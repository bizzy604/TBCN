import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@tbcn/shared';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { Notification, NotificationType } from './entities/notification.entity';
import { SendNotificationDto } from './dto/send-notification.dto';
import { InAppChannel } from './channels/in-app.channel';
import { EmailChannel } from './channels/email.channel';
import { NotificationsGateway } from './notifications.gateway';

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
    private readonly notificationsGateway: NotificationsGateway,
    private readonly inAppChannel: InAppChannel,
    private readonly emailChannel: EmailChannel,
  ) {}

  async listMine(userId: string, page = 1, limit = 20): Promise<PaginatedResult<Notification>> {
    const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
    const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : 20;

    const [items, total] = await this.notificationRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    return createPaginatedResult(items, createPaginationMeta(safePage, safeLimit, total));
  }

  async send(actor: Actor, dto: SendNotificationDto): Promise<Notification[]> {
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(actor.role)) {
      throw new ForbiddenException('Only admins can send arbitrary notifications');
    }
    const type = dto.type ?? NotificationType.INFO;
    const created = dto.userIds.map((userId) => this.notificationRepo.create({
      userId,
      title: dto.title,
      message: dto.message,
      type,
      metadata: { sentBy: actor.id },
    }));
    const saved = await this.notificationRepo.save(created);

    // Batch the unread count once per unique user rather than once per notification
    const unreadByUser = new Map<string, number>();
    for (const n of saved) {
      if (!unreadByUser.has(n.userId)) {
        unreadByUser.set(n.userId, await this.getUnreadCountValue(n.userId));
      }
    }

    // Use allSettled so one failing channel never blocks others
    await Promise.allSettled(saved.map(async (n) => {
      await Promise.allSettled([
        this.inAppChannel.send(n.userId, n.title),
        this.emailChannel.send(n.userId, n.title),
      ]);
      this.notificationsGateway.emitNotification(n);
      this.notificationsGateway.emitUnreadCount(n.userId, unreadByUser.get(n.userId) ?? 0);
    }));

    return saved;
  }

  async createForUser(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = NotificationType.INFO,
    metadata: Record<string, unknown> = {},
  ): Promise<Notification> {
    const notification = this.notificationRepo.create({
      userId,
      title,
      message,
      type,
      metadata,
    });
    const saved = await this.notificationRepo.save(notification);
    this.notificationsGateway.emitNotification(saved);
    this.notificationsGateway.emitUnreadCount(userId, await this.getUnreadCountValue(userId));
    return saved;
  }

  async markRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepo.findOne({ where: { id, userId } });
    if (!notification) {
      throw new NotFoundException(`Notification with ID "${id}" not found`);
    }
    if (!notification.isRead) {
      notification.isRead = true;
      notification.readAt = new Date();
      await this.notificationRepo.save(notification);
      this.notificationsGateway.emitNotificationRead(notification);
      this.notificationsGateway.emitUnreadCount(userId, await this.getUnreadCountValue(userId));
    }
    return notification;
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const result = await this.notificationRepo.update(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() },
    );
    const updated = result.affected ?? 0;
    if (updated > 0) {
      this.notificationsGateway.emitUnreadCount(userId, 0);
    }
    return { updated };
  }

  async getUnreadCount(userId: string): Promise<{ unread: number }> {
    return { unread: await this.getUnreadCountValue(userId) };
  }

  private async getUnreadCountValue(userId: string): Promise<number> {
    return this.notificationRepo.count({ where: { userId, isRead: false } });
  }
}

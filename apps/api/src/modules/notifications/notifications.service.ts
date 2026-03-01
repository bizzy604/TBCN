import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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

interface Actor {
  id: string;
  role: UserRole;
}

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepo: Repository<Notification>,
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

    await Promise.all(saved.map(async (n) => {
      await this.inAppChannel.send(n.userId, n.title);
      await this.emailChannel.send(n.userId, n.title);
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
    return this.notificationRepo.save(notification);
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
    }
    return notification;
  }

  async markAllRead(userId: string): Promise<{ updated: number }> {
    const pending = await this.notificationRepo.find({
      where: { userId, isRead: false },
      select: ['id'],
    });
    if (!pending.length) {
      return { updated: 0 };
    }
    await this.notificationRepo.update(
      { id: In(pending.map((n) => n.id)) },
      { isRead: true, readAt: new Date() },
    );
    return { updated: pending.length };
  }
}

import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import {
  PaginatedResult,
  createPaginatedResult,
  createPaginationMeta,
} from '../../common/dto';
import { User } from '../users/entities/user.entity';
import { Message } from './entities/message.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ConversationQueryDto } from './dto/conversation.dto';

@Injectable()
export class MessagingService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async send(senderId: string, dto: SendMessageDto): Promise<Message> {
    if (senderId === dto.recipientId) {
      throw new ForbiddenException('You cannot send a message to yourself');
    }

    const recipient = await this.userRepo.findOne({ where: { id: dto.recipientId } });
    if (!recipient) {
      throw new NotFoundException(`Recipient with ID "${dto.recipientId}" not found`);
    }

    const message = this.messageRepo.create({
      senderId,
      recipientId: dto.recipientId,
      content: dto.content,
    });
    return this.messageRepo.save(message);
  }

  async getConversation(currentUserId: string, peerId: string, query: ConversationQueryDto): Promise<PaginatedResult<Message>> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 25;
    const qb = this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.recipient', 'recipient')
      .where('(message.senderId = :currentUserId AND message.recipientId = :peerId)', { currentUserId, peerId })
      .orWhere('(message.senderId = :peerId AND message.recipientId = :currentUserId)', { currentUserId, peerId })
      .orderBy('message.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items.reverse(), createPaginationMeta(page, limit, total));
  }

  async listConversations(currentUserId: string) {
    const messages = await this.messageRepo.find({
      where: [
        { senderId: currentUserId },
        { recipientId: currentUserId },
      ],
      relations: ['sender', 'recipient'],
      order: { createdAt: 'DESC' },
      take: 300,
    });

    const map = new Map<string, Message>();
    for (const msg of messages) {
      const peerId = msg.senderId === currentUserId ? msg.recipientId : msg.senderId;
      if (!map.has(peerId)) {
        map.set(peerId, msg);
      }
    }

    return Array.from(map.entries()).map(([peerId, lastMessage]) => ({
      peerId,
      peer: lastMessage.senderId === currentUserId ? lastMessage.recipient : lastMessage.sender,
      lastMessage,
      unreadCount: 0,
    }));
  }

  async markAsRead(messageId: string, currentUserId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({ where: { id: messageId } });
    if (!message) {
      throw new NotFoundException(`Message with ID "${messageId}" not found`);
    }
    if (message.recipientId !== currentUserId) {
      throw new ForbiddenException('Only recipient can mark a message as read');
    }
    if (!message.readAt) {
      message.readAt = new Date();
      await this.messageRepo.save(message);
    }
    return message;
  }
}

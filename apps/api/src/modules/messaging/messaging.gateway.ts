import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { MessagingService } from './messaging.service';
import { ConversationQueryDto } from './dto/conversation.dto';

interface SocketUser {
  id: string;
  email: string;
  role: string;
}

interface SocketWithUser extends Socket {
  user?: SocketUser;
}

@WebSocketGateway({
  namespace: '/messages',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class MessagingGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(MessagingGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
    private readonly messagingService: MessagingService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: SocketWithUser): Promise<void> {
    try {
      const token = this.extractToken(client);
      if (!token) {
        throw new WsException('Access token is required');
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
      };

      client.join(this.userRoom(payload.sub));
      this.logger.debug(`Socket connected: ${client.id} user=${payload.sub}`);
    } catch (error) {
      this.logger.warn(`Socket auth failed: ${error?.message ?? 'unknown error'}`);
      client.emit('error', { message: 'Unauthorized' });
      client.disconnect();
    }
  }

  handleDisconnect(client: SocketWithUser): void {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('conversation.list')
  async onConversationList(@ConnectedSocket() client: SocketWithUser) {
    const userId = this.requireUser(client);
    return this.messagingService.listConversations(userId);
  }

  @SubscribeMessage('conversation.get')
  async onConversationGet(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: { peerId: string; page?: number; limit?: number },
  ) {
    const userId = this.requireUser(client);
    if (!payload?.peerId) {
      throw new WsException('peerId is required');
    }
    const query = Object.assign(new ConversationQueryDto(), {
      page: payload.page ?? 1,
      limit: payload.limit ?? 25,
      sortOrder: 'desc' as const,
    });
    return this.messagingService.getConversation(userId, payload.peerId, query);
  }

  @SubscribeMessage('message.send')
  async onMessageSend(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: { recipientId: string; content: string },
  ) {
    const userId = this.requireUser(client);
    if (!payload?.recipientId || !payload?.content) {
      throw new WsException('recipientId and content are required');
    }

    const message = await this.messagingService.send(userId, payload);
    const fullMessage = await this.messagingService.getById(message.id, userId);

    this.server.to(this.userRoom(userId)).emit('message.new', fullMessage);
    this.server.to(this.userRoom(payload.recipientId)).emit('message.new', fullMessage);

    return fullMessage;
  }

  @SubscribeMessage('message.read')
  async onMessageRead(
    @ConnectedSocket() client: SocketWithUser,
    @MessageBody() payload: { messageId: string },
  ) {
    const userId = this.requireUser(client);
    if (!payload?.messageId) {
      throw new WsException('messageId is required');
    }
    const message = await this.messagingService.markAsRead(payload.messageId, userId);
    this.server.to(this.userRoom(message.senderId)).emit('message.read', {
      messageId: message.id,
      readAt: message.readAt,
    });
    return message;
  }

  private requireUser(client: SocketWithUser): string {
    if (!client.user?.id) {
      throw new WsException('Unauthorized');
    }
    return client.user.id;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }

  private extractToken(client: Socket): string | null {
    const authToken = client.handshake.auth?.token;
    if (typeof authToken === 'string' && authToken.trim().length > 0) {
      return authToken;
    }

    const header = client.handshake.headers.authorization;
    if (!header || Array.isArray(header)) {
      return null;
    }
    const [type, token] = header.split(' ');
    if (type !== 'Bearer' || !token) {
      return null;
    }
    return token;
  }
}

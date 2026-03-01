import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { Notification } from './entities/notification.entity';

interface SocketUser {
  id: string;
  email: string;
  role: string;
}

interface SocketWithUser extends Socket {
  user?: SocketUser;
}

@WebSocketGateway({
  namespace: '/notifications',
  cors: {
    origin: '*',
    credentials: true,
  },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(NotificationsGateway.name);

  @WebSocketServer()
  server: Server;

  constructor(
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

  handleDisconnect(client: Socket): void {
    this.logger.debug(`Socket disconnected: ${client.id}`);
  }

  emitNotification(notification: Notification): void {
    if (!this.server) return;
    this.server
      .to(this.userRoom(notification.userId))
      .emit('notification.new', notification);
  }

  emitNotificationRead(notification: Notification): void {
    if (!this.server) return;
    this.server
      .to(this.userRoom(notification.userId))
      .emit('notification.read', {
        id: notification.id,
        readAt: notification.readAt,
      });
  }

  emitUnreadCount(userId: string, unread: number): void {
    if (!this.server) return;
    this.server
      .to(this.userRoom(userId))
      .emit('notification.unread.count', { unread });
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

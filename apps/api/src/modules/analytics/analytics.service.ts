import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, Repository } from 'typeorm';
import { UserStatus } from '@tbcn/shared';
import { User } from '../users/entities/user.entity';
import { Program, ProgramStatus } from '../programs/entities/program.entity';
import { Enrollment } from '../enrollments/entities/enrollment.entity';
import { Event } from '../events/entities/event.entity';
import { Transaction } from '../payments/entities/transaction.entity';
import { PaymentStatus } from '../payments/enums/payment-status.enum';
import { Post } from '../community/entities/post.entity';
import { Message } from '../messaging/entities/message.entity';
import { AnalyticsEvent } from './entities/analytics-event.entity';
import { AnalyticsQueryDto } from './dto/analytics-query.dto';
import { DashboardMetricsDto } from './dto/dashboard-metrics.dto';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Program)
    private readonly programRepo: Repository<Program>,
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(Post)
    private readonly postRepo: Repository<Post>,
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,
    @InjectRepository(AnalyticsEvent)
    private readonly analyticsEventRepo: Repository<AnalyticsEvent>,
  ) {}

  async getAdminOverview(query: AnalyticsQueryDto): Promise<DashboardMetricsDto> {
    const dateFilter = this.buildDateFilter(query);

    const usersTotal = await this.userRepo.count();
    const usersActive = await this.userRepo.count({ where: { status: UserStatus.ACTIVE } });
    const programsTotal = await this.programRepo.count();
    const programsPublished = await this.programRepo.count({ where: { status: ProgramStatus.PUBLISHED } });
    const enrollmentsTotal = await this.enrollmentRepo.count();
    const communityPostsTotal = await this.postRepo.count();
    const eventsTotal = await this.eventRepo.count();

    const transactionQb = this.transactionRepo
      .createQueryBuilder('txn')
      .where('txn.status = :status', { status: PaymentStatus.SUCCESS });

    if (dateFilter) {
      transactionQb.andWhere('txn.createdAt BETWEEN :from AND :to', dateFilter);
    }

    const [successfulTransactions, revenueAgg] = await Promise.all([
      transactionQb.getCount(),
      transactionQb.select('COALESCE(SUM(txn.amount), 0)', 'sum').getRawOne<{ sum: string }>(),
    ]);

    const conversionRate = usersTotal > 0
      ? Number(((successfulTransactions / usersTotal) * 100).toFixed(2))
      : 0;

    return {
      usersTotal,
      usersActive,
      programsTotal,
      programsPublished,
      enrollmentsTotal,
      communityPostsTotal,
      eventsTotal,
      transactionsTotal: successfulTransactions,
      revenueTotal: Number(revenueAgg?.sum ?? 0),
      conversionRate,
    };
  }

  async getRecentActivity(limit = 12) {
    const [transactions, messages, events] = await Promise.all([
      this.transactionRepo.find({
        where: { status: PaymentStatus.SUCCESS },
        order: { createdAt: 'DESC' },
        take: limit,
      }),
      this.messageRepo.find({
        order: { createdAt: 'DESC' },
        take: limit,
      }),
      this.eventRepo.find({
        order: { createdAt: 'DESC' },
        take: limit,
      }),
    ]);

    const feed = [
      ...transactions.map((t) => ({
        type: 'payment',
        title: `Payment received (${t.currency} ${t.amount})`,
        description: t.description ?? t.reference,
        createdAt: t.createdAt,
      })),
      ...messages.map((m) => ({
        type: 'message',
        title: 'New direct message',
        description: m.content.slice(0, 80),
        createdAt: m.createdAt,
      })),
      ...events.map((e) => ({
        type: 'event',
        title: 'Event updated',
        description: e.title,
        createdAt: e.createdAt,
      })),
    ];

    return feed
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async trackEvent(
    eventName: string,
    userId?: string | null,
    payload: Record<string, unknown> = {},
  ): Promise<AnalyticsEvent> {
    return this.analyticsEventRepo.save(this.analyticsEventRepo.create({
      eventName,
      userId: userId ?? null,
      payload,
    }));
  }

  private buildDateFilter(query: AnalyticsQueryDto): { from: Date; to: Date } | null {
    if (!query.from && !query.to) return null;
    const from = query.from ? new Date(query.from) : new Date(0);
    const to = query.to ? new Date(query.to) : new Date();
    return { from, to };
  }
}

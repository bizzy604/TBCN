import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';
import { PaymentsService } from './payments.service';
import { Transaction } from './entities/transaction.entity';
import { Subscription } from './entities/subscription.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { User } from '../users/entities/user.entity';
import { StripeProcessor } from './processors/stripe.processor';
import { FlutterwaveProcessor } from './processors/flutterwave.processor';
import { MpesaProcessor } from './processors/mpesa.processor';
import { PaypalProcessor } from './processors/paypal.processor';
import { PaystackProcessor } from './processors/paystack.processor';
import { CouponsModule } from '../coupons/coupons.module';

/**
 * Payments Module
 * Manages payments and subscriptions
 * - Stripe/Flutterwave integration
 * - Subscription management
 * - Transaction records
 * - Webhook handling
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Transaction, Subscription, WebhookEvent]),
    CouponsModule,
  ],
  controllers: [PaymentsController, WebhooksController],
  providers: [
    PaymentsService,
    StripeProcessor,
    FlutterwaveProcessor,
    MpesaProcessor,
    PaystackProcessor,
    PaypalProcessor,
  ],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}

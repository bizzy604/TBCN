import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentsController } from './payments.controller';
import { WebhooksController } from './webhooks.controller';
import { PaymentsService } from './payments.service';
import { Transaction } from './entities/transaction.entity';
import { Subscription } from './entities/subscription.entity';
import { WebhookEvent } from './entities/webhook-event.entity';
import { StripeProcessor } from './processors/stripe.processor';
import { FlutterwaveProcessor } from './processors/flutterwave.processor';
import { MpesaProcessor } from './processors/mpesa.processor';
import { PaypalProcessor } from './processors/paypal.processor';

/**
 * Payments Module
 * Manages payments and subscriptions
 * - Stripe/Flutterwave integration
 * - Subscription management
 * - Transaction records
 * - Webhook handling
 */
@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Subscription, WebhookEvent])],
  controllers: [PaymentsController, WebhooksController],
  providers: [
    PaymentsService,
    StripeProcessor,
    FlutterwaveProcessor,
    MpesaProcessor,
    PaypalProcessor,
  ],
  exports: [PaymentsService, TypeOrmModule],
})
export class PaymentsModule {}

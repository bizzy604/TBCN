import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subscription } from '../payments/entities/subscription.entity';
import { CouponsController } from './coupons.controller';
import { CouponsService } from './coupons.service';
import { CouponRedemption } from './entities/coupon-redemption.entity';
import { Coupon } from './entities/coupon.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Coupon, CouponRedemption, Subscription])],
  controllers: [CouponsController],
  providers: [CouponsService],
  exports: [CouponsService, TypeOrmModule],
})
export class CouponsModule {}


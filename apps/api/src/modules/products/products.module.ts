import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CouponsModule } from '../coupons/coupons.module';
import { PaymentsModule } from '../payments/payments.module';
import { Transaction } from '../payments/entities/transaction.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { Product } from './entities/product.entity';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, Order, OrderItem, Transaction]),
    CouponsModule,
    PaymentsModule,
  ],
  controllers: [ProductsController, OrdersController],
  providers: [ProductsService, OrdersService],
  exports: [ProductsService, OrdersService, TypeOrmModule],
})
export class ProductsModule {}

import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderQueryDto } from './dto/order-query.dto';
import { OrdersService } from './orders.service';

@ApiTags('Orders')
@ApiBearerAuth('JWT-auth')
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiOperation({ summary: 'Create order and initialize checkout' })
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOrderDto,
  ) {
    return this.ordersService.createWithCheckout(userId, dto);
  }

  @Get('me')
  @ApiOperation({ summary: 'Get my order history' })
  async listMine(
    @CurrentUser('id') userId: string,
    @Query() query: OrderQueryDto,
  ) {
    return this.ordersService.listMine(userId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get order details by ID' })
  async findById(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.findMineById(userId, id);
  }

  @Get(':id/invoice')
  @ApiOperation({ summary: 'Get basic invoice payload for order' })
  async invoice(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.getInvoice(userId, id);
  }

  @Patch(':id/cancel')
  @ApiOperation({ summary: 'Cancel pending order' })
  async cancel(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.ordersService.cancel(userId, id);
  }

  @Post(':id/items/:itemId/download')
  @ApiOperation({ summary: 'Generate/access secure digital download for purchased item' })
  async download(
    @CurrentUser('id') userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
  ) {
    return this.ordersService.requestDownload(userId, id, itemId);
  }
}

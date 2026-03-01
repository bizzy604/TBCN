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
import { UserRole } from '@tbcn/shared';
import { CurrentUser, Roles } from '../../common/decorators';
import { CouponQueryDto } from './dto/coupon-query.dto';
import { CreateCouponDto, UpdateCouponDto } from './dto/create-coupon.dto';
import { ValidateCouponDto } from './dto/validate-coupon.dto';
import { CouponsService } from './coupons.service';

@ApiTags('Coupons')
@ApiBearerAuth('JWT-auth')
@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post('validate')
  @ApiOperation({ summary: 'Validate a coupon code against checkout amount and user context' })
  async validate(
    @CurrentUser('id') userId: string,
    @Body() dto: ValidateCouponDto,
  ) {
    return this.couponsService.validateForUser(userId, dto);
  }

  @Get('admin/analytics')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get coupon usage analytics' })
  async analytics() {
    return this.couponsService.getAnalytics();
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List coupons (admin)' })
  async list(@Query() query: CouponQueryDto) {
    return this.couponsService.list(query);
  }

  @Post()
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create coupon (admin)' })
  async create(@Body() dto: CreateCouponDto) {
    return this.couponsService.create(dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update coupon (admin)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCouponDto,
  ) {
    return this.couponsService.update(id, dto);
  }

  @Patch(':id/activate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Activate coupon (admin)' })
  async activate(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.activate(id);
  }

  @Patch(':id/deactivate')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Deactivate coupon (admin)' })
  async deactivate(@Param('id', ParseUUIDPipe) id: string) {
    return this.couponsService.deactivate(id);
  }
}


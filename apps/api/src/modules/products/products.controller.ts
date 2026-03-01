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
import { Public, Roles } from '../../common/decorators';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { ProductsService } from './products.service';
import { ProductType } from './enums/product-type.enum';

class ProductQueryDto {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProductType;
}

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Public()
  @Get('catalog')
  @ApiOperation({ summary: 'List published products for marketplace/store' })
  async listCatalog(@Query() query: ProductQueryDto) {
    return this.productsService.listPublic(query);
  }

  @Public()
  @Get('catalog/:id')
  @ApiOperation({ summary: 'Get published product details' })
  async getCatalogProduct(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findPublicById(id);
  }

  @Get()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'List all products (admin)' })
  async listAll(@Query() query: ProductQueryDto) {
    return this.productsService.listAll(query);
  }

  @Get(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Get product by ID (admin)' })
  async findById(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findById(id);
  }

  @Post()
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create product (admin)' })
  async create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Patch(':id')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Update product (admin)' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto);
  }

  @Patch(':id/publish')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Publish product (admin)' })
  async publish(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.publish(id);
  }

  @Patch(':id/unpublish')
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Unpublish product (admin)' })
  async unpublish(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.unpublish(id);
  }
}

import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  createPaginatedResult,
  createPaginationMeta,
  PaginatedResult,
} from '../../common/dto';
import { CreateProductDto, UpdateProductDto } from './dto/create-product.dto';
import { Product } from './entities/product.entity';
import { ProductType } from './enums/product-type.enum';

interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: ProductType;
}

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
  ) {}

  async listPublic(query: ProductQuery): Promise<PaginatedResult<Product>> {
    const page = Number.isFinite(query.page) && query.page > 0 ? Math.floor(query.page) : 1;
    const limit = Number.isFinite(query.limit) && query.limit > 0 ? Math.floor(query.limit) : 20;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .where('product.isPublished = true')
      .orderBy('product.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.type) {
      qb.andWhere('product.type = :type', { type: query.type });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async listAll(query: ProductQuery): Promise<PaginatedResult<Product>> {
    const page = Number.isFinite(query.page) && query.page > 0 ? Math.floor(query.page) : 1;
    const limit = Number.isFinite(query.limit) && query.limit > 0 ? Math.floor(query.limit) : 20;
    const qb = this.productRepo
      .createQueryBuilder('product')
      .orderBy('product.createdAt', 'DESC');

    if (query.search) {
      qb.andWhere(
        '(LOWER(product.title) LIKE LOWER(:search) OR LOWER(product.description) LIKE LOWER(:search))',
        { search: `%${query.search}%` },
      );
    }

    if (query.type) {
      qb.andWhere('product.type = :type', { type: query.type });
    }

    qb.skip((page - 1) * limit).take(limit);
    const [items, total] = await qb.getManyAndCount();
    return createPaginatedResult(items, createPaginationMeta(page, limit, total));
  }

  async findPublicById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id, isPublished: true } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async findById(id: string): Promise<Product> {
    const product = await this.productRepo.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    const type = dto.type ?? ProductType.TOOLKIT;
    const isDigital = dto.isDigital ?? type !== ProductType.MERCH;
    const product = this.productRepo.create({
      title: dto.title,
      slug: await this.buildUniqueSlug(dto.title),
      description: dto.description,
      type,
      price: dto.price,
      currency: (dto.currency ?? 'KES').toUpperCase(),
      isPublished: dto.isPublished ?? false,
      isDigital,
      thumbnailUrl: dto.thumbnailUrl ?? null,
      downloadUrl: dto.downloadUrl ?? null,
      stockQuantity: dto.stockQuantity ?? (isDigital ? null : 0),
      downloadLimit: dto.downloadLimit ?? 3,
      downloadExpiresDays: dto.downloadExpiresDays ?? 7,
      metadata: dto.metadata ?? {},
    });
    return this.productRepo.save(product);
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    const product = await this.findById(id);
    const updateData: Partial<Product> = {
      title: dto.title ?? product.title,
      description: dto.description ?? product.description,
      type: dto.type ?? product.type,
      price: dto.price ?? product.price,
      currency: dto.currency ? dto.currency.toUpperCase() : product.currency,
      isPublished: dto.isPublished ?? product.isPublished,
      isDigital: dto.isDigital ?? product.isDigital,
      thumbnailUrl: dto.thumbnailUrl ?? product.thumbnailUrl,
      downloadUrl: dto.downloadUrl ?? product.downloadUrl,
      stockQuantity: dto.stockQuantity ?? product.stockQuantity,
      downloadLimit: dto.downloadLimit ?? product.downloadLimit,
      downloadExpiresDays: dto.downloadExpiresDays ?? product.downloadExpiresDays,
      metadata: dto.metadata ? { ...product.metadata, ...dto.metadata } : product.metadata,
    };

    if (dto.title && dto.title !== product.title) {
      updateData.slug = await this.buildUniqueSlug(dto.title, id);
    }

    await this.productRepo.update(id, updateData);
    return this.findById(id);
  }

  async publish(id: string): Promise<Product> {
    await this.productRepo.update(id, { isPublished: true });
    return this.findById(id);
  }

  async unpublish(id: string): Promise<Product> {
    await this.productRepo.update(id, { isPublished: false });
    return this.findById(id);
  }

  private async buildUniqueSlug(title: string, currentId?: string): Promise<string> {
    const base = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 180);
    let slug = base || `product-${Date.now()}`;
    let suffix = 1;

    while (true) {
      const existing = await this.productRepo.findOne({ where: { slug } });
      if (!existing || existing.id === currentId) {
        return slug;
      }
      slug = `${base}-${suffix++}`;
    }
  }
}

import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';

import { PrismaService } from '../../../prisma/prisma.service';
import { AdminCreateCategoryDto } from './dto/admin-create-category.dto';
import { AdminUpdateCategoryDto } from './dto/admin-update-category.dto';

@Injectable()
export class AdminCategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      orderBy: [{ sort: 'asc' }, { id: 'asc' }],
      select: {
        id: true,
        name: true,
        sort: true,
        _count: {
          select: {
            questions: true,
          },
        },
      },
    });
  }

  async create(dto: AdminCreateCategoryDto) {
    const name = dto.name.trim();
    const exists = await this.prisma.category.findFirst({
      where: { name },
      select: { id: true },
    });

    if (exists) {
      throw new BadRequestException('分类名称已存在');
    }

    return this.prisma.category.create({
      data: {
        name,
        sort: dto.sort ?? 0,
      },
      select: {
        id: true,
        name: true,
        sort: true,
      },
    });
  }

  async update(id: number, dto: AdminUpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    if (!category) {
      throw new NotFoundException('分类不存在');
    }

    const nextName = dto.name?.trim();
    if (nextName && nextName !== category.name) {
      const exists = await this.prisma.category.findFirst({
        where: {
          name: nextName,
          NOT: { id },
        },
        select: { id: true },
      });

      if (exists) {
        throw new BadRequestException('分类名称已存在');
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        ...(nextName !== undefined ? { name: nextName } : {}),
        ...(dto.sort !== undefined ? { sort: dto.sort } : {}),
      },
      select: {
        id: true,
        name: true,
        sort: true,
      },
    });
  }
}

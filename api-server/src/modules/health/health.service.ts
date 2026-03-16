import { Injectable, ServiceUnavailableException } from '@nestjs/common';

import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HealthService {
  constructor(private readonly prismaService: PrismaService) {}

  getLiveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.floor(process.uptime()),
      nodeEnv: process.env.NODE_ENV || 'development',
      pid: process.pid,
    };
  }

  async getReadiness() {
    const base = this.getLiveness();

    try {
      await this.prismaService.$queryRaw`SELECT 1`;

      return {
        ...base,
        checks: {
          database: 'up',
        },
      };
    } catch {
      throw new ServiceUnavailableException({
        ...base,
        status: 'error',
        message: 'Database is unavailable',
        checks: {
          database: 'down',
        },
      });
    }
  }
}

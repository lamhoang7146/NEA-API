import { OnModuleDestroy, OnModuleInit, Injectable } from '@nestjs/common';
import { PrismaClient } from './generated/prisma';

@Injectable()
export class PostgreSQLService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}

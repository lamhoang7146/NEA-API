import { Injectable } from '@nestjs/common';

import { PostgreSQLService } from '@/databases';

@Injectable()
export class UserService {
  constructor(private readonly postgresqlService: PostgreSQLService) {}

  async findAll(): Promise<any> {
    return await this.postgresqlService.user.findMany({});
  }
}

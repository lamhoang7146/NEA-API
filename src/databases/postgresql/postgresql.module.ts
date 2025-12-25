import { Module, Global } from '@nestjs/common';
import { PostgreSQLService } from './postgresql.service';

@Global()
@Module({
  providers: [PostgreSQLService],
  exports: [PostgreSQLService],
})
export class PostgreSQLModule {}

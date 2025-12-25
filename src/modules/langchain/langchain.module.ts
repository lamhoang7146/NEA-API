import { Module } from '@nestjs/common';
import { LangchainResolver } from './langchain.resolver';
import { LangchainService } from './langchain.service';

@Module({
  providers: [LangchainResolver, LangchainService],
})
export class LangchainModule {}

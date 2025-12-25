import { UserModule } from '@/modules/user/user.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { LangchainModule } from '@/modules/langchain/langchain.module';

export const Modules = [UserModule, AuthModule, LangchainModule];

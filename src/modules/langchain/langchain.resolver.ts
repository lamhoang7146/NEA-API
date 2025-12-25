import { Resolver, Mutation, Args, Subscription } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { LangchainService } from './langchain.service';
import { ChatMessage } from './dto';
import { CurrentUser, Roles } from '@/common/decorators';
import { CurrentUserResponse } from '@/common/interfaces';
import { Role } from '@/common/constants';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '@/modules/auth/guards/role/roles.guard';

@Resolver()
export class LangchainResolver {
  constructor(private readonly langchainService: LangchainService) {}

  @Subscription(() => String, { name: 'chatMessage' })
  chatMessage() {
    return this.langchainService
      .getPubSub()
      .asyncIterableIterator('chatMessage');
  }

  @Mutation(() => Boolean)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  async chat(
    @Args('input') input: ChatMessage,
    @CurrentUser() user: CurrentUserResponse,
  ) {
    await this.langchainService.chat(input, user);
    return true;
  }
}

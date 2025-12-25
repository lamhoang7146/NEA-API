import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { UserService } from '@/modules/user/user.service';
import { JwtAuthGuard } from '@/modules/auth/guards/jwt-auth/jwt-auth.guard';
import { Role } from '@/common/constants';
import { Roles } from '@/common/decorators';
import { RolesGuard } from '@/modules/auth/guards/role/roles.guard';
import { User } from './entities/user.entity';

@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @Query(() => [User], {
    name: 'users',
    description: 'Retrieve a list of all users',
  })
  async findAll(): Promise<any> {
    return await this.userService.findAll();
  }
}

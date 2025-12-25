import { Args, Mutation, Resolver, Context, Query } from '@nestjs/graphql';
import { Request, Response } from 'express';
import { UseGuards } from '@nestjs/common';

import { AuthService } from './auth.service';
import {
  CreateUserDto,
  ForgotPasswordDto,
  NewPasswordDto,
  SignInDto,
} from './dto/requests';
import { UserModel } from './dto/responses';
import { JwtAuthGuard } from './guards/jwt-auth/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators';
import { CurrentUserResponse } from '@/common/interfaces';
import { TOKEN_TYPE } from '@/common/constants';
import { User } from '@/modules/user/entities/user.entity';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => User, {
    name: 'signUp',
    description: 'Create a new user',
  })
  async createUser(@Args('input') input: CreateUserDto): Promise<any> {
    return await this.authService.createUser(input);
  }

  @Mutation(() => Boolean, {
    name: 'signIn',
    description: 'Sign in a user',
  })
  async signIn(
    @Args('input') input: SignInDto,
    @Context() context: { req: Request; res: Response },
  ): Promise<boolean> {
    const user = await this.authService.validateUser(input);
    const { accessToken } = await this.authService.generateToken(user.id);

    context.res.cookie(TOKEN_TYPE.ACCESS, accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    });

    return true;
  }

  @Mutation(() => Boolean, {
    name: 'signOut',
    description: 'Sign out a user',
  })
  signOut(@Context() context: { req: Request; res: Response }) {
    context.res.clearCookie(TOKEN_TYPE.ACCESS, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return true;
  }

  @Query(() => UserModel, {
    name: 'me',
    description: 'Get current user info',
  })
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() user: CurrentUserResponse) {
    return await this.authService.getUserById(user.id);
  }

  @Mutation(() => String, {
    name: 'forgotPassword',
    description: 'Forgot password',
  })
  async forgotPassword(@Args('input') input: ForgotPasswordDto) {
    return await this.authService.forgotPassword(input);
  }

  @Mutation(() => String, {
    name: 'resetPassword',
    description: 'Reset password',
  })
  async resetPassword(@Args('input') input: NewPasswordDto) {
    return await this.authService.resetPassword(input);
  }
}

import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, MaxLength, MinLength } from 'class-validator';

@InputType()
export class NewPasswordDto {
  @Field(() => String, { name: 'password', description: 'New password' })
  @MaxLength(20, { message: 'Password must be less than 20 characters long' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Password is required' })
  password: string;

  @Field(() => String, {
    name: 'confirmPassword',
    description: 'Confirm new password',
  })
  @MaxLength(20, { message: 'Password must be less than 20 characters long' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsNotEmpty({ message: 'Confirm password is required' })
  confirmPassword: string;

  @Field(() => String, { name: 'token', description: 'Reset password token' })
  @IsNotEmpty({ message: 'Token is required' })
  token: string;
}

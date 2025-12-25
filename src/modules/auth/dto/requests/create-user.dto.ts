import { Field, InputType } from '@nestjs/graphql';
import {
  IsNotEmpty,
  IsString,
  IsEmail,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';

@InputType()
export class CreateUserDto {
  @Field(() => String, { name: 'name' })
  @IsNotEmpty({ message: 'Name is required' })
  @IsString()
  name: string;

  @Field(() => String, { name: 'email' })
  @IsNotEmpty({ message: 'Email is required' })
  @IsEmail()
  email: string;

  @Field(() => String, { name: 'password' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must be less than 20 characters long' })
  password: string;

  @Field(() => String, { name: 'avatar', nullable: true })
  @IsOptional()
  avatar?: string;

  @Field(() => String, { name: 'bio', nullable: true })
  @IsOptional()
  bio?: string;
}

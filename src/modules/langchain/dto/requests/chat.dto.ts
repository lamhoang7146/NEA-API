import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

@InputType()
export class ChatMessage {
  @Field()
  @MinLength(2, { message: 'At least 2 characters!' })
  @IsString()
  @IsNotEmpty()
  prompt: string;
}

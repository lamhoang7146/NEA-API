// @ts-nocheck
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PubSub } from 'graphql-subscriptions';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { HumanMessage, SystemMessage, AIMessage } from 'langchain';

import { ChatMessage } from './dto';
import { systemPrompt } from './prompts';
import { RedisService } from '@/packages/redis/redis.service';
import { CurrentUserResponse } from '@/common/interfaces';

@Injectable()
export class LangchainService {
  private readonly logger = new Logger(LangchainService.name);
  private readonly model: ChatGoogleGenerativeAI;
  private readonly pubSub = new PubSub();
  private readonly systemPrompt: string = systemPrompt;
  private readonly aiMessage = '';
  private readonly messages = [];

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {
    this.model = new ChatGoogleGenerativeAI({
      model: configService.get<string>(
        'GOOGLE_API_VERSION',
        'gemini-2.5-flash',
      ),
      maxOutputTokens: 2048,
      apiKey: configService.get<string>('GOOGLE_API_KEY'),
    });
  }

  getPubSub() {
    return this.pubSub;
  }

  async loadMessageHistory(userId: string) {
    const history = await this.redisService.getList(
      `conversation:user:${userId}`,
    );

    this.messages = [
      new SystemMessage(this.systemPrompt),
      ...history.map((msg) => {
        if (msg.role === 'human')
          return new HumanMessage<string>(msg.content as string);
        if (msg.role === 'ai') return new AIMessage(msg.content as string);
      }),
    ];
  }

  async chat({ prompt }: ChatMessage, { id }: CurrentUserResponse) {
    await this.redisService.pushToList(
      `conversation:user:${id}`,
      {
        role: 'human',
        content: prompt,
      },
      3600,
    );

    await this.loadMessageHistory(id);

    const stream = await this.model.stream(this.messages);

    let aiResponse = '';

    for await (const chunk of stream) {
      aiResponse += chunk.text;
      await this.getPubSub().publish('chatMessage', {
        chatMessage: chunk.text,
      });
    }

    await this.redisService.pushToList(`conversation:user:${id}`, {
      role: 'ai',
      content: aiResponse,
    });
  }
}

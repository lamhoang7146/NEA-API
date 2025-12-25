import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private redis: Redis) {}

  async set(key: string, value: any, ttl?: number) {
    const toStore = typeof value === 'string' ? value : JSON.stringify(value);

    if (ttl) {
      await this.redis.set(key, toStore, 'EX', ttl);
    } else {
      await this.redis.set(key, toStore);
    }

    return { key, value };
  }

  async get(key: string) {
    const data = await this.redis.get(key);

    if (!data) throw new NotFoundException('Key not found');

    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  async safeGet(key: string) {
    const data = await this.redis.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  }

  async pushToList(key: string, value: any, ttl?: number) {
    const toStore = typeof value === 'string' ? value : JSON.stringify(value);
    await this.redis.rpush(key, toStore);

    if (ttl) {
      await this.redis.expire(key, ttl);
    }
  }

  async getList(key: string) {
    const list = await this.redis.lrange(key, 0, -1);
    return list.map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
  }

  async delete(key: string) {
    const deleted = await this.redis.del(key);

    if (!deleted) throw new NotFoundException('Key not found');

    return true;
  }

  async keys(pattern = '*') {
    return await this.redis.keys(pattern);
  }

  async clearAll() {
    return await this.redis.flushdb();
  }
}

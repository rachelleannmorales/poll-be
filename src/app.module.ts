import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from '../ormconfig';
import { Poll } from './entities/poll.entity';
import { PollModule } from './modules/poll/poll.module';
import { AuthModule } from './modules/auth/auth.module';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.registerAsync({
      useFactory: () => ({
        store: redisStore,
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        ttl: 60, // cache TTL in seconds
      }),
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    TypeOrmModule.forFeature([
      Poll,
    ]),
    PollModule,
    AuthModule,
  ],
})
export class AppModule {
}

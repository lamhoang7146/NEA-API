import { Module } from '@nestjs/common';

import { ConfigsModule } from './config';
import { DatabasesModule } from './databases';
import { PackagesModule } from './packages';
import { Modules } from './modules';

@Module({
  imports: [
    ...ConfigsModule,
    ...DatabasesModule,
    ...PackagesModule,
    ...Modules,
  ],
})
export class AppModule {}

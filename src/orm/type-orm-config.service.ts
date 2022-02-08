import { Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';

import path from 'path';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: 'localhost',
      port: 5433,
      database: process.env.TYPEORM_DB || 'happypal_technical_test',
      username: 'hpal',
      password: 'hpal',
      entities: [path.join(__dirname, '../**/*.model{.ts,.js}')],
      migrations: [path.join(__dirname, '../migrations/**{.ts,.js}')],
      synchronize: true,
    };
  }
}

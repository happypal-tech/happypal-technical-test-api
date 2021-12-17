import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Picture } from './models/picture.model';
import { PictureController } from './picture.controller';
import { PictureService } from './picture.service';

@Module({
  imports: [TypeOrmModule.forFeature([Picture])],
  providers: [PictureService],
  controllers: [PictureController],
  exports: [PictureService],
})
export class PictureModule {}

import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { Response } from 'express';
import fs from 'fs';

import { Public } from '@/auth/decorators/Public.decorator';

import { PictureService } from './picture.service';

@Controller('picture')
export class PictureController {
  constructor(private readonly pictureService: PictureService) {}

  @Get(':id')
  @Public()
  async getPicture(@Param('id') pictureId: string, @Res() res: Response) {
    const { picture, path } = await this.pictureService.getPicture(pictureId);

    res.setHeader('content-type', picture.mimetype);
    res.setHeader('content-length', picture.size);

    fs.createReadStream(path).pipe(res);
  }

  @Post('upload')
  @Public()
  @UseInterceptors(
    FileInterceptor('picture', {
      fileFilter: (_, file, cb) => {
        if (['image/png', 'image/jpeg', 'image/bmp'].includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('unsupported format'), false);
        }
      },
    }),
  )
  async pictureUpload(@UploadedFile() file: Express.Multer.File) {
    const picture = await this.pictureService.pictureUpload(file);

    return picture;
  }
}

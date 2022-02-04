import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { encode } from 'blurhash';
import fs from 'fs';
import sharp from 'sharp';
import { Connection, Repository } from 'typeorm';

import { Viewer } from '@/auth/decorators/Viewer.decorator';

import { Picture } from './models/picture.model';

@Injectable()
export class PictureService {
  constructor(
    @InjectRepository(Picture)
    private readonly pictureRepo: Repository<Picture>,

    private readonly connection: Connection,
  ) {}

  /**
   * CONTROLLERS
   */

  public async getPicture(pictureId: string) {
    const picture = await this.pictureRepo
      .createQueryBuilder('picture')
      .where('picture.id = :pictureId')
      .setParameters({ pictureId })
      .getOne();

    if (!picture) {
      throw new NotFoundException();
    } else {
      return {
        picture,
        path: `uploads/pictures/${picture.id}.webp`,
      };
    }
  }

  public async pictureUpload(file: Express.Multer.File) {
    const pipeline = sharp(file.buffer);

    const [{ data, info }, hash] = await Promise.all([
      pipeline.ensureAlpha().webp().toBuffer({ resolveWithObject: true }),
      this.generateHash(pipeline),
    ]);

    const picture = new Picture({
      originalName: file.originalname,
      mimetype: `image/${info.format}`,
      size: info.size,
      width: info.width,
      height: info.height,
      hash,
    });

    await this.connection.transaction(async (manager) => {
      await manager.save(picture);

      fs.mkdirSync('uploads/pictures', { recursive: true });
      fs.writeFileSync(`uploads/pictures/${picture.id}.webp`, data);
    });

    return picture;
  }

  /**
   * UTILS
   */

  public generatePictureQuery(viewer: Viewer, alias = 'picture') {
    const query = this.pictureRepo.createQueryBuilder(alias);

    return query;
  }

  /**
   * INTERNALS
   */

  private async generateHash(pipeline: sharp.Sharp) {
    const { data, info } = await pipeline
      .clone()
      .ensureAlpha()
      .raw()
      .resize(32, 32, { fit: 'inside' })
      .toBuffer({ resolveWithObject: true });

    return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 4);
  }
}

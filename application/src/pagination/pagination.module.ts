import { Module } from '@nestjs/common';

import { PaginationService } from './pagination.service';

@Module({
  providers: [PaginationService],
})
export class PaginationModule {}

import { Controller, Get } from '@nestjs/common';

import { AppService } from './app.service';
import { Public } from './auth/decorators/Public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @Public()
  getHello(): string {
    console.log('getHello');
    return this.appService.getHello();
  }
}

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getQuestions() {
    return this.appService.getQuestions();
  }

  @Get('/likesanddislikes')
  getLikesAndDislikes() {
    return this.appService.getLikesAndDislikesFromDisk();
  }

  @Get('/update')
  updateList() {
    return this.appService.updateLikesAndDislikes();
  }
}

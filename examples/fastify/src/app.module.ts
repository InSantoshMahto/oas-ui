import { Module, Controller, Get } from '@nestjs/common';

@Controller()
class AppController {
  @Get()
  getRoot() {
    return { hello: 'world' };
  }
}

@Module({
  controllers: [AppController],
})
export class AppModule {}

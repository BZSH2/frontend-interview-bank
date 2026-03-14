import { Body, Controller, Headers, Ip, Post } from '@nestjs/common';

import { CreateExplanationRequestDto } from './dto/create-explanation-request.dto';
import { ExplanationRequestsService } from './explanation-requests.service';

@Controller('explanation-requests')
export class ExplanationRequestsController {
  constructor(private readonly explanationRequestsService: ExplanationRequestsService) {}

  @Post()
  create(
    @Body() dto: CreateExplanationRequestDto,
    @Headers('x-user-key') userKey: string | undefined,
    @Ip() ip: string,
  ) {
    return this.explanationRequestsService.create(dto, {
      userKey,
      ip,
    });
  }
}

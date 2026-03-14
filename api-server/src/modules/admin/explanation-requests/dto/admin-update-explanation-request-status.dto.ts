import { RequestStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class AdminUpdateExplanationRequestStatusDto {
  @IsEnum(RequestStatus)
  status!: RequestStatus;
}

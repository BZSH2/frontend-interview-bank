import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum ExplanationRequestSource {
  MINIAPP = 'MINIAPP',
  H5 = 'H5',
  PC = 'PC',
  ADMIN = 'ADMIN',
}

export class CreateExplanationRequestDto {
  @IsInt()
  @Min(1)
  questionId!: number;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @IsOptional()
  @IsEnum(ExplanationRequestSource)
  source: ExplanationRequestSource = ExplanationRequestSource.MINIAPP;
}

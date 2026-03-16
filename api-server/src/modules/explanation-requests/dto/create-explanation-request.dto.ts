import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export enum ExplanationRequestSource {
  MINIAPP = 'MINIAPP',
  H5 = 'H5',
  PC = 'PC',
  ADMIN = 'ADMIN',
}

function normalizeNote(value: unknown) {
  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim();
  return normalized || undefined;
}

export class CreateExplanationRequestDto {
  @IsInt()
  @Min(1)
  questionId!: number;

  @IsOptional()
  @Transform(({ value }) => normalizeNote(value))
  @IsString()
  @MaxLength(300)
  note?: string;

  @IsOptional()
  @IsEnum(ExplanationRequestSource)
  source: ExplanationRequestSource = ExplanationRequestSource.MINIAPP;
}

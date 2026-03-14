import { Difficulty, ExplanationStatus, QuestionStatus } from '@prisma/client';
import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';

export class AdminCreateQuestionDto {
  @IsInt()
  @Min(1)
  categoryId!: number;

  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsString()
  content!: string;

  @IsOptional()
  @IsString()
  answer?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(QuestionStatus)
  status?: QuestionStatus;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  explanationContent?: string;

  @IsOptional()
  @IsEnum(ExplanationStatus)
  explanationStatus?: ExplanationStatus;
}

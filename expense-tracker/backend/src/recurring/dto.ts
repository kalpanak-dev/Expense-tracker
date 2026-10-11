import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator';

export class RecurringDto {
  @IsIn(['income', 'expense']) type: 'income' | 'expense';
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() amount: number;
  @IsNotEmpty() category: string;
  @IsOptional() @IsString() description?: string;
  @IsInt() @Min(1) @Max(31) dayOfMonth: number;
}

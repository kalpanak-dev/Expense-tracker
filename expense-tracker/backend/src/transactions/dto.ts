import { IsDateString, IsIn, IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';

export class TransactionDto {
  @IsIn(['income', 'expense']) type: 'income' | 'expense';
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() amount: number;
  @IsNotEmpty() category: string;
  @IsOptional() @IsString() description?: string;
  @IsDateString() date: string;
}

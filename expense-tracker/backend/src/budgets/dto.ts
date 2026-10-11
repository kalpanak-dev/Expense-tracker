import { IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class BudgetDto {
  @IsNotEmpty() category: string;
  @IsNumber({ maxDecimalPlaces: 2 }) @IsPositive() monthlyLimit: number;
}

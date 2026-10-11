import { Body, Controller, Delete, Get, Param, ParseIntPipe, Put, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { BudgetDto } from './dto';
import { BudgetsService } from './budgets.service';

@UseGuards(AuthGuard)
@Controller('budgets')
export class BudgetsController {
  constructor(private readonly service: BudgetsService) {}

  @Get() list(@CurrentUser() u: AuthUser, @Query('month') month?: string) { return this.service.listWithSpending(u.id, month); }
  @Put() upsert(@CurrentUser() u: AuthUser, @Body() dto: BudgetDto) { return this.service.upsert(u.id, dto); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id', ParseIntPipe) id: number) { return this.service.remove(u.id, id); }
}

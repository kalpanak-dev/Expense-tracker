import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, Put, Query, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '../common/auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { currentMonth } from '../common/utils';
import { TransactionDto } from './dto';
import { TransactionsService } from './transactions.service';

@UseGuards(AuthGuard)
@Controller()
export class TransactionsController {
  constructor(private readonly service: TransactionsService) {}

  @Get('transactions')
  list(@CurrentUser() u: AuthUser, @Query('month') month?: string, @Query('category') category?: string) {
    return this.service.list(u.id, month, category);
  }

  @Post('transactions')
  create(@CurrentUser() u: AuthUser, @Body() dto: TransactionDto) { return this.service.create(u.id, dto); }

  @Put('transactions/:id')
  update(@CurrentUser() u: AuthUser, @Param('id', ParseIntPipe) id: number, @Body() dto: TransactionDto) {
    return this.service.update(u.id, id, dto);
  }

  @Delete('transactions/:id')
  remove(@CurrentUser() u: AuthUser, @Param('id', ParseIntPipe) id: number) { return this.service.remove(u.id, id); }

  @Get('export/csv')
  async export(@CurrentUser() u: AuthUser, @Res() res: Response, @Query('month') month?: string) {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transactions-${month ?? 'all'}.csv"`);
    res.send(await this.service.exportCsv(u.id, month));
  }

  @Get('analytics/monthly')
  monthly(@CurrentUser() u: AuthUser, @Query('month') month?: string) {
    return this.service.monthly(u.id, month ?? currentMonth());
  }

  @Get('analytics/trend')
  trend(@CurrentUser() u: AuthUser, @Query('months') months?: string) {
    return this.service.trend(u.id, Math.min(Math.max(Number(months) || 6, 1), 24));
  }
}

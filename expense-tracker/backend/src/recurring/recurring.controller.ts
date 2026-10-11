import { Body, Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../common/auth.guard';
import { AuthUser, CurrentUser } from '../common/current-user.decorator';
import { RecurringDto } from './dto';
import { RecurringService } from './recurring.service';

@UseGuards(AuthGuard)
@Controller('recurring')
export class RecurringController {
  constructor(private readonly service: RecurringService) {}

  @Get() list(@CurrentUser() u: AuthUser) { return this.service.list(u.id); }
  @Post() create(@CurrentUser() u: AuthUser, @Body() dto: RecurringDto) { return this.service.create(u.id, dto); }
  @Delete(':id') remove(@CurrentUser() u: AuthUser, @Param('id', ParseIntPipe) id: number) { return this.service.remove(u.id, id); }
}

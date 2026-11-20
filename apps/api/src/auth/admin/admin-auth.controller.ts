import {
  Controller,
  Body,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import type { Request } from 'express';
import { AdminAuthService } from './admin-auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { AdminLogoutDto } from './dto/admin-logout.dto';
import { RefreshContext, SessionMeta } from '@common/types/auth.types';
import { AdminMfaDto } from './dto/admin-mfa.dto';
import { AdminRefreshGuard } from './guards/admin-refresh.guard';
import { RefreshAdminTokenDto } from './dto/refresh-admin-token.dto';

const meta = (req: Request): SessionMeta => ({
  userAgent: req.headers['user-agent'],
  ip: req.ip
});

@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly auth: AdminAuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    return this.auth.login(dto.email, dto.password, meta(req));
  }

  @Post('mfa')
  @HttpCode(HttpStatus.OK)
  mfa(@Body() dto: AdminMfaDto, @Req() req: Request) {
    return this.auth.verifyMfa(dto.mfaToken, dto.code, meta(req));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminRefreshGuard)
  refresh(@Body() _dto: RefreshAdminTokenDto, @Req() req: Request) {
    return this.auth.refresh(req.user as RefreshContext, meta(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AdminRefreshGuard)
  logout(@Body() dto: AdminLogoutDto, @Req() req: Request) {
    return this.auth.logout(req.user as RefreshContext, dto.allDevices);
  }
}

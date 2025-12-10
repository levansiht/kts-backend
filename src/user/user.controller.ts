import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseHelper } from '../common/helpers/response.helper';
import { ApiResponse } from '../common/interfaces/response.interface';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import {
  UpdateProfileDto,
  ChangePasswordDto,
  UpdateEmailDto,
} from './dto/profile.dto';

@Controller('api/user')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  async getProfile(@Request() req: AuthenticatedRequest): Promise<ApiResponse> {
    const user = await this.userService.findOne(req.user.sub);
    return ResponseHelper.success(
      instanceToPlain(user),
      'Profile fetched successfully',
    );
  }

  @Put('profile')
  async updateProfile(
    @Request() req: AuthenticatedRequest,
    @Body() updateProfileDto: UpdateProfileDto,
  ): Promise<ApiResponse> {
    const updatedUser = await this.userService.updateProfile(
      req.user.sub,
      updateProfileDto,
    );
    return ResponseHelper.success(
      instanceToPlain(updatedUser),
      'Profile updated successfully',
    );
  }

  @Post('change-password')
  async changePassword(
    @Request() req: AuthenticatedRequest,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<ApiResponse> {
    await this.userService.changePassword(req.user.sub, changePasswordDto);
    return ResponseHelper.success(null, 'Password changed successfully');
  }

  @Post('update-email')
  async updateEmail(
    @Request() req: AuthenticatedRequest,
    @Body() updateEmailDto: UpdateEmailDto,
  ): Promise<ApiResponse> {
    const updatedUser = await this.userService.updateEmail(
      req.user.sub,
      updateEmailDto,
    );
    return ResponseHelper.success(
      instanceToPlain(updatedUser),
      'Email updated successfully',
    );
  }

  @Get('balance')
  async getBalance(@Request() req: AuthenticatedRequest): Promise<ApiResponse> {
    const userBalance = await this.userService.getBalance(req.user.sub);
    return ResponseHelper.success(
      { balance: userBalance },
      'Balance fetched successfully',
    );
  }
}

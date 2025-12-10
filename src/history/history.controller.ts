import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { HistoryService } from './history.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResponseHelper } from '../common/helpers/response.helper';
import { ApiResponse } from '../common/interfaces/response.interface';
import { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { CreateHistoryDto, QueryHistoryDto } from './dto/history.dto';

@Controller('api/history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
  constructor(private readonly historyService: HistoryService) {}

  @Post()
  async createHistory(
    @Request() req: AuthenticatedRequest,
    @Body() createHistoryDto: CreateHistoryDto,
  ): Promise<ApiResponse> {
    const history = await this.historyService.createHistory(
      req.user.sub,
      createHistoryDto,
    );
    return ResponseHelper.created(history, 'History created successfully');
  }

  @Get()
  async getHistories(
    @Request() req: AuthenticatedRequest,
    @Query() queryDto: QueryHistoryDto,
  ): Promise<ApiResponse> {
    const result = await this.historyService.getUserHistories(
      req.user.sub,
      queryDto,
    );
    return ResponseHelper.success(
      {
        items: result.histories,
        total: result.total,
        page: queryDto.page || 1,
        limit: queryDto.limit || 20,
        totalPages: Math.ceil(result.total / (queryDto.limit || 20)),
      },
      'Histories fetched successfully',
    );
  }

  @Get('statistics')
  async getStatistics(
    @Request() req: AuthenticatedRequest,
  ): Promise<ApiResponse> {
    const statistics = await this.historyService.getStatistics(req.user.sub);
    return ResponseHelper.success(
      statistics,
      'Statistics fetched successfully',
    );
  }

  @Get(':id')
  async getHistory(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    const history = await this.historyService.getHistoryById(req.user.sub, id);
    return ResponseHelper.success(history, 'History fetched successfully');
  }

  @Delete(':id')
  async deleteHistory(
    @Request() req: AuthenticatedRequest,
    @Param('id') id: string,
  ): Promise<ApiResponse> {
    await this.historyService.deleteHistory(req.user.sub, id);
    return ResponseHelper.success(null, 'History deleted successfully');
  }
}

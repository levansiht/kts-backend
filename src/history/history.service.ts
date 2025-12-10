import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { GeminiHistory } from './entities/gemini-history.entity';
import { CreateHistoryDto, QueryHistoryDto } from './dto/history.dto';

@Injectable()
export class HistoryService {
  private readonly logger = new Logger(HistoryService.name);

  constructor(
    @InjectRepository(GeminiHistory)
    private readonly historyRepository: Repository<GeminiHistory>,
  ) {}

  async createHistory(
    userId: string,
    createHistoryDto: CreateHistoryDto,
  ): Promise<GeminiHistory> {
    const history = this.historyRepository.create({
      userId,
      ...createHistoryDto,
    });

    const savedHistory = await this.historyRepository.save(history);
    this.logger.log(`History created for user ${userId}: ${savedHistory.id}`);
    return savedHistory;
  }

  async getUserHistories(
    userId: string,
    queryDto: QueryHistoryDto,
  ): Promise<{ histories: GeminiHistory[]; total: number }> {
    const { page = 1, limit = 20, actionType, isSuccess } = queryDto;

    const where: FindOptionsWhere<GeminiHistory> = { userId };

    if (actionType) {
      where.actionType = actionType;
    }

    if (isSuccess !== undefined) {
      where.isSuccess = isSuccess;
    }

    const [histories, total] = await this.historyRepository.findAndCount({
      where,
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { histories, total };
  }

  async getHistoryById(
    userId: string,
    historyId: string,
  ): Promise<GeminiHistory> {
    const history = await this.historyRepository.findOne({
      where: { id: historyId, userId },
    });

    if (!history) {
      throw new NotFoundException('History not found');
    }

    return history;
  }

  async deleteHistory(userId: string, historyId: string): Promise<void> {
    const history = await this.getHistoryById(userId, historyId);
    await this.historyRepository.remove(history);
    this.logger.log(`History deleted: ${historyId}`);
  }

  async getStatistics(userId: string): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    actionsByType: Record<string, number>;
    totalCost: number;
  }> {
    const histories = await this.historyRepository.find({
      where: { userId },
    });

    const statistics = {
      totalActions: histories.length,
      successfulActions: histories.filter((h) => h.isSuccess).length,
      failedActions: histories.filter((h) => !h.isSuccess).length,
      actionsByType: {} as Record<string, number>,
      totalCost: 0,
    };

    histories.forEach((history) => {
      // Count by action type
      if (!statistics.actionsByType[history.actionType]) {
        statistics.actionsByType[history.actionType] = 0;
      }
      statistics.actionsByType[history.actionType]++;

      // Sum total cost
      if (history.cost) {
        statistics.totalCost += Number(history.cost);
      }
    });

    return statistics;
  }
}

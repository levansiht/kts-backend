import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { GeminiActionType } from '../../common/enums';

@Entity('gemini_histories')
@Index(['userId', 'createdAt'])
@Index(['actionType', 'createdAt'])
export class GeminiHistory {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column({
    type: 'enum',
    enum: GeminiActionType,
  })
  actionType!: GeminiActionType;

  @Column({ type: 'text', nullable: true })
  prompt!: string | null;

  @Column({ type: 'text', nullable: true })
  sourceImageUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  resultImageUrl!: string | null;

  @Column({ type: 'text', nullable: true })
  resultText!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  parameters!: Record<string, unknown> | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @Column({ type: 'boolean', default: true })
  isSuccess!: boolean;

  @Column({ type: 'text', nullable: true })
  errorMessage!: string | null;

  @Column({ type: 'integer', nullable: true })
  processingTimeMs!: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  cost!: number | null;

  @CreateDateColumn()
  createdAt!: Date;
}

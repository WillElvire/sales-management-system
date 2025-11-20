import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CashCollectTransaction } from './cash-collect-transaction.entity';

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('cash_collect_agents')
export class CashCollectAgent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @OneToMany(() => CashCollectTransaction, (transaction) => transaction.agent)
  transactions: CashCollectTransaction[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


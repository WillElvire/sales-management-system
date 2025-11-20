import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { CashCollectAgent } from './cash-collect-agent.entity';

export enum TransactionType {
  ENCAISSEMENT = 'encaissement',
  VERSEMENT = 'versement',
}

export enum TransactionDestination {
  FOURNISSEUR = 'Fournisseur',
  ORGANISATION = 'Organisation',
  TRESORERIE = 'Trésorerie',
}

@Entity('cash_collect_transactions')
export class CashCollectTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CashCollectAgent, (agent) => agent.transactions, { nullable: false })
  @JoinColumn({ name: 'agentId' })
  agent: CashCollectAgent;

  @Column({ type: 'enum', enum: TransactionType })
  type: TransactionType;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column()
  country: string;

  @Column({ type: 'enum', enum: TransactionDestination, nullable: true })
  destination: TransactionDestination;

  @Column({ nullable: true })
  destinationName: string;

  @Column({ nullable: true })
  notes: string;

  @Column({ type: 'date' })
  transactionDate: Date;

  @CreateDateColumn()
  createdAt: Date;
}


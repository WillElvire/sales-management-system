import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ECardSupplier } from './e-card-supplier.entity';

export enum PurchaseType {
  DIRECT = 'direct',
  CREDIT = 'credit',
}

@Entity('e_card_purchases')
export class ECardPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ECardSupplier, (supplier) => supplier.purchases)
  supplier: ECardSupplier;

  @Column()
  supplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  rate: number;

  @Column()
  currency: string;

  @Column({ type: 'enum', enum: PurchaseType })
  type: PurchaseType;

  @Column({ type: 'date', nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}


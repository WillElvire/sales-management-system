import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UsdtSupplier } from './usdt-supplier.entity';

@Entity('usdt_purchases')
export class UsdtPurchase {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsdtSupplier, (supplier) => supplier.purchases)
  supplier: UsdtSupplier;

  @Column()
  supplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 4 })
  rate: number;

  @Column()
  currency: string;

  @Column()
  country: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}


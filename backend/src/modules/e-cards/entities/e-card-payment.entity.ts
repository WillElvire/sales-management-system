import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { ECardSupplier } from './e-card-supplier.entity';

@Entity('e_card_payments')
export class ECardPayment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ECardSupplier, (supplier) => supplier.payments)
  supplier: ECardSupplier;

  @Column()
  supplierId: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  proofOfPayment: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}


import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { UsdtSupplier } from './usdt-supplier.entity';

@Entity('usdt_payment_proofs')
export class UsdtPaymentProof {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsdtSupplier)
  supplier: UsdtSupplier;

  @Column()
  supplierId: string;

  @Column()
  filePath: string;

  @Column({ nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}


import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsdtSupplier } from './usdt-supplier.entity';

export enum AccountStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('usdt_accounts')
export class UsdtAccount {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => UsdtSupplier, (supplier) => supplier.accounts)
  supplier: UsdtSupplier;

  @Column()
  supplierId: string;

  @Column()
  accountName: string;

  @Column({ type: 'enum', enum: AccountStatus, default: AccountStatus.ACTIVE })
  status: AccountStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


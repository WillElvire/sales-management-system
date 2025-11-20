import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UsdtPurchase } from './usdt-purchase.entity';
import { UsdtAccount } from './usdt-account.entity';

export enum PaymentMethod {
  BANK = 'Banque',
  CASH = 'Cash',
  MOBILE_MONEY = 'Mobile Money',
}

@Entity('usdt_suppliers')
export class UsdtSupplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  country: string;

  @Column()
  trc20Address: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => UsdtPurchase, (purchase) => purchase.supplier)
  purchases: UsdtPurchase[];

  @OneToMany(() => UsdtAccount, (account) => account.supplier)
  accounts: UsdtAccount[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


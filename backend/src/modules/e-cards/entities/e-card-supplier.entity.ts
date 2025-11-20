import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ECardPurchase } from './e-card-purchase.entity';
import { ECardPayment } from './e-card-payment.entity';

export enum PaymentMethod {
  BANK = 'Banque',
  CASH = 'Cash',
  MOBILE_MONEY = 'Mobile Money',
}

@Entity('e_card_suppliers')
export class ECardSupplier {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  balance: number;

  @Column({ type: 'enum', enum: PaymentMethod, nullable: true })
  paymentMethod: PaymentMethod;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ECardPurchase, (purchase) => purchase.supplier)
  purchases: ECardPurchase[];

  @OneToMany(() => ECardPayment, (payment) => payment.supplier)
  payments: ECardPayment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


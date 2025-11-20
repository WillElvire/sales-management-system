import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Client } from '../../clients/entities/client.entity';

@Entity('e_card_sales')
export class ECardSale {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  country: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column()
  currency: string;

  @Column({ type: 'date' })
  saleDate: Date;

  @Column()
  clientFirstName: string;

  @Column()
  clientLastName: string;

  @Column()
  clientContact: string;

  @Column({ nullable: true })
  clientId?: string;

  @ManyToOne(() => Client, (client) => client.ecardSales, { nullable: true }) // relation with client entity
  @JoinColumn({ name: 'clientId' })
  client?: Client;

  @CreateDateColumn()
  createdAt: Date;
}


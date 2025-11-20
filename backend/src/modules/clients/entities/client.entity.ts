import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Unique,
} from 'typeorm';
import { ECardSale } from '../../e-cards/entities/e-card-sale.entity';

@Entity('clients')
@Unique(['contact'])
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  contact: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ nullable: true })
  company?: string;

  @Column({ nullable: true })
  notes?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => ECardSale, (sale) => sale.client)
  ecardSales: ECardSale[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


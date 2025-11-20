import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
} from 'typeorm';

@Entity('countries')
@Unique(['code'])
export class Country {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 5 })
  code: string;

  @Column({ length: 5 })
  currency: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  region?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}


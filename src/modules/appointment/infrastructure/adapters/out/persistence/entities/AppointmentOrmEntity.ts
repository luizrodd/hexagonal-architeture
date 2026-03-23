import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('appointments')
export class AppointmentOrmEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column('uuid')
  patientId!: string

  @Column('uuid')
  doctorId!: string

  @Column({ type: 'timestamptz' })
  slotStart!: Date

  @Column({ type: 'timestamptz' })
  slotEnd!: Date

  @Column({ length: 30, default: 'SCHEDULED' })
  status!: string

  @Column({ length: 500 })
  reason!: string

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @Column({ type: 'text', nullable: true })
  cancelReason!: string | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

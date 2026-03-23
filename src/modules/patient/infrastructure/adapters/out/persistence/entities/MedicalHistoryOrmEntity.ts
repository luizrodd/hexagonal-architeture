import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { PatientOrmEntity } from './PatientOrmEntity'

@Entity('medical_history')
export class MedicalHistoryOrmEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column('uuid')
  patientId!: string

  @ManyToOne(() => PatientOrmEntity, (p) => p.medicalHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'patientId' })
  patient!: PatientOrmEntity

  @Column({ length: 500 })
  description!: string

  @Column({ type: 'date' })
  diagnosedAt!: Date

  @Column({ default: true })
  isActive!: boolean

  @Column({ type: 'text', nullable: true })
  notes!: string | null

  @CreateDateColumn()
  createdAt!: Date
}

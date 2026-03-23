import {
  Entity,
  Column,
  PrimaryColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { MedicalRecordOrmEntity } from './MedicalRecordOrmEntity'

@Entity('prescriptions')
export class PrescriptionOrmEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column('uuid')
  medicalRecordId!: string

  @ManyToOne(() => MedicalRecordOrmEntity, (mr) => mr.prescriptions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'medicalRecordId' })
  medicalRecord!: MedicalRecordOrmEntity

  @Column('uuid')
  appointmentId!: string

  @Column('uuid')
  doctorId!: string

  @Column({ length: 20 })
  diagnosisCode!: string

  @Column({ length: 500 })
  diagnosisDescription!: string

  @Column({ type: 'jsonb' })
  medications!: Array<{
    name: string
    dosage: string
    frequency: string
    duration: string
  }>

  @Column({ type: 'text' })
  instructions!: string

  @Column({ default: true })
  isActive!: boolean

  @CreateDateColumn()
  prescribedAt!: Date
}

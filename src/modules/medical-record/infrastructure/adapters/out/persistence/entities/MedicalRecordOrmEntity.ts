import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { PrescriptionOrmEntity } from './PrescriptionOrmEntity'

@Entity('medical_records')
export class MedicalRecordOrmEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column('uuid')
  patientId!: string

  @Column('uuid')
  appointmentId!: string

  @Column({ type: 'text' })
  anamnesis!: string

  @Column({ type: 'text', nullable: true })
  physicalExam!: string | null

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => PrescriptionOrmEntity, (p) => p.medicalRecord, {
    cascade: true,
    eager: true,
  })
  prescriptions!: PrescriptionOrmEntity[]
}

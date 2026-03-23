import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('doctors')
export class DoctorOrmEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column({ length: 10 })
  crmNumber!: string

  @Column({ length: 2 })
  crmState!: string

  @Column({ length: 50 })
  specialty!: string

  @Column({ length: 255 })
  email!: string

  @Column({ length: 11 })
  phone!: string

  @Column({ type: 'jsonb' })
  workSchedule!: Array<{
    weekday: string
    startTime: string
    endTime: string
  }>

  @Column({ length: 20, default: 'ACTIVE' })
  status!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date
}

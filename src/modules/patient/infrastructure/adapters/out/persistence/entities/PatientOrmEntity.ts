import {
  Entity,
  Column,
  PrimaryColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { MedicalHistoryOrmEntity } from './MedicalHistoryOrmEntity'

/**
 * ORM Entity: PatientOrmEntity
 *
 * Esta classe é um MODELO DE DADOS puro para o TypeORM.
 * Ela NÃO tem lógica de domínio.
 * Ela é decorada com @Column etc. para mapear para a tabela do banco.
 *
 * === POR QUE SEPARAR ORM Entity do Domain Entity? ===
 * - O TypeORM precisa de classes mutáveis com propriedades públicas
 * - O Domain Entity precisa de encapsulamento, imutabilidade, Value Objects
 * - Se você usar a mesma classe para ambos, o domínio fica "anêmico" (só dados, sem lógica)
 *   OU o ORM não funciona corretamente
 *
 * O Mapper (PatientMapper) faz a tradução entre os dois mundos.
 */
@Entity('patients')
export class PatientOrmEntity {
  @PrimaryColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column({ length: 11, unique: true })
  cpf!: string  // armazena apenas dígitos

  @Column({ length: 255, unique: true })
  email!: string

  @Column({ length: 11 })
  phone!: string  // armazena apenas dígitos

  @Column({ type: 'date' })
  birthDate!: Date

  @Column({ length: 255 })
  street!: string

  @Column({ length: 50 })
  addressNumber!: string

  @Column({ length: 255, nullable: true })
  complement!: string | null

  @Column({ length: 255 })
  neighborhood!: string

  @Column({ length: 255 })
  city!: string

  @Column({ length: 2 })
  state!: string

  @Column({ length: 8 })
  zipCode!: string

  @Column({ length: 20, default: 'ACTIVE' })
  status!: string

  @CreateDateColumn()
  createdAt!: Date

  @UpdateDateColumn()
  updatedAt!: Date

  @OneToMany(() => MedicalHistoryOrmEntity, (mh) => mh.patient, {
    cascade: true,
    eager: true,
  })
  medicalHistory!: MedicalHistoryOrmEntity[]
}

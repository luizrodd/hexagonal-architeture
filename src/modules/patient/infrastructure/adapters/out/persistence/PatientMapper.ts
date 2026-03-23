import { UniqueEntityId } from '@shared/domain/UniqueEntityId'
import { Patient, PatientStatus } from '@modules/patient/domain/Patient'
import { CPF } from '@modules/patient/domain/CPF'
import { Email } from '@modules/patient/domain/Email'
import { Phone } from '@modules/patient/domain/Phone'
import { Address } from '@modules/patient/domain/Address'
import { MedicalHistory } from '@modules/patient/domain/MedicalHistory'
import { PatientResponseDto } from '@modules/patient/application/dto/PatientResponseDto'
import { PatientOrmEntity } from './entities/PatientOrmEntity'
import { MedicalHistoryOrmEntity } from './entities/MedicalHistoryOrmEntity'

/**
 * PatientMapper
 *
 * Responsável pela tradução entre as três representações do paciente:
 * 1. Domain Object (Patient) — rico em comportamento, usa Value Objects
 * 2. ORM Entity (PatientOrmEntity) — plano, mutável, para o TypeORM
 * 3. Response DTO (PatientResponseDto) — formatado para o cliente HTTP
 *
 * === POR QUE ESTE PADRÃO EXISTE? ===
 * O ORM precisa de acesso direto às propriedades (sem encapsulamento).
 * O Domain Object encapsula tudo (getters, sem setters diretos).
 * O Mapper resolve este "impedance mismatch" (desfasamento de impedância).
 *
 * Se o schema do banco mudar → só o Mapper muda.
 * Se o domínio mudar → só o Mapper muda.
 * O Use Case não sabe que o banco existe.
 */
export class PatientMapper {
  /**
   * ORM Entity → Domain Object (usado pelo repositório ao carregar do banco)
   */
  static toDomain(raw: PatientOrmEntity): Patient {
    // Re-hidrata os Value Objects a partir dos dados primitivos do banco
    const cpf = CPF.create(raw.cpf)
    const email = Email.create(raw.email)
    const phone = Phone.create(raw.phone)
    const address = Address.create({
      street: raw.street,
      number: raw.addressNumber,
      complement: raw.complement ?? undefined,
      neighborhood: raw.neighborhood,
      city: raw.city,
      state: raw.state,
      zipCode: raw.zipCode,
    })

    // Se os dados do banco são inválidos, há um bug de consistência — falha rápido
    if (cpf.isLeft()) throw new Error(`[PatientMapper] CPF inválido no banco: ${raw.cpf}`)
    if (email.isLeft()) throw new Error(`[PatientMapper] Email inválido no banco: ${raw.email}`)
    if (phone.isLeft()) throw new Error(`[PatientMapper] Phone inválido no banco: ${raw.phone}`)
    if (address.isLeft()) throw new Error(`[PatientMapper] Address inválido no banco`)

    const medicalHistory = (raw.medicalHistory ?? []).map((mh) =>
      MedicalHistory.reconstitute(
        {
          description: mh.description,
          diagnosedAt: mh.diagnosedAt,
          isActive: mh.isActive,
          notes: mh.notes ?? undefined,
        },
        new UniqueEntityId(mh.id),
      ),
    )

    return Patient.reconstitute(
      {
        name: raw.name,
        cpf: cpf.value,
        email: email.value,
        phone: phone.value,
        birthDate: raw.birthDate,
        address: address.value,
        status: raw.status as PatientStatus,
        medicalHistory,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
      },
      new UniqueEntityId(raw.id),
    )
  }

  /**
   * Domain Object → ORM Entity (usado pelo repositório ao salvar)
   */
  static toOrmEntity(patient: Patient): PatientOrmEntity {
    const orm = new PatientOrmEntity()
    orm.id = patient.id.toValue()
    orm.name = patient.name
    orm.cpf = patient.cpf.value
    orm.email = patient.email.value
    orm.phone = patient.phone.value
    orm.birthDate = patient.birthDate
    orm.street = patient.address.street
    orm.addressNumber = patient.address.number
    orm.complement = patient.address.complement ?? null
    orm.neighborhood = patient.address.neighborhood
    orm.city = patient.address.city
    orm.state = patient.address.state
    orm.zipCode = patient.address.zipCode
    orm.status = patient.status

    orm.medicalHistory = patient.medicalHistory.map((mh) => {
      const mhOrm = new MedicalHistoryOrmEntity()
      mhOrm.id = mh.id.toValue()
      mhOrm.patientId = patient.id.toValue()
      mhOrm.description = mh.description
      mhOrm.diagnosedAt = mh.diagnosedAt
      mhOrm.isActive = mh.isActive
      mhOrm.notes = mh.notes ?? null
      return mhOrm
    })

    return orm
  }

  /**
   * Domain Object → Response DTO (usado pelos Use Cases para retornar dados)
   */
  static toResponseDto(patient: Patient): PatientResponseDto {
    return {
      id: patient.id.toValue(),
      name: patient.name,
      cpf: patient.cpf.formatted,
      email: patient.email.value,
      phone: patient.phone.formatted,
      birthDate: patient.birthDate.toISOString().split('T')[0],
      address: {
        street: patient.address.street,
        number: patient.address.number,
        complement: patient.address.complement,
        neighborhood: patient.address.neighborhood,
        city: patient.address.city,
        state: patient.address.state,
        zipCode: patient.address.zipCode,
      },
      status: patient.status,
      createdAt: patient.createdAt.toISOString(),
      updatedAt: patient.updatedAt.toISOString(),
    }
  }
}

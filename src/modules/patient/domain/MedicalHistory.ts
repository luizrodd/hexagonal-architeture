import { Entity } from '@shared/domain/Entity'
import { UniqueEntityId } from '@shared/domain/UniqueEntityId'

interface MedicalHistoryProps {
  description: string
  diagnosedAt: Date
  isActive: boolean
  notes?: string
}

/**
 * Entity filha: MedicalHistory (Histórico Médico)
 *
 * Esta é uma Entity (não um Aggregate Root).
 * Ela TEM identidade própria (pode referenciar uma condição específica),
 * mas NÃO é carregada/salva diretamente pelo repositório.
 *
 * Ela existe dentro do agregado Patient e só é acessada
 * passando pelo Patient.
 *
 * Diferença Entity vs Value Object:
 * - Entity: identidade por ID (dois registros de "Hipertensão" podem ser diferentes históricos)
 * - VO: identidade por estrutura (dois Endereços com mesmos dados são o mesmo endereço)
 */
export class MedicalHistory extends Entity<MedicalHistoryProps> {
  private constructor(props: MedicalHistoryProps, id?: UniqueEntityId) {
    super(props, id)
  }

  get description(): string { return this.props.description }
  get diagnosedAt(): Date { return this.props.diagnosedAt }
  get isActive(): boolean { return this.props.isActive }
  get notes(): string | undefined { return this.props.notes }

  static create(props: {
    description: string
    diagnosedAt: Date
    notes?: string
  }, id?: UniqueEntityId): MedicalHistory {
    return new MedicalHistory(
      { ...props, isActive: true },
      id,
    )
  }

  /** Reconstitui a entidade a partir da persistência (sem validações de criação) */
  static reconstitute(props: MedicalHistoryProps, id: UniqueEntityId): MedicalHistory {
    return new MedicalHistory(props, id)
  }

  deactivate(): void {
    this.props.isActive = false
  }

  addNotes(notes: string): void {
    this.props.notes = notes
  }
}

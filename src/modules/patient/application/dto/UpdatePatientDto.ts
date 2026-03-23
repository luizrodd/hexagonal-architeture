/**
 * DTO de entrada para atualização de dados de contato do paciente.
 * Todos os campos são opcionais — atualiza apenas o que for fornecido.
 */
export interface UpdatePatientDto {
  email?: string
  phone?: string
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}

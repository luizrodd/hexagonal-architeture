/**
 * DTO de saída para respostas de paciente.
 *
 * Expõe apenas o que o cliente precisa saber.
 * CPF é retornado formatado (000.000.000-00).
 */
export interface PatientResponseDto {
  id: string
  name: string
  cpf: string       // formatado: "123.456.789-09"
  email: string
  phone: string     // formatado: "(11) 99999-9999"
  birthDate: string // ISO 8601
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  status: string
  createdAt: string
  updatedAt: string
}

/**
 * DTO de entrada para cadastro de paciente.
 *
 * DTOs carregam dados entre camadas, sem lógica.
 * Eles usam tipos primitivos (string, number) — não Value Objects.
 * A conversão de primitivos para VOs acontece dentro do Use Case.
 */
export interface RegisterPatientDto {
  name: string
  cpf: string       // "123.456.789-09" ou "12345678909"
  email: string
  phone: string
  birthDate: string // ISO 8601: "1990-05-15"
  address: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
}

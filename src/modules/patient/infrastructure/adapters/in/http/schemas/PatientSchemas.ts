import { z } from 'zod'

/**
 * Schemas Zod para validação das requisições HTTP.
 *
 * A validação de REQUEST (dados externos vindos do HTTP) é responsabilidade
 * da camada de infraestrutura (driving adapter), não do domínio.
 *
 * O domínio valida INVARIANTES DE NEGÓCIO (ex: CPF com dígitos corretos).
 * O adapter valida FORMATO DA ENTRADA (ex: campo obrigatório, string não vazia).
 *
 * Sequência de validação:
 * 1. Zod valida: os campos existem e têm o tipo certo? (HTTP 400 se não)
 * 2. Value Object valida: os dados fazem sentido no negócio? (HTTP 422 se não)
 */

const addressSchema = z.object({
  street: z.string().min(1, 'Rua é obrigatória'),
  number: z.string().min(1, 'Número é obrigatório'),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, 'Bairro é obrigatório'),
  city: z.string().min(1, 'Cidade é obrigatória'),
  state: z.string().length(2, 'Estado deve ter 2 caracteres (UF)'),
  zipCode: z.string().min(8, 'CEP deve ter pelo menos 8 caracteres'),
})

export const registerPatientSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  cpf: z.string().min(1, 'CPF é obrigatório'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD'),
  address: addressSchema,
})

export const updatePatientSchema = z.object({
  email: z.string().email('Email inválido').optional(),
  phone: z.string().optional(),
  address: addressSchema.optional(),
})

export type RegisterPatientInput = z.infer<typeof registerPatientSchema>
export type UpdatePatientInput = z.infer<typeof updatePatientSchema>

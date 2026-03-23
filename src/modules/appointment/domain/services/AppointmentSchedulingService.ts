import { Appointment } from '../Appointment'
import { TimeSlot } from '../TimeSlot'
import { DoctorId } from '@modules/doctor/domain/DoctorId'

/**
 * Domain Service: AppointmentSchedulingService
 *
 * Um Domain Service é necessário quando a lógica envolve múltiplos
 * agregados e pertence claramente ao domínio (não à aplicação).
 *
 * === POR QUE DOMAIN SERVICE E NÃO MÉTODO NO AGGREGATE? ===
 * Para verificar disponibilidade, precisamos de:
 * - O TimeSlot desejado (do novo agendamento)
 * - As consultas EXISTENTES do médico naquele período
 *
 * O Aggregate Appointment não carrega outras consultas dentro dele.
 * Se colocássemos esta lógica no Appointment, ele precisaria de acesso
 * ao repositório — violando o princípio de que o domínio é puro.
 *
 * === IMPORTANTE ===
 * O Domain Service NÃO chama repositórios.
 * Ele recebe os dados já carregados pelo Use Case.
 *
 * O Use Case:
 * 1. Carrega as consultas existentes do médico via repositório
 * 2. Passa as consultas para o Domain Service
 * 3. O Domain Service verifica a disponibilidade com lógica pura
 */
export class AppointmentSchedulingService {
  /**
   * Verifica se um médico está disponível para o TimeSlot solicitado.
   *
   * @param doctorId - ID do médico
   * @param desiredSlot - O horário desejado para a nova consulta
   * @param existingAppointments - Consultas já agendadas do médico no período
   */
  isSlotAvailable(
    doctorId: DoctorId,
    desiredSlot: TimeSlot,
    existingAppointments: Appointment[],
  ): boolean {
    // Filtra apenas consultas do médico que não foram canceladas
    const relevantAppointments = existingAppointments.filter(
      (appt) =>
        appt.doctorId === doctorId.toValue() &&
        !appt.status.isTerminal,
    )

    // Verifica se alguma consulta existente sobrepõe com o horário desejado
    const hasConflict = relevantAppointments.some((appt) =>
      appt.timeSlot.overlapsWith(desiredSlot),
    )

    return !hasConflict
  }
}

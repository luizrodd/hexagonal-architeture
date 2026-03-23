/**
 * Driven Port: NotificationService
 *
 * A camada de aplicação define esta interface.
 * A infraestrutura a implementa (ex: SendGridNotificationService).
 *
 * O use case não sabe se as notificações vão por email, SMS ou push.
 */
export interface NotificationService {
  sendAppointmentConfirmation(patientEmail: string, appointmentDetails: {
    doctorName: string
    date: Date
    location: string
  }): Promise<void>

  sendAppointmentCancellation(patientEmail: string, reason: string): Promise<void>
}

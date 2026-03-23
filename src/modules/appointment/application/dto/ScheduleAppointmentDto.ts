export interface ScheduleAppointmentDto {
  patientId: string
  doctorId: string
  startTime: string  // ISO 8601: "2024-03-15T09:00:00Z"
  endTime: string
  reason: string
}

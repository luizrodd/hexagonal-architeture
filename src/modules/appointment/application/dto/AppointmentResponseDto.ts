export interface AppointmentResponseDto {
  id: string
  patientId: string
  doctorId: string
  timeSlot: {
    start: string
    end: string
    durationMinutes: number
  }
  status: string
  reason: string
  notes?: string
  cancelReason?: string
  createdAt: string
  updatedAt: string
}

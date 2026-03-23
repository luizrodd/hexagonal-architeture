export interface DoctorResponseDto {
  id: string
  name: string
  crm: string
  specialty: string
  specialtyLabel: string
  email: string
  phone: string
  workSchedule: Array<{
    weekday: string
    startTime: string
    endTime: string
  }>
  status: string
  createdAt: string
  updatedAt: string
}

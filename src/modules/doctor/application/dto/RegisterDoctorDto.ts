export interface WorkScheduleWindowDto {
  weekday: string
  startTime: string
  endTime: string
}

export interface RegisterDoctorDto {
  name: string
  crm: string
  specialty: string
  email: string
  phone: string
  workSchedule: WorkScheduleWindowDto[]
}

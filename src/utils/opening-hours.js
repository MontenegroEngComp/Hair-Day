import { isPastSlot } from "./date.js"

/** Períodos de atendimento do salão e seus horários disponíveis. */
export const PERIODS = [
  {
    id: "morning",
    label: "Manhã",
    range: "09h–12h",
    hours: ["09:00", "10:00", "11:00", "12:00"],
  },
  {
    id: "afternoon",
    label: "Tarde",
    range: "13h–18h",
    hours: ["13:00", "14:00", "15:00", "16:00", "17:00", "18:00"],
  },
  {
    id: "night",
    label: "Noite",
    range: "19h–21h",
    hours: ["19:00", "20:00", "21:00"],
  },
]

export const OPENING_HOURS = PERIODS.flatMap((period) => period.hours)

export function isOpeningHour(time) {
  return OPENING_HOURS.includes(time)
}

/** Retorna o id do período ("morning", "afternoon" ou "night") de um horário HH:mm. */
export function getPeriodId(time) {
  const hour = Number(time.split(":")[0])

  if (hour < 13) return "morning"
  if (hour < 19) return "afternoon"
  return "night"
}

/**
 * Calcula a disponibilidade de cada horário de um dia, agrupada por período.
 * Um horário fica indisponível quando já está reservado ou quando já passou.
 */
export function getAvailability(isoDate, bookedTimes = [], now = new Date()) {
  const booked = new Set(bookedTimes)

  return PERIODS.map((period) => ({
    ...period,
    slots: period.hours.map((time) => {
      const isBooked = booked.has(time)
      const isPast = isPastSlot(isoDate, time, now)

      return {
        time,
        isBooked,
        isPast,
        isAvailable: !isBooked && !isPast,
      }
    }),
  }))
}

/** Agrupa agendamentos por período, ordenados por horário. */
export function groupByPeriod(schedules) {
  const groups = Object.fromEntries(PERIODS.map((period) => [period.id, []]))

  const sorted = [...schedules].sort((a, b) => a.time.localeCompare(b.time))

  for (const schedule of sorted) {
    groups[getPeriodId(schedule.time)].push(schedule)
  }

  return groups
}

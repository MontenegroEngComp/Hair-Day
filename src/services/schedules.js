import { request } from "./api.js"

/** GET /schedules?date=AAAA-MM-DD — agendamentos de um dia, ordenados por horário. */
export function fetchSchedulesByDay(date) {
  const query = new URLSearchParams({ date, _sort: "time", _order: "asc" })

  return request(`/schedules?${query}`)
}

/** POST /schedules — cria um agendamento. */
export function createSchedule({ date, time, name }) {
  return request("/schedules", {
    method: "POST",
    body: { date, time, name, createdAt: new Date().toISOString() },
  })
}

/** DELETE /schedules/:id — cancela um agendamento. */
export function cancelSchedule(id) {
  return request(`/schedules/${encodeURIComponent(id)}`, { method: "DELETE" })
}

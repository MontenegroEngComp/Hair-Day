import { toISODate } from "../utils/date.js"

// [dias a partir de hoje, horário, cliente]
const SAMPLES = [
  [0, "11:00", "Ryan Dorwart"],
  [0, "13:00", "Livia Curtis"],
  [0, "14:00", "Randy Calzoni"],
  [0, "16:00", "Marley Franci"],
  [0, "17:00", "Jaylon Korsgaard"],
  [0, "21:00", "Maria Herwitz"],
  [1, "09:00", "Helena Souza"],
  [1, "15:00", "Caio Andrade"],
  [1, "19:00", "Beatriz Lima"],
]

/**
 * Agendamentos de exemplo para hoje e amanhã, usados pelo script de seed
 * da API local e pelo modo de demonstração.
 */
export function createSampleSchedules(today = new Date()) {
  const createdAt = new Date().toISOString()

  return SAMPLES.map(([offset, time, name], index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + offset)

    return { id: index + 1, date: toISODate(date), time, name, createdAt }
  })
}

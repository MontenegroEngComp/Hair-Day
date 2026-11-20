import { isPastSlot, isValidISODate } from "../../utils/date.js"
import { isOpeningHour } from "../../utils/opening-hours.js"

export const NAME_MIN_LENGTH = 3
export const NAME_MAX_LENGTH = 60

// Letras (com acentos), espaços, apóstrofo e hífen — ex.: "Ana D'Ávila", "João-Pedro".
const NAME_PATTERN = /^\p{L}[\p{L}' -]*$/u

/** Remove espaços extras do início, do fim e entre as palavras. */
export function normalizeName(value = "") {
  return value.trim().replace(/\s+/g, " ")
}

export function validateName(value) {
  const name = normalizeName(value)

  if (!name) return "Informe o nome do cliente."

  if (name.length < NAME_MIN_LENGTH) {
    return `O nome precisa ter pelo menos ${NAME_MIN_LENGTH} caracteres.`
  }

  if (name.length > NAME_MAX_LENGTH) {
    return `O nome pode ter no máximo ${NAME_MAX_LENGTH} caracteres.`
  }

  if (!NAME_PATTERN.test(name)) {
    return "Use apenas letras, espaços, hífen ou apóstrofo."
  }

  return null
}

export function validateDate(value, today) {
  if (!value) return "Selecione uma data."
  if (!isValidISODate(value)) return "Informe uma data válida."
  if (value < today) return "Escolha uma data a partir de hoje."

  return null
}

export function validateTime(time, date, now = new Date()) {
  if (!time) return "Selecione um horário."
  if (!isOpeningHour(time)) return "Escolha um horário de funcionamento."
  if (isValidISODate(date) && isPastSlot(date, time, now)) {
    return "Esse horário já passou. Escolha outro."
  }

  return null
}

/**
 * Valida todos os campos do agendamento.
 * Retorna um objeto apenas com os campos inválidos, ex.: { name: "..." }.
 */
export function validateSchedule({ date, time, name }, { today, now }) {
  const errors = {
    date: validateDate(date, today),
    time: validateTime(time, date, now),
    name: validateName(name),
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message !== null),
  )
}

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

/**
 * Converte uma data para o formato AAAA-MM-DD usando o fuso horário local
 * (toISOString usaria UTC e poderia "voltar" um dia à noite).
 */
export function toISODate(date = new Date()) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")

  return `${year}-${month}-${day}`
}

export function isValidISODate(value) {
  if (typeof value !== "string" || !ISO_DATE_PATTERN.test(value)) {
    return false
  }

  const [year, month, day] = value.split("-").map(Number)
  const date = new Date(year, month - 1, day)

  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  )
}

/** Monta um Date local a partir de uma data (AAAA-MM-DD) e um horário (HH:mm). */
export function toDateTime(isoDate, time) {
  const [year, month, day] = isoDate.split("-").map(Number)
  const [hours, minutes] = time.split(":").map(Number)

  return new Date(year, month - 1, day, hours, minutes)
}

/** Indica se o horário de um dia já começou (ou passou) em relação a `now`. */
export function isPastSlot(isoDate, time, now = new Date()) {
  return toDateTime(isoDate, time) <= now
}

const longDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  weekday: "long",
  day: "numeric",
  month: "long",
})

const shortDateFormatter = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
})

/** Ex.: "sexta-feira, 20 de novembro" */
export function formatLongDate(isoDate) {
  return longDateFormatter.format(toDateTime(isoDate, "00:00"))
}

/** Ex.: "20/11" */
export function formatShortDate(isoDate) {
  return shortDateFormatter.format(toDateTime(isoDate, "00:00"))
}

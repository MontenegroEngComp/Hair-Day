import { createSchedule, fetchSchedulesByDay } from "../../services/schedules.js"
import { formatShortDate, isValidISODate, toISODate } from "../../utils/date.js"
import { getAvailability } from "../../utils/opening-hours.js"
import { showToast } from "../ui/toast.js"
import { renderSlotsMessage, renderTimeSlots } from "./time-slots.js"
import { normalizeName, validateName, validateSchedule } from "./validation.js"

const form = document.querySelector("#schedule-form")
const dateInput = form.elements.date
const nameInput = form.elements.name
const slotsContainer = form.querySelector("#time-slots")
const submitButton = form.querySelector('button[type="submit"]')

// Elementos que recebem o estado de erro de cada campo.
const fields = {
  date: { field: dateInput.closest(".field"), control: dateInput },
  time: { field: slotsContainer.closest(".field"), control: slotsContainer.closest("fieldset") },
  name: { field: nameInput.closest(".field"), control: nameInput },
}

let slotsRequestId = 0
let hasTriedToSubmit = false

function getSelectedTime() {
  return form.querySelector('input[name="time"]:checked')?.value ?? ""
}

function setFieldError(name, message) {
  const { field, control } = fields[name]
  const errorElement = field.querySelector(".field__error")

  field.classList.toggle("field--invalid", Boolean(message))
  control.setAttribute("aria-invalid", String(Boolean(message)))
  errorElement.textContent = message ?? ""
}

function showErrors(errors) {
  for (const name of Object.keys(fields)) {
    setFieldError(name, errors[name] ?? null)
  }
}

function focusFirstInvalid(errors) {
  if (errors.date) return dateInput.focus()
  if (errors.time) {
    const firstOption = form.querySelector('input[name="time"]:not(:disabled)')
    return (firstOption ?? dateInput).focus()
  }
  if (errors.name) nameInput.focus()
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading
  submitButton.setAttribute("aria-busy", String(isLoading))
  submitButton.querySelector(".button__label").textContent = isLoading
    ? "Agendando…"
    : "Agendar atendimento"
}

/**
 * Busca os agendamentos da data escolhida e redesenha os horários,
 * bloqueando os já reservados e os que já passaram.
 */
async function refreshSlots() {
  const date = dateInput.value
  const selectedTime = getSelectedTime()

  if (!isValidISODate(date) || date < toISODate()) {
    renderSlotsMessage(slotsContainer, "Escolha uma data a partir de hoje para ver os horários.")
    return
  }

  // Ignora respostas antigas caso a data mude antes de a requisição terminar.
  const requestId = ++slotsRequestId
  slotsContainer.setAttribute("aria-busy", "true")

  try {
    const schedules = await fetchSchedulesByDay(date)
    if (requestId !== slotsRequestId) return

    const bookedTimes = schedules.map((schedule) => schedule.time)
    renderTimeSlots(slotsContainer, getAvailability(date, bookedTimes), selectedTime)
  } catch (error) {
    if (requestId !== slotsRequestId) return

    renderSlotsMessage(slotsContainer, error.message, { onRetry: refreshSlots })
  } finally {
    if (requestId === slotsRequestId) slotsContainer.removeAttribute("aria-busy")
  }
}

async function handleSubmit(event, onCreated) {
  event.preventDefault()
  hasTriedToSubmit = true

  const data = {
    date: dateInput.value,
    time: getSelectedTime(),
    name: normalizeName(nameInput.value),
  }

  const errors = validateSchedule(data, { today: toISODate(), now: new Date() })
  showErrors(errors)

  if (Object.keys(errors).length > 0) {
    focusFirstInvalid(errors)
    return
  }

  setLoading(true)

  try {
    // Confere de novo na API: outra pessoa pode ter reservado o horário
    // depois que a lista foi carregada.
    const schedules = await fetchSchedulesByDay(data.date)

    if (schedules.some((schedule) => schedule.time === data.time)) {
      await refreshSlots()
      setFieldError("time", "Esse horário acabou de ser reservado. Escolha outro.")
      return
    }

    const schedule = await createSchedule(data)

    showToast(`${schedule.name} · ${formatShortDate(schedule.date)} às ${schedule.time}`, {
      title: "Atendimento agendado",
    })

    nameInput.value = ""
    hasTriedToSubmit = false
    showErrors({})
    await refreshSlots()

    onCreated?.(schedule)
  } catch (error) {
    showToast(error.message, { type: "error", title: "Não foi possível agendar" })
  } finally {
    setLoading(false)
  }
}

export function initScheduleForm({ onCreated } = {}) {
  const today = toISODate()
  dateInput.min = today
  dateInput.value = today

  dateInput.addEventListener("change", () => {
    setFieldError("date", null)
    setFieldError("time", null)
    refreshSlots()
  })

  slotsContainer.addEventListener("change", () => setFieldError("time", null))

  // Revalida o nome enquanto a pessoa digita, mas só depois da primeira tentativa
  // de envio — assim os erros não aparecem antes de ela terminar de escrever.
  nameInput.addEventListener("input", () => {
    if (hasTriedToSubmit) setFieldError("name", validateName(nameInput.value))
  })

  nameInput.addEventListener("blur", () => {
    if (nameInput.value.trim()) setFieldError("name", validateName(nameInput.value))
  })

  form.addEventListener("submit", (event) => handleSubmit(event, onCreated))

  refreshSlots()

  return { refreshSlots }
}

import { cancelSchedule, fetchSchedulesByDay } from "../../services/schedules.js"
import { formatLongDate, isPastSlot, isValidISODate, toISODate } from "../../utils/date.js"
import { PERIODS, groupByPeriod } from "../../utils/opening-hours.js"
import { confirmDialog } from "../ui/confirm-dialog.js"
import { icons } from "../ui/icons.js"
import { showToast } from "../ui/toast.js"

const section = document.querySelector("#agenda")
const dateInput = section.querySelector("#agenda-date")
const summary = section.querySelector("#agenda-summary")
const statusBox = section.querySelector("#agenda-status")
const periodsContainer = section.querySelector("#periods")

const periodCards = Object.fromEntries(
  PERIODS.map((period) => [
    period.id,
    periodsContainer.querySelector(`[data-period="${period.id}"]`),
  ]),
)

let requestId = 0
let onChangeCallback = null

function pluralize(count, singular, plural) {
  return `${count} ${count === 1 ? singular : plural}`
}

function createAppointment(schedule) {
  const item = document.createElement("li")
  item.className = "appointment"

  const isDone = isPastSlot(schedule.date, schedule.time)
  if (isDone) item.classList.add("appointment--done")

  const time = document.createElement("time")
  time.className = "appointment__time"
  time.dateTime = `${schedule.date}T${schedule.time}`
  time.textContent = schedule.time

  // textContent (e não innerHTML) garante que o nome vindo da API seja tratado
  // como texto, sem risco de injeção de HTML.
  const name = document.createElement("span")
  name.className = "appointment__name"
  name.textContent = schedule.name

  item.append(time, name)

  if (isDone) {
    const badge = document.createElement("span")
    badge.className = "appointment__badge"
    badge.textContent = "Concluído"
    item.append(badge)
  } else {
    const cancelButton = document.createElement("button")
    cancelButton.type = "button"
    cancelButton.className = "appointment__cancel"
    cancelButton.dataset.id = schedule.id
    cancelButton.dataset.name = schedule.name
    cancelButton.dataset.time = schedule.time
    cancelButton.setAttribute(
      "aria-label",
      `Cancelar agendamento de ${schedule.name} às ${schedule.time}`,
    )
    cancelButton.title = "Cancelar agendamento"
    cancelButton.innerHTML = icons.trash
    item.append(cancelButton)
  }

  return item
}

function createEmptyState() {
  const item = document.createElement("li")
  item.className = "appointment appointment--empty"
  item.textContent = "Nenhum agendamento neste período"
  return item
}

function createSkeleton() {
  return Array.from({ length: 2 }, () => {
    const item = document.createElement("li")
    item.className = "appointment appointment--skeleton"
    item.setAttribute("aria-hidden", "true")
    item.innerHTML = '<span class="skeleton skeleton--time"></span><span class="skeleton"></span>'
    return item
  })
}

function renderLoading() {
  periodsContainer.setAttribute("aria-busy", "true")
  statusBox.hidden = true

  for (const card of Object.values(periodCards)) {
    card.querySelector(".period__count").textContent = "–"
    card.querySelector(".period__list").replaceChildren(...createSkeleton())
  }
}

function renderSchedules(date, schedules) {
  const groups = groupByPeriod(schedules)

  for (const period of PERIODS) {
    const card = periodCards[period.id]
    const items = groups[period.id]

    card.querySelector(".period__count").textContent = items.length
    card
      .querySelector(".period__list")
      .replaceChildren(...(items.length ? items.map(createAppointment) : [createEmptyState()]))
  }

  summary.textContent = `${pluralize(schedules.length, "atendimento", "atendimentos")} · ${formatLongDate(date)}`
}

function renderError(message) {
  statusBox.hidden = false
  statusBox.querySelector(".alert__message").textContent = message

  for (const card of Object.values(periodCards)) {
    card.querySelector(".period__count").textContent = "–"
    card.querySelector(".period__list").replaceChildren()
  }

  summary.textContent = ""
}

async function load() {
  const date = dateInput.value

  if (!isValidISODate(date)) {
    summary.textContent = "Selecione uma data para ver a agenda."
    return
  }

  const currentRequest = ++requestId
  renderLoading()

  try {
    const schedules = await fetchSchedulesByDay(date)
    if (currentRequest !== requestId) return

    renderSchedules(date, schedules)
  } catch (error) {
    if (currentRequest !== requestId) return

    renderError(error.message)
  } finally {
    if (currentRequest === requestId) periodsContainer.removeAttribute("aria-busy")
  }
}

async function handleCancel(button) {
  const { id, name, time } = button.dataset

  const confirmed = await confirmDialog({
    title: "Cancelar agendamento?",
    message: `O horário das ${time} de ${name} ficará livre para outro cliente. Essa ação não pode ser desfeita.`,
    confirmLabel: "Cancelar agendamento",
  })

  if (!confirmed) return

  button.disabled = true

  try {
    await cancelSchedule(id)
    showToast(`O horário das ${time} de ${name} foi liberado.`, {
      title: "Agendamento cancelado",
    })
    await load()
    onChangeCallback?.()
  } catch (error) {
    button.disabled = false
    showToast(error.message, { type: "error", title: "Não foi possível cancelar" })
  }
}

export function initAgenda({ onChange } = {}) {
  onChangeCallback = onChange
  dateInput.value = toISODate()

  dateInput.addEventListener("change", load)

  statusBox.querySelector(".alert__retry").addEventListener("click", load)

  periodsContainer.addEventListener("click", (event) => {
    const button = event.target.closest(".appointment__cancel")
    if (button) handleCancel(button)
  })

  load()

  return {
    reload: load,
    showDate(date) {
      dateInput.value = date
      return load()
    },
  }
}

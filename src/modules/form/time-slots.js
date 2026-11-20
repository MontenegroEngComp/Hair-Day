/**
 * Renderiza os horários como um grupo de radios estilizados em formato de
 * "chips": continua sendo um campo de formulário nativo (navegável por teclado
 * com as setas e lido corretamente por leitores de tela).
 */
export function renderTimeSlots(container, availability, selectedTime = null) {
  const groups = availability.map((period) => {
    const group = document.createElement("div")
    group.className = "slots__group"
    group.setAttribute("role", "group")
    group.setAttribute("aria-labelledby", `slots-${period.id}`)

    const label = document.createElement("span")
    label.className = "slots__label"
    label.id = `slots-${period.id}`
    label.textContent = period.label

    const options = document.createElement("div")
    options.className = "slots__options"

    for (const slot of period.slots) {
      options.append(createSlot(slot, slot.isAvailable && slot.time === selectedTime))
    }

    group.append(label, options)
    return group
  })

  container.replaceChildren(...groups)
}

function createSlot({ time, isAvailable, isBooked }, isChecked) {
  const option = document.createElement("label")
  option.className = "slot"

  const input = document.createElement("input")
  input.type = "radio"
  input.name = "time"
  input.value = time
  input.className = "slot__input"
  input.disabled = !isAvailable
  input.checked = isChecked

  const text = document.createElement("span")
  text.className = "slot__text"
  text.textContent = time

  option.append(input, text)

  if (!isAvailable) {
    const reason = isBooked ? "ocupado" : "encerrado"
    option.classList.add(`slot--${reason}`)
    option.title = isBooked ? "Horário ocupado" : "Horário encerrado"

    const hint = document.createElement("span")
    hint.className = "sr-only"
    hint.textContent = ` (${reason})`
    option.append(hint)
  }

  return option
}

export function renderSlotsMessage(container, message, { onRetry } = {}) {
  const box = document.createElement("div")
  box.className = "slots__message"

  const text = document.createElement("p")
  text.textContent = message
  box.append(text)

  if (onRetry) {
    const button = document.createElement("button")
    button.type = "button"
    button.className = "link-button"
    button.textContent = "Tentar novamente"
    button.addEventListener("click", onRetry)
    box.append(button)
  }

  container.replaceChildren(box)
}

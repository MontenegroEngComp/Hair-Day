import { icons } from "./icons.js"

const DURATION = 4500

const region = document.querySelector("#toasts")

/**
 * Exibe uma notificação temporária.
 * As mensagens são anunciadas por leitores de tela pela região aria-live.
 */
export function showToast(message, { type = "success", title } = {}) {
  const toast = document.createElement("div")
  toast.className = `toast toast--${type}`

  const icon = document.createElement("span")
  icon.className = "toast__icon"
  icon.innerHTML = type === "error" ? icons.alert : icons.check

  const content = document.createElement("div")
  content.className = "toast__content"

  if (title) {
    const heading = document.createElement("strong")
    heading.className = "toast__title"
    heading.textContent = title
    content.append(heading)
  }

  const text = document.createElement("p")
  text.className = "toast__message"
  text.textContent = message
  content.append(text)

  const closeButton = document.createElement("button")
  closeButton.type = "button"
  closeButton.className = "toast__close"
  closeButton.setAttribute("aria-label", "Fechar notificação")
  closeButton.innerHTML = icons.close

  toast.append(icon, content, closeButton)
  region.append(toast)

  let timer = setTimeout(dismiss, DURATION)

  // Pausa o fechamento automático enquanto a pessoa interage com a notificação.
  toast.addEventListener("pointerenter", () => clearTimeout(timer))
  toast.addEventListener("pointerleave", () => {
    timer = setTimeout(dismiss, DURATION / 2)
  })
  closeButton.addEventListener("click", dismiss)

  function dismiss() {
    clearTimeout(timer)
    toast.classList.add("toast--leaving")
    toast.addEventListener("animationend", () => toast.remove(), { once: true })

    // Garante a remoção mesmo sem animação (prefers-reduced-motion).
    setTimeout(() => toast.remove(), 400)
  }
}

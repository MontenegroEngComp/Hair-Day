const STORAGE_KEY = "hair-day:theme"

const root = document.documentElement
const toggle = document.querySelector("#theme-toggle")
const systemDark = window.matchMedia("(prefers-color-scheme: dark)")

function getStoredTheme() {
  try {
    return localStorage.getItem(STORAGE_KEY)
  } catch {
    return null
  }
}

function storeTheme(theme) {
  try {
    localStorage.setItem(STORAGE_KEY, theme)
  } catch {
    // Armazenamento indisponível (ex.: navegação privada): vale só para esta visita.
  }
}

function applyTheme(theme) {
  const isDark = theme === "dark"

  root.dataset.theme = theme
  toggle.setAttribute("aria-pressed", String(isDark))
  toggle.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro")
  toggle.title = isDark ? "Tema claro" : "Tema escuro"
}

/**
 * Alterna entre os temas claro e escuro. Enquanto a pessoa não escolhe um tema,
 * a página acompanha a preferência do sistema operacional.
 * O tema inicial é aplicado antes da pintura por um script inline no index.html.
 */
export function initTheme() {
  applyTheme(getStoredTheme() ?? (systemDark.matches ? "dark" : "light"))

  toggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark"
    storeTheme(next)
    applyTheme(next)
  })

  systemDark.addEventListener("change", (event) => {
    if (!getStoredTheme()) applyTheme(event.matches ? "dark" : "light")
  })
}

/**
 * API local do modo de demonstração (versão publicada no GitHub Pages).
 *
 * Responde às mesmas rotas do json-server — GET, POST e DELETE em /schedules —
 * guardando os dados no localStorage do navegador. Assim o restante da
 * aplicação não sabe se está falando com o servidor ou com o navegador.
 */
import { createSampleSchedules } from "../data/sample-schedules.js"
import { ApiError, NOT_FOUND_MESSAGE } from "./api-error.js"

const STORAGE_KEY = "hair-day:schedules"

// Atraso simulado para que os estados de carregamento continuem visíveis.
const LATENCY = import.meta.env?.MODE === "test" ? 0 : 350

// Cópia em memória, usada também quando o localStorage não está disponível
// (ex.: navegação privada com armazenamento bloqueado).
let memory = null

function readDatabase() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Sem acesso ao armazenamento: segue com a cópia em memória.
  }

  if (memory) return memory

  const samples = createSampleSchedules()
  writeDatabase(samples)
  return samples
}

function writeDatabase(schedules) {
  memory = schedules

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules))
  } catch {
    // Os dados ficam apenas em memória até a página ser recarregada.
  }
}

/** Substitui todos os dados (usado nos testes). */
export function resetLocalDatabase(schedules = []) {
  writeDatabase(structuredClone(schedules))
}

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

export async function localRequest(path, { method = "GET", body } = {}) {
  await wait(LATENCY)

  const url = new URL(path, "http://hair-day.local")
  const [, resource, rawId] = url.pathname.split("/")
  const id = rawId ? decodeURIComponent(rawId) : null

  if (resource !== "schedules") {
    throw new ApiError("Rota não encontrada.", { status: 404 })
  }

  const schedules = readDatabase()

  if (method === "GET" && !id) {
    const date = url.searchParams.get("date")

    return structuredClone(
      schedules
        .filter((schedule) => !date || schedule.date === date)
        .sort((a, b) => a.time.localeCompare(b.time)),
    )
  }

  if (method === "POST" && !id) {
    const nextId = schedules.reduce((max, schedule) => Math.max(max, Number(schedule.id) || 0), 0) + 1
    const created = { id: nextId, ...body }

    writeDatabase([...schedules, created])
    return structuredClone(created)
  }

  if (method === "DELETE" && id) {
    const exists = schedules.some((schedule) => String(schedule.id) === id)
    if (!exists) throw new ApiError(NOT_FOUND_MESSAGE, { status: 404 })

    writeDatabase(schedules.filter((schedule) => String(schedule.id) !== id))
    return {}
  }

  throw new ApiError(`Operação ${method} não suportada.`, { status: 405 })
}

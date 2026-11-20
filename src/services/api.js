const BASE_URL = (import.meta.env.VITE_API_URL ?? "http://localhost:3333").replace(
  /\/$/,
  "",
)

const DEFAULT_TIMEOUT = 8000

export class ApiError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause })
    this.name = "ApiError"
    this.status = status
  }
}

/**
 * Cliente HTTP mínimo sobre o fetch: monta a URL, serializa o corpo em JSON,
 * aplica um tempo limite e converte falhas em mensagens amigáveis (ApiError).
 */
export async function request(path, { method = "GET", body, timeout = DEFAULT_TIMEOUT } = {}) {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    })

    if (!response.ok) {
      throw new ApiError(getStatusMessage(response.status), {
        status: response.status,
      })
    }

    const text = await response.text()
    return text ? JSON.parse(text) : null
  } catch (error) {
    if (error instanceof ApiError) throw error

    if (error.name === "AbortError") {
      throw new ApiError("O servidor demorou para responder. Tente novamente.", {
        cause: error,
      })
    }

    throw new ApiError(
      "Não foi possível conectar ao servidor. Verifique se a API está rodando.",
      { cause: error },
    )
  } finally {
    clearTimeout(timer)
  }
}

function getStatusMessage(status) {
  if (status === 404) return "O agendamento não foi encontrado. Ele pode já ter sido cancelado."
  if (status >= 500) return "O servidor encontrou um erro. Tente novamente em instantes."

  return `Não foi possível concluir a operação (erro ${status}).`
}

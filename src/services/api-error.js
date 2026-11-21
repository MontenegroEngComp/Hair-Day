export class ApiError extends Error {
  constructor(message, { status = null, cause } = {}) {
    super(message, { cause })
    this.name = "ApiError"
    this.status = status
  }
}

export const NOT_FOUND_MESSAGE =
  "O agendamento não foi encontrado. Ele pode já ter sido cancelado."

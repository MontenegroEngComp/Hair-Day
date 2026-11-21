import { beforeEach, describe, expect, it } from "vitest"

import { ApiError } from "../src/services/api-error.js"
import { localRequest, resetLocalDatabase } from "../src/services/local-api.js"

describe("API local do modo de demonstração", () => {
  beforeEach(() => {
    resetLocalDatabase([
      { id: 1, date: "2026-11-21", time: "15:00", name: "Caio Andrade" },
      { id: 2, date: "2026-11-21", time: "09:00", name: "Helena Souza" },
      { id: 3, date: "2026-11-22", time: "10:00", name: "Beatriz Lima" },
    ])
  })

  it("GET filtra por data e ordena por horário", async () => {
    const schedules = await localRequest("/schedules?date=2026-11-21&_sort=time")

    expect(schedules.map((schedule) => schedule.time)).toEqual(["09:00", "15:00"])
  })

  it("POST cria o agendamento com o próximo id", async () => {
    const created = await localRequest("/schedules", {
      method: "POST",
      body: { date: "2026-11-21", time: "11:00", name: "Clara Nunes" },
    })

    expect(created).toMatchObject({ id: 4, time: "11:00", name: "Clara Nunes" })
    expect(await localRequest("/schedules?date=2026-11-21")).toHaveLength(3)
  })

  it("DELETE remove o agendamento", async () => {
    await localRequest("/schedules/2", { method: "DELETE" })

    const schedules = await localRequest("/schedules?date=2026-11-21")
    expect(schedules.map((schedule) => schedule.id)).toEqual([1])
  })

  it("DELETE de um id inexistente retorna erro 404", async () => {
    await expect(localRequest("/schedules/99", { method: "DELETE" })).rejects.toMatchObject({
      name: "ApiError",
      status: 404,
    })
  })

  it("não devolve referências aos dados armazenados", async () => {
    const [schedule] = await localRequest("/schedules?date=2026-11-22")
    schedule.name = "Alterado"

    const [again] = await localRequest("/schedules?date=2026-11-22")
    expect(again.name).toBe("Beatriz Lima")
  })

  it("rejeita rotas desconhecidas", async () => {
    await expect(localRequest("/clients")).rejects.toBeInstanceOf(ApiError)
  })
})

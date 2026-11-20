import { describe, expect, it } from "vitest"

import {
  normalizeName,
  validateDate,
  validateName,
  validateSchedule,
  validateTime,
} from "../src/modules/form/validation.js"

describe("normalizeName", () => {
  it("remove espaços extras", () => {
    expect(normalizeName("  Helena    Souza ")).toBe("Helena Souza")
  })
})

describe("validateName", () => {
  it.each(["Helena Souza", "João-Pedro", "Ana D'Ávila", "Íris"])(
    "aceita %s",
    (name) => {
      expect(validateName(name)).toBeNull()
    },
  )

  it("exige o nome", () => {
    expect(validateName("   ")).toBe("Informe o nome do cliente.")
  })

  it("exige pelo menos 3 caracteres", () => {
    expect(validateName("Al")).toMatch(/pelo menos 3/)
  })

  it("limita o nome a 60 caracteres", () => {
    expect(validateName("a".repeat(61))).toMatch(/no máximo 60/)
  })

  it.each(["Helena 2", "<script>", "@helena"])("rejeita %s", (name) => {
    expect(validateName(name)).toMatch(/apenas letras/)
  })
})

describe("validateDate", () => {
  const today = "2026-11-20"

  it("aceita hoje e datas futuras", () => {
    expect(validateDate("2026-11-20", today)).toBeNull()
    expect(validateDate("2026-12-01", today)).toBeNull()
  })

  it("rejeita datas passadas", () => {
    expect(validateDate("2026-11-19", today)).toMatch(/a partir de hoje/)
  })

  it("rejeita datas vazias ou inválidas", () => {
    expect(validateDate("", today)).toBe("Selecione uma data.")
    expect(validateDate("2026-02-31", today)).toBe("Informe uma data válida.")
  })
})

describe("validateTime", () => {
  const now = new Date(2026, 10, 20, 15, 0)

  it("exige um horário", () => {
    expect(validateTime("", "2026-11-21", now)).toBe("Selecione um horário.")
  })

  it("rejeita horários fora do funcionamento", () => {
    expect(validateTime("08:00", "2026-11-21", now)).toMatch(/funcionamento/)
  })

  it("rejeita horários que já passaram", () => {
    expect(validateTime("15:00", "2026-11-20", now)).toMatch(/já passou/)
  })
})

describe("validateSchedule", () => {
  const context = {
    today: "2026-11-20",
    now: new Date(2026, 10, 20, 8, 0),
  }

  it("retorna um objeto vazio quando tudo é válido", () => {
    expect(
      validateSchedule(
        { date: "2026-11-20", time: "09:00", name: "Helena Souza" },
        context,
      ),
    ).toEqual({})
  })

  it("retorna apenas os campos inválidos", () => {
    expect(
      Object.keys(
        validateSchedule({ date: "2026-11-20", time: "", name: "" }, context),
      ),
    ).toEqual(["time", "name"])
  })
})

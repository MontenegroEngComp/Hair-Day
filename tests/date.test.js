import { describe, expect, it } from "vitest"

import {
  isPastSlot,
  isValidISODate,
  toDateTime,
  toISODate,
} from "../src/utils/date.js"

describe("toISODate", () => {
  it("formata a data local como AAAA-MM-DD", () => {
    expect(toISODate(new Date(2026, 0, 5))).toBe("2026-01-05")
  })

  it("não muda de dia perto da meia-noite", () => {
    expect(toISODate(new Date(2026, 10, 20, 23, 59))).toBe("2026-11-20")
  })
})

describe("isValidISODate", () => {
  it.each(["2026-11-20", "2028-02-29"])("aceita %s", (value) => {
    expect(isValidISODate(value)).toBe(true)
  })

  it.each(["", "20/11/2026", "2026-02-30", "2026-13-01", null])(
    "rejeita %s",
    (value) => {
      expect(isValidISODate(value)).toBe(false)
    },
  )
})

describe("toDateTime", () => {
  it("combina data e horário no fuso local", () => {
    expect(toDateTime("2026-11-20", "14:30")).toEqual(
      new Date(2026, 10, 20, 14, 30),
    )
  })
})

describe("isPastSlot", () => {
  const now = new Date(2026, 10, 20, 13, 30)

  it("considera passado um horário anterior a agora", () => {
    expect(isPastSlot("2026-11-20", "13:00", now)).toBe(true)
  })

  it("considera disponível um horário posterior a agora", () => {
    expect(isPastSlot("2026-11-20", "14:00", now)).toBe(false)
  })

  it("considera disponível qualquer horário de um dia futuro", () => {
    expect(isPastSlot("2026-11-21", "09:00", now)).toBe(false)
  })
})

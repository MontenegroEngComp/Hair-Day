import { describe, expect, it } from "vitest"

import {
  OPENING_HOURS,
  getAvailability,
  getPeriodId,
  groupByPeriod,
} from "../src/utils/opening-hours.js"

describe("OPENING_HOURS", () => {
  it("vai das 09h às 21h, com intervalo às 13h e às 19h entre os períodos", () => {
    expect(OPENING_HOURS).toHaveLength(13)
    expect(OPENING_HOURS[0]).toBe("09:00")
    expect(OPENING_HOURS.at(-1)).toBe("21:00")
  })
})

describe("getPeriodId", () => {
  it.each([
    ["09:00", "morning"],
    ["12:00", "morning"],
    ["13:00", "afternoon"],
    ["18:00", "afternoon"],
    ["19:00", "night"],
    ["21:00", "night"],
  ])("%s pertence ao período %s", (time, period) => {
    expect(getPeriodId(time)).toBe(period)
  })
})

describe("getAvailability", () => {
  const now = new Date(2026, 10, 20, 10, 30)

  function findSlot(availability, time) {
    return availability
      .flatMap((period) => period.slots)
      .find((slot) => slot.time === time)
  }

  it("bloqueia horários reservados", () => {
    const availability = getAvailability("2026-11-21", ["15:00"], now)

    expect(findSlot(availability, "15:00")).toMatchObject({
      isBooked: true,
      isAvailable: false,
    })
  })

  it("bloqueia horários que já passaram no dia atual", () => {
    const availability = getAvailability("2026-11-20", [], now)

    expect(findSlot(availability, "10:00")).toMatchObject({
      isPast: true,
      isAvailable: false,
    })
    expect(findSlot(availability, "11:00").isAvailable).toBe(true)
  })

  it("mantém os horários agrupados por período", () => {
    const availability = getAvailability("2026-11-21", [], now)

    expect(availability.map((period) => period.id)).toEqual([
      "morning",
      "afternoon",
      "night",
    ])
  })
})

describe("groupByPeriod", () => {
  it("separa e ordena os agendamentos por período", () => {
    const groups = groupByPeriod([
      { id: 1, time: "20:00", name: "C" },
      { id: 2, time: "14:00", name: "B" },
      { id: 3, time: "13:00", name: "A" },
    ])

    expect(groups.morning).toEqual([])
    expect(groups.afternoon.map((schedule) => schedule.time)).toEqual([
      "13:00",
      "14:00",
    ])
    expect(groups.night).toHaveLength(1)
  })
})

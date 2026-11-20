/**
 * Gera o banco de dados local da API (server.json) com agendamentos de exemplo
 * para hoje e amanhã, para que a agenda nunca abra vazia em uma demonstração.
 *
 * Uso:
 *   npm run seed                     recria o banco do zero
 *   node scripts/seed.js --if-missing  cria apenas se o arquivo ainda não existir
 */
import { existsSync, writeFileSync } from "node:fs"

const databaseFile = new URL("../server.json", import.meta.url)
const onlyIfMissing = process.argv.includes("--if-missing")

if (onlyIfMissing && existsSync(databaseFile)) {
  process.exit(0)
}

function toISODate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

const today = new Date()
const tomorrow = new Date(today)
tomorrow.setDate(today.getDate() + 1)

const todayISO = toISODate(today)
const tomorrowISO = toISODate(tomorrow)

const examples = [
  [todayISO, "11:00", "Ryan Dorwart"],
  [todayISO, "13:00", "Livia Curtis"],
  [todayISO, "14:00", "Randy Calzoni"],
  [todayISO, "16:00", "Marley Franci"],
  [todayISO, "17:00", "Jaylon Korsgaard"],
  [todayISO, "21:00", "Maria Herwitz"],
  [tomorrowISO, "09:00", "Helena Souza"],
  [tomorrowISO, "15:00", "Caio Andrade"],
  [tomorrowISO, "19:00", "Beatriz Lima"],
]

const schedules = examples.map(([date, time, name], index) => ({
  id: index + 1,
  date,
  time,
  name,
  createdAt: new Date().toISOString(),
}))

writeFileSync(databaseFile, `${JSON.stringify({ schedules }, null, 2)}\n`)

console.log(`server.json criado com ${schedules.length} agendamentos de exemplo.`)

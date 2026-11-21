/**
 * Gera o banco de dados local da API (server.json) com agendamentos de exemplo
 * para hoje e amanhã, para que a agenda nunca abra vazia em uma demonstração.
 *
 * Uso:
 *   npm run seed                       recria o banco do zero
 *   node scripts/seed.js --if-missing  cria apenas se o arquivo ainda não existir
 */
import { existsSync, writeFileSync } from "node:fs"

import { createSampleSchedules } from "../src/data/sample-schedules.js"

const databaseFile = new URL("../server.json", import.meta.url)
const onlyIfMissing = process.argv.includes("--if-missing")

if (onlyIfMissing && existsSync(databaseFile)) {
  process.exit(0)
}

const schedules = createSampleSchedules()

writeFileSync(databaseFile, `${JSON.stringify({ schedules }, null, 2)}\n`)

console.log(`server.json criado com ${schedules.length} agendamentos de exemplo.`)

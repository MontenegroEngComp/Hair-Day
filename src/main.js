import "./styles/index.css"

import { initAgenda } from "./modules/agenda/agenda.js"
import { initScheduleForm } from "./modules/form/form.js"
import { initTheme } from "./modules/ui/theme.js"
import { IS_DEMO } from "./services/api.js"

initTheme()

document.querySelector("#demo-badge").hidden = !IS_DEMO

// Formulário e agenda se mantêm sincronizados: um novo agendamento abre a agenda
// no dia reservado, e um cancelamento libera o horário no formulário.
const agenda = initAgenda({
  onChange: () => scheduleForm.refreshSlots(),
})

const scheduleForm = initScheduleForm({
  onCreated: (schedule) => agenda.showDate(schedule.date),
})

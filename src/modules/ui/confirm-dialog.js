const dialog = document.querySelector("#confirm-dialog")
const titleElement = dialog.querySelector("#confirm-dialog-title")
const messageElement = dialog.querySelector("#confirm-dialog-message")
const confirmButton = dialog.querySelector('[value="confirm"]')

/**
 * Abre um modal de confirmação nativo (<dialog>) e resolve com true
 * quando a pessoa confirma, ou false ao voltar, apertar Esc ou clicar fora.
 */
export function confirmDialog({ title, message, confirmLabel = "Confirmar" }) {
  titleElement.textContent = title
  messageElement.textContent = message
  confirmButton.textContent = confirmLabel

  dialog.returnValue = ""
  dialog.showModal()

  return new Promise((resolve) => {
    dialog.addEventListener(
      "close",
      () => resolve(dialog.returnValue === "confirm"),
      { once: true },
    )
  })
}

// Fecha ao clicar no fundo escurecido, fora da caixa do modal.
dialog.addEventListener("click", (event) => {
  if (event.target === dialog) dialog.close("cancel")
})

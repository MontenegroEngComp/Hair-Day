// Ícones de interface sem equivalente no layout original, desenhados em traço
// para combinar com os ícones Phosphor usados no Figma.
const attributes =
  'width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"'

export const icons = {
  check: `<svg ${attributes}><path d="M20 6 9 17l-5-5"/></svg>`,
  alert: `<svg ${attributes}><circle cx="12" cy="12" r="9"/><path d="M12 8v4.5M12 16h.01"/></svg>`,
  close: `<svg ${attributes}><path d="M18 6 6 18M6 6l12 12"/></svg>`,
  trash: `<svg ${attributes}><path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3"/></svg>`,
  refresh: `<svg ${attributes}><path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/></svg>`,
}

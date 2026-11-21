import { defineConfig } from "vite"

// O build do GitHub Pages (`npm run build:pages`) é servido em /Hair-Day/.
export default defineConfig(({ mode }) => ({
  base: mode === "pages" ? "/Hair-Day/" : "/",
}))

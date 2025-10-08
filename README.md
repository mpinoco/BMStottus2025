# Paleta de colores — Tottus (aproximada)

Esta carpeta incluye variables CSS, una extensión de Tailwind y un JSON con la paleta basada en los Pantone citados públicamente para Tottus: 389 C (#D0DF00), 369 C (#64A70B) y 293 C (#003DA5). 
**Nota**: Los códigos hex aquí son aproximaciones digitales a Pantone (pueden variar vs. guía física). Verifica siempre con el manual de marca vigente.

## Archivos
- `colors.css` – Variables CSS listas para usar.
- `tailwind.tottus.config.js` – Extensión de colores para Tailwind.
- `colors.json` – Paleta estructurada.
- `README.md` – Este archivo.

## Ejemplo rápido (HTML)
```html
<link rel="stylesheet" href="./colors.css" />
<button class="btn-tottus">Comprar</button>
```

## Ejemplo rápido (Tailwind)
```js
// tailwind.config.js
const tottus = require('./tailwind.tottus.config.js')
module.exports = { ...tottus }
```
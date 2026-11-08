# Contributing to Folio PDF

Thank you for your interest in improving Folio! 📄✨

Folio is built on a simple promise: **A PDF tool that refuses to look AI-generated, respects privacy with 100% in-browser processing, and works without subscription gates or accounts.**

---

## Development Setup

1. Fork & clone the repository:
   ```bash
   git clone https://github.com/atharvabalujadhav21052007-ux/folio-pdf.git
   cd folio-pdf
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```
4. Run production build test:
   ```bash
   npm run build
   ```

---

## Design Principles (Hallmark Floor)
- Every color and typography token declared at `:root` in `src/index.css`.
- Never `transition: all` — keep transitions discrete (`150ms ease`).
- No generic purple-blue gradients or floating meaningless decorative containers.
- Every interactive control must have clear `:focus-visible` states.
- 100% client-side privacy: PDFs must NEVER be sent to an external server.

---

## Pull Request Guidelines
- Ensure `npm run build` succeeds with zero TypeScript or bundling errors.
- Keep commits descriptive (e.g., `feat: add custom font family picker`).
- Open your PR against `main`.

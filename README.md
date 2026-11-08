<div align="center">

# 📄 Folio

### A crafted web-based PDF editor refusing to look AI-generated.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19-cyan.svg)](https://react.dev/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fatharvabalujadhav21052007-ux%2Ffolio-pdf)

<p align="center">
  <a href="#-features">Features</a> •
  <a href="#-architecture">Architecture</a> •
  <a href="#-hallmark-design-standard">Design Standard</a> •
  <a href="#-quickstart">Quickstart</a> •
  <a href="#-deploy-to-vercel">Deploy to Vercel</a> •
  <a href="#-privacy">Privacy</a>
</p>

</div>

---

## ⚡ What is Folio?

**Folio** is an open-source, web-based PDF editing and watermarking studio built with genuine craft. 

Most online PDF editors are bloated with ads, require paid subscriptions to remove watermarks, or force you to upload sensitive contracts and financial documents to unknown third-party cloud servers.

Folio executes **100% inside your browser using WebAssembly and HTML5 Canvas**. Your documents never touch a remote server, bypassing Vercel body limits and guaranteeing total confidentiality.

---

## ✨ Features

- 🖋️ **Handwritten Signatures:** Draw natural, smooth signatures on an HTML5 canvas with vector ink smoothing and stamp them onto any contract or agreement.
- 🏷️ **Verified Watermark Seals:** One-click placement of classic corporate seals (`CONFIDENTIAL`, `APPROVED`, `DRAFT`, `PAID`, `OFFICIAL`, `VOID`) with diagonal angles and transparency.
- ✍️ **Custom Text & Annotations:** Add notes, dates, and review tags with customizable font size, color, opacity, and rotation.
- 📑 **Page Management:** Thumbnail strip with 90° page rotation, page deletion, and multi-page preview.
- 🌐 **Scope Flexibility:** Apply watermarks to just the current page or blast across all pages in a multi-page document.
- 🔒 **Zero Cloud Footprint:** No backend server, no database, no telemetry. Works completely offline.
- 📄 **Built-in Sample Agreement:** Don't have a PDF on hand? Click *"Try Sample PDF"* to instantly load a sample Master Services Agreement.

---

## 🏛️ Hallmark Design Standard

Folio was built under the **[Hallmark design floor](https://github.com/Nutlope/hallmark.git)**:
* **Declared CSS Tokens:** Every color, surface, and font is declared via `:root` tokens.
* **No AI Slop:** No generic purple-to-blue gradients, no nested cards inside cards, no meaningless floating decorative shapes.
* **Tactile Document Material:** High-contrast control rails, clean paper shadow depth, crisp typography, and instant feedback.
* **Accessibility:** Full `:focus-visible` states, keyboard shortcut support (`Delete` to remove selected stamp), and `prefers-reduced-motion` compliance.

---

## 🚀 Quickstart

Run Folio locally in less than a minute:

```bash
# 1. Clone the repository
git clone https://github.com/atharvabalujadhav21052007-ux/folio-pdf.git
cd folio-pdf

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🚢 Deploy to Vercel

Deploy your own private instance on Vercel with zero configuration:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fatharvabalujadhav21052007-ux%2Ffolio-pdf)

Alternatively, push and deploy via the Vercel CLI:

```bash
npm install -g vercel
vercel
```

Because Folio runs 100% client-side, it deploys as a static edge application with **zero serverless execution costs and zero payload limits**.

---

## 🛠️ Tech Stack

| Component | Library | Purpose |
| :--- | :--- | :--- |
| **Framework** | React 19 + TypeScript + Vite | Blazing fast client-side rendering & hot-module reload |
| **Styling** | Tailwind CSS v4 | Strict tokenized styling system |
| **PDF Rendering** | `pdfjs-dist` (Mozilla) | Parses binary PDF streams onto HTML5 canvas |
| **PDF Manipulation** | `pdf-lib` | In-memory byte modification, font embedding & export |
| **Icons** | Lucide React | Minimalist, clean vector iconography |

---

## 🔒 Security & Privacy

| Metric | Folio | Traditional Cloud PDF Tools |
| :--- | :---: | :---: |
| **Where PDF is processed** | **Local Browser Memory** | Remote Cloud Server |
| **Server payload limit** | **Unlimited (Tested 50MB+)** | Usually capped at 5MB–10MB |
| **Sign-up required** | **No** | Yes |
| **Document Retention** | **0 seconds (destroyed on tab close)** | Often stored for days |
| **Network Egress** | **Zero outbound PDF traffic** | Full upload / download roundtrip |

---

## 🤝 Contributing

Contributions are welcome! Please check out our [Contributing Guide](CONTRIBUTING.md) to get started.

---

## 📄 License

This project is open-source under the [MIT License](LICENSE).

# 🌿 PrintMint — Passport & ID Photo Compliance Assistant

**PrintMint** is a 100% client-side web application for generating compliant passport and ID photos, analyzing facial alignment and lighting quality, and exporting printable 300 DPI layout sheets.

> **Privacy Guarantee**: All face landmarking, background whitening, quality analysis, and PDF exports run locally inside your browser via WebAssembly (WASM). Your photos are **never** uploaded to any external server.

---

## ✨ Features

- **🎯 AI Face Auto-Centering**: Uses Google MediaPipe 478 3D facial landmarks to auto-crop, center eyes, and scale head height matching official government standard ratios.
- **🛡️ Compliance Assistant**: Evaluates photo quality against official country specifications and provides actionable explanations (**WHY** a check fails and **WHAT** to adjust).
- **📐 Interactive Passport Overlay**: Real-time canvas guidelines showing target head zone boundaries and eye-level alignment lines.
- **☀️ Lighting & Quality Analyzer**:
  - **Blur Detection**: Laplacian variance score on grayscale pixel arrays.
  - **Exposure & Shadow Check**: Luminance histogram analyzing underexposure, overexposure, and directional side shadows.
  - **Head Alignment**: Angle tilt detection (`atan2`) derived from eye center coordinates.
  - **Eye Closure**: Eye aspect ratio (EAR) analysis detecting squints/blinks.
- **🎨 Background Handling**: Zero-download threshold whitening preserving hair & facial edges, plus opt-in full ML segmentation.
- **🖨️ Printable Sheet Export**:
  - **Single Photo**: Physical millimeter dimension JPG & PDF export.
  - **Print Sheet**: 300 DPI 4x6" and A4 tiled layout sheets with hairline cut guides generated using `pdf-lib`.

---

## 📜 Country & Document Presets

| Country / Document | Dimensions (mm) | Head Coverage | Background Requirement |
| :--- | :--- | :--- | :--- |
| **US Passport / Visa** | 51 × 51 mm (2×2") | 50 – 69% | Pure White / Off-White |
| **India Passport (Sept 2025 Standard)** | 35 × 45 mm | 70 – 80% | Plain White (No AI smoothing) |
| **India OCI Card** | 51 × 51 mm | 70 – 80% | Light / Off-White |
| **UK Passport** | 35 × 45 mm | 64 – 75% | Light Grey / Cream |
| **Schengen Visa / EU** | 35 × 45 mm | 70 – 80% | Light Neutral |
| **Custom Specs** | User Configurable | User Configurable | Any |

---

## 🛠️ Technical Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Face Landmarker**: `@mediapipe/tasks-vision` (Client-side WebAssembly / WebGL)
- **Interactive Cropper**: `react-easy-crop`
- **PDF Generation**: `pdf-lib`
- **HEIC Conversion**: `heic2any`

---

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Run Locally

1. Clone repository:
   ```bash
   git clone https://github.com/sabasaeed/PrintMint.git
   cd PrintMint
   ```

2. Run startup script or start development server:
   ```bash
   ./start.sh
   ```
   *or manually:*
   ```bash
   npm install
   npm run dev
   ```

3. Open `http://localhost:5173` in your browser.

---

## 📄 License

MIT License — free for open-source and personal use.

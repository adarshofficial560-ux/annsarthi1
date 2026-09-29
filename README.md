# AnnSarthi - AI-Driven Food Redistribution & Rescue OS

**AnnSarthi** is an intelligent, full-stack food recovery and redistribution platform designed to bridge the gap between food surplus hubs (commercial kitchens, restaurants, banquets) and demand centers (NGOs, community shelters, food processing units).

---

## 🌟 Key Features

- **Multi-Role Portals**:
  - **Admin Portal**: High-level telemetry, logistics oversight, impact KPIs, and audit trails.
  - **Kitchen / Restaurant Portal**: Surplus logging, automated batch creation, and AI-assisted production planning.
  - **NGO / Shelter Portal**: Real-time matching, claim queue, intake capacity management, and SOS emergency requests.
  - **Processing Unit Portal**: Diversion tracking (secondary food processing, composting, biogas, animal feed) and IoT machine diagnostics.
- **AI Matching & Freshness Score**: Dynamic algorithms matching surplus perishability, distance, dietary preferences, and shelter intake limits.
- **AI Food Quality Scanner**: Visual and parameter inspection via AI API endpoint.
- **IoT Cold-Chain & Storage Telemetry**: Real-time temperature, humidity, and door-sensor monitoring to prevent spoilage during transit.
- **ESG Impact Calculator**: Real-time reporting on kg of food saved, CO₂ emissions prevented, water preserved, and landfill diversion.
- **Offline Sync & SMS Fallback**: Built-in resilience for low-bandwidth and field operations.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or 20+
- npm / yarn / pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/adarshofficial560-ux/annsarthi.git
   cd annsarthi
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Maps**: [Leaflet](https://leafletjs.com/)
- **State Management**: React Context / Hooks

---

## 📄 License
MIT License

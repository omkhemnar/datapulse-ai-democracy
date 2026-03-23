# AI-Driven Booth Management System — Design System

## Design Philosophy
Government-grade, trust-focused, data-dense analytics platform with clarity and accessibility.

---

## Color Palette

| Role | Hex | Usage |
|------|-----|-------|
| **Primary (Deep Blue)** | `#0c4a6e` – `#0284c7` | Headers, primary actions, trust |
| **Secondary (Teal)** | `#0f766e` – `#14b8a6` | Secondary actions, data accents |
| **Accent (Orange)** | `#c2410c` – `#f97316` | Alerts, CTAs, highlights |
| **Background** | `#f8fafc` | Page background |
| **Surface** | `#ffffff` | Cards, panels |
| **Text Primary** | `#0f172a` | Headings, body |
| **Text Secondary** | `#64748b` | Labels, captions |

---

## Typography

| Element | Font | Size | Weight |
|---------|------|------|--------|
| H1 | Inter / system-ui | 2rem | 700 |
| H2 | — | 1.5rem | 600 |
| H3 | — | 1.25rem | 600 |
| Body | — | 0.875–1rem | 400 |
| Caption | — | 0.75rem | 400 |
| Button | — | 0.875rem | 500 |

---

## Component Hierarchy

```
App
├── AuthLayout (Login, OTP)
│   └── LoginPage
├── MainLayout (Sidebar + Header)
│   ├── AdminDashboard
│   ├── BoothIntelligenceDashboard
│   ├── KnowledgeGraphPage
│   ├── VoterSegmentationPage
│   ├── GovernanceUpdatePage
│   ├── CitizenEngagementPanel
│   └── AnalyticsInsightsPage
├── MobileLayout (Citizen view)
│   └── CitizenMobileView
└── PublicLayout
    └── LandingPage
```

---

## Core Components

### Buttons
- **Primary**: Deep blue bg, white text
- **Secondary**: Teal outline
- **Ghost**: Transparent, hover bg
- **Destructive**: Red for delete
- Sizes: sm, md, lg
- States: default, hover, active, disabled

### Cards
- White background, subtle shadow
- Border-radius: 12px
- Padding: 1.5rem
- Hover: slight shadow lift

### Tables
- Zebra striping (optional)
- Sticky header
- Sortable columns
- Row hover highlight

### Charts (Recharts)
- Line, Bar, Area, Pie, Composed
- Consistent colors from palette
- Accessible labels

### Inputs
- Border: 1px slate-200
- Focus: primary ring
- Error: red border + message

---

## Screen Specifications

| # | Screen | Key Components |
|---|--------|----------------|
| 1 | Login | Form, role selector, OTP input |
| 2 | Admin Dashboard | KPI cards, charts, map, notifications |
| 3 | Booth Intelligence | Clusters, heatmap, AI insights |
| 4 | Knowledge Graph | Interactive graph, zoom, legend |
| 5 | Voter Segmentation | Filters, cluster cards, export |
| 6 | Governance Update | Campaign form, preview, tracking |
| 7 | Citizen Engagement | Open rates, feedback, tagging |
| 8 | Analytics & Insights | Predictions, trends, impact |
| 9 | Citizen Mobile | Updates, alerts, feedback form |

---

## Advanced Features
- **Smart Search**: Global search with filters
- **Data Filters**: Multi-select, date range, booth
- **Dark Mode**: Toggle with system preference
- **AI Widgets**: Recommendation cards
- **Real-time**: Live indicators
- **Map**: Geo distribution
- **Graph**: Node-link visualization

---

## Tech Stack
- **React 19** + Vite
- **TailwindCSS 3** (dark mode via `class`)
- **Recharts** (Bar, Line, Area, Pie)
- **React Router 7**
- **react-force-graph-2d** (Knowledge Graph)
- **lucide-react** (icons)

## Implemented Features
- ✅ Login with role selector (Admin / Booth Officer) and OTP flow
- ✅ Admin Dashboard (KPIs, charts, notifications, map placeholder)
- ✅ Booth Intelligence (clusters, heatmap, AI insights)
- ✅ Knowledge Graph (interactive nodes: Voters, Booths, Schemes)
- ✅ Voter Segmentation (filters, export, cluster cards)
- ✅ Governance Update (campaign compose, preview, performance)
- ✅ Citizen Engagement (open rates, feedback, issue tags)
- ✅ Analytics & Insights (trends, AI predictions)
- ✅ Citizen Mobile (updates, eligibility alerts, feedback)
- ✅ Dark mode toggle
- ✅ Smart search (header)

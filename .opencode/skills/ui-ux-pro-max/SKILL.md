---
name: ui-ux-pro-max
description: Use when designing, building, reviewing, or improving UI/UX — landing pages, dashboards, mobile apps, design systems, color palettes, typography, component styling, responsive layouts, animations, and accessibility. Provides 67 UI styles, 161 color palettes, 57 font pairings, 99 UX guidelines, and 161 industry-specific reasoning rules.
---

# UI UX Pro Max

> Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill

An AI skill that provides design intelligence for building professional UI/UX across multiple platforms and frameworks.

161 reasoning rules | 67 UI styles | 161 color palettes | 57 font pairings | 25 chart types | 15 tech stacks | 99 UX guidelines

## What's New in v2.0

### Intelligent Design System Generation

The flagship feature of v2.0 is the **Design System Generator** - an AI-powered reasoning engine that analyzes your project requirements and generates a complete, tailored design system in seconds.

**How Design System Generation Works:**
1. **User Request** — e.g., "Build a landing page for my beauty spa"
2. **Multi-Domain Search** — 5 parallel searches: product type matching (161 categories), style recommendations (67 styles), color palette selection (161 palettes), landing page patterns (24 patterns), typography pairing (57 font combinations)
3. **Reasoning Engine** — Match product → UI category rules, apply style priorities (BM25 ranking), filter anti-patterns, process decision rules
4. **Complete Design System Output** — Pattern + Style + Colors + Typography + Effects + Anti-patterns + Pre-delivery checklist

### 161 Industry-Specific Reasoning Rules

Categories include:
- **Tech & SaaS** — SaaS, Micro SaaS, B2B, Developer Tool / IDE, AI/Chatbot, Cybersecurity
- **Finance** — Fintech/Crypto, Banking, Insurance, Personal Finance, Invoice & Billing
- **Healthcare** — Medical Clinic, Pharmacy, Dental, Veterinary, Mental Health
- **E-commerce** — General, Luxury, Marketplace (P2P), Subscription Box, Food Delivery
- **Services** — Beauty/Spa, Restaurant, Hotel, Legal, Home Services, Booking
- **Creative** — Portfolio, Agency, Photography, Gaming, Music Streaming
- **Lifestyle** — Habit Tracker, Recipe & Cooking, Meditation, Weather, Diary
- **Emerging Tech** — Web3/NFT, Spatial Computing, Quantum Computing, Autonomous Drones

Each rule includes: Recommended Pattern, Style Priority, Color Mood, Typography Mood, Key Effects, Anti-Patterns

## Features

- **67 UI Styles** — Glassmorphism, Claymorphism, Minimalism, Brutalism, Neumorphism, Bento Grid, Dark Mode, AI-Native UI, and more
- **161 Color Palettes** — Industry-specific palettes aligned 1:1 with the 161 product types
- **57 Font Pairings** — Curated typography combinations with Google Fonts imports
- **25 Chart Types** — Recommendations for dashboards and analytics
- **15 Tech Stacks** — React, Next.js, Astro, Vue, Nuxt.js, Nuxt UI, Svelte, SwiftUI, React Native, Flutter, HTML+Tailwind, shadcn/ui, Jetpack Compose, Angular, Laravel
- **99 UX Guidelines** — Best practices, anti-patterns, and accessibility rules

### Available Style Categories

**General Styles (49):** Minimalism & Swiss, Neumorphism, Glassmorphism, Brutalism, 3D & Hyperrealism, Dark Mode (OLED), Claymorphism, Aurora UI, Retro-Futurism, Flat Design, Skeuomorphism, Liquid Glass, Motion-Driven, Micro-interactions, Bento Box Grid, Y2K Aesthetic, Cyberpunk UI, Organic Biophilic, AI-Native UI, Memphis Design, Vaporwave, Spatial UI (VisionOS), E-Ink / Paper, Gen Z Chaos, Biomimetic, Anti-Polish, Tactile Digital, Nature Distilled, Interactive Cursor, Voice-First, 3D Product Preview, Gradient Mesh, Editorial Grid, Chromatic Aberration, Vintage Analog, and more.

**Landing Page Styles (8):** Hero-Centric, Conversion-Optimized, Feature-Rich Showcase, Minimal & Direct, Social Proof-Focused, Interactive Product Demo, Trust & Authority, Storytelling-Driven

**BI/Analytics Dashboard Styles (10):** Data-Dense, Heat Map, Executive, Real-Time Monitoring, Drill-Down, Comparative, Predictive Analytics, User Behavior, Financial, Sales Intelligence

## Usage

### Skill Mode (Auto-activate)

The skill activates automatically when you request UI/UX work. Just chat naturally:

```
Build a landing page for my SaaS product
Create a dashboard for healthcare analytics
Design a portfolio website with dark mode
Improve the UI of this component
Review this design for accessibility issues
```

### Design System Command (Advanced)

```bash
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "beauty spa wellness" --design-system -p "Serenity Spa"
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "glassmorphism" --domain style
python3 .claude/skills/ui-ux-pro-max/scripts/search.py "form validation" --stack react
```

### Supported Stacks

| Category | Stacks |
|----------|--------|
| **Web (HTML)** | HTML + Tailwind (default) |
| **React Ecosystem** | React, Next.js, shadcn/ui |
| **Vue Ecosystem** | Vue, Nuxt.js, Nuxt UI |
| **Angular** | Angular |
| **PHP** | Laravel (Blade, Livewire, Inertia.js) |
| **Other Web** | Svelte, Astro |
| **iOS** | SwiftUI |
| **Android** | Jetpack Compose |
| **Cross-Platform** | React Native, Flutter |

## How It Works

1. **You ask** — Request any UI/UX task
2. **Design System Generated** — AI generates complete design system using reasoning engine
3. **Smart recommendations** — Best matching styles, colors, and typography for your product
4. **Code generation** — Implements UI with proper colors, fonts, spacing, best practices
5. **Pre-delivery checks** — Validates against common UI/UX anti-patterns

## License

MIT License

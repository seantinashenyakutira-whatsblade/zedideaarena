# Components — Agent Docs

## Purpose
Reusable React components — shadcn/ui primitives + custom business components.

## Key Files
### UI Primitives (shadcn/ui)
- `ui/accordion.tsx` — Collapsible accordion
- `ui/alert-dialog.tsx` — Confirmation dialogs
- `ui/alert.tsx` — Alert banners
- `ui/aspect-ratio.tsx` — Aspect ratio container
- `ui/avatar.tsx` — User avatar
- `ui/badge.tsx` — Status badges
- `ui/breadcrumb.tsx` — Navigation breadcrumbs
- `ui/button.tsx` — Primary/secondary/ghost buttons
- `ui/button-group.tsx` — Grouped buttons
- `ui/calendar.tsx` — Date picker calendar
- `ui/card.tsx` — Content cards
- `ui/carousel.tsx` — Image carousel
- `ui/chart.tsx` — Recharts-based chart components
- `ui/checkbox.tsx` — Checkbox input
- `ui/collapsible.tsx` — Collapsible sections
- `ui/command.tsx` — Command palette / search
- `ui/context-menu.tsx` — Right-click context menu
- `ui/dialog.tsx` — Modal dialogs
- `ui/drawer.tsx` — Bottom drawer
- `ui/dropdown-menu.tsx` — Dropdown menus
- `ui/empty.tsx` — Empty state placeholder
- `ui/field.tsx` — Form field wrapper
- `ui/form.tsx` — Form component (react-hook-form)
- `ui/hover-card.tsx` — Hover-triggered cards
- `ui/input.tsx` — Text input
- `ui/input-group.tsx` — Grouped inputs
- `ui/input-otp.tsx` — OTP input
- `ui/item.tsx` — List item component
- `ui/kbd.tsx` — Keyboard shortcut display
- `ui/label.tsx` — Form label
- `ui/menubar.tsx` — Menu bar
- `ui/navigation-menu.tsx` — Navigation menus
- `ui/pagination.tsx` — Pagination controls
- `ui/popover.tsx` — Popover overlay
- `ui/progress.tsx` — Progress bar
- `ui/radio-group.tsx` — Radio button group
- `ui/resizable.tsx` — Resizable panels
- `ui/scroll-area.tsx` — Custom scrollbar container
- `ui/select.tsx` — Select dropdown
- `ui/separator.tsx` — Visual separator
- `ui/sheet.tsx` — Slide-out panel
- `ui/sidebar.tsx` — Application sidebar
- `ui/skeleton.tsx` — Loading skeleton
- `ui/slider.tsx` — Range slider
- `ui/sonner.tsx` — Toast provider (Sonner)
- `ui/spinner.tsx` — Loading spinner
- `ui/switch.tsx` — Toggle switch
- `ui/table.tsx` — Data table
- `ui/tabs.tsx` — Tab navigation
- `ui/textarea.tsx` — Multi-line text input
- `ui/toast.tsx` — Toast notification container
- `ui/toaster.tsx` — Toast rendering
- `ui/toggle.tsx` — Toggle button
- `ui/toggle-group.tsx` — Grouped toggles
- `ui/tooltip.tsx` — Tooltip on hover
- `ui/use-mobile.tsx` — Mobile detection hook
- `ui/use-toast.ts` — Toast trigger hook

### Business Components
- `CompetitionCountdown.tsx` — Countdown timer for competitions
- `LocationAutocomplete.tsx` — Location search with autocomplete
- `theme-provider.tsx` — Theme provider wrapper
- `ui/SuccessPage.tsx` — Shared success page template

### Auth
- `auth/ProtectedRoute.tsx` — Auth guard wrapper component

### Dashboard
- `dashboard/header.tsx` — Dashboard top header with mode switch
- `dashboard/sidebar.tsx` — Dashboard sidebar navigation
- `dashboard/KycBanner.tsx` — KYC reminder banner

### Payment
- `payment/StripePaymentForm.tsx` — Stripe Elements payment form

## Rules
- shadcn/ui components are generated and should not be manually edited (regenerated via `npx shadcn-ui@latest add`)
- Business components in `dashboard/`, `auth/`, `payment/` folders are custom-built
- All UI components support dark mode via Tailwind classes
- Use `cn()` utility from `lib/utils.ts` for conditional class merging
- Components should be server-compatible where possible; use `'use client'` only when necessary

## Child Docs
(none — leaf node)

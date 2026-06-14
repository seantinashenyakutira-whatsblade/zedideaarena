# WebApp Testing Skill

## Overview
Automated QA and security audit for ZedIdeaArena web application using Playwright.

## Required Tools
- Python 3.14+
- Playwright (pip install playwright pytest-playwright)
- Chromium/Chrome browser

## Audit Categories

### 1. UI/UX Polish
- **CLS Detection**: Inject `PerformanceObserver` to capture layout-shift entries
- **Responsive Design**: Test at 375px, 768px, 1024px, 1440px viewports
- **Alignment**: Check flexbox/grid containers for uneven spacing or overflow
- **Color Contrast**: Verify foreground/background ratios on primary UI elements
- **Console Warnings**: Capture React hydration warnings and missing key warnings

### 2. Functional Breaks
- **Broken Links**: Collect all `<a href>` tags, test each for 4xx/5xx
- **Dead Buttons**: Click all interactive elements, capture unhandled rejections
- **Form Validation**: Submit empty/invalid data to every form, verify error states
- **Console Errors**: Route all `console.error`, `pageerror`, `requestfailed` events

### 3. Core Security
- **Exposed Secrets**: Scan HTML/JS for embedded API keys, tokens, secrets
- **Form Security**: Check forms submit over HTTPS, have no `action="http://"`
- **Security Headers**: Inspect response headers for CSP, HSTS, X-Frame-Options, X-Content-Type-Options
- **DOM XSS Vectors**: Check for `dangerouslySetInnerHTML` or `innerHTML` usage in client bundles
- **Cookie Attributes**: Verify auth cookies have `Secure`, `HttpOnly`, `SameSite` where appropriate

## Test Artifacts
- Save screenshots of failures to `./test-artifacts/` with timestamp prefix
- Save console error logs to `./test-artifacts/console-errors.log`
- Save security header scan to `./test-artifacts/security-headers.json`

## Reporting
Generate a markdown report with:
- Executive summary (pass/fail per category)
- Detailed findings with DOM selectors, screenshots, and severity ratings
- Fixed/Unfixed classification
- Top 3 bugs with auto-generated code patches

# Typography Design Specification

**Date:** 2026-04-17
**Topic:** Font Family & Heading Hierarchy Update

## Overview

Update the app's typography to use a premium, sophisticated feel suitable for a dating application.

## Font Selection

- **Heading Font:** Playfair Display (serif) — elegant, romantic, premium
- **Body Font:** Inter (sans-serif) — clean, readable, modern

## Implementation

### 1. Font Setup (layout.tsx)
- Import Playfair Display and Inter from Google Fonts via next/font/google
- Create CSS variables: `--font-heading` and `--font-sans` (body)

### 2. Typography Scale (globals.css)

| Element | Font | Size | Weight | Line Height |
|---------|------|------|--------|-------------|
| h1 | Playfair Display | 2.5rem (40px) | 700 | 1.2 |
| h2 | Playfair Display | 2rem (32px) | 600 | 1.25 |
| h3 | Playfair Display | 1.5rem (24px) | 600 | 1.3 |
| h4 | Playfair Display | 1.25rem (20px) | 500 | 1.4 |
| body | Inter | 1rem (16px) | 400 | 1.5 |
| small | Inter | 0.875rem (14px) | 400 | 1.5 |

### 3. Theme Integration
- Update `@theme` in globals.css to use heading font variable
- Add heading utility classes

## Files to Modify
- `src/app/layout.tsx` — Font imports and variables
- `src/app/globals.css` — Typography scale and utilities
# Chore.io Style Guide

> **Authoritative design system for AI agents and developers**
> All styles extracted from existing implementation. Do not deviate.

## Color System

### Semantic Color Tokens

All colors are defined in `src/styles/app.css` using the `@theme` directive. **Never use hardcoded Tailwind color classes** (e.g., `blue-500`, `gray-800`). Always use semantic tokens.

#### Backgrounds

- **Page background**: `bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end`
- **Cards/Surfaces**: `bg-surface backdrop-blur-sm`
- **Elevated surfaces** (navbars): `bg-surface-elevated`
- **Input fields**: `bg-surface-input`
- **Hover states**: `bg-surface-hover`
- **Disabled elements**: `bg-surface-disabled`

#### Borders

- **Default borders**: `border-border`
- **Strong borders**: `border-border-strong`
- **Hover borders**: `border-border-hover`

#### Text Hierarchy

- **Headings/Primary**: `text-text` (white)
- **Body text/Labels**: `text-text-muted` (gray-300)
- **Secondary text**: `text-text-subtle` (gray-400)
- **Tertiary text**: `text-text-faint` (gray-500)
- **Disabled text**: `text-text-disabled` (gray-600)
- **Placeholders**: `placeholder-text-placeholder` (gray-500)

#### Interactive Elements

- **Primary brand color**: `text-primary` (blue-500)
- **Links**: `text-primary-light hover:text-primary-lighter`
- **Button hover**: Uses `primary-from-hover` and `primary-to-hover` tokens

#### Feedback Colors

- **Error text**: `text-error-text`
- **Error background**: `bg-error-bg`
- **Error border**: `border-error-border-subtle` or `border-error-border`
- **Success text**: `text-success-text`
- **Success background**: `bg-success-bg`
- **Success border**: `border-success-border`

#### Icon Accent Colors

- **Blue icons**: `text-primary-light` with `bg-accent-blue-bg`
- **Purple icons**: `text-accent-purple-light` with `bg-accent-purple-bg`
- **Green icons**: `text-accent-green-light` with `bg-accent-green-bg`

## Typography

### Font Family

Uses Tailwind CSS v4 default system font stack. No custom fonts.

### Font Sizes & Scale

- **Extra large headings**: `text-6xl` or `text-7xl` (home page hero)
- **Page headings**: `text-4xl`
- **Section headings**: `text-2xl` or `text-xl`
- **Subheadings**: `text-xl`
- **Body text**: `text-base` (default)
- **Small text**: `text-sm`

### Font Weights

- **Bold** (headings): `font-bold`
- **Semibold** (subheadings): `font-semibold`
- **Medium** (buttons, labels): `font-medium`
- **Regular** (body): default
- **Light** (taglines): `font-light`

### Tracking & Leading

- **Tight tracking** (large headings): `tracking-tight`
- Default line height for body text

## Spacing & Layout

### Container Patterns

- **Full-screen pages**: `min-h-screen`
- **Centered content**: `flex items-center justify-center`
- **Max-width containers**: `max-w-md` (auth forms), `max-w-4xl` (home), `max-w-7xl` (dashboard)
- **Responsive padding**: `px-4 sm:px-6 lg:px-8`

### Spacing Scale

Uses Tailwind's default spacing scale:

- **Extra small gaps**: `gap-2`, `space-y-2`
- **Small gaps**: `gap-3`, `gap-4`, `space-y-3`, `space-y-4`
- **Medium gaps**: `gap-6`, `space-y-6`, `space-y-8`
- **Large gaps**: `gap-8`, `space-y-8`
- **Padding**: `p-4`, `p-6`, `px-8 py-4`, `py-8`, `py-12`
- **Margins**: `mb-4`, `mb-6`, `mt-2`, `mt-16`

### Grid Layouts

- **Feature grids**: `grid grid-cols-1 md:grid-cols-3 gap-6`
- **Responsive flex**: `flex flex-col sm:flex-row`

## Components

### Buttons

#### Primary Button

```tsx
// Pattern: Gradient background with shadow
className =
  'px-8 py-4 bg-linear-to-r from-primary-from to-primary-to hover:from-primary-from-hover hover:to-primary-to-hover text-text font-semibold rounded-lg shadow-lg shadow-primary-shadow hover:shadow-primary-shadow-hover transition-all duration-200 transform hover:scale-105'
```

**Required classes:**

- `bg-linear-to-r from-primary-from to-primary-to`
- `hover:from-primary-from-hover hover:to-primary-to-hover`
- `shadow-lg shadow-primary-shadow`
- `hover:shadow-primary-shadow-hover`
- `text-text font-semibold`
- `rounded-lg`
- `transition-all duration-200`

#### Secondary Button

```tsx
// Pattern: Surface background with border
className =
  'px-8 py-4 bg-surface-elevated hover:bg-surface-hover text-text-muted hover:text-text font-medium rounded-lg border border-border-strong hover:border-border-hover transition-all duration-200'
```

**Required classes:**

- `bg-surface-elevated hover:bg-surface-hover`
- `border border-border-strong hover:border-border-hover`
- `text-text-muted hover:text-text`
- `rounded-lg`
- `transition-all duration-200`

#### Disabled State

```tsx
// Add to button
disabled:from-surface-disabled disabled:to-surface-disabled disabled:shadow-none disabled:cursor-not-allowed disabled:transform-none
```

### Links

```tsx
// Standard text link
className =
  'text-primary-light hover:text-primary-lighter transition-colors duration-200'
```

### Cards/Surfaces

```tsx
// Standard card pattern
className =
  'bg-surface backdrop-blur-sm rounded-lg border border-border shadow-lg p-6'
```

**Required classes:**

- `bg-surface backdrop-blur-sm`
- `rounded-lg`
- `border border-border`
- Optional: `shadow-lg` for elevation

### Form Inputs

```tsx
// Input field pattern
className =
  'w-full px-4 py-3 bg-surface-input text-text placeholder-text-placeholder border border-border-strong rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all duration-200'
```

**Error state:** Add `border-error-border`

### Navigation Bar

```tsx
// Navbar pattern
className = 'bg-surface-elevated backdrop-blur-sm border-b border-border'
```

### Icon Containers

```tsx
// Icon accent backgrounds
className =
  'w-12 h-12 bg-accent-blue-bg rounded-lg flex items-center justify-center'
// Icon color
className = 'w-6 h-6 text-primary-light'
```

## Error & Empty States

### Error Messages

```tsx
// Error alert box
className = 'p-4 bg-error-bg border border-error-border-subtle rounded-lg'
// Error text
className = 'text-sm text-error-text'
```

### Empty States / 404 Pages

- **Layout**: Full-screen centered (`min-h-screen flex items-center justify-center`)
- **Background**: Gradient (`bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end`)
- **Content card**: `bg-surface backdrop-blur-sm rounded-lg border border-border p-8` or `p-12`
- **Heading hierarchy**:
  - Large error code: `text-6xl font-bold text-text`
  - Title: `text-2xl font-semibold text-text`
  - Description: `text-text-subtle`
- **Actions**: Primary button for main action, secondary for alternative

## Border Radius

- **Standard**: `rounded-lg` (0.75rem / 12px)
- **Small**: `rounded-md` (8px) - rarely used
- **Full**: `rounded-full` - for decorative elements only

## Shadows

- **Cards**: `shadow-lg`
- **Primary buttons**: `shadow-lg shadow-primary-shadow`
- **Primary button hover**: `hover:shadow-primary-shadow-hover`

## Transitions & Animations

### Standard Transitions

- **Duration**: `transition-all duration-200`
- **Color transitions**: `transition-colors duration-200`

### Hover Effects

- **Buttons**: `hover:scale-105` with `transform`
- **Links**: Color change only (no transform)

### Focus States

- **Inputs**: `focus:ring-2 focus:ring-primary focus:border-primary`
- **Buttons**: Inherits focus ring from base styles

## Accessibility

### Semantic HTML

- Use proper heading hierarchy (`h1` → `h2` → `h3`)
- Use `<nav>` for navigation
- Use `<main>` for main content
- Use `<button>` for clickable actions (not `<div>`)

### Focus Management

- All interactive elements must have visible focus states
- Focus ring: `focus:ring-2 focus:ring-primary`
- Focus ring offset: Defined in theme

### Keyboard Navigation

- All buttons and links must be keyboard-accessible
- No `tabIndex={-1}` unless intentional

### Color Contrast

- All text colors meet WCAG AA standards against dark backgrounds
- Primary text (`text-text`): white on dark
- Links (`text-primary-light`): blue-400 on dark

## Layout Patterns

### Full-Page Centered Layout

```tsx
<div className="flex min-h-screen items-center justify-center bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end px-4">
  <div className="w-full max-w-md space-y-8">{/* Content */}</div>
</div>
```

### Authenticated Layout (with Nav)

```tsx
<div className="min-h-screen bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end">
  <nav className="border-b border-border bg-surface-elevated backdrop-blur-sm">
    {/* Nav content */}
  </nav>
  <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {/* Page content */}
  </main>
</div>
```

## Critical Rules for AI Agents

1. **Never hardcode Tailwind colors**: Always use semantic tokens (`text-text`, not `text-white`)
2. **Always use the gradient background**: Full-page layouts must use `bg-linear-to-br from-background-gradient-start via-background-gradient-mid to-background-gradient-end`
3. **Always add backdrop-blur to surfaces**: Cards use `bg-surface backdrop-blur-sm`
4. **Always add transitions**: Interactive elements use `transition-all duration-200` or `transition-colors duration-200`
5. **Never modify existing styles**: Only reuse patterns, never introduce new colors or tokens
6. **TypeScript strict mode**: No `any` types
7. **Accessibility first**: Semantic HTML, proper ARIA, keyboard navigation
8. **Responsive by default**: Use `sm:`, `md:`, `lg:` breakpoints where appropriate

## File References

- **Theme definition**: `src/styles/app.css`
- **Layout examples**: `src/routes/__root.tsx`, `src/routes/index.tsx`
- **Auth components**: `src/components/auth/` (reusable patterns)
- **Theme documentation**: `THEME.md`

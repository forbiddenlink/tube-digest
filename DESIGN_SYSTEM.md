# TubeDigest Design System

## 🎨 Color Palette

Our unique, professional color scheme avoids overused AI tool colors (blue/purple) and instead uses a sophisticated **Emerald, Slate & Amber** palette.

### Primary Colors

- **Emerald** (`emerald-500` to `emerald-600`): Primary brand color, used for CTAs, links, and key UI elements
- **Teal** (`teal-500` to `teal-600`): Secondary accent, used in gradients and supporting elements
- **Cyan** (`cyan-500` to `cyan-600`): Tertiary accent for gradient transitions

### Accent Colors

- **Amber** (`amber-400` to `amber-600`): Warm accent for highlights, stats, and special elements
- **Orange** (`orange-400` to `orange-600`): Supporting warm accent

### Neutral Colors

- **Slate** (`slate-50` to `slate-950`): Primary neutral palette for text, backgrounds, and borders
- Replaces the typical gray palette for a more sophisticated look

### Semantic Colors

- **Success**: Emerald/Teal gradients
- **Error**: Red to Orange gradients
- **Warning**: Amber to Orange
- **Info**: Teal to Cyan

## 🎭 Design Principles

### 1. **Glassmorphism & Depth**
- Frosted glass effects with `backdrop-blur-sm` and semi-transparent backgrounds
- Layered depth using shadows and borders
- Example: `bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm`

### 2. **Gradient Accents**
- Subtle animated background gradients
- Text gradients for headings and stats
- Button gradients for primary actions
- Node gradients in mind maps

### 3. **Smooth Interactions**
- Hover effects with scale and translate transforms
- Color transitions on interactive elements
- Shadow changes on hover
- Example: `hover:-translate-y-1 hover:shadow-2xl transition-all duration-300`

### 4. **Professional Typography**
- Clear hierarchy with size and weight
- Generous line height for readability
- Slate colors for better contrast than pure gray
- Antialiased text rendering

### 5. **Accessibility First**
- ARIA labels on all interactive elements
- Semantic HTML structure
- Keyboard shortcuts (⌘K to focus input)
- High contrast ratios
- Focus states with emerald accent

## 🧩 Component Patterns

### Hero Section
```tsx
- Large gradient text heading
- Subtle animated background blobs
- Stats display with gradient numbers
- Status badge with pulse animation
```

### Cards
```tsx
- Glassmorphism effect
- 2px borders with subtle colors
- Hover lift effect (-translate-y-1)
- Shadow transitions
- Image overlays on hover
```

### Buttons
```tsx
Primary: Emerald → Teal → Cyan gradient
Secondary: Slate borders with hover effects
Accent: Amber → Orange gradient
Icons: 4x4 with 2px stroke
```

### Tags/Topics
```tsx
- Rotating colors: Emerald, Teal, Amber
- Rounded-full for pills
- Border + background combination
- Subtle shadows
```

### Mind Maps
```tsx
Root: Emerald → Teal → Cyan gradient
Headings: Teal → Cyan or Emerald → Green
Topics: Amber → Orange gradient
All with shadows and border accents
```

## 📐 Spacing & Layout

### Container Widths
- Homepage: `max-w-7xl` (1280px)
- Detail pages: `max-w-5xl` (1024px)
- Forms: `max-w-3xl` (768px)

### Padding
- Cards: `p-6 sm:p-8` or `p-6 sm:p-10`
- Sections: `py-12 sm:py-20`
- Buttons: `px-4 py-2` or custom heights

### Gaps
- Grid: `gap-6 sm:gap-8`
- Flex: `gap-2` to `gap-4`
- Section spacing: `mb-12` to `mb-20`

## 🌓 Dark Mode

### Strategy
- Slate-950/900 backgrounds instead of pure black
- Reduced opacity on colors in dark mode
- Inverted prose styles
- Adjusted border opacities
- Shadow colors match theme

### Implementation
```tsx
bg-white dark:bg-slate-900
text-slate-900 dark:text-white
border-slate-200 dark:border-slate-700
```

## ✨ Unique Features

### 1. **Animated Background Blobs**
- Two gradient blobs with different animation durations
- Emerald/Teal and Amber/Orange combinations
- Blur effect for soft appearance
- Fixed positioning with -z-10

### 2. **Gradient Stats**
- Numbers use gradient text
- Different colors for different metrics
- Large, bold typography

### 3. **Smart Topic Colors**
- Alternating colors based on index
- Consistent across the app
- Hover effects on clickable tags

### 4. **Keyboard Shortcuts**
- ⌘K to focus input
- Visual indicators in UI
- Accessible kbd elements

### 5. **Progressive Image Loading**
- Next.js Image component
- Hover scale effects
- Gradient overlays

## 🎯 Best Practices

1. **Always use gradients for primary CTAs** - Makes them stand out
2. **Maintain 2:1 spacing rhythm** - 4, 8, 12, 16, 20, 24...
3. **Use backdrop-blur for overlays** - Creates depth
4. **Add hover states to all interactive elements** - Better UX
5. **Keep borders subtle** - Use /50 opacity or light colors
6. **Animate with purpose** - Duration 200-300ms for interactions
7. **Use semantic HTML** - Better accessibility and SEO
8. **Test in both light and dark mode** - Ensure readability

## 🚀 Performance Considerations

- Use Next.js Image for optimization
- Minimize inline styles (use Tailwind classes)
- Lazy load heavy components
- Optimize animations (transform/opacity only)
- Use backdrop-blur sparingly

## 📱 Responsive Design

### Breakpoints
- `sm:` 640px - Small tablets
- `md:` 768px - Tablets
- `lg:` 1024px - Desktops
- `xl:` 1280px - Large desktops

### Mobile-First Approach
- Base styles for mobile
- Progressive enhancement for larger screens
- Touch-friendly tap targets (min 44x44px)
- Readable font sizes (min 16px for body)

---

This design system creates a **unique, professional, and modern** appearance that stands out from typical AI tools while maintaining excellent usability and accessibility.


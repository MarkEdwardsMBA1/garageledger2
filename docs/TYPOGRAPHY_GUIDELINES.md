# Typography Guidelines for GarageLedger2

This document establishes standardized typography usage patterns to ensure design system consistency and prevent custom styling drift.

## 🎯 Core Principle
**Always use Typography component with semantic variants instead of custom font styling.**

## 📋 Typography Variants Reference

### **Semantic Variants** (Use these 95% of the time)

| Variant | Usage | Example |
|---------|-------|---------|
| `display` | Hero/display text, landing pages | Main app titles |
| `title` | Page titles, screen headers | "Vehicle Details", "Settings" |
| `heading` | Section headings, card titles | "Maintenance History", "Service Details" |
| `subheading` | Sub-section headings, form sections | "Vehicle Information", "Contact Details" |
| `body` | Regular content text, descriptions | Paragraphs, main content |
| `bodyLarge` | Emphasized body text | Important descriptions |
| `bodySmall` | Secondary content, captions | Helper text, metadata |
| `label` | Form labels, UI labels | Input labels, section labels |
| `button` | Button text | CTA buttons, action buttons |
| `caption` | Small descriptive text | Image captions, footnotes |
| `overline` | Small caps text | Category labels, timestamps |

## ✅ Correct Usage Patterns

### **1. Basic Typography**
```typescript
// ✅ GOOD - Use semantic variants
<Typography variant="title">Vehicle Details</Typography>
<Typography variant="body">This is the main content text.</Typography>
<Typography variant="bodySmall">Helper text or metadata</Typography>

// ❌ BAD - Custom styling
<Text style={{ fontSize: 24, fontWeight: 'bold' }}>Vehicle Details</Text>
```

### **2. Color Overrides**
```typescript
// ✅ GOOD - Use Typography with style prop for colors
<Typography variant="body" style={{ color: theme.colors.error }}>
  Error message
</Typography>

// ✅ GOOD - Use Typography with style prop for layout
<Typography variant="body" style={{ textAlign: 'center', marginBottom: 16 }}>
  Centered text with margin
</Typography>

// ❌ BAD - Recreating typography properties
<Text style={{
  fontSize: theme.typography.fontSize.base,
  fontWeight: theme.typography.fontWeight.normal,
  color: theme.colors.error
}}>
  Error message
</Text>
```

### **3. Section Headers**
```typescript
// ✅ GOOD - Consistent section headers
<Typography variant="label" style={{ marginBottom: theme.spacing.md }}>
  Settings
</Typography>

// ✅ GOOD - Alternative for larger sections
<Typography variant="subheading">
  Vehicle Information
</Typography>

// ❌ BAD - Custom section styling
<Text style={styles.sectionTitle}>Settings</Text>
```

### **4. Form Labels**
```typescript
// ✅ GOOD - Use Input component's built-in label
<Input
  label="Vehicle Make"
  value={formData.make}
/>

// ✅ GOOD - Custom labels when needed
<Typography variant="label">
  Viscosity (Optional)
</Typography>

// ❌ BAD - Manual label recreation
<Text style={{ fontSize: 14, fontWeight: '500', letterSpacing: 0.5 }}>
  Vehicle Make
</Text>
```

## 🚫 Anti-Patterns to Avoid

### **1. Font Size/Weight Combinations**
```typescript
// ❌ BAD - Manual font combinations
const styles = StyleSheet.create({
  customTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
  }
});

// ✅ GOOD - Use Typography variant
<Typography variant="subheading">Title Text</Typography>
```

### **2. Inline Font Styling**
```typescript
// ❌ BAD - Inline font properties
<Text style={{ fontSize: 16, fontWeight: 'bold', textAlign: 'center' }}>
  Important Text
</Text>

// ✅ GOOD - Typography with layout-only styling
<Typography variant="body" style={{ textAlign: 'center' }}>
  Important Text
</Typography>
```

### **3. Component-Specific Typography**
```typescript
// ❌ BAD - Custom typography in component
const Button = ({ title }) => (
  <TouchableOpacity>
    <Text style={{ fontSize: 16, fontWeight: '600', letterSpacing: 0.5 }}>
      {title}
    </Text>
  </TouchableOpacity>
);

// ✅ GOOD - Use Typography variant
const Button = ({ title }) => (
  <TouchableOpacity>
    <Typography variant="button">{title}</Typography>
  </TouchableOpacity>
);
```

## 🎨 When to Use Style Prop

Use the `style` prop **only** for:
- **Colors**: `color`, `backgroundColor`
- **Layout**: `textAlign`, `margin`, `padding`
- **Spacing**: `lineHeight` adjustments
- **Transform**: `textTransform`, `textDecorationLine`

**Never** use style prop for:
- `fontSize` (use correct variant)
- `fontWeight` (use correct variant)
- `fontFamily` (handled by variants)
- `letterSpacing` (handled by variants)

## 📁 File Conversion Checklist

When converting files to use Typography:

### **Step 1: Import Typography**
```typescript
import { Typography } from '../components/common/Typography';
```

### **Step 2: Convert Text Components**
- Replace `<Text style={styles.customStyle}>` with appropriate `<Typography variant="...">`
- Move layout-only styles to `style` prop
- Remove font-related styles

### **Step 3: Clean StyleSheet**
Remove these style properties:
- `fontSize`
- `fontWeight`
- `fontFamily`
- `letterSpacing` (unless custom override needed)

Keep these style properties:
- Layout: `margin`, `padding`, `textAlign`
- Colors: `color` (when not using theme defaults)
- Transform: `textTransform`, `textDecorationLine`

### **Step 4: Test Visual Consistency**
Ensure converted components maintain visual hierarchy and spacing.

## 🔍 ESLint Rules (Future Enhancement)

Consider adding these ESLint rules to prevent drift:

```javascript
// Prevent manual fontSize in StyleSheet
'no-manual-font-size': 'error',

// Require Typography import when using text
'require-typography-component': 'warn',

// Prevent fontWeight in StyleSheet
'no-manual-font-weight': 'error',
```

## 📊 Conversion Progress

### **Phase 1: ✅ Completed**
- SettingsScreen.tsx
- VehiclesScreen.tsx
- EditVehicleScreen.tsx

### **Phase 2: Pending**
74 mixed files that import Typography but also use custom styling

### **Phase 3: Future**
Component library updates (Button, Card, Input standardization)

## 🚀 Benefits of This Approach

1. **Design Consistency**: Unified typography across the app
2. **Maintainability**: Single source of truth for font styling
3. **Theme Integration**: Automatic updates when theme changes
4. **Developer Experience**: Clear semantic meaning for text styles
5. **Performance**: Reduced StyleSheet objects and calculations

## 📞 Questions?

If you're unsure about which Typography variant to use:
1. Check this guide first
2. Look at similar UI patterns in the app
3. Ask for clarification in code review

**Remember**: When in doubt, use `Typography variant="body"` and adjust with the `style` prop for colors/layout only.
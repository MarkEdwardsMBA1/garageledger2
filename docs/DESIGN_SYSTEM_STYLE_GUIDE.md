# GarageLedger Design System Style Guide

## Overview
This style guide ensures consistent, professional design across all screens in GarageLedger. It combines best practices from premium apps like MyFitnessPal with our automotive-inspired design system.

## Design Principles

### 1. Strategic Typography Hierarchy
- **Consistent Information Architecture**: Each screen type should follow the same visual hierarchy
- **Predictable Patterns**: Users should know where to look for specific information
- **Automotive Premium Feel**: Professional weight and spacing that conveys trust and reliability

### 2. Visual Consistency Guidelines

#### Typography System (ALWAYS use Typography component)
```typescript
// ✅ CORRECT - Use Typography component
<Typography variant="title">Add Vehicle</Typography>
<Typography variant="body">Enter your vehicle information...</Typography>

// ❌ INCORRECT - Manual styling
<Text style={{fontSize: 24, fontWeight: 'bold'}}>Add Vehicle</Text>
```

#### Standard Screen Typography Hierarchy
1. **Screen Title**: `Typography variant="title"` (24px, bold)
2. **Section Headers**: `Typography variant="heading"` (20px, semibold) 
3. **Subsection Headers**: `Typography variant="subheading"` (18px, medium)
4. **Body Text**: `Typography variant="body"` (16px, normal)
5. **Helper Text**: `Typography variant="caption"` (14px, normal, wide letter spacing)
6. **Labels**: `Typography variant="label"` (14px, medium, wide letter spacing)

## Screen Layout Patterns

### Form Screens Pattern
**Used for**: AddVehicle, CreateProgram, EditProfile, Settings

```typescript
// Standard form screen structure
<View style={styles.container}>
  <ScrollView contentContainerStyle={styles.content}>
    
    {/* Progress indicator if multi-step */}
    <ProgressBar currentStep={1} totalSteps={2} />
    
    {/* Main form card */}
    <Card variant="elevated" style={styles.formCard}>
      <Typography variant="title" style={styles.screenTitle}>
        Screen Title
      </Typography>
      <Typography variant="body" style={styles.screenSubtitle}>
        Brief description of what this screen does.
      </Typography>

      {/* Section 1 */}
      <View style={styles.section}>
        <Typography variant="heading" style={styles.sectionTitle}>
          Section Name
        </Typography>
        
        <Input
          label="Field Label"
          placeholder="Helpful placeholder..."
          // ... field props
        />
      </View>
      
      {/* Additional sections... */}
    </Card>
  </ScrollView>

  {/* Action buttons - always at bottom */}
  <View style={styles.actionBar}>
    <Button variant="outline" title="Cancel" style={styles.button} />
    <Button variant="primary" title="Save" style={styles.button} />
  </View>
</View>
```

### List Screens Pattern  
**Used for**: VehiclesList, ProgramsList, MaintenanceHistory

```typescript
<View style={styles.container}>
  {/* Header with actions */}
  <View style={styles.header}>
    <Typography variant="title">Screen Title</Typography>
    <Button variant="primary" title="Add New" />
  </View>
  
  {/* List content */}
  <FlatList
    data={items}
    renderItem={renderItem}
    contentContainerStyle={styles.listContent}
  />
</View>
```

### Detail Screens Pattern
**Used for**: VehicleDetail, ProgramDetail, MaintenanceRecord

```typescript
<ScrollView contentContainerStyle={styles.content}>
  {/* Hero section */}
  <Card variant="elevated" style={styles.heroCard}>
    <Typography variant="title">{item.name}</Typography>
    <Typography variant="body">{item.description}</Typography>
  </Card>
  
  {/* Detail sections */}
  <Card variant="outlined" style={styles.detailCard}>
    <Typography variant="heading">Section Title</Typography>
    {/* Section content */}
  </Card>
</ScrollView>
```

## Spacing Standards

### Container Spacing
```typescript
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.lg, // 16px - standard content padding
  },
  
  // Form-specific spacing
  formCard: {
    marginBottom: theme.spacing.xl, // 20px - space before action bar
  },
  section: {
    marginBottom: theme.spacing.xl, // 20px between sections
  },
  
  // Action bar
  actionBar: {
    flexDirection: 'row',
    gap: theme.spacing.md, // 12px between buttons
    padding: theme.spacing.lg, // 16px padding
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.borderLight,
    ...theme.shadows.sm,
  },
  button: {
    flex: 1,
    minHeight: 48, // Consistent button height
  },
});
```

### Typography Spacing
```typescript
const styles = StyleSheet.create({
  screenTitle: {
    marginBottom: theme.spacing.sm, // 8px below title
  },
  screenSubtitle: {
    marginBottom: theme.spacing.xl, // 20px below subtitle
    color: theme.colors.textSecondary,
    lineHeight: theme.typography.lineHeight.relaxed * theme.typography.fontSize.base,
  },
  sectionTitle: {
    marginBottom: theme.spacing.md, // 12px below section headers
  },
  helperText: {
    marginTop: theme.spacing.xs, // 4px above helper text
    color: theme.colors.textSecondary,
  },
});
```

## Component Usage Standards

### Card Variants
- **`elevated`**: Primary content cards (forms, main content)
- **`outlined`**: Secondary content, detail sections
- **`floating`**: Modal content, overlays
- **`filled`**: Special emphasis (warnings, success states)

### Button Patterns
- **Primary Action**: `variant="primary"` - One per screen
- **Secondary Action**: `variant="outline"` - Cancel, back actions  
- **Destructive Action**: `variant="outline"` with error color

### Input Patterns
```typescript
// Standard input with proper spacing
<Input
  label="Field Label"
  placeholder="Helpful placeholder text"
  value={value}
  onChangeText={onChange}
  error={error}
  helperText="Optional helpful guidance"
  required // Shows asterisk for required fields
/>
```

## Color Application

### Text Colors
- **Primary Text**: `theme.colors.text` (#111827) - Main content
- **Secondary Text**: `theme.colors.textSecondary` (#374151) - Descriptions, helper text
- **Light Text**: `theme.colors.textLight` (#9ca3af) - Subtle labels, captions

### Semantic Colors
- **Success**: `theme.colors.success` (#166534) - Completed states
- **Warning**: `theme.colors.warning` (#ea580c) - Attention needed
- **Error**: `theme.colors.error` (#b91c1c) - Problems, validation errors
- **Info**: `theme.colors.info` (#0284c7) - Information, tips

## Accessibility Guidelines

### Typography Accessibility
- Minimum font size: 14px for body text
- Line height: 1.5x font size minimum
- Color contrast: 4.5:1 minimum for normal text
- Touch targets: 44px minimum height

### Interaction Patterns
- Loading states for all async operations
- Clear error messages with actionable guidance
- Disabled states that communicate why action is unavailable

## Common Anti-Patterns to Avoid

### ❌ Don't Do This
```typescript
// Manual typography styling
<Text style={{fontSize: 20, fontWeight: 'bold', marginBottom: 10}}>

// Inconsistent spacing
marginBottom: 15, // Use theme.spacing values

// Hardcoded colors
color: '#333333', // Use theme.colors

// Mixed component usage in same screen
<Text>Title</Text>
<Typography variant="body">Body</Typography>
```

### ✅ Do This Instead
```typescript
// Use Typography component consistently
<Typography variant="heading" style={styles.sectionTitle}>

// Use theme spacing
marginBottom: theme.spacing.md,

// Use theme colors
color: theme.colors.textSecondary,

// Consistent component usage
<Typography variant="title">Title</Typography>
<Typography variant="body">Body</Typography>
```

## Form Screen Checklist

Before considering a form screen complete, verify:

- [ ] Uses Typography component for all text
- [ ] Follows standard spacing (lg padding, xl section margins)
- [ ] Has proper Card structure (elevated variant for main form)
- [ ] Action bar at bottom with proper button layout
- [ ] Loading states implemented
- [ ] Error handling with clear messaging
- [ ] Proper validation feedback
- [ ] Keyboard handling (dismiss, proper input types)
- [ ] Accessibility features (labels, touch targets)

## Implementation Priority

1. **Phase 1**: Standardize all form screens (AddVehicle, CreateProgram, etc.)
2. **Phase 2**: Standardize list screens (VehiclesList, ProgramsList)
3. **Phase 3**: Standardize detail screens (VehicleDetail, ProgramDetail)
4. **Phase 4**: Apply standards to utility screens (Settings, Profile)

This style guide ensures every screen feels cohesive and professional, matching the premium automotive experience we're creating.
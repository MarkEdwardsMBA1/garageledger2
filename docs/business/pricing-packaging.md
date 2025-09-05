# Pricing & Packaging Strategy
**Created**: January 27, 2025  
**Status**: 📋 **DRAFT** (Evolving as features are implemented)

## Overview
This document tracks feature distribution across pricing tiers to ensure consistent implementation and strategic positioning. Features are categorized as we build and test them.

---

## 🏗️ **Current Tier Strategy**

### **Free Tier Philosophy**
- **Core maintenance tracking** with professional UX
- **Limited scale** (1-2 vehicles) to encourage upgrade
- **Full Advanced Programs** to showcase platform capability
- **Professional experience** to build trust and engagement

### **Paid Tier Philosophy**  
- **Scale unlock** (unlimited vehicles, fleet management)
- **Premium features** (photo storage, advanced analytics)
- **Professional tools** (export, reporting, integrations)

---

## 📊 **Feature Matrix**

| **Feature Category** | **Feature** | **Free Tier** | **Advanced Tier** | **Pro Tier** | **Implementation Status** |
|---------------------|-------------|---------------|------------------|--------------|--------------------------|
| **Core Tracking** | | | | | |
| | Basic maintenance logging | ✅ Full | ✅ Full | ✅ Full | ✅ Complete |
| | Vehicle management | ✅ 1-2 vehicles | ✅ 5-10 vehicles | ✅ Unlimited | ⚠️ Limit not enforced |
| | Service categories (60+) | ✅ Full | ✅ Full | ✅ Full | ✅ Complete |
| | Maintenance history | ✅ Full | ✅ Full | ✅ Full | ✅ Complete |
| **Program Management** | | | | | |
| | Basic Programs (8 curated services) | ✅ Full | ✅ Full | ✅ Full | ✅ Complete |
| | Advanced Programs (60+ services) | ✅ Full | ✅ Full | ✅ Full | ✅ Complete |
| | Program assignment | ✅ Full | ✅ Full | ✅ Full | ✅ Complete |
| | Service interval configuration | ✅ Full | ✅ Full | ✅ Full | ✅ Complete |
| **Photos & Documents** | | | | | |
| | Basic photo attachments | ✅ 1 photo/log | ✅ 3 photos/log | ✅ Unlimited | 🔄 Upgrade prompts implemented |
| | Receipt uploads | ❌ Locked | ❌ Locked | ✅ Full | 🔄 Upgrade prompts implemented |
| | Document storage | ❌ Locked | ❌ Locked | ✅ Full | 📋 Planned |
| **Analytics & Reporting** | | | | | |
| | Basic cost tracking | ✅ Per vehicle | ✅ Full | ✅ Full | 🔄 In progress |
| | Fleet analytics dashboard | ❌ Locked | ✅ Full | ✅ Full | 📋 Planned |
| | Cost trends & insights | ❌ Locked | ✅ Basic | ✅ Advanced | 📋 Planned |
| | Data export | ❌ Locked | ✅ CSV | ✅ CSV + PDF + API | 📋 Planned |
| **Notifications & Reminders** | | | | | |
| | In-app reminders | ✅ Full | ✅ Full | ✅ Full | 📋 Planned |
| | Email notifications | ❌ Locked | ✅ Full | ✅ Full | 📋 Planned |
| | SMS notifications | ❌ Locked | ❌ Locked | ✅ Full | 📋 Planned |
| **Professional Features** | | | | | |
| | Multi-user access | ❌ Locked | ❌ Locked | ✅ Full | 📋 Planned |
| | API access | ❌ Locked | ❌ Locked | ✅ Full | 📋 Planned |
| | Priority support | ❌ Community | ❌ Community | ✅ Priority | 📋 Planned |

---

## 💡 **Strategic Upgrade Points**

### **Free → Advanced Triggers**
1. **Vehicle limit reached** (2+ vehicles)
2. **Advanced analytics desire** (cost trends, fleet insights)
3. **Email notifications needed**
4. **Export requirements**

### **Advanced → Pro Triggers**  
1. **Photo storage needs** (receipt uploads, unlimited photos)
2. **Team collaboration** (multi-user access)
3. **Integration requirements** (API access)
4. **Professional support needs**

---

## 🎯 **Conversion Strategy**

### **Value Ladder Design**
```
Free Tier (Hook) → Advanced Tier (Scale) → Pro Tier (Professional)
     ↓                    ↓                      ↓
Core experience      Unlimited vehicles    Professional tools
Professional UX      Advanced analytics    Team features
Trust building       Email notifications   API & integrations
```

### **Current Upgrade Prompts Implemented**
- ✅ **Receipt uploads**: Shop/DIY Service Step 3 screens
- ✅ **Photo attachments**: Shop/DIY Service Step 3 screens  
- ✅ **Advanced Programs**: EditProgram screen (now free tier)

### **Planned Upgrade Prompts**
- 📋 **Vehicle limit**: Add Vehicle screen when limit reached
- 📋 **Export features**: Maintenance history screens
- 📋 **Advanced analytics**: Insights/dashboard screens
- 📋 **Email notifications**: Reminders setup screens

---

## 🔧 **Implementation Guidelines**

### **Tier Detection Pattern**
```typescript
// Standard tier checking pattern across app
const userTier = 'free' | 'advanced' | 'pro'; // From user context
const canAccessFeature = checkFeatureAccess(feature, userTier);
```

### **Upgrade Prompt Consistency**
All upgrade prompts should use the standardized `UpgradePrompt` component:
```typescript
<UpgradePrompt
  items={[
    { title: 'Feature Name', description: 'Value-focused benefit' }
  ]}
  buttonTitle="Upgrade to [Tier]"
  onUpgrade={handleUpgrade}
/>
```

### **Graceful Degradation**
- **Never break core functionality** - always provide alternative
- **Show value before locking** - let users see what they're missing
- **Clear upgrade path** - obvious next step to unlock features

---

## 📈 **Success Metrics**

### **Engagement KPIs**
- **Free tier activation**: Users logging 3+ maintenance entries
- **Advanced tier conversion**: Free users upgrading within 30 days
- **Pro tier retention**: Advanced users maintaining annual subscriptions

### **Feature Usage Tracking**
- **Photo upload attempts**: Measure demand for Pro tier features
- **Export requests**: Track Advanced tier conversion triggers  
- **Vehicle limit hits**: Monitor Free tier constraint effectiveness

---

## 🚀 **Future Pricing Considerations**

### **Potential Pricing Structure**
- **Free**: $0/month (1-2 vehicles, core features)
- **Advanced**: $5-8/month (unlimited vehicles, analytics, notifications)  
- **Pro**: $15-20/month (team features, integrations, priority support)

### **Alternative Models**
- **One-time purchase**: Premium app with all features unlocked
- **Freemium + Pro**: Skip middle tier, focus on Free → Pro conversion
- **Usage-based**: Pricing based on vehicle count or maintenance entries

---

## 📝 **Next Steps**

1. **Implement tier detection system** - User context with tier information
2. **Add vehicle limit enforcement** - Block adding 3rd vehicle for free users
3. **Complete photo/receipt tier restrictions** - Enforce upload limits
4. **Build upgrade flow screens** - Dedicated subscription management
5. **Add usage analytics** - Track feature demand and conversion triggers

---

**Last Updated**: January 27, 2025  
**Next Review**: After user tier system implementation

*This document will evolve as we implement features and gather user feedback on pricing sensitivity.*
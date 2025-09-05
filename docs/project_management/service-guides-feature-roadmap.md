# Service Guides Feature Roadmap
**Created**: September 5, 2025  
**Epic**: Advanced DIY Features & Monetization  
**Status**: 📋 **ROADMAP PLANNING** → 🔍 **MARKET RESEARCH**

---

## 🎯 **Vision Statement**

Transform GarageLedger from maintenance logging into a **comprehensive DIY workshop tool** that empowers users to perform their own vehicle maintenance with confidence, precision, and repeatability.

---

## 🔍 **Market Opportunity Analysis**

### **Target User Segments:**
- **DIY Enthusiasts** - Passionate about working on their own vehicles
- **Small Business Owners** - Multiple similar vehicles (fleet maintenance)
- **Budget-Conscious Owners** - Want to save money on labor costs
- **Rural/Remote Users** - Limited access to professional service shops
- **Technical Professionals** - Engineers, mechanics, technicians who appreciate documentation

### **Competitive Landscape:**
- **Haynes/Chilton Manuals** - Static, generic, not personalized
- **YouTube Videos** - Not vehicle-specific, can't customize
- **AllData/Mitchell** - Professional-only, expensive, complex
- **Reddit/Forums** - Scattered, inconsistent, hard to organize

### **GarageLedger Advantage:**
- **Personalized & Vehicle-Specific** - Tailored to exact make/model/year
- **Progressive Complexity** - Build guides as you learn
- **Integrated Experience** - Logs, costs, guides, analytics in one app
- **Mobile-First** - In the garage, under the hood accessibility
- **Photo Documentation** - Visual steps with personal photos

---

## 🎨 **Feature Naming Research**

### **"Service Guides" - Recommended** ⭐
**Pros:**
- Professional but approachable
- Clear value proposition  
- Scales from simple to complex procedures
- SEO-friendly and searchable
- Works for both DIY and professional contexts

**Cons:**
- Might sound generic
- Less exciting than alternatives

### **Alternative Names Considered:**
| Name | Appeal Score | Professional Score | Clarity Score | Overall |
|------|-------------|-------------------|---------------|---------|
| Service Guides | 7/10 | 9/10 | 10/10 | **26/30** ⭐ |
| Maintenance Playbooks | 9/10 | 8/10 | 8/10 | 25/30 |
| DIY Blueprints | 8/10 | 7/10 | 9/10 | 24/30 |
| Workshop Guides | 8/10 | 8/10 | 7/10 | 23/30 |
| Custom Procedures | 6/10 | 10/10 | 8/10 | 24/30 |
| Service Recipes | 9/10 | 5/10 | 8/10 | 22/30 |

**Decision: "Service Guides"** - Best balance of professional credibility and user clarity

---

## 📋 **Feature Specification**

### **Core Data Model:**
```typescript
interface ServiceGuide {
  id: string;
  userId: string;
  vehicleIds: string[];         // Free: [single], Paid: [multiple]
  title: string;                // "Oil Change - 2019 Honda Civic"
  category: MaintenanceCategory; // Oil, Brakes, Engine, etc.
  estimatedTime: number;        // Minutes
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
  
  // Prerequisites  
  tools: Tool[];
  parts: Part[];
  fluids: Fluid[];
  safetyWarnings: string[];
  
  // Guide Content
  steps: GuideStep[];
  tips: string[];
  troubleshooting: TroubleshootingItem[];
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
  useCount: number;
  isTemplate: boolean;          // Paid: Can create reusable templates
}

interface GuideStep {
  stepNumber: number;
  title: string;                // "Remove oil drain plug"
  description: string;          // Detailed instructions
  photo?: string;               // Step-specific photo
  video?: string;               // Future: video support
  estimatedTime?: number;       // Time for this step
  warnings?: string[];          // Step-specific safety warnings
  tips?: string[];              // Helpful hints
  checkboxes: ChecklistItem[];  // Sub-tasks within step
}

interface Tool {
  name: string;                 // "17mm socket wrench"
  required: boolean;
  alternatives?: string[];       // ["17mm box wrench", "adjustable wrench"]
  estimatedCost?: number;
  purchaseLinks?: string[];      // Affiliate opportunity
}

interface Part {
  name: string;                 // "Oil filter"
  partNumber?: string;          // "51356"  
  quantity: number;
  estimatedCost?: number;
  preferredSupplier?: string;
  alternatives?: string[];
}
```

### **User Experience Flow:**
```
Service Guides
├── My Guides (List view)
│   ├── Create New Guide → Guide Builder
│   ├── Browse Templates (Paid) → Template Library  
│   └── Recent Guides → Quick access
├── Guide Builder (Step-by-step creation)
│   ├── Basic Info → Title, category, difficulty
│   ├── Tools & Parts → Shopping list creation
│   ├── Step Creation → Photo + description per step
│   └── Review & Save → Preview before saving
└── Guide Execution (Usage mode)
    ├── Pre-flight Check → Confirm tools/parts available
    ├── Step-by-Step Progress → Checkbox completion
    ├── Timer Integration → Track actual vs estimated time
    └── Completion Log → Auto-log maintenance when done
```

---

## 🎯 **Tiered Feature Strategy**

### **Free Tier: Single-Vehicle Guides**
```typescript
interface FreeServiceGuide {
  vehicleId: string;           // Locked to ONE vehicle
  maxSteps: 20;               // Limit complexity
  basicTools: Tool[];        // No advanced tool database
  photos: string[];           // Basic photo support
}
```

**Free Tier Limitations:**
- ✅ Create guides for ONE vehicle only
- ✅ Up to 20 steps per guide
- ✅ Basic photo support (5 photos per guide)
- ❌ Cannot assign guide to multiple vehicles
- ❌ No guide templates or sharing
- ❌ No video steps
- ❌ No advanced tool database with purchase links

### **Paid Tier: Multi-Vehicle + Advanced Features**
```typescript
interface PaidServiceGuide {
  vehicleIds: string[];        // Multiple vehicle assignment
  maxSteps: Unlimited;        // Complex procedures
  advancedTools: Tool[];      // Full tool database + purchase links
  photos: string[];           // Unlimited photos
  videos: string[];           // Video step support
  templates: boolean;         // Create reusable templates
  sharing: boolean;           // Share with other users
}
```

**Paid Tier Enhancements:**
- ✅ Assign guides to multiple vehicles
- ✅ Unlimited steps and complexity
- ✅ Unlimited photos + video support
- ✅ Advanced tool database with purchase recommendations
- ✅ Template creation and sharing
- ✅ Community guide marketplace
- ✅ Offline guide downloads
- ✅ PDF export functionality

### **Enterprise Tier: Fleet Management**
- ✅ Organization-wide guide sharing
- ✅ Team collaboration on guide creation  
- ✅ Compliance tracking and reporting
- ✅ Custom branding and white-labeling
- ✅ API access for integration

---

## 📈 **Business Model Impact**

### **Revenue Streams:**
1. **Subscription Upgrades** - Free to Paid tier conversion
2. **Tool Affiliate Commissions** - Purchase link referrals
3. **Template Marketplace** - User-generated content revenue sharing
4. **Enterprise Licensing** - B2B fleet management solutions

### **User Engagement Drivers:**
1. **Time Investment** - Users invest hours creating detailed guides
2. **Repeated Usage** - Guides used multiple times (oil changes every 3-6 months)
3. **Improvement Cycle** - Guides get better with each use
4. **Content Ownership** - Users "own" their maintenance knowledge

### **Competitive Moats:**
1. **Personal Data Lock-In** - Custom guides tied to specific vehicles
2. **Network Effects** - Better guides → more users → better marketplace
3. **Integration Advantage** - Seamless with existing maintenance logs
4. **Mobile Optimization** - Designed for garage/workshop usage

---

## 🛠️ **Implementation Phases**

### **Phase 1: MVP Service Guides** 
**Timeline**: 2-3 sessions | **Risk**: MEDIUM | **Impact**: HIGH

#### **Core Features:**
- Basic guide creation and editing
- Step-by-step builder with photos
- Tool and parts list management  
- Simple guide execution mode
- Integration with maintenance logging

#### **Technical Requirements:**
- New data models and repositories
- Guide builder UI components
- Photo capture and storage
- Step navigation and progress tracking

### **Phase 2: Multi-Vehicle & Templates**
**Timeline**: 1-2 sessions | **Risk**: LOW | **Impact**: MEDIUM

#### **Paid Tier Features:**
- Multi-vehicle guide assignment
- Template creation and management
- Advanced tool database
- Enhanced photo/media support

### **Phase 3: Community & Marketplace**
**Timeline**: 3-4 sessions | **Risk**: HIGH | **Impact**: HIGH

#### **Advanced Features:**
- User-generated template sharing
- Community rating and reviews
- Marketplace revenue sharing
- Advanced search and discovery

---

## 🔄 **Integration Strategy**

### **Existing Feature Connections:**
1. **Maintenance Logging** - Auto-log when guide completed
2. **Cost Analytics** - Track DIY vs shop service costs
3. **Vehicle Programs** - Suggest guide creation for scheduled maintenance
4. **Photo Management** - Reuse existing photo capture/storage

### **New Service Requirements:**
1. **Guide Storage** - Firebase document structure optimization
2. **Image Optimization** - Compress and cache guide photos
3. **Search Engine** - Find guides by vehicle, category, difficulty
4. **Template System** - Reusable guide patterns

---

## ⚠️ **Risk Assessment**

### **Technical Risks:**
- **Complex UI/UX** - Guide builder needs intuitive step creation
- **Storage Costs** - Photos and videos increase Firebase usage
- **Performance** - Large guides with many photos could be slow

### **Business Risks:**
- **User Adoption** - DIY users may prefer YouTube/forums
- **Content Quality** - User-generated guides may be poor quality
- **Legal Liability** - Injury from following incorrect instructions

### **Mitigation Strategies:**
- **Progressive Rollout** - Start with power users and DIY enthusiasts
- **Quality Controls** - Review system and community moderation
- **Legal Protection** - Clear disclaimers and liability limitations
- **Professional Review** - Expert validation for popular templates

---

## 📊 **Success Metrics**

### **Engagement Metrics:**
- **Guide Creation Rate** - Guides created per active user
- **Guide Usage Rate** - How often guides are executed
- **Step Completion Rate** - Percentage of users who finish guides
- **Photo Upload Rate** - Visual documentation engagement

### **Business Metrics:**
- **Free-to-Paid Conversion** - Service Guides driving upgrades
- **Retention Improvement** - Users with guides vs without
- **Affiliate Revenue** - Tool/parts purchase commissions
- **Template Marketplace** - User-generated content engagement

### **Quality Metrics:**
- **Guide Ratings** - Community feedback on guide quality
- **Error Reports** - Issues identified in guide instructions
- **Completion Times** - Actual vs estimated guide duration
- **Success Rate** - Maintenance completed successfully using guides

---

## 🎯 **Go-to-Market Strategy**

### **Phase 1: DIY Enthusiast Focus**
- Target existing power users with multiple maintenance logs
- Promote in automotive forums and DIY communities
- Create high-quality sample guides for popular procedures

### **Phase 2: Small Business Expansion**  
- Focus on multi-vehicle features for small fleets
- B2B marketing to auto shops, delivery companies
- Case studies showing cost savings vs professional service

### **Phase 3: Mass Market Appeal**
- Consumer marketing emphasizing money savings
- Partnership with tool/parts retailers
- Influencer collaborations with automotive YouTubers

---

## 🚀 **Recommendation**

**Service Guides represents a transformative feature** that could differentiate GarageLedger from simple maintenance logging competitors. The combination of personalization, mobile optimization, and integration with existing analytics creates a compelling value proposition.

**Recommended approach:**
1. ✅ **Document and plan thoroughly** (current phase)
2. ✅ **Start with Phase 1 MVP** after Insights Screen overhaul
3. ✅ **Focus on user experience quality** over feature quantity
4. ✅ **Build community gradually** with power user feedback

This feature has the potential to create **significant user lock-in** and drive **sustainable revenue growth** through both subscriptions and affiliate partnerships.

**Ready to begin Phase 1 implementation after Insights Screen completion!**
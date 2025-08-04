# GitHub Issues Workflow

This document explains how to use GitHub Issues to track epics and user stories for GarageLedger development.

## 🎯 Issue Structure

### Hierarchy
```
Epic (Issue) 
├── User Story (Issue) - relates to Epic
├── User Story (Issue) - relates to Epic  
└── User Story (Issue) - relates to Epic
```

### Labels System
- **epic**: Major feature or milestone
- **user-story**: Individual user story
- **bug**: Bug reports
- **enhancement**: Feature improvements
- **documentation**: Documentation updates
- **good-first-issue**: Beginner-friendly issues
- **needs-triage**: Needs priority/assignment review

### Priority Labels
- **priority: critical**: Must have for MVP
- **priority: high**: Important for user experience
- **priority: medium**: Competitive advantage
- **priority: low**: Future consideration

### Phase Labels
- **phase: mvp**: Phase 1 - MVP (Weeks 1-12)
- **phase: growth**: Phase 2 - Market Growth (Months 3-6)
- **phase: intelligence**: Phase 3 - Intelligence & Analytics (Months 6-12)
- **phase: platform**: Phase 4 - Platform & Ecosystem (Year 2+)

## 📋 Creating Issues

### 1. Create Epics First
Use the **Epic template** to create high-level features:

**Example Epic:**
```
Title: [EPIC] Vehicle Management
Labels: epic, phase: mvp, priority: critical
```

### 2. Create User Stories
Use the **User Story template** and link to the epic:

**Example User Story:**
```
Title: [STORY] GL-007 - Add vehicle form
Labels: user-story, phase: mvp, priority: high
Related Epic: #1
```

### 3. Link Stories to Epics
In the epic description, maintain a checklist:
```markdown
## Related User Stories
- [ ] #5 - GL-007: Add vehicle form
- [ ] #6 - GL-008: Vehicle list screen  
- [ ] #7 - GL-009: Edit vehicle form
```

## 🏗️ Initial Epic Issues to Create

Based on our backlog, create these epic issues:

### Phase 1 - MVP Epics
1. **[EPIC] MVP Foundation** 
   - Stories: GL-001 to GL-006
   - Sprint: 1-2

2. **[EPIC] Vehicle Management**
   - Stories: GL-007 to GL-013  
   - Sprint: 2-3

3. **[EPIC] Maintenance Logging**
   - Stories: GL-014 to GL-021
   - Sprint: 4-5

4. **[EPIC] Reminders & Notifications**
   - Stories: GL-022 to GL-027
   - Sprint: 5-6

5. **[EPIC] MVP Polish & Launch**
   - Stories: GL-028 to GL-033
   - Sprint: 6

## 🔄 Issue Workflow States

### Open Issues
- **Backlog**: Not yet started
- **Ready**: Defined and ready to work
- **In Progress**: Currently being worked on

### Closed Issues  
- **Done**: Completed successfully
- **Won't Fix**: Decided not to implement

## 📊 GitHub Projects Setup

### Create Project Board
1. Go to repository **Projects** tab
2. Create new project: "GarageLedger MVP"
3. Use **Board** view with columns:
   - 📋 **Backlog** (Not started)
   - 🚀 **Ready** (Defined, ready to work)
   - 👨‍💻 **In Progress** (Active development)
   - 👀 **Review** (Code review/testing)
   - ✅ **Done** (Completed)

### Project Views
- **Epic View**: Filter by `label:epic` to see high-level progress
- **Current Sprint**: Filter by `milestone:Sprint-X` for sprint planning
- **Priority View**: Sort by priority labels for backlog grooming

## 🏃‍♂️ Sprint Planning with Issues

### Create Milestones
1. **Sprint 1**: Week 1-2 (Foundation Setup)
2. **Sprint 2**: Week 3-4 (Navigation & Vehicle Foundation)
3. **Sprint 3**: Week 5-6 (Vehicle Management & Photos)
4. **Sprint 4**: Week 7-8 (Maintenance Logging Foundation)
5. **Sprint 5**: Week 9-10 (Maintenance History & Reminders)
6. **Sprint 6**: Week 11-12 (Notifications & MVP Launch)

### Assign Issues to Sprints
- Add issues to appropriate milestone
- Use project board to track sprint progress
- Update story points in issue descriptions

## 🔗 Issue Linking Best Practices

### Epic → Story Relationships
```markdown
## Epic Issue Description
Related User Stories:
- [ ] #10 GL-007: Add vehicle form (8 pts)
- [ ] #11 GL-008: Vehicle list screen (5 pts)
- [ ] #12 GL-009: Edit vehicle form (5 pts)

Total Points: 18
```

### Story → Epic References
```markdown
## User Story Description
**Epic**: #5 Vehicle Management Epic
**Story ID**: GL-007
**Points**: 8
```

### Dependencies
```markdown
## Dependencies
- Depends on #5 (Firebase Setup) being completed
- Blocks #12 (Edit Vehicle) until complete
```

## 📝 Issue Templates Usage

### When to Use Each Template

**Epic Template** (`epic.yml`):
- Major features spanning multiple stories
- High-level milestones
- Cross-cutting concerns (i18n, testing, etc.)

**User Story Template** (`user-story.yml`):
- Individual features delivering user value
- Specific functionality within an epic
- Development tasks with clear acceptance criteria

**Bug Report Template** (`bug-report.yml`):
- Issues found during development/testing
- User-reported problems
- Regression issues

## 🎯 Example Issue Creation Workflow

### Step 1: Create Epic
```bash
# Create issue using Epic template
Title: [EPIC] Vehicle Management
Priority: Critical
Phase: MVP
Description: Complete vehicle CRUD functionality...
```

### Step 2: Create Stories
```bash
# Story 1
Title: [STORY] GL-007 - Add vehicle form  
Epic: #1
Points: 8
Sprint: Sprint 2

# Story 2  
Title: [STORY] GL-008 - Vehicle list screen
Epic: #1  
Points: 5
Sprint: Sprint 2
```

### Step 3: Update Epic
```markdown
# Update Epic #1 description
## Related User Stories
- [ ] #2 GL-007: Add vehicle form (8 pts)
- [ ] #3 GL-008: Vehicle list screen (5 pts)
Total: 13 pts
```

## 🏷️ Labels to Create

Set up these labels in your repository:

### Type Labels
- `epic` (purple)
- `user-story` (blue)
- `bug` (red)
- `enhancement` (green)
- `documentation` (yellow)

### Priority Labels  
- `priority: critical` (dark red)
- `priority: high` (orange)
- `priority: medium` (yellow)
- `priority: low` (light gray)

### Phase Labels
- `phase: mvp` (dark blue)
- `phase: growth` (blue)
- `phase: intelligence` (purple)
- `phase: platform` (pink)

### Status Labels
- `needs-triage` (light red)
- `ready` (green)
- `blocked` (red)
- `good-first-issue` (light green)

## 📈 Tracking Progress

### Epic Progress
- Check off completed stories in epic description
- Update epic with completion percentage
- Close epic when all stories are done

### Sprint Progress
- Use milestone view to see sprint completion
- Update project board as work progresses
- Review velocity for future sprint planning

### Overall Progress
- Track epic completion for phase milestones
- Monitor story point velocity
- Use GitHub insights for team productivity

---

**Next Steps**: Create the initial epic issues for Phase 1 MVP development using the templates above.
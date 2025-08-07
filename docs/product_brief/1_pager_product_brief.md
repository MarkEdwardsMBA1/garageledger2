# 🛠️ GarageLedger Product Brief (v1.0)

## 📌 What is GarageLedger?
**GarageLedger** is a forms-first, UX-focused mobile and web app designed for **DIY vehicle owners, home mechanics, and car enthusiasts** to easily **log, track, and reflect** on the work they do to their vehicles.

It starts simple — just well-structured, nicely-formatted forms to collect data — but becomes increasingly valuable over time as a personal maintenance, modification, and repair history for each vehicle.

---

## 🎯 Core Product Vision
> Help users turn scattered notes, receipts, and memories into a clean, digital garage record they actually enjoy using — and come back to.

---

## 🧱 MVP Scope

### 1. User Identity & Account
- Email-based signup
- Basic profile: name, preferences, notification settings

### 2. Vehicle Setup
- Add one or more vehicles (make, model, year, VIN optional)
- Upload photo (optional)
- Tag as “daily,” “project,” or “track” car (optional)

### 3. Maintenance & Mods Logging
- Log entries like:
  - Oil changes
  - Tire rotations
  - Filter replacements
  - Upgrades/mods
- Each log includes: date, mileage, parts used, notes, photos (optional)

---

## 💡 Key Product Principles

| Principle | Description |
|----------|-------------|
| 🧩 **Progressive Disclosure** | Show only what’s needed. Keep each screen focused and uncluttered. |
| ⚡ **Low Friction, High Reward** | Every action should feel smooth and worthwhile. Immediate feedback, visual reinforcement. |
| 📈 **Value Builds Over Time** | The product gets better as more data is entered — insights, reminders, and history unlock later. |
| 📱 **Mobile-First, Responsive Web** | Users may be in the garage or driveway. Optimize for quick input from phones. |

---

## 🔁 Why Users Come Back
- “What did I do last time?”
- “When should I do this next?”
- “What parts did I use?”
- “What’s my total investment in this build?”

---

## 🚀 Key UX Goals for Early Release
- 🧭 Smooth onboarding with a clear first "win"
- 🧾 Thoughtfully designed forms (minimal input, smart defaults)
- 🎉 Positive reinforcement at each step (e.g., “Vehicle added!”)
- 📅 Clear timeline view or logbook history

---

## 🔧 Technical Notes for Development
- Form-driven UX across all major flows
- Structured data models: user → vehicle → entries
- Support offline-first behavior (local cache, sync later)
- Simple notification engine for reminders (e.g., time or mileage-based)

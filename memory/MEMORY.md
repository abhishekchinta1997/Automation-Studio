# Automation Studio - AI Context & Project Memory

## 📌 Project Overview
**Automation Studio** is a client-side QA practice sandbox and live element inspector designed for practicing automation testing using **Playwright**, **Selenium**, and **Cypress**.

---

## 🏗️ Architecture & Core Stack
* **Framework:** React 19 with TypeScript, bundled via Vite.
* **UI & Styling:** Custom Modern Slate Theme (native CSS with #0F172A background, #1E293B cards, #334155 borders, #6366F1 accents; no Tailwind dependency).
* **Routing:** React Router DOM using HashRouter for GitHub Pages compatibility.
* **State & Data:** Client-side only using React Context API (`AuthContext`), state hooks, and browser `localStorage`/`sessionStorage`. **No backend database.**
* **Testability:** All interactive components use explicit `data-testid` attributes for reliable test script targeting.

---

## 📂 Key Directory Structure
* `/src/components` — Reusable UI modules (Sidebar, Navbar, Modals, Live Inspector panel).
* `/src/pages` — Main application views (Login, User Management, Interactive Sandbox).
* `/src/context` — Global state management for authentication, roles, and themes.
* `/src/utils` — Automation script generator engines (Playwright, Selenium, Cypress).

---

## ⚙️ Core Modules & Capabilities
1. **Form Controls:** Inputs, single/multi-selects, searchable typeahead country dropdowns, and file upload targets.
2. **Dynamic Tables:** Sorting headers, global search/filter across columns, pagination, and bulk user actions.
3. **Async & Waits Lab:** Loading state simulations (1.5s - 3.5s AJAX delays) for practicing explicit waits.
4. **Frames, Shadow DOM & Storage:** Simulated iframe contexts, shadow DOM element piercing, and Web Storage management.
5. **Toasts, Alerts & Modals:** Native browser dialog triggers and temporary toast notifications.
6. **User Management:** Role-based access controls (Super User, Admin, Test User) with status filters and random user generators.

---

## 🎯 Development Conventions for AI Assistants
* **Styling:** Always adhere to the modern slate theme (`#0F172A`). Avoid pure black (`#000000`).
* **Test Selectors:** Every new interactive element or button **must** include a descriptive `data-testid` attribute (e.g., `data-testid="submit-btn"`).
* **Telemetry:** New interactive elements should push action events to the Live Inspector context when clicked or modified.
* **TypeScript:** Strictly enforce explicit interfaces and types for all props and data models.

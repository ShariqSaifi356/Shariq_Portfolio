# Mohammad Shariq Saifi - Professional QA Automation Portfolio

A premium, creative, and highly interactive single-page landing portfolio website designed specifically for a **QA Automation Engineer / SDET**. Built with a modern aesthetic featuring glassmorphism, custom micro-animations, theme-aware HSL colors (Dark/Light modes), and special QA-focused features.

---

## 🚀 Key Features

*   **Custom Interactive QA Shell**: An interactive CLI terminal in the Hero section that simulates script loading and accepts custom commands (`help`, `skills`, `projects`, `theme`, `clear`).
*   **🕵️ QA Inspector Mode**: A creative utility toggled from the navbar. When turned ON, hovering over any page element highlights it with a blue outline and opens a floating control panel displaying:
    *   XPath
    *   CSS Selector
    *   Playwright (TS) Locator
    *   Selenium (Java) Locator
    *   Selenium (Python) Locator
    *   *Includes an auto-shutdown countdown timer (60s) with an option to extend time (+60s).*
*   **Work History Timeline**: A centered, clean interactive vertical timeline displaying TCS banking client projects, written as Java class syntax, which expands/collapses on click to show responsibilities and stack tags.
*   **Squeezed Skills Grid**: A compact 5-column technical capability panel detailing test engines, languages, CI/CD tools, databases, and financial messaging standards.
*   **One-Click Email Copy Card**: A clean contact panel that displays your email address. Clicking copies it to the clipboard and triggers a toast notification.
*   **Dynamic Theme Toggle**: Flawless transitions between dark mode and light mode, adjusting backgrounds, text, and glass cards instantly.
*   **Direct Resume Download**: Anchored directly to your actual resume PDF (`public/Mohammad_Shariq_Saifi_Resume.pdf`) with immediate download snackbar feedback.

---

## 🛠️ Technology Stack

*   **Framework**: Angular 22 (Standalone Components, Signals state management)
*   **Styling**: Tailwind CSS v4 (CSS-first engine)
*   **Fonts**: Inter (UI Text) & JetBrains Mono (Monospaced elements)

---

## ⚙️ Installation & Setup

Follow these steps to set up and run the project locally on your machine:

### 1. Prerequisites
Ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (Version 18.x or later recommended)
*   [npm](https://www.npmjs.com/) (bundled with Node.js)

### 2. Clone the Repository
```bash
git clone <repository-url>
cd Shariq_Portfolio
```

### 3. Install Dependencies
Run the install command to fetch all Angular, Material design, and GSAP libraries:
```bash
npm install
```

### 4. Run Development Server
Start the local watcher:
```bash
npm run dev
```
*Note: If port 4200 is occupied, you can serve on a custom port:*
```bash
npx ng serve --port 4300
```
Open your browser and navigate to **`http://localhost:4300/`** (or the port outputted in terminal) to view the live app.

### 5. Production Build
To build the optimized static assets for hosting:
```bash
npm run build
```
This compiles the application and outputs the build assets into the `dist/Shariq_Portfolio` directory.

---

## 📁 Project Structure & Customization

The portfolio is fully database-driven. All personal details, educational history, technical skills, projects, and work highlights are decoupled from components.

To customize the website's content, simply edit the centralized JSON configuration file:
*   **Database Path**: [portfolio-data.json](file:///home/tanmaysinghx/Developer/Code/Projects/Shariq_Portfolio/src/app/shared/data/portfolio-data.json)

Updating this JSON automatically propagates changes dynamically throughout the Hero section, About card, Experience timeline, Skills grid, Project overlays, and download anchors without editing any HTML!

---

## 📄 License
This project is open-source and free to adapt.
# Shariq_Portfolio

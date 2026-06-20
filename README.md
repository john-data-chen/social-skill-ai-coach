# Social Skills AI Coach

[![codecov](https://codecov.io/gh/john-data-chen/social-skill-ai-coach/graph/badge.svg?token=Gj6H1mEAAz)](https://codecov.io/gh/john-data-chen/social-skill-ai-coach)
[![Quality gate](https://sonarcloud.io/api/project_badges/quality_gate?project=john-data-chen_social-skill-ai-coach)](https://sonarcloud.io/summary/new_code?id=john-data-chen_social-skill-ai-coach)
[![CI](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml/badge.svg)](https://github.com/john-data-chen/social-skill-ai-coach/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

An AI-powered web application designed to help you practice and improve your social interactions. Built with Next.js, React, and the Vercel AI SDK, this app provides a structured 4-stage workflow (Analyzer, Coach, Roleplay, Reflection) to guide you through social scenarios.

## 🚀 Features

- **4-Stage Workflow**: Seamlessly transition from analyzing a situation to getting advice, roleplaying, and receiving feedback.
- **Multi-Model Support**: Switch between Xiaomi MiMo and DeepSeek models.
- **BYOK (Bring Your Own Key)**: Securely use your own API keys directly from the browser session.
- **Attachments Support**: Upload images and text files (.md, .txt, .csv) for the AI to analyze.
- **Dark/Light Theme**: Built-in theme toggling for better accessibility.

---

## 📂 Repository Structure

A quick overview of what each file and directory is responsible for:

```text
├── .github/workflows/   # GitHub Actions CI/CD pipelines (e.g., ci.yml for automated testing & Vercel deployment)
├── __tests__/           # All automated tests
│   ├── e2e/             # Playwright End-to-End tests (UI & browser cross-testing)
│   └── units/           # Vitest unit tests for components, API routes, and store logic
├── src/                 # Application source code
│   ├── app/             # Next.js App Router entry points
│   │   ├── api/chat/    # API Route for handling AI stream generation & structured outputs
│   │   ├── layout.tsx   # Root layout containing providers (Theme)
│   │   └── page.tsx     # Main application UI and chat interface
│   ├── components/      # React components
│   │   ├── ui/          # Reusable UI components (buttons, inputs, dialogs, tabs) built with Base UI/shadcn
│   │   ├── Settings.tsx # Settings dialog for AI provider and API key configuration
│   │   └── ThemeToggle.tsx # Light/Dark mode toggle button
│   └── lib/             # Utilities and core logic
│       ├── agents.ts    # AI system prompts and schemas for the 4 stages
│       ├── ai.ts        # AI provider initialization (MiMo / DeepSeek)
│       ├── router.ts    # Logic for determining the next stage of the workflow
│       ├── store.ts     # Zustand store for state management (history, config)
│       └── utils.ts     # Generic utility functions (e.g., Tailwind class merging)
├── playwright.config.ts # Playwright E2E testing configuration
├── vitest.config.ts     # Vitest unit testing & coverage configuration
├── package.json         # Project dependencies and npm scripts
└── env.example          # Template for environment variables needed for local development
```

---

## 💻 Local Development & Test Environment Setup

Follow these steps to run the application and execute tests on your local machine.

### 1. Prerequisites

Ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v24 or latest LTS)
- [pnpm](https://pnpm.io/installation) (latest)

### 2. Install Dependencies

Clone the repository and install the required packages:

```bash
pnpm install
```

### 3. Environment Variables

To run the server locally, you need to set up your environment variables.

1. Copy the provided `.env.example` to a new file named `.env`:
   ```bash
   cp env.example .env
   ```
2. Open `.env` and fill in your API keys (e.g., `MIMO_API_KEY`, `DEEPSEEK_API_KEY`) if you plan to use the "Demo" mode locally.

### 4. Run the Development Server

Start the Next.js local development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

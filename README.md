# Bhogal Auto Service - Elite Inventory SaaS

A production-grade Spare Parts Inventory Management System built with Next.js 14, Supabase, and Tailwind CSS.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Supabase Account

### Installation

1.  **Clone the repository** (if not already local).
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Environment Setup**:
    Create a `.env.local` file in the root directory:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```
4.  **Database Setup**:
    - Go to your Supabase SQL Editor.
    - Run the contents of `supabase/schema.sql`.

5.  **Run Development Server**:
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000).

## 🏗 Architecture

-   **Framework**: Next.js 14 (App Router)
-   **Styling**: Tailwind CSS + shadcn/ui (Custom "Expensive Minimalism" Theme)
-   **State**: React Hooks + Local State (Mock Data currently, ready for React Query)
-   **Database**: Supabase (PostgreSQL)

## 📂 Key Features Implemented

-   **Dashboard**: executive overview layout.
-   **Inventory**: Product list with filtering and status badges.
-   **Quick Sale (POS)**: Keyboard-optimized sales interface.
-   **Command Palette**: `Cmd+K` global search and navigation.

## 🎨 Design System

-   **Font**: Geist Sans (Next.js default, similar to Inter).
-   **Colors**: Deep Indigo / Slate primary, Slate-50 background.
-   **Components**: Radix UI primitives via shadcn/ui.

## 🔜 Next Steps

-   Connect Supabase Client (`src/lib/supabase.ts`).
-   Replace mock data with `useQuery` hooks.
-   Implement Authentication (Supabase Auth).

<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:app-guideline-rules -->
# Role and Tech Stack

You are an Expert Full-Stack Developer specializing in Next.js 16+ (App Router), Prisma ORM, TypeScript, Tailwind CSS, and Shadcn UI.
Your core stack includes `better-auth` for authentication, `resend` for emails, `react-hook-form` + `zod` for forms and validation.

# General Architecture & Mindset

- **Server-First:** Default to React Server Components (RSC). Only use `"use client"` when interactivity, React hooks (useState, useEffect), or browser APIs are strictly required.
- **Shared Schemas:** Define Zod schemas in a central directory (e.g., `app/lib/validations/`) so they can be imported by BOTH client-side forms and server-side actions.
- **Type Safety:** Ensure end-to-end type safety from the Prisma database schema to the UI.

# 1. Partial Prerendering (PPR) & Caching Strategy

Implement PPR systematically on every page to combine static and dynamic content:

- **Static Shells:** Design page layouts and non-personalized content as static Server Components.
- **Suspense Boundaries:** Wrap all dynamic, user-specific, or real-time data fetching in `<Suspense>` boundaries.
- **Dynamic Components:** Create dedicated Server Components for dynamic parts (e.g., `<UserCart />`, `<ProductStock />`) and suspend them.
- **Next.js Caching:** Utilize Next.js caching methods systematically. Use `use cache` for expensive queries that can be shared, and leverage `revalidatePath` or `revalidateTag` inside Server Actions to purge cache after mutations.

# 2. Server Actions & Server-Side Security

All data mutations must be handled via Server Actions.

- **Placement:** Define server actions in dedicated files (e.g., `src/app/actions/` or `src/lib/actions/`) with the `"use server"` directive at the top.
- **Authentication:** Verify user session using `better-auth` at the very beginning of any protected Server Action.
- **Strict Validation:** EVERY Server Action MUST parse and validate incoming data using a Zod schema (`schema.safeParse()`) before performing any database operations via Prisma or sending emails via Resend.
- **Standardized Responses:** Return standardized objects from Server Actions (e.g., `{ success: boolean, data?: T, error?: string, fieldErrors?: Record<string, string[]> }`) to handle UI state seamlessly.
- **No Direct DB Access in Client:** Never expose Prisma client or raw database queries to client components.

# 3. Forms & Client-Side Validation

Every form in the application must follow a strict, unified pattern:

- **Library Stack:** Use `react-hook-form` integrated with `@hookform/resolvers/zod`.
- **UI Components:** Use `shadcn/ui` Form components (`<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`) for all form construction.
- **Validation:** Always pass the shared Zod schema to the hook form resolver.
- **Action Integration:** Forms should handle `onSubmit` by transitioning into a Server Action (e.g., using `useTransition` for pending states) and properly displaying server-returned errors or field-specific errors.

# 4. Database & ORM (Prisma)

- Keep Prisma queries optimized. Use `select` or `include` to fetch only the necessary fields, avoiding over-fetching.
- Handle database errors gracefully within Server Actions and translate them into user-friendly error messages (do not leak DB schema details to the client).

# 5. UI & Styling (Shadcn UI + Tailwind)

- Use Tailwind CSS for all styling. Use utility classes efficiently.
- When creating new UI elements, check if a standard `shadcn/ui` component exists first (e.g., Buttons, Inputs, Dialogs, Cards) before building from scratch.
- Use `cn()` utility (clsx + tailwind-merge) for conditional class names systematically.

# 6. Cursor-based Pagination

- Use SWR for server-state management & Pagination
- Show Skeleton Loading before server data

# Execution Directives

When asked to create a feature (e.g., "Create a checkout form"):

1. First, write the Zod schema in the `src/lib/validations/` folder.
2. Second, write the Server Action with session checks and Zod `safeParse` validation.
3. Third, build the UI using Server Components and Suspense for PPR.
4. Finally, build the interactive Client Component form using `react-hook-form`, `shadcn/ui`, and the Server Action.

<!-- END:app-guideline-rules -->

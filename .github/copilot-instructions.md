# Copilot Instructions

This document provides guidelines and best practices used throughout the repository, especially with regard to tRPC usage and common patterns seen in the project.

## tRPC Best Practices

- **Procedure Types**

  - Use [`publicProcedure`](web/src/server/api/trpc.ts) for endpoints that do not require authentication.
  - Use [`authenticatedProcedure`](web/src/server/api/trpc.ts) for queries and mutations that require a logged-in user.
  - Use [`adminProcedure`](web/src/server/api/trpc.ts) for admin-only endpoints.
  - Follow the established pattern in your routers (e.g. [`toolsRouter`](web/src/server/api/routers/tools.ts), [`favoritesRouter`](web/src/server/api/routers/favorites.ts), etc.).

- **Error Handling & Logging**

  - Leverage tRPC’s error formatting in [`trpc.ts`](web/src/server/api/trpc.ts) so that Zod validation errors are properly formatted on the frontend.
  - Use standardized error messages (e.g. using `TRPCError` for unauthorized or conflict states).

- **Context and Middleware**

  - Create context using [`createTRPCContext`](web/src/server/api/trpc.ts) to inject the database, session, and user.
  - Use middleware for tasks like timing, logging, or enforcing authentication before procedures are executed.

- **Data Fetching & Mutations**
  - When using mutations (e.g. upserting favorites or deleting entries), refresh or update related client data using hooks like `router.refresh()` or by invalidating queries.
  - Use `useMutation` hooks from [`api`](web/src/trpc/react.tsx) consistently on the client side.

## UI and Client-Side Patterns

- **React Hook Form & Zod**

  - Use [`react-hook-form`](https://react-hook-form.com) together with [`zod`](https://github.com/colinhacks/zod) and `zodResolver` for form validation.
  - See usage in [tools.client.tsx](<web/src/app/(app)/tools/[id]/tools.client.tsx>): form schema (`FormSchema`) and form handling for reviews.

- **Tailwind CSS & Utility Functions**

  - Use the utility function [`cn`](web/src/lib/utils) to compose Tailwind CSS class names.
  - Follow the styling conventions from the Tailwind configuration in [tailwind.config.ts](web/tailwind.config.ts).

- **ShadCN Components**

  - Use pre-built components from the [shadcn/ui library](https://ui.shadcn.dev/) for consistent and accessible UI elements.
  - Customize components as needed but ensure they align with the design system.
  - Examples include buttons, dropdown menus, tabs, and badges, which are already integrated into the project (e.g., `/components/ui/`).

- **Optimizations**
  - Use hooks like `useMemo` to cache computed values (e.g. checking for admin privileges).
  - For pagination, leverage the custom [`usePagination`](web/src/hooks/use-pagination.ts) hook and keep query state managed with [`useQueryState`](https://www.npmjs.com/package/nuqs).

## Code Structure and Consistency

- **Component Organization**

  - UI components such as buttons, tabs, and forms are consistently imported from `/components/ui/` to centralize design styles.
  - Keep business logic for data fetching in the server-side API, and keep UI rendering responsibilities in React components.

- **API Routers and Database Access**
  - Group related endpoints (e.g. tools, favorites, collections, releases) into separate routers (e.g. [`toolsRouter`](web/src/server/api/routers/tools.ts), [`collectionsRouter`](web/src/server/api/routers/collections.ts)).
  - Use upsert patterns for creating or updating entities. For example, when handling favorites or tools updates, use a consistent upsert pattern.

## Additional Recommendations

- **Code Comments & Documentation**

  - Comment non-obvious logic especially in mutation handlers and middleware.
  - Update this `copilot-instructions.md` file if new best practices emerge as the project evolves.

- **Testing & Debugging**
  - Use integrated test support and run unit tests via the provided test configuration (e.g. [vitest.config.ts](discord-bot/vitest.config.ts) if applicable).
  - Monitor logs and errors both in the browser (for tRPC errors) and in the server console.

By following these guidelines, contributors and tools like GitHub Copilot will maintain consistency and high code quality across the repository.

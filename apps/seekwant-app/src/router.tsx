import { createRootRoute, createRouter } from "@tanstack/react-router";
import { GraphPage } from "./pages/GraphPage";

const rootRoute = createRootRoute({
  component: GraphPage,
});

const routeTree = rootRoute;

export const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

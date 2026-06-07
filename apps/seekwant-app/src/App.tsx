import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "@tanstack/react-router";
import { Toaster } from "./components/ui/sonner";
import { ThemeProvider } from "./components/ui/theme-provider";
import { router } from "./router";

const queryClient = new QueryClient();

export function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="seekwant-theme">
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

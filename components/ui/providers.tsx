"use client";

import { ThemeProvider, useTheme } from "next-themes";
import React from "react";
import { Toaster } from "./sonner";
import ConvexClientProvider from "./convex-client-provider";
import { ClerkProvider } from "@clerk/nextjs";

const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ClerkProvider>
      <ConvexClientProvider>
        <ThemeProvider
          enableSystem
          attribute={"class"}
          defaultTheme="dark"
          disableTransitionOnChange>
          {children}
          <ToastProvider />
        </ThemeProvider>
      </ConvexClientProvider>
    </ClerkProvider>
  );
};

export default Providers;

function ToastProvider() {
  const { resolvedTheme } = useTheme();

  return (
    <Toaster
      richColors
      closeButton
      position="top-center"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
    />
  );
}

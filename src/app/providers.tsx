'use client';

import { SessionProvider } from "next-auth/react";
import { ThemeProvider, useTheme } from "@/lib/theme-context";

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  return (
    <div className={`min-h-screen bg-background text-foreground transition-colors duration-300`}>
      {children}
    </div>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider>
        <ThemeWrapper>
          {children}
        </ThemeWrapper>
      </ThemeProvider>
    </SessionProvider>
  );
}

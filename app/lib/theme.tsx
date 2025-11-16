"use client";

import { useEffect } from "react";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const root = document.documentElement;
    
    // Function to update theme based on system preference
    const updateTheme = () => {
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    };
    
    // Set initial theme
    updateTheme();
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", updateTheme);
    
    return () => {
      mediaQuery.removeEventListener("change", updateTheme);
    };
  }, []);

  return <>{children}</>;
}


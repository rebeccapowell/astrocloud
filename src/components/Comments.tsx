import Giscus, { type Theme } from "@giscus/react";
import { useEffect, useState } from "react";
import { GISCUS } from "../config.ts";

export default function Comments() {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    if (typeof window !== "undefined") { // Ensure client-side execution
      const storedTheme = localStorage.getItem("theme");
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setTheme(storedTheme || systemTheme);
    }
  }, []);

  return (
    <div className="mt-8">
      <Giscus theme={theme} {...GISCUS} />
    </div>
  );
}

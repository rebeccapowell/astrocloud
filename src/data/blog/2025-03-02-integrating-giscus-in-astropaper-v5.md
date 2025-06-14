---
id: 10000
title: "Integrating Giscus Comments in AstroPaper v5"
pubDatetime: 2025-03-02T16:00:00+01:00
author: rebecca
layout: "../layouts/BlogPost.astro"
guid: "https://rebecca-powell.com/?p=10000"
slug: 2025-03-02-integrating-giscus-in-astropaper-v5'
description: A step-by-step guide on integrating Giscus comments into AstroPaper v5, including fixes for common issues.
categories:
  - work
tags:
  - astro
  - blog
  - comments
  - giscus
---

![Astro Giscus Integration](/assets/posts/giscuss_comments_integration.webp)

### Integrating Giscus Comments in AstroPaper v5

Adding interactive comments to a static blog can be a challenge, but with **Giscus**, we can integrate GitHub-powered discussions into an **AstroPaper v5** blog. This guide walks through the initial setup and fixes applied to make Giscus work correctly.

#### Step 1: Setting Up Giscus

1. Go to [giscus.app](https://giscus.app/).
2. Select the **GitHub repository** where discussions should be stored.
3. Enable **Discussions** in the repository settings.
4. Choose the preferred category (e.g., `Announcements`).
5. Copy the generated `<script>` tag and embed it into `src/layouts/PostDetails.astro`:

```html
<script
  src="https://giscus.app/client.js"
  data-repo="[ENTER REPO HERE]"
  data-repo-id="[ENTER REPO ID HERE]"
  data-category="[ENTER CATEGORY NAME HERE]"
  data-category-id="[ENTER CATEGORY ID HERE]"
  data-mapping="pathname"
  data-theme="preferred_color_scheme"
  crossorigin="anonymous"
  async
></script>
```

#### Step 2: Using the Giscus React Component

A better way to integrate Giscus is to use the **React component**, which allows seamless light/dark theme switching.

1. Install the Giscus React package:

   ```bash
   npm install @giscus/react
   ```

2. Create `src/components/Comments.tsx`:

   ```tsx
   import Giscus, { type Theme } from "@giscus/react";
   import { useEffect, useState } from "react";
   import { GISCUS } from "../config";

   export default function Comments() {
     const [theme, setTheme] = useState<Theme>("light");

     useEffect(() => {
       if (typeof window !== "undefined") {
         const storedTheme = localStorage.getItem("theme");
         const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
           .matches
           ? "dark"
           : "light";
         setTheme(storedTheme || systemTheme);
       }
     }, []);

     return <Giscus theme={theme} {...GISCUS} />;
   }
   ```

3. Define `GISCUS` in `src/config.ts`:

   ```ts
   import type { GiscusProps } from "@giscus/react";

   export const GISCUS: GiscusProps = {
     repo: "[ENTER REPO HERE]",
     repoId: "[ENTER REPO ID HERE]",
     category: "[ENTER CATEGORY NAME HERE]",
     categoryId: "[ENTER CATEGORY ID HERE]",
     mapping: "pathname",
     reactionsEnabled: "0",
     emitMetadata: "0",
     inputPosition: "bottom",
     lang: "en",
     loading: "lazy",
   };
   ```

4. Add `Comments.tsx` to `PostDetails.astro`:

   ```astro
   ---
   import Comments from "../components/Comments";
   ---

   <Layout>
     <main>
       <ShareLinks />
       <Comments client:load />
     </main>
   </Layout>
   ```

#### Step 3: Fixing Common Issues

During the installation, we encountered and resolved several issues:

✅ **Fix: `localStorage is not defined` error**

- Solution: Wrap `localStorage` inside `useEffect` to ensure it runs only in the browser.

✅ **Fix: `Cannot find module '@config'` error**

- Solution: Update the import to `import { GISCUS } from "../config";` or set up aliases in `tsconfig.json`.

✅ **Fix: Astro hydration errors**

- Solution: Use `<Comments client:load />` to ensure React loads only on the client.

### Conclusion

With these steps, we successfully integrated **Giscus comments** into **AstroPaper v5** with full support for light/dark mode and seamless client-side hydration. If you run into any issues, drop a comment below—on Giscus! 🚀

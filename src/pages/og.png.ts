import type { APIRoute } from "astro";
import { generateOgImageForSite } from "@/utils/generateOgImages";

export const GET: APIRoute = async () => {
  return new Response(await generateOgImageForSite(), {
    headers: { "Content-Type": "image/png" },
  });
};

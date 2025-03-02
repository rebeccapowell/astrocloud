import type { GiscusProps } from "@giscus/react";

export const SITE = {
  website: "https://blog.rebeccapowell.com/", // replace this with your deployed domain
  author: "Rebecca powell",
  profile: "https://rebeccapowell.com/",
  desc: "the home of tech evangelista rebecca powell.",
  title: "rebecca🟅powell",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    url: "https://github.com/rebeccapowell/astrocloud/tree/main/src/data/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
} as const;

export const GISCUS: GiscusProps = {
  repo: "rebeccapowell/astrocloud",
  repoId: "R_kgDOOB4lxA",
  category: "Announcements",
  categoryId: "DIC_kwDOOB4lxM4CnfVr",
  mapping: "pathname",
  reactionsEnabled: "0",
  emitMetadata: "0",
  inputPosition: "bottom",
  lang: "en",
  loading: "lazy",
} as const;


export const LOGO_IMAGE = {
  enable: true,
  svg: true,
  width: 216,
  height: 46,
};
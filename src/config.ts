export const SITE = {
  website: "https://rebeccapowell.com/", // replace this with your deployed domain
  author: "Rebecca powell",
  profile: "https://rebeccapowell.com/",
  desc: "the home of tech evangelista rebecca powell.",
  title: "rebecca powell",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 4,
  postPerPage: 4,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: true,
    url: "https://github.com/rebeccapowell/astrocloud/tree/main/src/data/blog",
    text: "Suggest Changes",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "Europe/Berlin", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;

export const LOGO_IMAGE = {
  enable: true,
  svg: true,
  width: 216,
  height: 46,
};

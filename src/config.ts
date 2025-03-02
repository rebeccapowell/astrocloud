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
    url: "https://github.com/satnaing/astro-paper/edit/main/src/content/blog",
    text: "Suggest Changes",
    appendFilePath: true,
  },
} as const;

export const LOGO_IMAGE = {
  enable: true,
  svg: true,
  width: 216,
  height: 46,
};
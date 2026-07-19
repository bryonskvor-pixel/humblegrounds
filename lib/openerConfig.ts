// Swappable opener config (projectcontext.md §4.5).
// mode:
//   "open"        no animation, site loads doors-open
//   "video-bloom" illustrated opener: the bean splits, gold light pours from
//                 the seam, and the light floods the viewport then fades to
//                 reveal the site (masthead first)
//   "video-doors" video freezes on P6, doors slide apart (needs a clean
//                 vertical-split final frame — the current video ends on a
//                 tilted V with a starburst, so bloom is the live mode)
//   "video-fade"  plain crossfade from the video's last frame to the site
export const openerConfig = {
  mode: "video-bloom" as "open" | "video-bloom" | "video-doors" | "video-fade",
  videoSrc: "/assets/opener/new-opener.mp4",
  videoSrcWebm: "/assets/opener/new-opener.webm",
  poster: "/assets/opener/new-opener-poster.jpg",
  doorLeft: "/assets/opener/door-left.jpg",
  doorRight: "/assets/opener/door-right.jpg",
};

// Swappable opener config (projectcontext.md §4.5).
// mode:
//   "open"        no animation, site loads doors-open (current default until assets exist)
//   "video-doors" illustrated opener: video plays, freezes on P6, doors slide apart
//   "video-fade"  interim photoreal opener with a light-bloom fade instead of doors
export const openerConfig = {
  mode: "open" as "open" | "video-doors" | "video-fade",
  videoSrc: "/assets/opener/opener.mp4",
  videoSrcWebm: "/assets/opener/opener.webm",
  poster: "/assets/opener/p1-poster.jpg",
  doorLeft: "/assets/opener/door-left.jpg",
  doorRight: "/assets/opener/door-right.jpg",
};

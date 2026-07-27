const seoIssues = [
  { type: "critical", title: "Missing meta descriptions", count: 14, detail: "14 pages have no meta description" },
  { type: "critical", title: "Broken internal links", count: 7, detail: "7 broken links found across the site" },
  { type: "warning", title: "Images without alt text", count: 38, detail: "38 images missing alt attributes" },
  { type: "warning", title: "Slow page speed", count: 6, detail: "6 pages load in over 3 seconds" },
  { type: "info", title: "Duplicate title tags", count: 3, detail: "3 pages share identical title tags" },
  { type: "info", title: "Low word count pages", count: 11, detail: "11 pages under 300 words" },
];
export default seoIssues;
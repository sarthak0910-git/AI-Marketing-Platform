const automationWorkflows = [
  { id: 1, name: "Welcome Email Series", trigger: "New signup", steps: 5, active: true, runs: 1240, success: 94 },
  { id: 2, name: "Re-engagement Campaign", trigger: "30 days inactive", steps: 3, active: true, runs: 387, success: 28 },
  { id: 3, name: "Content Promotion Flow", trigger: "New blog post published", steps: 4, active: true, runs: 89, success: 71 },
  { id: 4, name: "Lead Nurture Sequence", trigger: "Download asset", steps: 7, active: false, runs: 0, success: 0 },
  { id: 5, name: "Weekly Digest", trigger: "Every Monday 8 AM", steps: 2, active: true, runs: 52, success: 88 },
];
export default automationWorkflows;
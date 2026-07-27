const analyticsData = Array.from({ length: 30 }, (_, i) => ({
  day: `Jun ${i + 1}`,
  sessions: Math.floor(3200 + Math.sin(i * 0.4) * 800 + i * 60 + Math.random() * 300),
  users: Math.floor(2100 + Math.sin(i * 0.3) * 500 + i * 45 + Math.random() * 200),
  pageviews: Math.floor(9400 + Math.sin(i * 0.5) * 1200 + i * 90 + Math.random() * 500),
  bounceRate: parseFloat((58 - i * 0.4 + Math.random() * 5).toFixed(1)),
}));
export default analyticsData;
function ScoreGauge({ score }) {
  const r = 54, cx = 70, cy = 70;
  const circ = 2 * Math.PI * r;
  const arc = (score / 100) * circ * 0.75;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <svg width={140} height={100} viewBox="0 0 140 100">
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="#ffffff12"
        strokeWidth={10}
        strokeDasharray={`${circ * 0.75} ${circ}`}
        strokeDashoffset={circ * 0.125}
        strokeLinecap="round"
      />

      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={10}
        strokeDasharray={`${arc} ${circ}`}
        strokeDashoffset={circ * 0.125}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 1s ease" }}
      />

      <text
        x={cx}
        y={cy - 2}
        textAnchor="middle"
        fill={color}
        fontSize={26}
        fontWeight={700}
        fontFamily="'Sora', sans-serif"
      >
        {score}
      </text>

      <text
        x={cx}
        y={cy + 14}
        textAnchor="middle"
        fill="#888"
        fontSize={11}
      >
        / 100
      </text>
    </svg>
  );
}

export default ScoreGauge;
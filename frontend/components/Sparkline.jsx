// components/Sparkline.jsx
// Pure SVG sparkline — no chart library needed.
// Receives an array of price numbers and renders a smooth path.

export default function Sparkline({ data = [], color = "#fff", width = 120, height = 40 }) {
  if (!data || data.length < 2) {
    // Render a flat dashed line while waiting for data
    return (
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <line
          x1="0" y1={height / 2}
          x2={width} y2={height / 2}
          stroke={color} strokeWidth="1.5"
          strokeDasharray="4 4" opacity="0.3"
        />
      </svg>
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 4;

  // Map data points to SVG coordinates
  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
    const y = height - pad - ((val - min) / range) * (height - pad * 2);
    return [x, y];
  });

  // Build a smooth SVG path using cubic bezier curves
  const path = points.reduce((acc, [x, y], i) => {
    if (i === 0) return `M ${x},${y}`;
    const [px, py] = points[i - 1];
    const cpx = (px + x) / 2;
    return `${acc} C ${cpx},${py} ${cpx},${y} ${x},${y}`;
  }, "");

  // Build fill path (close shape at bottom for gradient fill)
  const fillPath = `${path} L ${points[points.length - 1][0]},${height} L ${points[0][0]},${height} Z`;

  const gradientId = `grad-${color.replace("#", "")}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} overflow="visible">
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Fill area */}
      <path d={fillPath} fill={`url(#${gradientId})`} />

      {/* Line */}
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* End dot */}
      <circle
        cx={points[points.length - 1][0]}
        cy={points[points.length - 1][1]}
        r="3"
        fill={color}
      />
    </svg>
  );
}
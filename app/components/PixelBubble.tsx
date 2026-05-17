interface Props {
  width?: number;
  className?: string;
}

export default function PixelBubble({ width = 26, className = "" }: Props) {
  const h = Math.round((width * 13) / 10);
  return (
    <svg
      viewBox="0 0 10 13"
      width={width}
      height={h}
      shapeRendering="crispEdges"
      className={className}
      aria-hidden
    >
      <g fill="#ffffff">
        <rect x="1" y="1" width="8" height="1" />
        <rect x="1" y="2" width="3" height="1" />
        <rect x="6" y="2" width="3" height="1" />
        <rect x="1" y="3" width="2" height="1" />
        <rect x="4" y="3" width="2" height="1" />
        <rect x="7" y="3" width="2" height="1" />
        <rect x="1" y="4" width="5" height="1" />
        <rect x="7" y="4" width="2" height="1" />
        <rect x="1" y="5" width="4" height="1" />
        <rect x="6" y="5" width="3" height="1" />
        <rect x="1" y="6" width="3" height="1" />
        <rect x="5" y="6" width="4" height="1" />
        <rect x="1" y="7" width="8" height="1" />
        <rect x="1" y="8" width="3" height="1" />
        <rect x="5" y="8" width="4" height="1" />
        <rect x="1" y="9" width="8" height="1" />
      </g>
      <g fill="currentColor">
        <rect x="1" y="0" width="8" height="1" />
        <rect x="0" y="1" width="1" height="9" />
        <rect x="9" y="1" width="1" height="9" />
        <rect x="4" y="2" width="2" height="1" />
        <rect x="3" y="3" width="1" height="1" />
        <rect x="6" y="3" width="1" height="1" />
        <rect x="6" y="4" width="1" height="1" />
        <rect x="5" y="5" width="1" height="1" />
        <rect x="4" y="6" width="1" height="1" />
        <rect x="4" y="8" width="1" height="1" />
        <rect x="1" y="10" width="8" height="1" />
        <rect x="0" y="11" width="2" height="1" />
        <rect x="1" y="12" width="1" height="1" />
      </g>
    </svg>
  );
}

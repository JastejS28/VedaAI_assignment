interface DiagramData {
  renderType: "svg" | "dagre";
  svgContent?: string;
  nodes?: Array<{
    id: string;
    label: string;
  }>;
  edges?: Array<{
    from: string;
    to: string;
    label?: string;
  }>;
}

interface DiagramRendererProps {
  imageUrl?: string;
  diagramData?: DiagramData | null;
}

export default function DiagramRenderer({
  imageUrl,
  diagramData,
}: DiagramRendererProps): JSX.Element | null {
  if (!diagramData && !imageUrl) {
    return null;
  }

  if (imageUrl) {
    return <img src={imageUrl} alt="Question diagram" className="mt-3 max-w-full" />;
  }

  if (diagramData?.renderType === "svg" && diagramData.svgContent) {
    return (
      <div
        className="mt-3 max-w-full"
        dangerouslySetInnerHTML={{ __html: diagramData.svgContent }}
      />
    );
  }

  if (
    diagramData?.renderType === "dagre" &&
    Array.isArray(diagramData.nodes) &&
    Array.isArray(diagramData.edges)
  ) {
    const boxWidth = 160;
    const boxHeight = 42;
    const horizontalGap = 40;
    const verticalGap = 28;
    const width = boxWidth * 2 + horizontalGap + 24;
    const height =
      Math.max(diagramData.nodes.length, 1) * (boxHeight + verticalGap) + 24;

    const nodePositions = new Map<string, { x: number; y: number; label: string }>();
    diagramData.nodes.forEach((node, index) => {
      const isLeft = index % 2 === 0;
      const row = Math.floor(index / 2);
      nodePositions.set(node.id, {
        label: node.label,
        x: isLeft ? 12 : 12 + boxWidth + horizontalGap,
        y: 12 + row * (boxHeight + verticalGap),
      });
    });

    return (
      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full">
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="8"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#6B7280" />
            </marker>
          </defs>

          {diagramData.edges.map((edge, index) => {
            const from = nodePositions.get(edge.from);
            const to = nodePositions.get(edge.to);
            if (!from || !to) {
              return null;
            }

            const startX = from.x + boxWidth / 2;
            const startY = from.y + boxHeight;
            const endX = to.x + boxWidth / 2;
            const endY = to.y;
            const labelX = (startX + endX) / 2;
            const labelY = (startY + endY) / 2 - 6;

            return (
              <g key={`${edge.from}-${edge.to}-${index}`}>
                <line
                  x1={startX}
                  y1={startY}
                  x2={endX}
                  y2={endY}
                  stroke="#6B7280"
                  strokeWidth="1.5"
                  markerEnd="url(#arrowhead)"
                />
                {edge.label && (
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="11"
                    fill="#4B5563"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            );
          })}

          {diagramData.nodes.map((node) => {
            const position = nodePositions.get(node.id);
            if (!position) {
              return null;
            }

            return (
              <g key={node.id}>
                <rect
                  x={position.x}
                  y={position.y}
                  width={boxWidth}
                  height={boxHeight}
                  rx="6"
                  fill="#FFFFFF"
                  stroke="#9CA3AF"
                />
                <text
                  x={position.x + boxWidth / 2}
                  y={position.y + boxHeight / 2 + 4}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#111827"
                >
                  {position.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }

  return null;
}

interface DiagramData {
  renderType: "svg" | "dagre";
  svgContent?: string;
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

  if (diagramData?.renderType === "dagre") {
    return (
      <div className="mt-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500">
        Diagram renders here.
      </div>
    );
  }

  return null;
}

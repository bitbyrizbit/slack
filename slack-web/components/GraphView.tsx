import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import * as d3 from "d3";
import { Maximize2, ZoomIn, ZoomOut, RotateCcw, ChevronDown, ChevronUp, MapPin, Clock, DollarSign, Plane, Bed, Car } from "lucide-react";
import { GraphEdge, GraphNode, NodeImpact, SuggestedDependency } from "@/lib/types";
import { useZoom } from "@/hooks/useZoom";
import { useRippleAnimation } from "@/hooks/useRippleAnimation";
import { useD3Graph, getEdgeStyle } from "@/hooks/useD3Graph";

export interface GraphViewProps {
  tripId?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  onSelectNode: (node: GraphNode) => void;
  suggestedDependencies: SuggestedDependency[];
  disruptedBookingId?: string | null;
  ripplePath?: string[];
  perNodeImpact?: NodeImpact[];
  onFitToScreenRef?: (fn: () => void) => void;
  isReverseRippling?: boolean;
  reverseStepIndex?: number;
  pulsingNodeId?: string | null;
  showAtRiskOnly?: boolean;
}

interface D3Node extends d3.SimulationNodeDatum {
  id: string;
  type: "flight" | "hotel" | "transfer" | "activity";
  title: string;
  start_time: string;
  end_time: string;
  location?: string | null;
  vendor?: string | null;
  cost?: number | null;
  cancellation_policy?: string | null;
  metadata: Record<string, string | number | boolean | undefined>;
  trackIndex: number;
  timeX: number;
}

interface D3Link {
  id: string;
  from: string;
  to: string;
  source: string | D3Node;
  target: string | D3Node;
  min_buffer_minutes: number;
  actual_gap_minutes: number;
  slack_minutes: number;
  status: "safe" | "tight" | "violated";
}

const NODE_RADIUS = 30;

const TYPE_COLORS: Record<string, { fill: string; stroke: string; label: string; text: string }> = {
  flight: { fill: "var(--foreground)", stroke: "none", label: "Flight", text: "var(--foreground)" },
  hotel: { fill: "#2D3A31", stroke: "none", label: "Hotel", text: "var(--foreground)" },
  transfer: { fill: "var(--foreground)", stroke: "none", label: "Transfer", text: "var(--foreground)" },
  activity: { fill: "#FFFFFF", stroke: "none", label: "Activity", text: "var(--foreground)" },
};

// Strict & Defensive Edge Style Resolver (guarantees safe slack >30m never renders as violated)

export const GraphView: React.FC<GraphViewProps> = ({
  tripId,
  nodes,
  edges,
  selectedNodeId,
  onSelectNode,
  suggestedDependencies,
  disruptedBookingId,
  ripplePath = [],
  perNodeImpact = [],
  onFitToScreenRef,
  isReverseRippling = false,
  reverseStepIndex = -1,
  pulsingNodeId = null,
  showAtRiskOnly = false,
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const zoomBehaviorRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const gRootRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null);
  const nodePositionsRef = useRef<Map<string, { x: number; y: number }>>(new Map());

  // Clear stale node positions when active trip changes so every trip starts from a clean deterministic layout
  useEffect(() => {
    nodePositionsRef.current.clear();
  }, [tripId]);

  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 1200,
    height: 620,
  });

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [isLegendCollapsed, setIsLegendCollapsed] = useState(false);
  const [hoveredNode, setHoveredNode] = useState<{
    node: any;
    screenX: number;
    screenY: number;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerDimensions({ width: Math.round(width), height: Math.round(height) });
        }
      }
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const { revealedRippleIndex } = useRippleAnimation(disruptedBookingId, ripplePath);

  const impactMap = useMemo(() => {
    const map = new Map<string, NodeImpact>();
    perNodeImpact.forEach((i) => map.set(i.booking_id, i));
    return map;
  }, [perNodeImpact]);

  const effectiveEdges = useMemo(() => {
    if (!showAtRiskOnly) return edges;
    return edges.filter((e) => e.status === "tight" || e.status === "violated" || e.slack_minutes <= 30);
  }, [edges, showAtRiskOnly]);

  const atRiskTargetNodeIds = useMemo(() => {
    const ids = new Set<string>();
    edges.forEach((e) => {
      if ((e.status === "tight" || e.status === "violated" || e.slack_minutes <= 30) && !disruptedBookingId) {
        ids.add(e.to);
      }
    });
    return ids;
  }, [edges, disruptedBookingId]);

  const dayBuckets = useMemo(() => {
    if (nodes.length === 0) return [];
    const sorted = [...nodes].sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());
    const dayMap = new Map<string, { label: string; dateStr: string; startTimestamp: number; fullDate: string }>();

    sorted.forEach((n) => {
      const d = new Date(n.start_time);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!dayMap.has(key)) {
        const midnight = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0, 0);
        const label = d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        const fullDate = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        dayMap.set(key, { label, dateStr: key, startTimestamp: midnight.getTime(), fullDate });
      }
    });
    return Array.from(dayMap.values()).map((val, idx) => ({ ...val, dayNum: idx + 1 }));
  }, [nodes]);

  const suggestedNodeIds = useMemo(() => {
    const set = new Set<string>();
    suggestedDependencies.forEach((s) => {
      set.add(s.from);
      set.add(s.to);
    });
    return set;
  }, [suggestedDependencies]);

  const {
    fitToContent,
    handleZoomIn,
    handleZoomOut,
    handleJumpToDay,
    handleResetView
  } = useZoom(svgRef as any, zoomBehaviorRef, gRootRef, containerDimensions, nodes, nodePositionsRef, setActiveDayIndex);

  useEffect(() => {
    if (onFitToScreenRef) {
      onFitToScreenRef(fitToContent);
    }
  }, [onFitToScreenRef, fitToContent]);

  useD3Graph({
    svgRef, containerRef, zoomBehaviorRef, gRootRef, nodePositionsRef,
    containerDimensions, nodes, effectiveEdges, selectedNodeId, onSelectNode,
    suggestedDependencies, disruptedBookingId, ripplePath, revealedRippleIndex,
    impactMap, suggestedNodeIds, dayBuckets, fitToContent, pulsingNodeId,
    atRiskTargetNodeIds, isReverseRippling, reverseStepIndex, setHoveredNode
  });

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden touch-none select-none bg-[#FAF9F6]"
      style={{
        backgroundImage: "radial-gradient(#E5DFD7 1px, transparent 1px)",
        backgroundSize: "32px 32px",
      }}
    >
      {/* Top Controls Bar: Day Jumps & Camera Controls */}
      <div className="absolute top-3 left-5 right-5 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Day-Jump Navigation */}
        <div className="pointer-events-auto flex items-center gap-1.5 border border-[var(--border-strong)] bg-[var(--card)] px-2.5 py-1.5 text-xs">
          <span className="text-[11px] font-semibold text-[var(--muted-foreground)] mr-1">Timeline:</span>
          <button
            onClick={handleResetView}
            className={`px-2 py-0.5 text-[11px] font-medium transition-colors ${
              activeDayIndex === null
                ? "bg-[#2D3A31] text-white"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            All Days
          </button>
          {dayBuckets.map((d, idx) => (
            <button
              key={d.dateStr}
              onClick={() => handleJumpToDay(d.startTimestamp, idx)}
              className={`px-2 py-0.5 text-[11px] font-medium transition-colors ${
                activeDayIndex === idx
                  ? "bg-[#2D3A31] text-white"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              }`}
            >
              Day {d.dayNum} ({d.fullDate})
            </button>
          ))}
        </div>

        {/* Zoom & Fit Control Cluster */}
        <div className="pointer-events-auto flex items-center gap-1 border border-[var(--border-strong)] bg-[var(--card)] p-1 text-xs">
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            title="Zoom in (+)"
            aria-label="Zoom in"
          >
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            title="Zoom out (-)"
            aria-label="Zoom out"
          >
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <div className="h-4 w-px bg-[var(--border)] mx-0.5" />
          <button
            onClick={fitToContent}
            className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            title="Fit whole graph to screen"
          >
            <Maximize2 className="h-3 w-3" />
            <span>Fit</span>
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
            title="Reset view"
            aria-label="Reset view"
          >
            <RotateCcw className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Responsive SVG Canvas */}
      <svg
        ref={svgRef}
        className="h-full w-full select-none cursor-grab active:cursor-grabbing"
        style={{ minHeight: "560px" }}
      />

      {/* Interactive Instant Hover Tooltip for untruncated label affordance (Requirement 7) */}
      {hoveredNode && (
        <div
          className="pointer-events-none absolute z-30 border border-[var(--foreground)] bg-[var(--card)] p-3 text-xs shadow-none max-w-xs"
          style={{
            left: `${Math.min(containerDimensions.width - 240, hoveredNode.screenX + 16)}px`,
            top: `${Math.max(20, hoveredNode.screenY - 70)}px`,
          }}
        >
          <div className="flex items-center gap-2 mb-1.5">
            <span
              className="inline-block border px-1.5 py-0.2 text-[10px] font-bold uppercase tracking-wider"
              style={{
                backgroundColor: TYPE_COLORS[hoveredNode.node.type]?.fill,
                borderColor: TYPE_COLORS[hoveredNode.node.type]?.stroke,
                color: TYPE_COLORS[hoveredNode.node.type]?.text,
              }}
            >
              {TYPE_COLORS[hoveredNode.node.type]?.label}
            </span>
            {hoveredNode.node.vendor && (
              <span className="text-[11px] text-[var(--muted-foreground)]">by {hoveredNode.node.vendor}</span>
            )}
          </div>
          <div className="font-serif-heading text-sm font-bold text-[var(--foreground)]">
            {hoveredNode.node.title}
          </div>
          <div className="mt-1.5 space-y-1 text-[var(--muted-foreground)] text-[11px]">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-[var(--muted-foreground)]" />
              <span>
                {hoveredNode.node.start_time.split("T")[1]?.substring(0, 5)} -{" "}
                {hoveredNode.node.end_time.split("T")[1]?.substring(0, 5)}
              </span>
            </div>
            {hoveredNode.node.location && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3 text-[var(--muted-foreground)]" />
                <span className="truncate">{hoveredNode.node.location}</span>
              </div>
            )}
            {hoveredNode.node.cost != null && (
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-[var(--muted-foreground)]" />
                <span>${hoveredNode.node.cost.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unclipped, Collapsible Legend Panel in Bottom-Left (Requirement 5) */}
      <div className="absolute bottom-4 left-5 z-20 border border-[var(--border-strong)] bg-[var(--card)] text-xs max-w-sm">
        <div
          onClick={() => setIsLegendCollapsed(!isLegendCollapsed)}
          className="flex items-center justify-between gap-3 px-3 py-2 cursor-pointer select-none hover:bg-[var(--background)] transition-colors"
        >
          <div className="font-serif-heading font-semibold text-[var(--foreground)]">
            Itinerary Graph Legend
          </div>
          <button className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]" aria-label="Toggle legend">
            {isLegendCollapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>

        {!isLegendCollapsed && (
          <div className="p-3 pt-1 border-t border-[var(--border)] flex flex-col gap-2 text-[var(--muted-foreground)]">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center bg-[#2D3A31]">
                  <Plane className="h-2.5 w-2.5 text-white" />
                </span>
                <span>Flight</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center bg-[#C2A878]">
                  <Bed className="h-2.5 w-2.5 text-[#1A1A1A]" />
                </span>
                <span>Hotel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center bg-[#E8F0E9] border border-[#A8C0A9]">
                  <Car className="h-2.5 w-2.5 text-[#2D3A31]" />
                </span>
                <span>Transfer</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center bg-[#F5F2ED] border border-[#B8B2A8]">
                  <MapPin className="h-2.5 w-2.5 text-[var(--muted-foreground)]" />
                </span>
                <span>Activity</span>
              </div>
            </div>
            <div className="border-t border-[var(--border)] pt-2 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block h-1 w-5 bg-[var(--border-strong)]" />
                <span className="text-[var(--foreground)] font-medium">Safe (&gt;30m slack)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-1.5 w-5 bg-[#C05621]" />
                <span className="text-[#C05621] font-medium">Tight (0-30m buffer)</span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="inline-block h-1.5 w-5 border-b-2 border-dashed border-[var(--foreground)]"
                  style={{ height: "0px" }}
                />
                <span className="text-[var(--foreground)] font-bold">Violated (&lt;0m, missed)</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

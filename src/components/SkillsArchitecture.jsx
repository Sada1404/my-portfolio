// src/components/SkillsArchitecture.jsx – Interactive tree-graph topology (metoro.io style)
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";

/* ── Icon lookup from resume.json flat skill list ─────────────────── */
function buildIconMap(skills) {
  const map = {};
  Object.values(skills || {}).forEach((arr) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((item) => {
      if (item && typeof item === "object" && item.name) {
        map[item.name] = item.icon || null;
      }
    });
  });
  return map;
}

/* ── Node definitions ─────────────────────────────────────────────── */
const NODE_DEFS = [
  {
    id: "fe-tech", label: "Frontend Technologies", type: "tech-group",
    items: ["React.js", "React Native", "Bootstrap", "Tailwind CSS", "HTML5", "CSS3", "Vite"],
  },
  {
    id: "be-tech", label: "Backend Technologies", type: "tech-group",
    items: ["Node.js", "NestJS", "Express.js", "Microservices"],
  },
  {
    id: "state", label: "State Management", type: "tech-group",
    items: ["React Context API", "Redux"],
  },
  {
    id: "frontend", label: "Frontend", type: "layer",
    desc: "Client-side applications, SPAs, and mobile interfaces built with React ecosystem.",
  },
  {
    id: "apis", label: "REST APIs", type: "connector",
    desc: "HTTP endpoints connecting client and server layers.",
    items: ["REST APIs", "Google APIs"],
  },
  {
    id: "backend", label: "Backend", type: "layer",
    desc: "Server-side logic, API handlers, microservices, and business rules.",
  },
  {
    id: "database", label: "Database", type: "layer",
    desc: "Persistent storage and data management.",
    items: ["MySQL", "PostgreSQL", "Firebase"],
  },
  {
    id: "git", label: "Git & GitHub", type: "infra",
    desc: "Version control, code review, and CI triggers.",
    items: ["Git", "GitHub"],
  },
  {
    id: "devtools", label: "Dev Tools", type: "tech-group",
    desc: "CI/CD, testing, and design tooling.",
    items: ["Jenkins", "Jest", "Figma"],
  },
  {
    id: "server", label: "Server / AWS", type: "infra",
    desc: "Cloud hosting, EC2 instances, S3, and deployment targets.",
    items: ["AWS"],
  },
  {
    id: "docker", label: "Docker", type: "infra",
    desc: "Containerized deployments, orchestration, and reproducible environments.",
    items: ["Docker"],
  },
];

/* ── Connections with explicit port sides ─────────────────────────── */
const CONNECTIONS = [
  { from: "fe-tech",  fromSide: "bottom", to: "frontend", toSide: "top",    color: "#38bdf8", label: null },
  { from: "be-tech",  fromSide: "bottom", to: "backend",  toSide: "top",    color: "#fb923c", label: null },
  { from: "state",    fromSide: "right",  to: "frontend", toSide: "left",   color: "#a855f7", label: null },
  { from: "frontend", fromSide: "right",  to: "apis",     toSide: "left",   color: "#2dd4bf", label: "HTTP requests" },
  { from: "apis",     fromSide: "right",  to: "backend",  toSide: "left",   color: "#2dd4bf", label: "JSON responses" },
  { from: "backend",  fromSide: "bottom", to: "database", toSide: "top",    color: "#4ade80", label: "Queries" },
  { from: "frontend", fromSide: "bottom", to: "git",      toSide: "top",    color: "#60a5fa", label: "Push code" },
  { from: "backend",  fromSide: "left",   to: "git",      toSide: "right",  color: "#60a5fa", label: "Push code" },
  { from: "devtools", fromSide: "right",  to: "git",      toSide: "left",   color: "#818cf8", label: "CI/CD" },
  { from: "git",      fromSide: "bottom", to: "server",   toSide: "top",    color: "#f59e0b", label: "Deploys" },
  { from: "server",   fromSide: "bottom", to: "docker",   toSide: "top",    color: "#f59e0b", label: "Containers" },
  { from: "database", fromSide: "bottom", to: "docker",   toSide: "right",  color: "#4ade80", label: "Containerized" },
];

/* ── Node type styles ─────────────────────────────────────────────── */
const TYPE_STYLES = {
  "tech-group": { border: "#2dd4bf", glow: "rgba(45,212,191,0.15)" },
  "layer":      { border: "#38bdf8", glow: "rgba(56,189,248,0.15)" },
  "connector":  { border: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
  "infra":      { border: "#4ade80", glow: "rgba(74,222,128,0.15)" },
};

/* ── Initial positions (tree-graph layout) ────────────────────────── */
function computeInitialPositions(w) {
  const cx = w / 2;
  return {
    "fe-tech":  { x: cx - 700, y: 20 },
    "be-tech":  { x: cx + 380, y: 220 },
    "state":    { x: cx - 820, y: 310 },
    "frontend": { x: cx - 460, y: 310 },
    "apis":     { x: cx - 120,  y: 120 },
    "backend":  { x: cx + 280, y: 410 },
    "devtools": { x: cx - 740, y: 490 },
    "git":      { x: cx - 180,  y: 500 },
    "database": { x: cx + 380, y: 730 },
    "server":   { x: cx - 480,  y: 700 },
    "docker":   { x: cx - 80,  y: 850 },
  };
}

/* ── Port distribution: build a map of how many connections per (node, side) ── */
function buildPortMap(connections) {
  const map = {};
  connections.forEach((conn, idx) => {
    const fk = `${conn.from}:${conn.fromSide}`;
    const tk = `${conn.to}:${conn.toSide}`;
    if (!map[fk]) map[fk] = [];
    map[fk].push(idx);
    if (!map[tk]) map[tk] = [];
    map[tk].push(idx);
  });
  return map;
}

const PORT_MAP = buildPortMap(CONNECTIONS);

/* ── Get anchor point on a node edge, distributed when sharing a side ── */
function getPortAnchor(nodeId, side, connIdx, positions, sizes) {
  const pos = positions[nodeId];
  if (!pos) return { x: 0, y: 0 };
  const size = sizes[nodeId] || { w: 180, h: 80 };

  const key = `${nodeId}:${side}`;
  const siblings = PORT_MAP[key] || [connIdx];
  const total = siblings.length;
  const rank = siblings.indexOf(connIdx);
  const t = total === 1 ? 0.5 : 0.2 + (rank / (total - 1)) * 0.6;

  switch (side) {
    case "top":    return { x: pos.x + size.w * t, y: pos.y };
    case "bottom": return { x: pos.x + size.w * t, y: pos.y + size.h };
    case "left":   return { x: pos.x,              y: pos.y + size.h * t };
    case "right":  return { x: pos.x + size.w,     y: pos.y + size.h * t };
    default:       return { x: pos.x + size.w / 2, y: pos.y + size.h / 2 };
  }
}

/* ── Stem: extend anchor outward before any bend ─────────────────── */
const STEM = 40;

function stemPointDynamic(anchor, side, len) {
  switch (side) {
    case "top":    return { x: anchor.x, y: anchor.y - len };
    case "bottom": return { x: anchor.x, y: anchor.y + len };
    case "left":   return { x: anchor.x - len, y: anchor.y };
    case "right":  return { x: anchor.x + len, y: anchor.y };
    default:       return anchor;
  }
}

/* ── Build orthogonal SVG path with rounded bends ────────────────── */
const BEND_R = 8; // radius for rounded corners

function buildOrthogonalPath(a1, s1, a2, s2) {
  const isVExit = (s1 === "top" || s1 === "bottom");
  const isVEntry = (s2 === "top" || s2 === "bottom");

  // Check if stems face each other (could cross if nodes are close)
  const facing =
    (s1 === "bottom" && s2 === "top") ||
    (s1 === "top" && s2 === "bottom") ||
    (s1 === "right" && s2 === "left") ||
    (s1 === "left" && s2 === "right");

  // Adaptive stem: when facing nodes are close, shrink stems so they don't cross
  let stemLen = STEM;
  if (facing) {
    const dist = isVExit
      ? Math.abs(a2.y - a1.y)
      : Math.abs(a2.x - a1.x);
    if (dist < STEM * 2.5) {
      stemLen = Math.max(8, dist / 3);
    }
  }

  const st1 = stemPointDynamic(a1, s1, stemLen);
  const st2 = stemPointDynamic(a2, s2, stemLen);

  const points = [a1, st1];

  if (isVExit && isVEntry) {
    // Both vertical exits
    if (Math.abs(st1.x - st2.x) < 2) {
      // Vertically aligned — straight line, no intermediate points
    } else {
      const midY = (st1.y + st2.y) / 2;
      points.push({ x: st1.x, y: midY });
      points.push({ x: st2.x, y: midY });
    }
  } else if (!isVExit && !isVEntry) {
    // Both horizontal exits
    if (Math.abs(st1.y - st2.y) < 2) {
      // Horizontally aligned — straight line
    } else {
      const midX = (st1.x + st2.x) / 2;
      points.push({ x: midX, y: st1.y });
      points.push({ x: midX, y: st2.y });
    }
  } else if (isVExit && !isVEntry) {
    // V exit → H entry: L-bend
    points.push({ x: st1.x, y: st2.y });
  } else {
    // H exit → V entry: L-bend
    points.push({ x: st2.x, y: st1.y });
  }

  points.push(st2);
  points.push(a2);

  return buildPathWithRoundedCorners(points);
}

function buildPathWithRoundedCorners(pts) {
  if (pts.length < 2) return "";
  let d = `M ${pts[0].x},${pts[0].y}`;

  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1];
    const curr = pts[i];
    const next = pts[i + 1];

    if (!next) {
      // Last point — just line to it
      d += ` L ${curr.x},${curr.y}`;
      break;
    }

    // Check if there's a bend at curr (direction changes)
    const dx1 = curr.x - prev.x;
    const dy1 = curr.y - prev.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;

    const isHorizontal1 = Math.abs(dx1) > Math.abs(dy1);
    const isHorizontal2 = Math.abs(dx2) > Math.abs(dy2);

    // If both segments go same direction, or segment is zero-length, skip rounding
    if (isHorizontal1 === isHorizontal2 || (dx1 === 0 && dy1 === 0) || (dx2 === 0 && dy2 === 0)) {
      d += ` L ${curr.x},${curr.y}`;
      continue;
    }

    // There's a 90° bend at curr — apply rounded corner
    const len1 = Math.sqrt(dx1 * dx1 + dy1 * dy1);
    const len2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
    const r = Math.min(BEND_R, len1 / 2, len2 / 2);

    if (r < 1) {
      d += ` L ${curr.x},${curr.y}`;
      continue;
    }

    // Point just before the bend (along incoming segment)
    const beforeX = curr.x - (dx1 / len1) * r;
    const beforeY = curr.y - (dy1 / len1) * r;
    // Point just after the bend (along outgoing segment)
    const afterX = curr.x + (dx2 / len2) * r;
    const afterY = curr.y + (dy2 / len2) * r;

    // Determine sweep direction
    const cross = dx1 * dy2 - dy1 * dx2;
    const sweep = cross > 0 ? 1 : 0;

    d += ` L ${beforeX},${beforeY}`;
    d += ` A ${r} ${r} 0 0 ${sweep} ${afterX},${afterY}`;
  }

  return d;
}

/* ── Connection line (SVG) ────────────────────────────────────────── */
function ConnectionLine({ pathD, color, label, labelX, labelY }) {
  return (
    <g>
      {/* Glow */}
      <path d={pathD} fill="none" stroke={color} strokeWidth={3} strokeOpacity={0.1} />
      {/* Main dashed line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray="8 5"
        strokeOpacity={0.65}
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-26"
          dur="2s"
          repeatCount="indefinite"
        />
      </path>
      {/* Label */}
      {label && (
        <g>
          <rect
            x={labelX - label.length * 3.2 - 8}
            y={labelY - 10}
            width={label.length * 6.4 + 16}
            height={18}
            rx={9}
            fill="rgba(10,14,26,0.92)"
            stroke={color}
            strokeWidth={1}
            strokeDasharray="4 3"
            strokeOpacity={0.6}
          />
          <text
            x={labelX}
            y={labelY + 3}
            fill={color}
            fontSize="10"
            fontFamily="'JetBrains Mono', monospace"
            textAnchor="middle"
            opacity={0.85}
          >
            {label}
          </text>
        </g>
      )}
    </g>
  );
}

/* ── Pill with colored dot (metoro style) ─────────────────────────── */
function SkillPill({ name, icon, dotColor }) {
  return (
    <li className="skills-arch__pill">
      <span className="skills-arch__pill-dot" style={{ background: dotColor }} />
      {icon && <img src={icon} alt="" className="skills-arch__pill-icon" />}
      <span>{name}</span>
    </li>
  );
}

/* ── Controls hint ────────────────────────────────────────────────── */
function ControlsHint({ onReset }) {
  return (
    <div className="skills-arch__controls-hint">
      <div className="skills-arch__control-row">
        <kbd>Ctrl</kbd> + <kbd>Scroll</kbd>
        <span>Zoom</span>
      </div>
      <div className="skills-arch__control-row">
        <kbd>Click</kbd> + <kbd>Drag</kbd>
        <span>Move nodes</span>
      </div>
      <div className="skills-arch__control-row">
        <kbd>Ctrl</kbd> + <kbd>Z</kbd>
        <span>Reset view</span>
      </div>
      <button className="skills-arch__reset-btn" onClick={onReset}>
        Reset
      </button>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────── */
export default function SkillsArchitecture({ skills = {} }) {
  const canvasRef = useRef(null);
  const nodeRefsMap = useRef({});
  const nodeSizesRef = useRef({});
  const initialPositionsRef = useRef(null);
  const dragRef = useRef({ active: false, nodeId: null, offsetX: 0, offsetY: 0 });
  const panRef = useRef({ active: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });

  const [nodePositions, setNodePositions] = useState({});
  const [viewTransform, setViewTransform] = useState({ panX: 0, panY: 0, zoom: 1 });
  const [isMobile, setIsMobile] = useState(false);
  const [ready, setReady] = useState(false);

  const iconMap = useMemo(() => buildIconMap(skills), [skills]);

  // Detect mobile
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    setIsMobile(mq.matches);
    const handler = (e) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Initialize positions
  useEffect(() => {
    if (isMobile || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const positions = computeInitialPositions(rect.width);
    initialPositionsRef.current = JSON.parse(JSON.stringify(positions));
    setNodePositions(positions);
    setReady(true);
  }, [isMobile]);

  // Measure node sizes
  useEffect(() => {
    if (!ready) return;
    const timer = requestAnimationFrame(() => {
      const sizes = {};
      for (const def of NODE_DEFS) {
        const el = nodeRefsMap.current[def.id];
        if (el) {
          sizes[def.id] = { w: el.offsetWidth, h: el.offsetHeight };
        }
      }
      nodeSizesRef.current = sizes;
      setNodePositions((p) => ({ ...p }));
    });
    return () => cancelAnimationFrame(timer);
  }, [ready]);

  const handleReset = useCallback(() => {
    if (initialPositionsRef.current) {
      setNodePositions(JSON.parse(JSON.stringify(initialPositionsRef.current)));
    }
    setViewTransform({ panX: 0, panY: 0, zoom: 1 });
  }, []);

  // Ctrl+Z
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        const canvas = canvasRef.current;
        if (canvas && canvas.matches(":hover")) {
          e.preventDefault();
          handleReset();
        }
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [handleReset]);

  // Node drag
  const handleNodePointerDown = useCallback((e, nodeId) => {
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    const { zoom, panX, panY } = viewTransform;
    const pos = nodePositions[nodeId];
    dragRef.current = {
      active: true,
      nodeId,
      offsetX: e.clientX - (pos.x * zoom + panX),
      offsetY: e.clientY - (pos.y * zoom + panY),
    };
  }, [nodePositions, viewTransform]);

  const handlePointerMove = useCallback((e) => {
    if (dragRef.current.active) {
      const { nodeId, offsetX, offsetY } = dragRef.current;
      const { zoom, panX, panY } = viewTransform;
      setNodePositions((prev) => ({
        ...prev,
        [nodeId]: {
          x: (e.clientX - offsetX - panX) / zoom,
          y: (e.clientY - offsetY - panY) / zoom,
        },
      }));
      return;
    }
    if (panRef.current.active) {
      const { startX, startY, startPanX, startPanY } = panRef.current;
      setViewTransform((prev) => ({
        ...prev,
        panX: startPanX + (e.clientX - startX),
        panY: startPanY + (e.clientY - startY),
      }));
    }
  }, [viewTransform]);

  const handlePointerUp = useCallback(() => {
    dragRef.current.active = false;
    panRef.current.active = false;
  }, []);

  const handleCanvasPointerDown = useCallback((e) => {
    const t = e.target;
    if (t !== canvasRef.current &&
        !t.classList.contains("skills-arch__nodes-layer") &&
        !t.classList.contains("skills-arch__connections")) return;
    panRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      startPanX: viewTransform.panX,
      startPanY: viewTransform.panY,
    };
  }, [viewTransform]);

  const handleWheel = useCallback((e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    setViewTransform((prev) => {
      const oldZ = prev.zoom;
      const newZ = Math.min(2.5, Math.max(0.3, oldZ - e.deltaY * 0.003));
      const s = newZ / oldZ;
      return { zoom: newZ, panX: px - (px - prev.panX) * s, panY: py - (py - prev.panY) * s };
    });
  }, []);

  useEffect(() => {
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [handlePointerMove, handlePointerUp]);

  // Compute all connection paths
  const connectionPaths = useMemo(() => {
    if (!ready || Object.keys(nodePositions).length === 0) return [];
    const sizes = nodeSizesRef.current;
    return CONNECTIONS.map((conn, idx) => {
      const a1 = getPortAnchor(conn.from, conn.fromSide, idx, nodePositions, sizes);
      const a2 = getPortAnchor(conn.to, conn.toSide, idx, nodePositions, sizes);
      const pathD = buildOrthogonalPath(a1, conn.fromSide, a2, conn.toSide);
      const labelX = (a1.x + a2.x) / 2;
      const labelY = (a1.y + a2.y) / 2;
      return { ...conn, pathD, labelX, labelY, key: `${conn.from}-${conn.to}` };
    });
  }, [nodePositions, ready]);

  /* ── Mobile: stacked layout ──────────────────────────────────── */
  if (isMobile) {
    return (
      <div className="skills-arch skills-arch--mobile">
        {NODE_DEFS.map((def) => {
          const style = TYPE_STYLES[def.type] || TYPE_STYLES["layer"];
          return (
            <div
              key={def.id}
              className="skills-arch__node"
              style={{ borderColor: style.border, boxShadow: `0 0 24px ${style.glow}` }}
            >
              <h3 className="skills-arch__title">{def.label}</h3>
              {def.desc && <p className="skills-arch__node-desc">{def.desc}</p>}
              {def.items && (
                <ul className="skills-arch__pill-list">
                  {def.items.map((name) => (
                    <SkillPill key={name} name={name} icon={iconMap[name]} dotColor={style.border} />
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  /* ── Desktop: interactive diagram ────────────────────────────── */
  const transformStyle = {
    transform: `translate(${viewTransform.panX}px, ${viewTransform.panY}px) scale(${viewTransform.zoom})`,
    transformOrigin: "0 0",
  };

  return (
    <div className="skills-arch">
      <div
        className="skills-arch__canvas-wrap"
        ref={canvasRef}
        onPointerDown={handleCanvasPointerDown}
        onWheel={handleWheel}
      >
        {/* SVG connections */}
        {ready && (
          <svg className="skills-arch__connections" style={transformStyle}>
            {connectionPaths.map((cp) => (
              <ConnectionLine
                key={cp.key}
                pathD={cp.pathD}
                color={cp.color}
                label={cp.label}
                labelX={cp.labelX}
                labelY={cp.labelY}
              />
            ))}
          </svg>
        )}

        {/* Nodes */}
        <div className="skills-arch__nodes-layer" style={transformStyle}>
          {NODE_DEFS.map((def) => {
            const pos = nodePositions[def.id];
            if (!pos) return null;
            const style = TYPE_STYLES[def.type] || TYPE_STYLES["layer"];
            return (
              <div
                key={def.id}
                ref={(el) => { nodeRefsMap.current[def.id] = el; }}
                className="skills-arch__node"
                style={{
                  transform: `translate(${pos.x}px, ${pos.y}px)`,
                  borderColor: style.border,
                  boxShadow: `0 0 24px ${style.glow}`,
                }}
                onPointerDown={(e) => handleNodePointerDown(e, def.id)}
              >
                <h3 className="skills-arch__title">
                  <span className="skills-arch__title-dot" style={{ background: style.border }} />
                  {def.label}
                </h3>
                {def.desc && <p className="skills-arch__node-desc">{def.desc}</p>}
                {def.items && (
                  <ul className="skills-arch__pill-list">
                    {def.items.map((name) => (
                      <SkillPill key={name} name={name} icon={iconMap[name]} dotColor={style.border} />
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>

        <ControlsHint onReset={handleReset} />
      </div>

      <p className="skills-arch__legend">
        Drag nodes to explore. Lines show how requests flow from the UI through APIs,
        services, and databases into containerized deployments.
      </p>
    </div>
  );
}

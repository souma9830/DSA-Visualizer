import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  Activity,
  Binary,
  CheckCheck,
  Clock3,
  Code2,
  Copy,
  Download,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
} from "lucide-react";
import {
  middleNodeCPP,
  reverseLinkedListCPP,
  middleNodePython,
  reverseLinkedListPython,
} from "../algorithms/linkedList";
import { renderHighlightedCode } from "../utils/codeHighlight";

const EMPTY_MARKERS = {
  head: null,
  current: null,
  prev: null,
  next: null,
  slow: null,
  fast: null,
  middle: null,
};

const runStatusStyleMap = {
  Idle: "border-white/15 bg-white/5 text-slate-200",
  Running: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
  Paused: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  Completed: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
};

const markerLabels = {
  head: "head",
  current: "curr",
  prev: "prev",
  next: "next",
  slow: "slow",
  fast: "fast",
  middle: "mid",
};

const linkedListAlgorithms = {
  reverse: {
    title: "Reverse Linked List",
    description:
      "Iteratively reverse each next pointer using prev, current, and next pointers.",
    complexity: "O(n)",
    space: "O(1)",
    cppSnippet: reverseLinkedListCPP,
    pythonSnippet: reverseLinkedListPython,
  },
  middle: {
    title: "Middle Node (Slow/Fast)",
    description:
      "Move slow by one step and fast by two steps until fast reaches the tail.",
    complexity: "O(n)",
    space: "O(1)",
    cppSnippet: middleNodeCPP,
    pythonSnippet: middleNodePython,
  },
};

const nodeStatusClassMap = {
  default: "border-blue-400/30 bg-blue-500/10 text-blue-100",
  current: "border-amber-400/45 bg-amber-500/20 text-amber-100",
  reversed: "border-emerald-400/45 bg-emerald-500/20 text-emerald-100",
  slow: "border-cyan-400/45 bg-cyan-500/20 text-cyan-100",
  fast: "border-fuchsia-400/45 bg-fuchsia-500/20 text-fuchsia-100",
  middle: "border-violet-400/45 bg-violet-500/20 text-violet-100",
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getRandomValue() {
  return Math.floor(Math.random() * 90) + 10;
}

function getNodeStatusClass(status) {
  return nodeStatusClassMap[status] ?? nodeStatusClassMap.default;
}

function createLinkedListState(size) {
  const stamp = Date.now();
  const nodes = Array.from({ length: size }, (_, index) => ({
    id: `${stamp}-${index}-${Math.floor(Math.random() * 1000000)}`,
    value: getRandomValue(),
    status: "default",
  }));
  const nextLinks = Array.from({ length: size }, (_, index) =>
    index + 1 < size ? index + 1 : null,
  );

  return {
    nodes,
    nextLinks,
    headIndex: size > 0 ? 0 : null,
  };
}

function getFocusPointer(markers, nodes) {
  const priority = [
    "current",
    "head",
    "slow",
    "fast",
    "middle",
    "prev",
    "next",
  ];
  for (const key of priority) {
    const pointerIndex = markers[key];
    if (
      pointerIndex !== null &&
      pointerIndex !== undefined &&
      nodes[pointerIndex]
    ) {
      return {
        key,
        label: markerLabels[key],
        index: pointerIndex,
        value: nodes[pointerIndex].value,
      };
    }
  }
  return null;
}

export default function LinkedListVisualizerPage() {
  const initialGraph = useMemo(() => createLinkedListState(7), []);
  const [nodes, setNodes] = useState(initialGraph.nodes);
  const [nextLinks, setNextLinks] = useState(initialGraph.nextLinks);
  const [headIndex, setHeadIndex] = useState(initialGraph.headIndex);
  const [markers, setMarkers] = useState({
    ...EMPTY_MARKERS,
    head: initialGraph.headIndex,
  });
  const [listSize, setListSize] = useState(7);
  const [speed, setSpeed] = useState(280);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState("reverse");
  const [runStatus, setRunStatus] = useState("Idle");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [statusMessage, setStatusMessage] = useState(
    "Generate data and start an algorithm run.",
  );
  const [copyState, setCopyState] = useState("idle");
  const [selectedLanguage, setSelectedLanguage] = useState("C++");

  const stopSignal = useRef(false);
  const pauseSignal = useRef(false);
  const nodeViewportRef = useRef(null);
  const nodeItemRefs = useRef({});

  const MotionSection = motion.section;
  const MotionButton = motion.button;
  const MotionDiv = motion.div;

  const activeAlgorithm = linkedListAlgorithms[selectedAlgorithm];
  const activeCodeSnippet =
    selectedLanguage === "C++"
      ? activeAlgorithm.cppSnippet
      : activeAlgorithm.pythonSnippet;

  const waitWithControl = useCallback(async (durationMs) => {
    let elapsed = 0;
    while (elapsed < durationMs) {
      if (stopSignal.current) return false;

      while (pauseSignal.current) {
        if (stopSignal.current) return false;
        await sleep(80);
      }

      const chunk = Math.min(40, durationMs - elapsed);
      await sleep(chunk);
      elapsed += chunk;
    }

    return !stopSignal.current;
  }, []);

  const hardStopRun = useCallback(() => {
    stopSignal.current = true;
    pauseSignal.current = false;
    setIsRunning(false);
    setIsPaused(false);
  }, []);

  const resetNodeHighlights = useCallback(() => {
    setNodes((currentNodes) =>
      currentNodes.map((node) => ({
        ...node,
        status: "default",
      })),
    );
  }, []);

  const generateNewList = useCallback(
    (size) => {
      hardStopRun();
      const nextGraph = createLinkedListState(size);

      setNodes(nextGraph.nodes);
      setNextLinks(nextGraph.nextLinks);
      setHeadIndex(nextGraph.headIndex);
      setMarkers({ ...EMPTY_MARKERS, head: nextGraph.headIndex });
      setRunStatus("Idle");
      setStepCount(0);
      setStatusMessage("New linked list generated.");
    },
    [hardStopRun],
  );

  const handleReset = useCallback(() => {
    hardStopRun();
    resetNodeHighlights();
    setMarkers({ ...EMPTY_MARKERS, head: headIndex });
    setRunStatus("Idle");
    setStepCount(0);
    setStatusMessage("Pointers and highlights reset.");
  }, [hardStopRun, headIndex, resetNodeHighlights]);

  const runReverseLinkedList = useCallback(async () => {
    let workingNodes = nodes.map((node) => ({ ...node, status: "default" }));
    let workingLinks = [...nextLinks];
    let prev = null;
    let current = headIndex;
    let localStep = 0;

    while (current !== null) {
      const nextNode = workingLinks[current];
      localStep += 1;
      setStepCount(localStep);

      workingNodes = workingNodes.map((node, index) => {
        if (index === current) return { ...node, status: "current" };
        if (index === prev) return { ...node, status: "reversed" };
        return node.status === "reversed"
          ? node
          : { ...node, status: "default" };
      });

      setNodes([...workingNodes]);
      setMarkers({
        head: headIndex,
        current,
        prev,
        next: nextNode,
        slow: null,
        fast: null,
        middle: null,
      });
      setStatusMessage(
        `Step ${localStep}: save next of ${workingNodes[current].value}, then reverse current pointer.`,
      );

      const canContinue = await waitWithControl(speed);
      if (!canContinue) return false;

      workingLinks[current] = prev;
      workingNodes = workingNodes.map((node, index) => {
        if (index === current) return { ...node, status: "reversed" };
        return node;
      });

      setNodes([...workingNodes]);
      setNextLinks([...workingLinks]);

      const canContinueAfterRelink = await waitWithControl(
        Math.max(120, Math.floor(speed * 0.65)),
      );
      if (!canContinueAfterRelink) return false;

      prev = current;
      current = nextNode;
    }

    const completedNodes = workingNodes.map((node) => ({
      ...node,
      status: "reversed",
    }));

    setNodes(completedNodes);
    setHeadIndex(prev);
    setMarkers({
      ...EMPTY_MARKERS,
      head: prev,
    });
    setStatusMessage("Reversal complete. Head now points to the old tail.");

    return true;
  }, [headIndex, nextLinks, nodes, speed, waitWithControl]);

  const runMiddleNode = useCallback(async () => {
    if (headIndex === null) return true;

    const workingLinks = [...nextLinks];
    const workingNodes = nodes.map((node) => ({ ...node, status: "default" }));
    let slow = headIndex;
    let fast = headIndex;
    let localStep = 0;

    while (fast !== null && workingLinks[fast] !== null) {
      localStep += 1;
      setStepCount(localStep);

      const currentFast = fast;
      workingNodes.forEach((node, index) => {
        if (index === slow) node.status = "slow";
        else if (index === currentFast) node.status = "fast";
        else node.status = "default";
      });

      setNodes([...workingNodes]);
      setMarkers({
        ...EMPTY_MARKERS,
        head: headIndex,
        slow,
        fast: currentFast,
      });
      setStatusMessage(
        `Step ${localStep}: move slow by 1 and fast by 2 until fast reaches the tail.`,
      );

      const canContinue = await waitWithControl(speed);
      if (!canContinue) return false;

      slow = workingLinks[slow];
      const fastNext = workingLinks[currentFast];
      fast = fastNext !== null ? workingLinks[fastNext] : null;
    }

    workingNodes.forEach((node, index) => {
      node.status = index === slow ? "middle" : "default";
    });

    setNodes([...workingNodes]);
    setMarkers({
      ...EMPTY_MARKERS,
      head: headIndex,
      middle: slow,
    });
    setStatusMessage(`Middle node found: ${workingNodes[slow].value}.`);

    return waitWithControl(Math.max(120, Math.floor(speed * 0.6)));
  }, [headIndex, nextLinks, nodes, speed, waitWithControl]);

  const handleStart = useCallback(async () => {
    if (nodes.length === 0 || isRunning) return;

    stopSignal.current = false;
    pauseSignal.current = false;
    setIsRunning(true);
    setIsPaused(false);
    setRunStatus("Running");
    setStepCount(0);

    const completed =
      selectedAlgorithm === "reverse"
        ? await runReverseLinkedList()
        : await runMiddleNode();

    if (stopSignal.current) return;

    setIsRunning(false);
    setIsPaused(false);
    setRunStatus(completed ? "Completed" : "Idle");
  }, [
    isRunning,
    nodes.length,
    runMiddleNode,
    runReverseLinkedList,
    selectedAlgorithm,
  ]);

  const handlePause = useCallback(() => {
    if (!isRunning || isPaused) return;
    pauseSignal.current = true;
    setIsPaused(true);
    setRunStatus("Paused");
  }, [isPaused, isRunning]);

  const handleResume = useCallback(() => {
    if (!isRunning || !isPaused) return;
    pauseSignal.current = false;
    setIsPaused(false);
    setRunStatus("Running");
  }, [isPaused, isRunning]);

  const handleCopyCode = useCallback(async () => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(activeCodeSnippet);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1400);
    } catch {
      setCopyState("idle");
    }
  }, [activeCodeSnippet]);

  const handleDownloadCode = useCallback(() => {
    const extension = selectedLanguage === "C++" ? ".cpp" : ".py";
    const blob = new Blob([activeCodeSnippet], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeAlgorithm.title.replace(/\s+/g, "")}${extension}`;
    link.click();
    URL.revokeObjectURL(url);
  }, [activeCodeSnippet, activeAlgorithm.title, selectedLanguage]);

  const listTraversal = useMemo(() => {
    if (headIndex === null) return { order: [], hasCycle: false };

    const visited = new Set();
    const order = [];
    let cursor = headIndex;

    while (cursor !== null && !visited.has(cursor)) {
      order.push(cursor);
      visited.add(cursor);
      cursor = nextLinks[cursor];
    }

    return {
      order,
      hasCycle: cursor !== null,
    };
  }, [headIndex, nextLinks]);

  const nodeRenderOrder = useMemo(() => {
    if (nodes.length === 0) return [];
    if (headIndex === null) return nodes.map((_, index) => index);
    if (listTraversal.order.length === nodes.length) return listTraversal.order;
    return nodes.map((_, index) => index);
  }, [headIndex, listTraversal.order, nodes]);

  const pointerSummary = useMemo(() => {
    return Object.entries(markerLabels)
      .filter(([key]) => markers[key] !== null)
      .map(([key, label]) => ({
        key,
        label,
        value: nodes[markers[key]]?.value,
      }))
      .filter((item) => item.value !== undefined);
  }, [markers, nodes]);

  const focusPointer = getFocusPointer(markers, nodes);
  const focusIndex = focusPointer?.index ?? null;

  useEffect(() => {
    if (focusIndex === null) return;

    const viewport = nodeViewportRef.current;
    const focusedNode = nodeItemRefs.current[focusIndex];
    if (!viewport || !focusedNode) return;

    const targetLeft =
      focusedNode.offsetLeft -
      viewport.clientWidth / 2 +
      focusedNode.clientWidth / 2;
    const maxLeft = Math.max(0, viewport.scrollWidth - viewport.clientWidth);
    const clampedLeft = Math.min(maxLeft, Math.max(0, targetLeft));

    viewport.scrollTo({
      left: clampedLeft,
      behavior: isRunning ? "smooth" : "auto",
    });
  }, [focusIndex, isRunning]);

  return (
    <div className="font-body relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,0.16),transparent_34%),linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(15,23,42,0.6))]" />

      <MotionSection
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-3xl border border-white/10 bg-slate-800/40 p-5 shadow-2xl backdrop-blur sm:p-7"
      >
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
                Linked List
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${runStatusStyleMap[runStatus]}`}
              >
                {runStatus}
              </span>
            </div>

            <h1 className="font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl">
              {activeAlgorithm.title}
            </h1>
            <p className="mt-3 text-sm text-slate-300 sm:text-base">
              {activeAlgorithm.description}
            </p>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Nodes
                </p>
                <p className="mt-1 text-sm font-semibold text-white">
                  {nodes.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Time
                </p>
                <p className="mt-1 text-sm font-semibold text-cyan-200">
                  {activeAlgorithm.complexity}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Space
                </p>
                <p className="mt-1 text-sm font-semibold text-blue-100">
                  {activeAlgorithm.space}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 p-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Steps
                </p>
                <p className="mt-1 text-sm font-semibold text-emerald-200">
                  {stepCount}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
              <Activity size={14} className="text-cyan-300" /> Runtime Snapshot
            </p>
            <div className="mt-4 space-y-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Current Step</p>
                <p className="text-sm font-semibold text-white">
                  {statusMessage}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Head Value</p>
                <p className="text-lg font-bold text-cyan-100">
                  {headIndex === null ? "null" : nodes[headIndex]?.value}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Delay</p>
                <p className="text-lg font-bold text-blue-100">{speed}ms</p>
              </div>
            </div>
          </div>
        </div>
      </MotionSection>

      <div className="mt-6 grid grid-cols-1 items-start gap-6 xl:grid-cols-[350px_minmax(0,1fr)] xl:items-stretch">
        <aside className="flex h-full flex-col rounded-3xl border border-white/10 bg-slate-800/35 p-5 backdrop-blur">
          <div className="mb-5 flex items-center gap-2">
            <Binary size={18} className="text-cyan-300" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Linked List Controls
            </h2>
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div className="rounded-2xl bg-white/5 p-3">
              <label className="mb-2 flex items-center justify-between text-xs uppercase text-slate-400">
                <span>Algorithm</span>
              </label>
              <select
                value={selectedAlgorithm}
                disabled={isRunning}
                onChange={(event) => {
                  setSelectedAlgorithm(event.target.value);
                  handleReset();
                }}
                className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/70 px-3 text-sm text-slate-100 outline-none focus:border-cyan-400/45"
              >
                <option value="reverse">Reverse Linked List</option>
                <option value="middle">Middle Node (Slow/Fast)</option>
              </select>
            </div>

            <div className="rounded-2xl bg-white/5 p-3">
              <label className="mb-2 flex items-center justify-between text-xs uppercase text-slate-400">
                <span>
                  <Binary size={13} className="mr-1 inline" /> Size
                </span>
                <span>{listSize}</span>
              </label>
              <input
                type="range"
                min="4"
                max="12"
                value={listSize}
                disabled={isRunning}
                onChange={(event) => {
                  const size = Number(event.target.value);
                  setListSize(size);
                  generateNewList(size);
                }}
                className="w-full accent-cyan-400"
              />
            </div>

            <div className="rounded-2xl bg-white/5 p-3">
              <label className="mb-2 flex items-center justify-between text-xs uppercase text-slate-400">
                <span>
                  <Clock3 size={13} className="mr-1 inline" /> Delay
                </span>
                <span>{speed}ms</span>
              </label>
              <input
                type="range"
                min="80"
                max="600"
                value={speed}
                disabled={isRunning}
                onChange={(event) => setSpeed(Number(event.target.value))}
                className="w-full accent-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <MotionButton
                whileTap={{ scale: 0.95 }}
                onClick={handleReset}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2.5 text-sm font-bold text-white"
              >
                <RotateCcw size={16} /> Reset
              </MotionButton>
              <MotionButton
                whileTap={{ scale: 0.95 }}
                onClick={() => generateNewList(listSize)}
                className="flex items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 py-2.5 text-sm font-bold text-cyan-100"
              >
                <Shuffle size={16} /> New Data
              </MotionButton>
            </div>

            {!isRunning ? (
              <MotionButton
                whileHover={{ scale: 1.02 }}
                onClick={handleStart}
                className="mt-auto flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 py-3.5 font-bold text-white shadow-lg"
              >
                <Play size={18} fill="currentColor" /> Start
              </MotionButton>
            ) : (
              <MotionButton
                onClick={isPaused ? handleResume : handlePause}
                className={`mt-auto flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white ${isPaused ? "bg-emerald-600" : "bg-amber-500 text-slate-900"}`}
              >
                {isPaused ? (
                  <Play size={18} fill="currentColor" />
                ) : (
                  <Pause size={18} fill="currentColor" />
                )}
                {isPaused ? "Resume" : "Pause"}
              </MotionButton>
            )}
          </div>
        </aside>

        <section className="min-w-0 h-full rounded-3xl border border-white/10 bg-slate-800/35 p-4 shadow-2xl backdrop-blur sm:p-6">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Node Graph
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Each card shows its current <code>next</code> pointer.
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-slate-900/45">
            <div
              ref={nodeViewportRef}
              className="ll-scrollbar h-[170px] w-full max-w-full overflow-x-auto overflow-y-hidden px-2 pb-3 pt-7"
            >
              <div className="flex h-full min-w-max items-start gap-3 pr-4">
                {nodeRenderOrder.map((nodeIndex, orderIndex) => {
                  const node = nodes[nodeIndex];
                  if (!node) return null;
                  const labels = Object.entries(markers)
                    .filter(([, markerIndex]) => markerIndex === nodeIndex)
                    .map(([markerKey]) => markerLabels[markerKey]);
                  const nextIndex = nextLinks[nodeIndex];

                  return (
                    <div
                      key={node.id}
                      ref={(element) => {
                        if (element) nodeItemRefs.current[nodeIndex] = element;
                      }}
                      className="flex items-center gap-2"
                    >
                      <MotionDiv
                        layout
                        transition={{
                          type: "spring",
                          stiffness: 250,
                          damping: 28,
                        }}
                        className={`relative mt-2 min-w-[112px] rounded-xl border px-3 py-3 text-center shadow-lg ${getNodeStatusClass(node.status)}`}
                      >
                        {focusPointer?.index === nodeIndex && (
                          <motion.div
                            layoutId="active-pointer-focus"
                            transition={{
                              type: "spring",
                              stiffness: 320,
                              damping: 30,
                            }}
                            className="pointer-events-none absolute -inset-1 rounded-xl border-2 border-cyan-300/80 shadow-[0_0_0_6px_rgba(34,211,238,0.16)]"
                          />
                        )}
                        {labels.length > 0 && (
                          <div className="absolute -top-5 left-1/2 z-20 flex max-w-[130px] -translate-x-1/2 flex-wrap justify-center gap-1">
                            {labels.map((label) => (
                              <span
                                key={`${node.id}-${label}`}
                                className="rounded-full border border-slate-700 bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-100"
                              >
                                {label}
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-[10px] uppercase tracking-wider text-slate-200/90">
                          Node {nodeIndex + 1}
                        </p>
                        <p className="mt-1 text-xl font-bold">{node.value}</p>
                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-slate-100/85">
                          next:{" "}
                          {nextIndex === null
                            ? "null"
                            : (nodes[nextIndex]?.value ?? "null")}
                        </p>
                      </MotionDiv>
                      {orderIndex < nodeRenderOrder.length - 1 && (
                        <span className="self-center text-sm font-bold text-slate-500">
                          -&gt;
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="ll-scrollbar mt-2 w-full max-w-full overflow-x-auto">
            <div className="flex min-w-max items-center gap-2 pb-1">
              {pointerSummary.length === 0 ? (
                <span className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-slate-400">
                  No active pointers
                </span>
              ) : (
                pointerSummary.map((pointer) => (
                  <span
                    key={pointer.key}
                    className={`rounded-lg px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${focusPointer?.key === pointer.key
                        ? "border border-amber-400/50 bg-amber-500/20 text-amber-100"
                        : "border border-cyan-400/30 bg-cyan-500/10 text-cyan-100"
                      }`}
                  >
                    {pointer.label}: {pointer.value}
                  </span>
                ))
              )}
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/60 p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300">
              Traversal From Head
            </p>
            <div className="ll-scrollbar mt-3 w-full max-w-full overflow-x-auto">
              <div className="flex min-w-max items-center gap-2 pb-1 text-sm">
                {listTraversal.order.length === 0 ? (
                  <span className="text-slate-400">null</span>
                ) : (
                  <>
                    {listTraversal.order.map((index, orderIndex) => (
                      <div
                        key={`${nodes[index].id}-order`}
                        className="flex items-center gap-2"
                      >
                        <span className="rounded-lg border border-cyan-400/35 bg-cyan-500/10 px-2.5 py-1 font-semibold text-cyan-100">
                          {nodes[index].value}
                        </span>
                        {orderIndex < listTraversal.order.length - 1 && (
                          <span className="text-slate-400">-&gt;</span>
                        )}
                      </div>
                    ))}
                    <span className="text-slate-500">-&gt; null</span>
                    {listTraversal.hasCycle && (
                      <span className="rounded-full border border-rose-400/35 bg-rose-500/15 px-2 py-0.5 text-xs font-semibold text-rose-100">
                        cycle detected
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4">
          <div className="flex items-center gap-3">
            <Code2 size={20} className="text-blue-400" />
            <span className="text-sm font-bold uppercase tracking-widest text-slate-200">
              {selectedLanguage} Source
            </span>
            <div className="ml-4 flex rounded-lg bg-white/5 p-1 border border-white/10">
              {["C++", "Python"].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setSelectedLanguage(lang)}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${selectedLanguage === lang ? "bg-blue-600 text-white" : "text-slate-400 hover:text-white"}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-white/10"
            >
              {copyState === "copied" ? (
                <CheckCheck size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 transition-colors hover:bg-white/10"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
        <div className="ll-scrollbar max-h-[500px] overflow-auto bg-[#020617] p-6 font-code text-sm leading-relaxed">
          <pre>
            <code>
              {activeCodeSnippet.split("\n").map((line, index) => (
                <div
                  key={`${selectedAlgorithm}-line-${index}`}
                  className="flex rounded px-2 hover:bg-white/5"
                >
                  <span className="w-8 shrink-0 select-none pr-4 text-right text-xs text-slate-600">
                    {index + 1}
                  </span>
                  <span className="text-slate-300">
                    {renderHighlightedCode(line)}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </section>
    </div>
  );
}

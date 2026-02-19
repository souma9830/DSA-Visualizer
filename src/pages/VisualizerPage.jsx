import { useEffect, useMemo, useRef, useState } from "react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { motion } from "framer-motion";
import {
  Activity,
  Binary,
  CheckCheck,
  Clock3,
  Play,
  Pause,
  RotateCcw,
  Code2,
  Shuffle,
  Eye,
  EyeOff,
  SlidersHorizontal,
  Copy,
  Radar,
  Sparkles,
  Download,
  Keyboard,
} from "lucide-react";
import { useVisualizer } from "../hooks/useVisualizer";
import { bubbleSort } from "../algorithms/bubbleSort";
import { selectionSort } from "../algorithms/selectionSort";
import { quickSort } from "../algorithms/quickSort";
import { linearSearch } from "../algorithms/linearSearch";
import { radixSort } from "../algorithms/radixSort";
import { heapSort } from "../algorithms/heapSort";
import { insertionSort } from "../algorithms/insertionSort";
import { dfs } from "../algorithms/dfs";
import { interpolationSearch } from "../algorithms/interpolationSearch";
import { renderHighlightedCode } from "../utils/codeHighlight";

const algorithmMap = {
  "Bubble Sort": {
    run: bubbleSort,
    category: "Sorting",
    best: "O(n)",
    average: "O(n^2)",
    worst: "O(n^2)",
    space: "O(1)",
    description:
      "Bubble Sort compares adjacent bars and swaps them until larger values settle at the end.",
  },
  "Selection Sort": {
    run: selectionSort,
    category: "Sorting",
    best: "O(n^2)",
    average: "O(n^2)",
    worst: "O(n^2)",
    space: "O(1)",
    description:
      "Selection Sort repeatedly chooses the smallest unsorted value and places it into position.",
  },
  "Quick Sort": {
    run: quickSort,
    category: "Sorting",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n^2)",
    space: "O(log n)",
    description:
      "Quick Sort partitions around a pivot and recursively solves left and right subarrays.",
  },
  "Linear Search": {
    run: linearSearch,
    category: "Searching",
    best: "O(1)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(1)",
    description:
      "Linear Search scans each value from left to right until the target value is discovered.",
  },
  "Interpolation Search": {
    run: interpolationSearch,
    category: "Searching",
    best: "O(1)",
    average: "O(log log n)",
    worst: "O(n)",
    space: "O(1)",
    description:
      "Interpolation Search estimates the position of the target value in a sorted array based on the values at the range edges.",
  },
  "Radix Sort": {
    run: radixSort,
    category: "Sorting",
    best: "O(nk)",
    average: "O(nk)",
    worst: "O(nk)",
    space: "O(n+k)",
    description:
      "Radix Sort avoids comparison by creating and distributing elements into buckets according to their radix.",
  },
  "Insertion Sort": {
    run: insertionSort,
    category: "Sorting",
    best: "O(n)",
    average: "O(n^2)",
    worst: "O(n^2)",
    space: "O(1)",
    description:
      "Insertion Sort builds the final sorted array one item at a time by shifting larger elements to the right.",
  },
  "Heap Sort": {
    run: heapSort,
    category: "Sorting",
    best: "O(n log n)",
    average: "O(n log n)",
    worst: "O(n log n)",
    space: "O(1)",
    description:
      "Heap Sort builds a max heap and repeatedly extracts the maximum element to sort the array in-place.",
  },
  "Depth First Search": {
    run: dfs,
    category: "Searching",
    best: "O(n)",
    average: "O(n)",
    worst: "O(n)",
    space: "O(h)",
    description:
      "Depth First Search traversal on an implicit Binary Tree structure.",
  },
};

const statusStyleMap = {
  Idle: "border-white/15 bg-white/5 text-slate-200",
  Running: "border-cyan-400/30 bg-cyan-500/10 text-cyan-100",
  Paused: "border-amber-400/30 bg-amber-500/10 text-amber-100",
  Completed: "border-emerald-400/30 bg-emerald-500/10 text-emerald-100",
};

const colorThemes = {
  ocean: {
    label: "Ocean",
    chip: "from-cyan-500/25 to-blue-500/25",
    colors: {
      default: "bg-blue-500",
      comparing: "bg-amber-300",
      swapping: "bg-rose-500",
      sorted: "bg-emerald-500",
      pivot: "bg-violet-500",
      target: "bg-cyan-300",
    },
  },
  sunrise: {
    label: "Sunrise",
    chip: "from-orange-500/30 to-fuchsia-500/25",
    colors: {
      default: "bg-orange-400",
      comparing: "bg-fuchsia-400",
      swapping: "bg-red-500",
      sorted: "bg-lime-400",
      pivot: "bg-indigo-500",
      target: "bg-yellow-300",
    },
  },
  aurora: {
    label: "Aurora",
    chip: "from-emerald-500/30 to-cyan-500/25",
    colors: {
      default: "bg-cyan-400",
      comparing: "bg-yellow-300",
      swapping: "bg-pink-500",
      sorted: "bg-emerald-400",
      pivot: "bg-purple-500",
      target: "bg-orange-300",
    },
  },
};

function formatElapsed(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

export default function VisualizerPage({
  name,
  cppSnippet,
  javaSnippet,
  pythonSnippet,
}) {
  const { array, setArray, generateRandomArray } = useVisualizer();
  useDocumentTitle(name);
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [runStatus, setRunStatus] = useState("Idle");
  const [arraySize, setArraySize] = useState(40);
  const [speed, setSpeed] = useState(30);
  const [showValues, setShowValues] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [colorTheme, setColorTheme] = useState("ocean");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copyState, setCopyState] = useState("idle");
  const [selectedLanguage, setSelectedLanguage] = useState("C++");

  const stopSignal = useRef(false);
  const pauseSignal = useRef(false);
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const MotionBar = motion.div;

  const algorithm = algorithmMap[name];
  const activeCode =
    selectedLanguage === "C++"
      ? cppSnippet
      : selectedLanguage === "Java"
        ? javaSnippet
        : pythonSnippet;

  const themeConfig = colorThemes[colorTheme] ?? colorThemes.ocean;
  const themeColors = themeConfig.colors;

  const sortedCount = useMemo(
    () => array.filter((item) => item.status === "sorted").length,
    [array],
  );
  const progress = useMemo(
    () =>
      runStatus === "Completed"
        ? 100
        : array.length === 0
          ? 0
          : Math.round((sortedCount / array.length) * 100),
    [array.length, runStatus, sortedCount],
  );
  const valueStats = useMemo(() => {
    if (array.length === 0) return { min: 0, max: 0, avg: 0 };
    const values = array.map((item) => item.value);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Math.round(values.reduce((a, b) => a + b, 0) / values.length),
    };
  }, [array]);

  const maxValue = valueStats.max || 1;
  const isTooLargeForValues = array.length > 35;
  const canShowValues = showValues && !isTooLargeForValues;

  const legendItems = useMemo(
    () => [
      { label: "Default", color: themeColors.default },
      { label: "Comparing", color: themeColors.comparing },
      { label: "Swapping", color: themeColors.swapping },
      { label: "Sorted", color: themeColors.sorted },
      {
        label: algorithm?.category === "Searching" ? "Target" : "Pivot",
        color:
          algorithm?.category === "Searching"
            ? themeColors.target
            : themeColors.pivot,
      },
    ],
    [algorithm?.category, themeColors],
  );

  // HOTKEYS
  useEffect(() => {
    const handleHotkeys = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!isSorting) handleStart();
        else if (isPaused) handleResume();
        else handlePause();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleResetHighlights();
      }
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleGenerateNew();
      }
    };
    window.addEventListener("keydown", handleHotkeys);
    return () => window.removeEventListener("keydown", handleHotkeys);
  }, [isSorting, isPaused]);

  useEffect(() => {
    handleGenerateNew(arraySize);
  }, [name]);

  useEffect(() => {
    if (!isSorting || isPaused) return undefined;
    const timer = setInterval(
      () => setElapsedSeconds((current) => current + 1),
      1000,
    );
    return () => clearInterval(timer);
  }, [isSorting, isPaused]);

  // HOTKEYS LOGIC
  useEffect(() => {
    const handleHotkeys = (e) => {
      const tag = e.target?.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea" || tag === "select") return;
      if (e.code === "Space") {
        e.preventDefault();
        if (!isSorting) handleStart();
        else if (isPaused) handleResume();
        else handlePause();
      }
      if (e.key.toLowerCase() === "r") {
        e.preventDefault();
        handleResetHighlights();
      }
      if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        handleGenerateNew();
      }
      if (e.key.toLowerCase() === "v") {
        e.preventDefault();
        !isTooLargeForValues && setShowValues((v) => !v);
      }
      if (e.key.toLowerCase() === "g") {
        e.preventDefault();
        setShowGrid((g) => !g);
      }
      if (e.key.toLowerCase() === "c") {
        e.preventDefault();
        const keys = Object.keys(colorThemes);
        setColorTheme(keys[(keys.indexOf(colorTheme) + 1) % keys.length]);
      }
    };
    window.addEventListener("keydown", handleHotkeys);
    return () => window.removeEventListener("keydown", handleHotkeys);
  }, [isSorting, isPaused, colorTheme, array.length]);

  const handleGenerateNew = (nextSize = arraySize) => {
    stopSignal.current = true;
    pauseSignal.current = false;
    setIsSorting(false);
    setIsPaused(false);
    setRunStatus("Idle");
    setElapsedSeconds(0);
    generateRandomArray(nextSize);
  };

  const handleResetHighlights = () => {
    stopSignal.current = true;
    setRunStatus("Idle");
    setArray((current) =>
      current.map((item) => ({ ...item, status: "default" })),
    );
  };

  const handleStart = async () => {
    if (!algorithm?.run) return;
    stopSignal.current = false;
    pauseSignal.current = false;
    setIsSorting(true);
    setRunStatus("Running");
    setElapsedSeconds(0);
    await algorithm.run(array, setArray, speed, stopSignal, pauseSignal);
    if (!stopSignal.current) setRunStatus("Completed");
    setIsSorting(false);
  };

  const handlePause = () => {
    pauseSignal.current = true;
    setIsPaused(true);
    setRunStatus("Paused");
  };
  const handleResume = () => {
    pauseSignal.current = false;
    setIsPaused(false);
    setRunStatus("Running");
  };

  const handleCopyCode = async () => {
    if (!navigator?.clipboard) return;
    await navigator.clipboard.writeText(activeCode || "");
    setCopyState("copied");
    setTimeout(() => setCopyState("idle"), 1400);
  };

  const handleDownloadCode = () => {
    const ext =
      selectedLanguage === "C++"
        ? ".cpp"
        : selectedLanguage === "Java"
          ? ".java"
          : ".py";
    const blob = new Blob([activeCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${name.replace(/\s+/g, "")}${ext}`;
    link.click();
  };

  return (
    <div className="font-body relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,0.18),transparent_36%),linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(15,23,42,0.6))]" />

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-800/40 p-5 shadow-2xl backdrop-blur sm:p-7"
      >
        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-200">
                {algorithm?.category}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyleMap[runStatus]}`}
              >
                {runStatus}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>
            <h1 className="font-display text-3xl font-black text-white sm:text-5xl">
              {name}
            </h1>
            <p className="mt-3 text-sm text-slate-300">
              {algorithm?.description}
            </p>
            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-slate-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                <MotionDiv
                  animate={{ width: `${progress}%` }}
                  className={`h-full bg-gradient-to-r ${themeConfig.chip}`}
                />
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4 text-center">
              {["Best", "Average", "Worst", "Space"].map((stat) => (
                <div
                  key={stat}
                  className="rounded-xl border border-white/10 bg-white/5 p-3"
                >
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">
                    {stat}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {algorithm?.[stat.toLowerCase()] || "-"}
                  </p>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5">
            <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300">
              <Radar size={14} className="text-cyan-300" /> Live Snapshot
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Data Points</p>
                <p className="text-lg font-bold text-white">{array.length}</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Sorted</p>
                <p className="text-lg font-bold text-emerald-200">
                  {sortedCount}/{array.length}
                </p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Delay</p>
                <p className="text-lg font-bold text-cyan-100">{speed}ms</p>
              </div>
              <div className="rounded-xl bg-white/5 p-3">
                <p className="text-[11px] text-slate-400">Avg Value</p>
                <p className="text-lg font-bold text-blue-100">
                  {valueStats.avg}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-3xl border border-white/10 bg-slate-800/35 p-5 backdrop-blur xl:sticky xl:top-24">
          <div className="mb-5 flex items-center gap-2">
            <SlidersHorizontal size={18} className="text-cyan-300" />
            <h2 className="text-sm font-bold uppercase tracking-widest text-white">
              Controls
            </h2>
          </div>
          <div className="space-y-4">
            <div className="rounded-2xl bg-white/5 p-3">
              <label className="flex justify-between text-xs text-slate-400 mb-2 uppercase">
                <span>Size</span> <span>{arraySize}</span>
              </label>
              <input
                type="range"
                min="16"
                max="80"
                value={arraySize}
                disabled={isSorting}
                onChange={(e) => {
                  setArraySize(+e.target.value);
                  handleGenerateNew(+e.target.value);
                }}
                className="w-full accent-cyan-400"
              />
            </div>
            <div className="rounded-2xl bg-white/5 p-3">
              <label className="flex justify-between text-xs text-slate-400 mb-2 uppercase">
                <span>Delay</span> <span>{speed}ms</span>
              </label>
              <input
                type="range"
                min="10"
                max="150"
                value={speed}
                disabled={isSorting}
                onChange={(e) => setSpeed(+e.target.value)}
                className="w-full accent-blue-400"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <MotionButton
                onClick={handleResetHighlights}
                className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-sm font-bold text-white border border-white/10"
              >
                <RotateCcw size={16} /> Reset
              </MotionButton>
              <MotionButton
                onClick={() => handleGenerateNew()}
                className="flex items-center justify-center gap-2 rounded-xl bg-cyan-500/10 py-2.5 text-sm font-bold text-cyan-100 border border-cyan-400/20"
              >
                <Shuffle size={16} /> New Data
              </MotionButton>
            </div>
            <div className="grid grid-cols-2 gap-2 items-start">
              <div className="flex flex-col">
                <MotionButton
                  onClick={() =>
                    !isTooLargeForValues && setShowValues(!showValues)
                  }
                  className={`flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold border transition-all ${isTooLargeForValues ? "bg-slate-800/50 border-white/5 text-slate-500 cursor-not-allowed" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
                >
                  {showValues && !isTooLargeForValues ? (
                    <EyeOff size={16} />
                  ) : (
                    <Eye size={16} />
                  )}{" "}
                  {isTooLargeForValues
                    ? "Hidden"
                    : showValues
                      ? "Hide"
                      : "Values"}
                </MotionButton>
                {isTooLargeForValues && (
                  <p className="mt-1 text-[9px] text-amber-400/90 text-center font-medium animate-pulse">
                    Size must be ≤ 35
                  </p>
                )}
              </div>
              <MotionButton
                onClick={handleDownloadCode}
                className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/10 py-2.5 text-sm font-bold text-blue-100 border border-blue-400/20 hover:bg-blue-500/20 transition-all"
              >
                <Download size={16} /> Download
              </MotionButton>
            </div>
            <MotionButton
              whileHover={{ scale: 1.02 }}
              onClick={
                isPaused ? handleResume : isSorting ? handlePause : handleStart
              }
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-lg transition-all ${isPaused ? "bg-emerald-600" : isSorting ? "bg-amber-500 text-slate-900" : "bg-gradient-to-r from-blue-600 to-cyan-500"}`}
            >
              {isPaused ? (
                <Play size={18} fill="currentColor" />
              ) : isSorting ? (
                <Pause size={18} fill="currentColor" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
              {isPaused ? "Resume" : isSorting ? "Pause" : "Start"}
            </MotionButton>
          </div>
          <div className="mt-5 p-3 rounded-2xl border border-white/10 bg-white/5 text-[11px] text-slate-400 space-y-1">
            <p className="font-bold text-slate-200 uppercase mb-1 flex items-center gap-1">
              <Keyboard size={12} /> Shortcuts
            </p>
            <p>Space: Start/Pause | R: Reset | N: New</p>
          </div>
        </aside>

        <section className="rounded-3xl border border-white/10 bg-slate-800/35 p-4 backdrop-blur sm:p-6 shadow-2xl">
          <div className="mb-4 flex justify-between items-center">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
              <Sparkles size={14} className="text-cyan-300" /> Stage
            </p>
            <div className="flex gap-2">
              {legendItems.map((item) => (
                <span
                  key={item.label}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-slate-300 uppercase"
                >
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  {item.label}
                </span>
              ))}
            </div>
          </div>
          <div className="relative h-[300px] sm:h-[450px] bg-slate-900/55 rounded-2xl border border-slate-700/60 flex items-end justify-center gap-0.5 px-4 pb-4">
            {showGrid && (
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage:
                    "linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)",
                  backgroundSize: "100% 32px, 32px 100%",
                }}
              />
            )}
            {array.map((item, i) => (
              <MotionBar
                key={i}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className={`relative rounded-t-sm flex items-end justify-center pb-1 ${item.status === "comparing" ? themeColors.comparing : item.status === "swapping" ? themeColors.swapping : item.status === "sorted" ? themeColors.sorted : item.status === "pivot" || item.status === "target" ? themeColors.pivot || themeColors.target : themeColors.default}`}
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                  width: `${100 / array.length}%`,
                }}
              >
                {canShowValues && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[10px] font-bold text-white select-none mb-1"
                    style={{
                      writingMode:
                        array.length > 30 ? "vertical-rl" : "horizontal-tb",
                    }}
                  >
                    {item.value}
                  </motion.span>
                )}
              </MotionBar>
            ))}
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
              {["C++", "Java", "Python"].map((lang) => (
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
              className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors border border-white/10"
            >
              {copyState === "copied" ? (
                <CheckCheck size={14} className="text-emerald-400" />
              ) : (
                <Copy size={14} />
              )}{" "}
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
            <button
              onClick={handleDownloadCode}
              className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors border border-white/10"
            >
              <Download size={14} /> Download
            </button>
          </div>
        </div>
        <div className="ll-scrollbar max-h-[500px] overflow-auto bg-[#020617] p-6 font-code text-sm leading-relaxed">
          <pre>
            <code>
              {(activeCode || "").split("\n").map((line, i) => (
                <div key={i} className="flex hover:bg-white/5 px-2 rounded">
                  <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-4 text-xs">
                    {i + 1}
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

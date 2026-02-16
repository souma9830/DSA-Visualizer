import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import {
  Activity,
  BarChart3,
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
  Layers,
  Copy,
  Gauge,
  Keyboard,
  Radar,
  Sparkles,
} from 'lucide-react';
import { useVisualizer } from '../hooks/useVisualizer';
import { bubbleSort } from '../algorithms/bubbleSort';
import { selectionSort } from '../algorithms/selectionSort';
import { quickSort } from '../algorithms/quickSort';
import { linearSearch } from '../algorithms/linearSearch';

const algorithmMap = {
  'Bubble Sort': {
    run: bubbleSort,
    category: 'Sorting',
    best: 'O(n)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
    space: 'O(1)',
    description:
      'Bubble Sort compares adjacent bars and swaps them until larger values settle at the end.',
  },
  'Selection Sort': {
    run: selectionSort,
    category: 'Sorting',
    best: 'O(n^2)',
    average: 'O(n^2)',
    worst: 'O(n^2)',
    space: 'O(1)',
    description:
      'Selection Sort repeatedly chooses the smallest unsorted value and places it into position.',
  },
  'Quick Sort': {
    run: quickSort,
    category: 'Sorting',
    best: 'O(n log n)',
    average: 'O(n log n)',
    worst: 'O(n^2)',
    space: 'O(log n)',
    description:
      'Quick Sort partitions around a pivot and recursively solves left and right subarrays.',
  },
  'Linear Search': {
    run: linearSearch,
    category: 'Searching',
    best: 'O(1)',
    average: 'O(n)',
    worst: 'O(n)',
    space: 'O(1)',
    description:
      'Linear Search scans each value from left to right until the target value is discovered.',
  },
};

const statusStyleMap = {
  Idle: 'border-white/15 bg-white/5 text-slate-200',
  Running: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
  Paused: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
  Completed: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
  Unavailable: 'border-red-400/30 bg-red-500/10 text-red-100',
};

const legendTemplate = [
  { key: 'default', label: 'Default', status: 'default' },
  { key: 'comparing', label: 'Comparing', status: 'comparing' },
  { key: 'swapping', label: 'Swapping', status: 'swapping' },
  { key: 'sorted', label: 'Sorted / Found', status: 'sorted' },
  { key: 'special', label: 'Pivot / Target', status: 'pivot' },
];

const sizePresets = [24, 40, 60, 80];

const colorThemes = {
  ocean: {
    label: 'Ocean',
    chip: 'from-cyan-500/25 to-blue-500/25',
    colors: {
      default: 'bg-blue-500',
      comparing: 'bg-amber-300',
      swapping: 'bg-rose-500',
      sorted: 'bg-emerald-500',
      pivot: 'bg-violet-500',
      target: 'bg-cyan-300',
    },
  },
  sunrise: {
    label: 'Sunrise',
    chip: 'from-orange-500/30 to-fuchsia-500/25',
    colors: {
      default: 'bg-orange-400',
      comparing: 'bg-fuchsia-400',
      swapping: 'bg-red-500',
      sorted: 'bg-lime-400',
      pivot: 'bg-indigo-500',
      target: 'bg-yellow-300',
    },
  },
  aurora: {
    label: 'Aurora',
    chip: 'from-emerald-500/30 to-cyan-500/25',
    colors: {
      default: 'bg-cyan-400',
      comparing: 'bg-yellow-300',
      swapping: 'bg-pink-500',
      sorted: 'bg-emerald-400',
      pivot: 'bg-purple-500',
      target: 'bg-orange-300',
    },
  },
};

function getBarColor(status, paletteColors) {
  if (status === 'comparing') return paletteColors.comparing;
  if (status === 'swapping') return paletteColors.swapping;
  if (status === 'sorted') return paletteColors.sorted;
  if (status === 'pivot') return paletteColors.pivot;
  if (status === 'target') return paletteColors.target;
  return paletteColors.default;
}

function formatElapsed(seconds) {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}

export default function VisualizerPage({ name, codeSnippet }) {
  const { array, setArray, generateRandomArray } = useVisualizer();
  const [isSorting, setIsSorting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [runStatus, setRunStatus] = useState('Idle');
  const [arraySize, setArraySize] = useState(40);
  const [speed, setSpeed] = useState(30);
  const [showValues, setShowValues] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [colorTheme, setColorTheme] = useState('ocean');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copyState, setCopyState] = useState('idle');
  const prefersReducedMotion = useReducedMotion();

  const stopSignal = useRef(false);
  const pauseSignal = useRef(false);

  const MotionSection = motion.section;
  const MotionDiv = motion.div;
  const MotionButton = motion.button;
  const MotionBar = motion.div;

  const algorithm = algorithmMap[name];

  const sortedCount = useMemo(
    () => array.filter((item) => item.status === 'sorted').length,
    [array],
  );

  const progress = useMemo(() => {
    if (runStatus === 'Completed') return 100;
    if (array.length === 0) return 0;
    return Math.round((sortedCount / array.length) * 100);
  }, [array.length, runStatus, sortedCount]);

  const valueStats = useMemo(() => {
    if (array.length === 0) {
      return { min: 0, max: 0, avg: 0 };
    }
    const values = array.map((item) => item.value);
    const sum = values.reduce((acc, value) => acc + value, 0);
    return {
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Math.round(sum / values.length),
    };
  }, [array]);

  const maxValue = valueStats.max || 1;
  const canShowValues = showValues && array.length <= 34;
  const themeConfig = colorThemes[colorTheme] ?? colorThemes.ocean;
  const themeColors = themeConfig.colors;
  const legendItems = useMemo(
    () =>
      legendTemplate.map((item) => ({
        ...item,
        status:
          item.key === 'special'
            ? algorithm?.category === 'Searching'
              ? 'target'
              : 'pivot'
            : item.status,
        label:
          item.key === 'special'
            ? algorithm?.category === 'Searching'
              ? 'Target'
              : 'Pivot'
            : item.label,
        color:
          themeColors[
            item.key === 'special'
              ? algorithm?.category === 'Searching'
                ? 'target'
                : 'pivot'
              : item.status
          ] ?? themeColors.default,
      })),
    [algorithm?.category, themeColors],
  );
  const estimatedOps = useMemo(() => {
    const n = array.length;
    if (!algorithm?.average || n === 0) return 0;
    if (algorithm.average.includes('n^2')) return n * n;
    if (algorithm.average.includes('n log n')) return Math.round(n * Math.log2(n));
    if (algorithm.average.includes('n')) return n;
    return 0;
  }, [algorithm?.average, array.length]);
  const stageGlowClass =
    runStatus === 'Running'
      ? 'from-cyan-400/20 via-blue-500/10 to-transparent'
      : runStatus === 'Completed'
        ? 'from-emerald-400/20 via-cyan-500/10 to-transparent'
        : 'from-blue-500/12 via-slate-500/6 to-transparent';

  useEffect(() => {
    stopSignal.current = true;
    pauseSignal.current = false;
    setIsSorting(false);
    setIsPaused(false);
    setRunStatus('Idle');
    setElapsedSeconds(0);
    generateRandomArray(arraySize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  useEffect(() => {
    if (!isSorting || isPaused) return undefined;
    const timer = setInterval(() => {
      setElapsedSeconds((current) => current + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [isSorting, isPaused]);

  useEffect(() => {
    const handleHotkeys = (event) => {
      const tag = event.target?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

      if (event.code === 'Space') {
        event.preventDefault();
        if (!isSorting) {
          handleStart();
        } else if (isPaused) {
          handleResume();
        } else {
          handlePause();
        }
      }

      if (event.key.toLowerCase() === 'r') {
        event.preventDefault();
        handleResetHighlights();
      }

      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        handleGenerateNew();
      }

      if (event.key.toLowerCase() === 'v') {
        event.preventDefault();
        setShowValues((current) => !current);
      }

      if (event.key.toLowerCase() === 'g') {
        event.preventDefault();
        setShowGrid((current) => !current);
      }

      if (event.key.toLowerCase() === 'c') {
        event.preventDefault();
        const themeKeys = Object.keys(colorThemes);
        const currentIndex = themeKeys.indexOf(colorTheme);
        const nextIndex = (currentIndex + 1) % themeKeys.length;
        setColorTheme(themeKeys[nextIndex]);
      }
    };

    window.addEventListener('keydown', handleHotkeys);
    return () => window.removeEventListener('keydown', handleHotkeys);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSorting, isPaused, speed, arraySize, name, colorTheme]);

  const handleGenerateNew = (nextSize = arraySize) => {
    stopSignal.current = true;
    pauseSignal.current = false;
    setIsSorting(false);
    setIsPaused(false);
    setRunStatus('Idle');
    setElapsedSeconds(0);
    generateRandomArray(nextSize);
  };

  const handleResetHighlights = () => {
    stopSignal.current = true;
    pauseSignal.current = false;
    setIsSorting(false);
    setIsPaused(false);
    setRunStatus('Idle');
    setElapsedSeconds(0);
    setArray((current) => current.map((item) => ({ ...item, status: 'default' })));
  };

  const handleStart = async () => {
    if (!algorithm?.run) {
      setRunStatus('Unavailable');
      return;
    }

    stopSignal.current = false;
    pauseSignal.current = false;
    setIsSorting(true);
    setIsPaused(false);
    setRunStatus('Running');
    setElapsedSeconds(0);

    await algorithm.run(array, setArray, speed, stopSignal, pauseSignal);

    if (stopSignal.current) {
      setIsSorting(false);
      setIsPaused(false);
      return;
    }

    if (!pauseSignal.current) {
      setIsSorting(false);
      setIsPaused(false);
      setRunStatus('Completed');
    }
  };

  const handlePause = () => {
    pauseSignal.current = true;
    setIsPaused(true);
    setRunStatus('Paused');
  };

  const handleResume = () => {
    pauseSignal.current = false;
    setIsPaused(false);
    setRunStatus('Running');
  };

  const handleCopyCode = async () => {
    if (!navigator?.clipboard) return;
    try {
      await navigator.clipboard.writeText(codeSnippet);
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 1400);
    } catch {
      setCopyState('idle');
    }
  };

  return (
    <div className="font-body relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(56,189,248,0.2),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(59,130,246,0.18),transparent_36%),linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(15,23,42,0.6))]" />
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,rgba(16,185,129,0.08)_0%,rgba(59,130,246,0.03)_42%,rgba(245,158,11,0.08)_100%)]" />
      <MotionDiv
        className="pointer-events-none absolute -left-14 top-28 -z-10 h-52 w-52 rounded-full bg-cyan-500/20 blur-3xl"
        animate={prefersReducedMotion ? undefined : { y: [0, -14, 0], opacity: [0.35, 0.65, 0.35] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 6.5, repeat: Infinity, ease: 'easeInOut' }
        }
      />
      <MotionDiv
        className="pointer-events-none absolute right-0 top-48 -z-10 h-56 w-56 rounded-full bg-blue-500/20 blur-3xl"
        animate={prefersReducedMotion ? undefined : { y: [0, 16, 0], opacity: [0.3, 0.55, 0.3] }}
        transition={
          prefersReducedMotion
            ? undefined
            : { duration: 7.2, repeat: Infinity, ease: 'easeInOut' }
        }
      />

      <MotionSection
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-800/40 p-5 shadow-2xl shadow-slate-950/45 backdrop-blur sm:p-7"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-52 w-52 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-16 h-52 w-52 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative z-10 grid gap-6 xl:grid-cols-[1.15fr_0.85fr] xl:items-end">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                {algorithm?.category ?? 'Algorithm'}
              </span>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyleMap[runStatus]}`}
                role="status"
                aria-live="polite"
              >
                {runStatus}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                {formatElapsed(elapsedSeconds)}
              </span>
            </div>

            <h1 className="font-display text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {name}
            </h1>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
              {algorithm?.description ??
                'Visualize every operation step-by-step with smooth animation and rich controls.'}
            </p>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-widest text-slate-400">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-700/70">
                <MotionDiv
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.35 }}
                  className={`h-full rounded-full bg-gradient-to-r ${themeConfig.chip}`}
                />
              </div>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Best</p>
                <p className="mt-1 text-sm font-semibold text-white">{algorithm?.best ?? '-'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Average</p>
                <p className="mt-1 text-sm font-semibold text-white">{algorithm?.average ?? '-'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Worst</p>
                <p className="mt-1 text-sm font-semibold text-white">{algorithm?.worst ?? '-'}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Space</p>
                <p className="mt-1 text-sm font-semibold text-white">{algorithm?.space ?? '-'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 backdrop-blur">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
              <Radar size={14} className="text-cyan-300" />
              Live Snapshot
            </p>
            <span
              className={`mt-2 inline-flex rounded-full border border-white/10 bg-gradient-to-r ${themeConfig.chip} px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-100`}
            >
              {themeConfig.label} Palette
            </span>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Data Points</p>
                <p className="mt-1 text-lg font-bold text-white">{array.length}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Delay</p>
                <p className="mt-1 text-lg font-bold text-cyan-100">{speed}ms</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Sorted</p>
                <p className="mt-1 text-lg font-bold text-emerald-200">
                  {sortedCount}/{array.length}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Avg Value</p>
                <p className="mt-1 text-lg font-bold text-blue-100">{valueStats.avg}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">
                  Estimated Steps
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-100">
                  {estimatedOps.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                <p className="text-[11px] uppercase tracking-wider text-slate-400">Grid Overlay</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">
                  {showGrid ? 'Visible' : 'Hidden'}
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-3">
              <p className="text-[11px] uppercase tracking-wider text-slate-400">Value Range</p>
              <p className="mt-1 inline-flex items-center gap-2 text-sm font-semibold text-slate-100">
                <Binary size={15} className="text-cyan-300" />
                {valueStats.min} to {valueStats.max}
              </p>
            </div>
          </div>
        </div>
      </MotionSection>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[360px_1fr]">
        <MotionSection
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.07 }}
          className="rounded-3xl border border-white/10 bg-slate-800/35 p-5 backdrop-blur sm:p-6 xl:sticky xl:top-24 xl:self-start"
        >
          <div className="mb-5 flex items-center gap-2 text-slate-100">
            <SlidersHorizontal size={18} className="text-cyan-300" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-[0.2em]">
              Controls
            </h2>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Layers size={14} />
                Array Size
              </span>
              <span className="font-semibold text-slate-200">{arraySize}</span>
            </div>
            <input
              type="range"
              min="16"
              max="80"
              step="2"
              value={arraySize}
              aria-label="Array size"
              disabled={isSorting}
              onChange={(event) => {
                const nextSize = Number(event.target.value);
                setArraySize(nextSize);
                handleGenerateNew(nextSize);
              }}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-cyan-400 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-wider text-slate-400">
              <span className="inline-flex items-center gap-1">
                <Clock3 size={14} />
                Delay (ms)
              </span>
              <span className="font-semibold text-slate-200">{speed}</span>
            </div>
            <input
              type="range"
              min="10"
              max="150"
              step="5"
              value={speed}
              aria-label="Visualization delay in milliseconds"
              disabled={isSorting}
              onChange={(event) => setSpeed(Number(event.target.value))}
              className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-700 accent-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>

          <div className="mt-4">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Quick Sizes</p>
            <div className="grid grid-cols-4 gap-2">
              {sizePresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  disabled={isSorting}
                  onClick={() => {
                    setArraySize(preset);
                    handleGenerateNew(preset);
                  }}
                  className={`rounded-lg border px-2 py-2 text-xs font-semibold transition-all ${
                    arraySize === preset
                      ? 'border-cyan-400/45 bg-cyan-500/15 text-cyan-100'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/35 hover:text-white'
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-3">
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">Visual Palette</p>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(colorThemes).map(([key, theme]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setColorTheme(key)}
                  aria-pressed={colorTheme === key}
                  className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-all ${
                    colorTheme === key
                      ? 'border-cyan-400/55 bg-cyan-500/15 text-cyan-100'
                      : 'border-white/10 bg-white/5 text-slate-300 hover:border-cyan-400/35 hover:text-white'
                  }`}
                >
                  <span
                    className={`mb-1 block h-1.5 w-full rounded-full bg-gradient-to-r ${theme.chip}`}
                  />
                  {theme.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowGrid((current) => !current)}
              aria-pressed={showGrid}
              className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition-colors hover:bg-white/10"
            >
              {showGrid ? 'Hide Grid Overlay' : 'Show Grid Overlay'}
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2">
            <MotionButton
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleResetHighlights}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              <RotateCcw size={16} />
              Reset
            </MotionButton>
            <MotionButton
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => handleGenerateNew()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-3 py-2.5 text-sm font-semibold text-cyan-100 transition-colors hover:bg-cyan-500/15"
            >
              <Shuffle size={16} />
              New Data
            </MotionButton>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <MotionButton
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => setShowValues((current) => !current)}
              aria-pressed={showValues}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              {showValues ? <EyeOff size={16} /> : <Eye size={16} />}
              {showValues ? 'Hide' : 'Values'}
            </MotionButton>
            <MotionButton
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-blue-400/25 bg-blue-500/10 px-3 py-2.5 text-sm font-semibold text-blue-100 transition-colors hover:bg-blue-500/15"
            >
              {copyState === 'copied' ? <CheckCheck size={16} /> : <Copy size={16} />}
              {copyState === 'copied' ? 'Copied' : 'Copy C++'}
            </MotionButton>
          </div>

          <div className="mt-5">
            {!isSorting && (
              <MotionButton
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleStart}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-blue-900/35 transition-all hover:brightness-110"
              >
                <Play size={18} fill="currentColor" />
                Start Visualization
              </MotionButton>
            )}
            {isSorting && !isPaused && (
              <MotionButton
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handlePause}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-amber-500 px-4 py-3 text-sm font-bold text-slate-900 shadow-lg shadow-amber-900/35 transition-colors hover:bg-amber-400"
              >
                <Pause size={18} fill="currentColor" />
                Pause
              </MotionButton>
            )}
            {isSorting && isPaused && (
              <MotionButton
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleResume}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-cyan-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-900/35 transition-all hover:brightness-110"
              >
                <Play size={18} fill="currentColor" />
                Resume
              </MotionButton>
            )}
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            <p className="mb-2 inline-flex items-center gap-2 font-semibold uppercase tracking-wider text-slate-200">
              <Keyboard size={14} className="text-cyan-300" />
              Hotkeys
            </p>
            <p>`Space` start/pause/resume</p>
            <p>`R` reset highlights</p>
            <p>`N` generate new data</p>
            <p>`V` toggle values</p>
            <p>`G` toggle grid overlay</p>
            <p>`C` cycle color palette</p>
          </div>
        </MotionSection>

        <MotionSection
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="rounded-3xl border border-white/10 bg-slate-800/35 p-4 shadow-2xl shadow-slate-950/35 backdrop-blur sm:p-6"
        >
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-display inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                <Sparkles size={14} className="text-cyan-300" />
                Visualization Stage
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                <Gauge size={13} className="text-cyan-300" />
                avg {valueStats.avg}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-slate-300">
                <BarChart3 size={13} className="text-blue-300" />
                min {valueStats.min} max {valueStats.max}
              </span>
            </div>
          </div>

          <div className="mb-4 flex flex-wrap gap-2">
            {legendItems.map((item) => (
              <span
                key={item.key}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-200"
              >
                <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                {item.label}
              </span>
            ))}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900/55 p-2 sm:p-3">
            {showGrid && (
              <div
                className="pointer-events-none absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    'linear-gradient(to top, rgba(148,163,184,0.1) 1px, transparent 1px), linear-gradient(to right, rgba(148,163,184,0.08) 1px, transparent 1px)',
                  backgroundSize: '100% 24px, 24px 100%',
                }}
              />
            )}
            <div className={`pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${stageGlowClass}`} />
            {runStatus === 'Running' && !prefersReducedMotion && (
              <MotionDiv
                className="pointer-events-none absolute inset-y-0 w-20 bg-[linear-gradient(90deg,rgba(56,189,248,0),rgba(56,189,248,0.22),rgba(56,189,248,0))] blur-sm"
                initial={{ x: '-30%' }}
                animate={{ x: '130%' }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
              />
            )}

            <div className="relative flex h-[260px] items-end justify-center gap-[2px] overflow-hidden rounded-xl px-2 pb-2 pt-8 sm:h-[330px] md:h-[420px] md:px-4">
              {array.map((item, index) => (
                <MotionBar
                  key={index}
                  layout
                  transition={{ type: 'spring', stiffness: 210, damping: 24, mass: 0.48 }}
                  className={`relative rounded-t-md ${getBarColor(item.status, themeColors)}`}
                  style={{
                    height: `${(item.value / maxValue) * 100}%`,
                    width: `${Math.max(100 / array.length, 1)}%`,
                  }}
                >
                  {canShowValues && (
                    <span className="pointer-events-none absolute -top-5 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-slate-300">
                      {item.value}
                    </span>
                  )}
                </MotionBar>
              ))}
            </div>
          </div>

          {showValues && !canShowValues && (
            <p className="mt-3 text-xs text-slate-400">
              Value labels are displayed automatically when array size is 34 or lower.
            </p>
          )}

          <div className="mt-4 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-300">
            <p className="inline-flex items-center gap-1 font-semibold uppercase tracking-wider text-slate-200">
              <Activity size={13} className="text-cyan-300" />
              Runtime Note
            </p>
            <p className="mt-1">
              Delay controls animation speed. Lower values run faster and may skip perceived detail.
            </p>
          </div>
        </MotionSection>
      </div>

      <MotionSection
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.18 }}
        className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-slate-900 px-5 py-3">
          <div className="inline-flex items-center gap-2 text-white">
            <Code2 size={18} className="text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
              C++ Implementation
            </span>
          </div>
          <div className="inline-flex items-center gap-2">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-slate-300">
              {name}
            </span>
            <button
              type="button"
              onClick={handleCopyCode}
              className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-slate-200 transition-colors hover:bg-white/10"
            >
              {copyState === 'copied' ? <CheckCheck size={14} /> : <Copy size={14} />}
              {copyState === 'copied' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="max-h-[480px] overflow-auto p-5 sm:p-7">
          <pre className="font-code text-xs leading-relaxed text-blue-100 sm:text-sm">
            <code>{codeSnippet}</code>
          </pre>
        </div>
      </MotionSection>
    </div>
  );
}

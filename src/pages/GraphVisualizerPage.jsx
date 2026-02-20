import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { motion } from 'framer-motion';
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
    Network,
    ArrowLeft,
} from 'lucide-react';
import { dfsCPP, dfsJava, dfsPython, dfsJS, dfs } from '../algorithms/dfs';
import { renderHighlightedCode } from '../utils/codeHighlight';

const runStatusStyleMap = {
    Idle: 'border-white/15 bg-white/5 text-slate-200',
    Running: 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100',
    Paused: 'border-amber-400/30 bg-amber-500/10 text-amber-100',
    Completed: 'border-emerald-400/30 bg-emerald-500/10 text-emerald-100',
};

// Helper to generate a random graph (connected)
function generateRandomGraph(nodeCount, width, height) {
    const nodes = [];
    const edges = [];
    const padding = 40;

    // 1. Generate Nodes with random positions (keeping away from edges)
    for (let i = 0; i < nodeCount; i++) {
        nodes.push({
            id: i,
            value: Math.floor(Math.random() * 99) + 1,
            x: Math.random() * (width - 2 * padding) + padding,
            y: Math.random() * (height - 2 * padding) + padding,
            status: 'default', // default, visited, current, processing
        });
    }

    // 2. Generate Edges (ensure connectivity - MST + random edges)
    const connected = new Set([0]);
    const uncommitted = new Set();
    for (let i = 1; i < nodeCount; i++) uncommitted.add(i);

    // Initial Tree
    while (uncommitted.size > 0) {
        const u = Array.from(connected)[Math.floor(Math.random() * connected.size)];
        const v = Array.from(uncommitted)[Math.floor(Math.random() * uncommitted.size)];

        edges.push({ source: u, target: v, id: `e-${u}-${v}`, status: 'default' });

        uncommitted.delete(v);
        connected.add(v);
    }

    // Add extra random edges (density)
    const extraEdges = Math.floor(nodeCount * 0.5);
    for (let i = 0; i < extraEdges; i++) {
        const u = Math.floor(Math.random() * nodeCount);
        const v = Math.floor(Math.random() * nodeCount);
        if (u !== v && !edges.some(e => (e.source === u && e.target === v) || (e.source === v && e.target === u))) {
            edges.push({ source: u, target: v, id: `e-${u}-${v}`, status: 'default' });
        }
    }

    return { nodes, edges };
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}


export default function GraphVisualizerPage() {
    const navigate = useNavigate();
    useDocumentTitle('Depth First Search');
    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [nodeCount, setNodeCount] = useState(8);
    const [speed, setSpeed] = useState(250);
    const [runStatus, setRunStatus] = useState("Idle");
    const [isRunning, setIsRunning] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [statusMessage, setStatusMessage] = useState("Generate a graph to start.");
    const [selectedLanguage, setSelectedLanguage] = useState("C++");
    const [copyState, setCopyState] = useState("idle");

    const activeCode = selectedLanguage === "C++" ? dfsCPP : (selectedLanguage === "Java" ? dfsJava : (selectedLanguage === "Python" ? dfsPython : dfsJS));

    // Canvas Refs
    const containerRef = useRef(null);
    const stopSignal = useRef(false);
    const pauseSignal = useRef(false);

    // Initial Generator
    useEffect(() => {
        handleNewGraph(nodeCount);
    }, []);

    const handleNewGraph = (count = nodeCount) => {
        stopSignal.current = true;
        pauseSignal.current = false;
        setIsRunning(false);
        setIsPaused(false);
        setRunStatus("Idle");
        setStatusMessage("New graph generated.");

        if (containerRef.current) {
            const { width, height } = containerRef.current.getBoundingClientRect();
            const newGraph = generateRandomGraph(count, width || 600, height || 400);
            setGraph(newGraph);
        } else {
            // Fallback dimensions if unmounted
            const newGraph = generateRandomGraph(count, 800, 450);
            setGraph(newGraph);
        }
    };

    const handleReset = () => {
        stopSignal.current = true;
        pauseSignal.current = false;
        setIsRunning(false);
        setIsPaused(false);
        setRunStatus("Idle");
        setGraph(prev => ({
            nodes: prev.nodes.map(n => ({ ...n, status: 'default' })),
            edges: prev.edges.map(e => ({ ...e, status: 'default' }))
        }));
        setStatusMessage("Visualization reset.");
    };

    const waitWithControl = async (duration) => {
        let elapsed = 0;
        while (elapsed < duration) {
            if (stopSignal.current) return false;
            while (pauseSignal.current) {
                if (stopSignal.current) return false;
                await sleep(100);
            }
            await sleep(50);
            elapsed += 50;
        }
        return !stopSignal.current;
    }

    const runDFS = async () => {
        if (isRunning || graph.nodes.length === 0) return;

        setIsRunning(true);
        setRunStatus("Running");
        stopSignal.current = false;
        pauseSignal.current = false;

        // Build Adj List
        const adj = Array.from({ length: graph.nodes.length }, () => []);
        graph.edges.forEach(e => {
            adj[e.source].push({ target: e.target, id: e.id });
            adj[e.target].push({ target: e.source, id: e.id }); // Undirected
        });

        const visited = new Array(graph.nodes.length).fill(false);
        const stack = [0]; // Start at 0

        // Helper to update specific node/edge
        const updateNode = (id, status) => {
            setGraph(prev => ({
                ...prev,
                nodes: prev.nodes.map(n => n.id === id ? { ...n, status } : n)
            }));
        };
        const updateEdge = (id, status) => {
            setGraph(prev => ({
                ...prev,
                edges: prev.edges.map(e => e.id === id ? { ...e, status } : e)
            }));
        };

        // Recursive DFS wrapper for async
        const dfsRecursive = async (curr, parent) => {
            if (stopSignal.current) return;

            visited[curr] = true;
            updateNode(curr, 'processing'); // Highlight current
            setStatusMessage(`Visiting Node ${curr}`);

            if (!(await waitWithControl(speed))) return;

            // Mark as visited (fully in process)
            updateNode(curr, 'visited');

            // Explore neighbors
            const neighbors = adj[curr];
            for (let edge of neighbors) {
                if (stopSignal.current) return;

                if (edge.target === parent) continue; // Don't go back immediately

                if (!visited[edge.target]) {
                    // Highlight Edge
                    updateEdge(edge.id, 'traversed');
                    if (!(await waitWithControl(speed / 2))) return;

                    await dfsRecursive(edge.target, curr);
                }
            }
        };

        await dfsRecursive(0, -1);

        if (!stopSignal.current) {
            setRunStatus("Completed");
            setStatusMessage("DFS Traversal Completed.");
        }
        setIsRunning(false);
    };

    const handleCopyCode = async () => {
        try {
            await navigator.clipboard.writeText(activeCode);
            setCopyState("copied");
            setTimeout(() => setCopyState("idle"), 1400);
        } catch { }
    };

    // Node Colors
    const getNodeColor = (status) => {
        switch (status) {
            case 'processing': return 'bg-amber-500 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-110';
            case 'visited': return 'bg-emerald-500 border-emerald-300';
            default: return 'bg-slate-800 border-slate-600 hover:border-cyan-400';
        }
    };

    const getEdgeColor = (status) => {
        switch (status) {
            case 'traversed': return 'stroke-emerald-400 stroke-2';
            default: return 'stroke-slate-700 stroke-1';
        }
    };


    return (
        <div className="font-body relative mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
            <div className="pointer-events-none absolute inset-0 -z-20 bg-[radial-gradient(circle_at_20%_0%,rgba(168,85,247,0.2),transparent_32%),radial-gradient(circle_at_82%_10%,rgba(236,72,153,0.16),transparent_34%),linear-gradient(to_bottom,rgba(15,23,42,0.95),rgba(15,23,42,0.6))]" />

            <motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl border border-white/10 bg-slate-800/40 p-5 shadow-2xl backdrop-blur sm:p-7">
                <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
                    <div>
                        <div className="mb-6 flex items-center">
                            <button
                                onClick={() => navigate("/algorithms")}
                                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/5 pr-4 pl-3 py-1.5 text-xs font-bold text-slate-300 transition-all hover:bg-white/10 hover:text-white"
                            >
                                <ArrowLeft
                                    size={14}
                                    className="transition-transform group-hover:-translate-x-1"
                                />
                                Back to Algorithms
                            </button>
                        </div>
                        <div className="mb-4 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-purple-400/25 bg-purple-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-purple-200">Graph</span>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${runStatusStyleMap[runStatus]}`}>{runStatus}</span>
                        </div>
                        <h1 className="font-display text-3xl font-black text-white sm:text-4xl lg:text-5xl">Depth First Search</h1>
                        <p className="mt-3 text-sm text-slate-300 sm:text-base max-w-2xl">Traverse graphs by exploring as far as possible along each branch before backtracking.</p>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-slate-900/55 p-5 min-w-[200px]">
                        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-slate-300"><Activity size={14} className="text-purple-300" /> Status</p>
                        <p className="mt-2 text-sm font-semibold text-white">{statusMessage}</p>
                    </div>
                </div>
            </motion.section>

            <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[350px_1fr]">
                {/* Controls */}
                <aside className="rounded-3xl border border-white/10 bg-slate-800/35 p-5 backdrop-blur h-fit">
                    <div className="mb-5 flex items-center gap-2"><Network size={18} className="text-purple-300" /><h2 className="text-sm font-bold uppercase tracking-widest text-white">Graph Controls</h2></div>

                    <div className="space-y-4">
                        <div className="rounded-2xl bg-white/5 p-3">
                            <label className="flex justify-between text-xs text-slate-400 mb-2 uppercase"><span>Nodes</span> <span>{nodeCount}</span></label>
                            <input type="range" min="4" max="15" value={nodeCount} disabled={isRunning} onChange={(e) => { setNodeCount(+e.target.value); handleNewGraph(+e.target.value); }} className="w-full accent-purple-400" />
                        </div>
                        <div className="rounded-2xl bg-white/5 p-3">
                            <label className="flex justify-between text-xs text-slate-400 mb-2 uppercase"><span>Speed</span> <span>{speed}ms</span></label>
                            <input type="range" min="50" max="800" value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-purple-400" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <motion.button onClick={handleReset} className="flex items-center justify-center gap-2 rounded-xl bg-white/5 py-2.5 text-sm font-bold text-white border border-white/10 hover:bg-white/10"><RotateCcw size={16} /> Reset</motion.button>
                            <motion.button onClick={() => handleNewGraph()} className="flex items-center justify-center gap-2 rounded-xl bg-purple-500/10 py-2.5 text-sm font-bold text-purple-100 border border-purple-400/20 hover:bg-purple-500/20"><Shuffle size={16} /> Re-Gen</motion.button>
                        </div>

                        <motion.button
                            onClick={isRunning ? (isPaused ? () => { pauseSignal.current = false; setIsPaused(false); setRunStatus("Running") } : () => { pauseSignal.current = true; setIsPaused(true); setRunStatus("Paused") }) : runDFS}
                            className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 font-bold text-white shadow-lg transition-all ${isPaused ? "bg-emerald-600" : (isRunning ? "bg-amber-500 text-slate-900" : "bg-gradient-to-r from-purple-600 to-pink-500")}`}
                        >
                            {isRunning ? (isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />) : <Play size={18} fill="currentColor" />}
                            {isRunning ? (isPaused ? "Resume" : "Pause") : "Start DFS"}
                        </motion.button>
                    </div>
                </aside>

                {/* Visualization Area */}
                <section className="rounded-3xl border border-white/10 bg-slate-900/40 p-1 shadow-2xl relative overflow-hidden min-h-[500px]" ref={containerRef}>
                    <div className="absolute inset-0 opacity-20 pointer-events-none" style={{ backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>

                    <svg className="w-full h-full absolute inset-0 pointer-events-none">
                        {graph.edges.map((edge) => {
                            const u = graph.nodes.find(n => n.id === edge.source);
                            const v = graph.nodes.find(n => n.id === edge.target);
                            if (!u || !v) return null;
                            return (
                                <motion.line
                                    key={edge.id}
                                    x1={u.x} y1={u.y} x2={v.x} y2={v.y}
                                    className={`transition-all duration-500 ${getEdgeColor(edge.status)}`}
                                    strokeWidth="2"
                                />
                            );
                        })}
                    </svg>

                    {graph.nodes.map((node) => (
                        <motion.div
                            key={node.id}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1, x: node.x - 24, y: node.y - 24 }} // centering 48px node
                            className={`absolute w-12 h-12 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500 ${getNodeColor(node.status)}`}
                        >
                            <span className="text-white font-bold text-sm pointer-events-none select-none">{node.id}</span>
                        </motion.div>
                    ))}
                </section>
            </div>

            {/* Code Section */}
            <section className="mt-6 overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-2xl">
                <div className="flex flex-col gap-4 border-b border-slate-800 bg-slate-900 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        <button
                            onClick={() => navigate("/algorithms")}
                            className="group flex items-center gap-2 rounded-lg bg-white/5 pr-4 pl-3 py-2 text-xs font-bold text-slate-200 transition-all hover:bg-white/10 hover:text-white border border-white/10"
                        >
                            <ArrowLeft
                                size={14}
                                className="transition-transform group-hover:-translate-x-1"
                            />
                            Back to Algorithms
                        </button>
                        <div className="h-6 w-px bg-slate-700 hidden sm:block" />
                        <Code2 size={20} className="text-purple-400" />
                        <span className="text-sm font-bold uppercase tracking-widest text-slate-200">{selectedLanguage} Source</span>
                        <div className="flex rounded-lg bg-white/5 p-1 border border-white/10">
                            {["C++", "Java", "Python", "JavaScript"].map((lang) => (
                                <button key={lang} onClick={() => setSelectedLanguage(lang)} className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${selectedLanguage === lang ? "bg-purple-600 text-white" : "text-slate-400 hover:text-white"}`}>
                                    {lang}
                                </button>
                            ))}
                        </div>
                    </div>
                    <button onClick={handleCopyCode} className="flex items-center gap-2 rounded-lg bg-white/5 px-4 py-2 text-xs font-bold text-slate-200 hover:bg-white/10 transition-colors border border-white/10">
                        {copyState === "copied" ? <CheckCheck size={14} className="text-emerald-400" /> : <Copy size={14} />} {copyState === "copied" ? "Copied" : "Copy"}
                    </button>
                </div>
                <div className="ll-scrollbar max-h-[500px] overflow-auto bg-[#020617] p-6 font-code text-sm leading-relaxed">
                    <pre>
                        <code>
                            {activeCode.split("\n").map((line, i) => (
                                <div key={i} className="flex hover:bg-white/5 px-2 rounded">
                                    <span className="w-8 shrink-0 text-slate-600 select-none text-right pr-4 text-xs">{i + 1}</span>
                                    <span className="text-slate-300">{renderHighlightedCode(line)}</span>
                                </div>
                            ))}
                        </code>
                    </pre>
                </div>
            </section>
        </div>
    );
}

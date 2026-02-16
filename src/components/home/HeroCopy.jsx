import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

export default function HeroCopy() {
  return (
    <>
      <p className="mb-4 inline-flex items-center rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-1.5 text-xs font-bold tracking-[0.18em] text-blue-300 uppercase">
        Interactive DSA Learning
      </p>

      <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
        Understand Algorithms by
        <span className="block text-blue-500">Watching Them Work</span>
      </h1>

      <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg">
        DSA Lab turns algorithm logic into a step-by-step visual flow. Track each
        operation in real time and connect implementation details with actual
        behavior.
      </p>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          to="/algorithms"
          className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-7 py-3.5 text-sm font-bold tracking-wide text-white transition hover:bg-blue-500"
        >
          <Play size={18} fill="currentColor" />
          Start Visualizing
        </Link>
        <Link
          to="/contact"
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-600 bg-slate-900/70 px-7 py-3.5 text-sm font-bold tracking-wide text-slate-200 transition hover:border-blue-400 hover:text-white"
        >
          Contact Team
          <ArrowRight size={18} />
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 text-xs font-semibold tracking-wide text-slate-300 uppercase">
        <span className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">
          Real-time Animation
        </span>
        <span className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">
          Clean C++ Snippets
        </span>
        <span className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2">
          Open Source
        </span>
      </div>
    </>
  );
}

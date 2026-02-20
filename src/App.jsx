

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop";
import Home from "./pages/Home";
import Algorithms from "./pages/Algorithms";
import Contact from "./pages/Contact";
import VisualizerPage from "./pages/VisualizerPage";
import LinkedListVisualizerPage from "./pages/LinkedListVisualizerPage";
import GraphVisualizerPage from "./pages/GraphVisualizerPage";
import DijkstraPage from "./pages/DijkstraPage";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";

// UPDATED IMPORTS: Including both CPP and Java versions
import {
  bubbleSortCPP,
  bubbleSortJava,
  bubbleSortPython,
  bubbleSortJS,
} from "./algorithms/bubbleSort";
import {
  selectionSortCPP,
  selectionSortJava,
  selectionSortPython,
  selectionSortJS,
} from "./algorithms/selectionSort";
import {
  quickSortCPP,
  quickSortJava,
  quickSortPython,
  quickSortJS,
} from "./algorithms/quickSort";
import {
  linearSearchCPP,
  linearSearchJava,
  linearSearchPython,
  linearSearchJS,
} from "./algorithms/linearSearch";
import {
  interpolationSearchCPP,
  interpolationSearchJava,
  interpolationSearchPython,
  interpolationSearchJS,
} from "./algorithms/interpolationSearch";
import {
  radixSortCPP,
  radixSortJava,
  radixSortPython,
  radixSortJS,
} from "./algorithms/radixSort";
import {
  heapSortCPP,
  heapSortJava,
  heapSortPython,
  heapSortJS,
} from "./algorithms/heapSort";
import {
  insertionSortCPP,
  insertionSortJava,
  insertionSortPython,
  insertionSortJS,
} from "./algorithms/insertionSort";
import { mergeSortCPP,
  mergeSortJava,
  mergeSortPython,
  mergeSortJS,

} from './algorithms/mergeSort';
import { dfsCPP, dfsJava } from "./algorithms/dfs";

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="flex flex-col min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
        <Navbar />

        <main className="block">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/algorithms" element={<Algorithms />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />

            {/* UPDATED ROUTES: Passing both cppSnippet, javaSnippet, and pythonSnippet */}
            <Route
              path="/visualizer/bubble-sort"
              element={
                <VisualizerPage
                  name="Bubble Sort"
                  cppSnippet={bubbleSortCPP}
                  javaSnippet={bubbleSortJava}
                  pythonSnippet={bubbleSortPython}
                  jsSnippet={bubbleSortJS}
                />
              }
            />
            <Route
              path="/visualizer/selection-sort"
              element={
                <VisualizerPage
                  name="Selection Sort"
                  cppSnippet={selectionSortCPP}
                  javaSnippet={selectionSortJava}
                  pythonSnippet={selectionSortPython}
                  jsSnippet={selectionSortJS}
                />
              }
            />
            <Route
              path="/visualizer/quick-sort"
              element={
                <VisualizerPage
                  name="Quick Sort"
                  cppSnippet={quickSortCPP}
                  javaSnippet={quickSortJava}
                  pythonSnippet={quickSortPython}
                  jsSnippet={quickSortJS}
                />
              }
            />
            <Route
              path="/visualizer/linear-search"
              element={
                <VisualizerPage
                  name="Linear Search"
                  cppSnippet={linearSearchCPP}
                  javaSnippet={linearSearchJava}
                  pythonSnippet={linearSearchPython}
                  jsSnippet={linearSearchJS}
                />
              }
            />
            <Route
              path="/visualizer/interpolation-search"
              element={
                <VisualizerPage
                  name="Interpolation Search"
                  cppSnippet={interpolationSearchCPP}
                  javaSnippet={interpolationSearchJava}
                  pythonSnippet={interpolationSearchPython}
                  jsSnippet={interpolationSearchJS}
                />
              }
            />
            <Route
              path="/visualizer/radix-sort"
              element={
                <VisualizerPage
                  name="Radix Sort"
                  cppSnippet={radixSortCPP}
                  javaSnippet={radixSortJava}
                  pythonSnippet={radixSortPython}
                  jsSnippet={radixSortJS}
                />
              }
            />
            <Route
              path="/visualizer/heap-sort"
              element={
                <VisualizerPage
                  name="Heap Sort"
                  cppSnippet={heapSortCPP}
                  javaSnippet={heapSortJava}
                  pythonSnippet={heapSortPython}
                  jsSnippet={heapSortJS}
                />
              }
            />
            <Route
              path="/visualizer/insertion-sort"
              element={
                <VisualizerPage
                  name="Insertion Sort"
                  cppSnippet={insertionSortCPP}
                  javaSnippet={insertionSortJava}
                  pythonSnippet={insertionSortPython}
                  jsSnippet={insertionSortJS}
                />
              }
            />
            <Route
              path="/visualizer/linked-list"
              element={<LinkedListVisualizerPage />}
            />
            <Route 
              path="/visualizer/merge-sort"
              element={<VisualizerPage name="Merge Sort" 
                cppSnippet={mergeSortCPP}
                javaSnippet={mergeSortJava}
                pythonSnippet={mergeSortPython}
                jsSnippet={mergeSortJS}
                 />} 
            />
            <Route path="/visualizer/dijkstra" element={<DijkstraPage />} />
            <Route path="/visualizer/dfs" element={<GraphVisualizerPage />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

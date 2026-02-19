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
} from "./algorithms/bubbleSort";
import {
  selectionSortCPP,
  selectionSortJava,
  selectionSortPython,
} from "./algorithms/selectionSort";
import {
  quickSortCPP,
  quickSortJava,
  quickSortPython,
} from "./algorithms/quickSort";
import {
  linearSearchCPP,
  linearSearchJava,
  linearSearchPython,
} from "./algorithms/linearSearch";
import {
  interpolationSearchCPP,
  interpolationSearchJava,
  interpolationSearchPython,
} from "./algorithms/interpolationSearch";
import {
  radixSortCPP,
  radixSortJava,
  radixSortPython,
} from "./algorithms/radixSort";
import {
  heapSortCPP,
  heapSortJava,
  heapSortPython,
} from "./algorithms/heapSort";
import {
  insertionSortCPP,
  insertionSortJava,
  insertionSortPython,
} from "./algorithms/insertionSort";
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
                />
              }
            />
            <Route
              path="/visualizer/linked-list"
              element={<LinkedListVisualizerPage />}
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

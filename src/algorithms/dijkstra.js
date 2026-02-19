
export const dijkstraCPP = `#include <iostream>
#include <vector>
#include <queue>
#include <climits>
using namespace std;

const int INF = INT_MAX;

struct Edge {
    int to;
    int weight;
};

void dijkstra(int start, int n, const vector<vector<Edge>>& adj) {
    priority_queue<pair<int, int>, vector<pair<int, int>>, greater<pair<int, int>>> pq;
    vector<int> dist(n, INF);

    dist[start] = 0;
    pq.push({0, start});

    while (!pq.empty()) {
        int d = pq.top().first;
        int u = pq.top().second;
        pq.pop();

        if (d > dist[u]) continue;

        for (const auto& edge : adj[u]) {
            if (dist[u] + edge.weight < dist[edge.to]) {
                dist[edge.to] = dist[u] + edge.weight;
                pq.push({dist[edge.to], edge.to});
            }
        }
    }

    // Output distances
    for (int i = 0; i < n; ++i) {
        if (dist[i] == INF) cout << "INF ";
        else cout << dist[i] << " ";
    }
}
`;

export const dijkstraJava = `import java.util.*;

class Edge {
    int to;
    int weight;
    
    Edge(int to, int weight) {
        this.to = to;
        this.weight = weight;
    }
}

class Node implements Comparable<Node> {
    int id;
    int dist;
    
    Node(int id, int dist) {
        this.id = id;
        this.dist = dist;
    }
    
    @Override
    public int compareTo(Node other) {
        return Integer.compare(this.dist, other.dist);
    }
}

public class Main {
    static final int INF = Integer.MAX_VALUE;

    public static void dijkstra(int start, int n, List<List<Edge>> adj) {
        PriorityQueue<Node> pq = new PriorityQueue<>();
        int[] dist = new int[n];
        Arrays.fill(dist, INF);

        dist[start] = 0;
        pq.add(new Node(start, 0));

        while (!pq.isEmpty()) {
            Node node = pq.poll();
            int u = node.id;
            int d = node.dist;

            if (d > dist[u]) continue;

            for (Edge edge : adj.get(u)) {
                if (dist[u] + edge.weight < dist[edge.to]) {
                    dist[edge.to] = dist[u] + edge.weight;
                    pq.add(new Node(edge.to, dist[edge.to]));
                }
            }
        }

        // Output distances
        for (int i = 0; i < n; ++i) {
            if (dist[i] == INF) System.out.print("INF ");
            else System.out.print(dist[i] + " ");
        }
    }
}
`;

export const dijkstraPython = `import heapq

def dijkstra(start, n, adj):
    INF = float('inf')
    dist = [INF] * n
    
    dist[start] = 0
    pq = [(0, start)]
    
    while pq:
        d, u = heapq.heappop(pq)
        
        if d > dist[u]:
            continue
        
        for v, weight in adj[u]:
            if dist[u] + weight < dist[v]:
                dist[v] = dist[u] + weight
                heapq.heappush(pq, (dist[v], v))
                
    # Output distances
    for i in range(n):
        if dist[i] == INF:
            print("INF", end=" ")
        else:
            print(dist[i], end=" ")
`;

export const generateDijkstraSteps = (nodes, edges, startNodeId) => {
    const steps = [];
    const adjacencyList = {};

    // Initialize adjacency list
    nodes.forEach(node => {
        adjacencyList[node.id] = [];
    });

    edges.forEach(edge => {
        if (adjacencyList[edge.source]) {
            adjacencyList[edge.source].push({ target: edge.target, weight: edge.weight });
        }
        // Assuming undirected graph for visualization simplicity
        if (adjacencyList[edge.target]) {
            adjacencyList[edge.target].push({ target: edge.source, weight: edge.weight });
        }
    });

    const distances = {};
    const previous = {};
    const visited = new Set();
    const pq = []; // Simple priority queue array

    // Initialize
    nodes.forEach(node => {
        distances[node.id] = Infinity;
        previous[node.id] = null;
    });
    distances[startNodeId] = 0;
    pq.push({ id: startNodeId, dist: 0 });

    // Initial state step
    steps.push({
        visited: new Set(visited),
        distances: { ...distances },
        processingNode: null,
        highlightEdge: null,
        description: "Initialize distances to Infinity, start node to 0."
    });

    while (pq.length > 0) {
        // Sort to simulate priority queue
        pq.sort((a, b) => a.dist - b.dist);
        const { id: u, dist: d } = pq.shift();

        // Step: Processing node u
        steps.push({
            visited: new Set(visited),
            distances: { ...distances },
            processingNode: u,
            highlightEdge: null,
            description: `Processing node ${u} with distance ${d}.`
        });

        if (d > distances[u]) continue;

        visited.add(u);

        // Step: Mark u as visited
        steps.push({
            visited: new Set(visited),
            distances: { ...distances },
            processingNode: u,
            highlightEdge: null,
            description: `Marked node ${u} as visited.`
        });

        const neighbors = adjacencyList[u] || [];
        for (const edge of neighbors) {
            const v = edge.target;
            const weight = edge.weight;

            // Step: Checking edge u -> v
            steps.push({
                visited: new Set(visited),
                distances: { ...distances },
                processingNode: u,
                highlightEdge: { source: u, target: v },
                description: `Checking neighbor ${v} with edge weight ${weight}.`
            });

            if (distances[u] + weight < distances[v]) {
                distances[v] = distances[u] + weight;
                previous[v] = u;
                pq.push({ id: v, dist: distances[v] });

                // Step: Relaxed edge
                steps.push({
                    visited: new Set(visited),
                    distances: { ...distances },
                    processingNode: u,
                    highlightEdge: { source: u, target: v },
                    description: `Updated distance for node ${v} to ${distances[v]}.`
                });
            }
        }
    }

    // Final Step
    steps.push({
        visited: new Set(visited),
        distances: { ...distances },
        processingNode: null,
        highlightEdge: null,
        description: "Algorithm complete."
    });

    return { steps, previous };
};

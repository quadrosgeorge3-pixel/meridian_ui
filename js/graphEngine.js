/**
 * MERIDIAN: Graph-Based Optimization Engine
 * Implements Minimum Spanning Tree (MST), Dijkstra Pathfinding, and
 * Multi-Objective Weighted Cost Functions balancing Algorithmic Flow with Community Penalties.
 */

class MeridianGraphEngine {
  constructor(data) {
    this.nodes = JSON.parse(JSON.stringify(data.nodes));
    this.edges = JSON.parse(JSON.stringify(data.edges));
    this.reports = JSON.parse(JSON.stringify(data.communityReports));

    // Dynamic Engine Parameters
    this.weights = {
      alphaDistance: 0.45,       // Weight on geometric distance / transit time
      betaCongestion: 0.35,      // Weight on existing traffic delays
      gammaCommunity: 0.65       // Weight on community preservation & safety penalty
    };

    this.activeScenario = 'hybrid'; // 'baseline' | 'algorithmic' | 'hybrid'
    this.selectedRoute = {
      source: "N_BKC_CONNECTOR",
      target: "N_PHOENIX_MALL"
    };

    this.recalculate();
  }

  // Update dynamic sliders
  updateWeights(alpha, beta, gamma) {
    this.weights.alphaDistance = parseFloat(alpha);
    this.weights.betaCongestion = parseFloat(beta);
    this.weights.gammaCommunity = parseFloat(gamma);
    return this.recalculate();
  }

  // Calculate dynamic weight for an edge based on scenario and parameters
  calculateEdgeWeight(edge, scenario = this.activeScenario) {
    const normLength = edge.lengthMeters / 1000.0; // km
    const normCongestion = edge.baselineCongestion; // 0.0 - 1.0

    if (scenario === 'baseline') {
      // Baseline raw impedance
      return normLength * (1.0 + normCongestion * 2.0);
    }

    if (scenario === 'algorithmic') {
      // Pure mathematical efficiency: minimize length and flow impedance, ignore community penalties
      return (normLength * 0.7) + (normCongestion * 0.3);
    }

    // Hybrid: Balance efficiency with community preservation & safety penalties
    // Cultural importance & citizen contestation add impedance to damaging modifications
    const communityPenaltyNorm = (edge.communityPenalty || 0) / 100.0;
    
    // Weight calculation
    const geometricCost = (normLength * this.weights.alphaDistance) + (normCongestion * this.weights.betaCongestion);
    const communityCost = (communityPenaltyNorm * this.weights.gammaCommunity);

    return geometricCost + communityCost;
  }

  // Disjoint Set Union (DSU) helper for Kruskal's MST
  findRoot(parent, i) {
    if (parent[i] === i) return i;
    parent[i] = this.findRoot(parent, parent[i]);
    return parent[i];
  }

  unionSets(parent, rank, x, y) {
    const rootX = this.findRoot(parent, x);
    const rootY = this.findRoot(parent, y);
    if (rootX !== rootY) {
      if (rank[rootX] < rank[rootY]) {
        parent[rootX] = rootY;
      } else if (rank[rootX] > rank[rootY]) {
        parent[rootY] = rootX;
      } else {
        parent[rootY] = rootX;
        rank[rootX]++;
      }
      return true;
    }
    return false;
  }

  // Compute Minimum Spanning Tree (Kruskal's Algorithm)
  computeMST(scenario = this.activeScenario) {
    const nodeMap = new Map();
    this.nodes.forEach((node, index) => nodeMap.set(node.id, index));

    const evaluatedEdges = this.edges.map(edge => ({
      ...edge,
      computedCost: this.calculateEdgeWeight(edge, scenario),
      u: nodeMap.get(edge.source),
      v: nodeMap.get(edge.target)
    })).filter(e => e.u !== undefined && e.v !== undefined);

    // Sort edges ascending by weight
    evaluatedEdges.sort((a, b) => a.computedCost - b.computedCost);

    const parent = [];
    const rank = [];
    for (let i = 0; i < this.nodes.length; i++) {
      parent[i] = i;
      rank[i] = 0;
    }

    const mstEdges = [];
    let totalMSTCost = 0;

    for (const edge of evaluatedEdges) {
      if (this.unionSets(parent, rank, edge.u, edge.v)) {
        mstEdges.push(edge);
        totalMSTCost += edge.computedCost;
        if (mstEdges.length === this.nodes.length - 1) break;
      }
    }

    return {
      mstEdges,
      totalMSTCost: totalMSTCost.toFixed(2),
      edgeCount: mstEdges.length
    };
  }

  // Dijkstra Shortest Path between two nodes
  computeShortestPath(sourceId, targetId, scenario = this.activeScenario) {
    const distances = {};
    const previous = {};
    const unvisited = new Set();
    const adjacency = new Map();

    this.nodes.forEach(node => {
      distances[node.id] = Infinity;
      previous[node.id] = null;
      unvisited.add(node.id);
      adjacency.set(node.id, []);
    });

    this.edges.forEach(edge => {
      const weight = this.calculateEdgeWeight(edge, scenario);
      adjacency.get(edge.source).push({ node: edge.target, weight, edge });
      adjacency.get(edge.target).push({ node: edge.source, weight, edge }); // undirected
    });

    distances[sourceId] = 0;

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let closestNode = null;
      let minDistance = Infinity;

      for (const nodeId of unvisited) {
        if (distances[nodeId] < minDistance) {
          minDistance = distances[nodeId];
          closestNode = nodeId;
        }
      }

      if (closestNode === null || distances[closestNode] === Infinity) break;
      if (closestNode === targetId) break;

      unvisited.delete(closestNode);

      const neighbors = adjacency.get(closestNode) || [];
      for (const neighbor of neighbors) {
        if (unvisited.has(neighbor.node)) {
          const alt = distances[closestNode] + neighbor.weight;
          if (alt < distances[neighbor.node]) {
            distances[neighbor.node] = alt;
            previous[neighbor.node] = {
              prevNode: closestNode,
              edge: neighbor.edge
            };
          }
        }
      }
    }

    // Reconstruct path
    const pathNodes = [];
    const pathEdges = [];
    let curr = targetId;

    while (curr && previous[curr]) {
      pathNodes.unshift(curr);
      pathEdges.unshift(previous[curr].edge);
      curr = previous[curr].prevNode;
    }
    if (curr === sourceId) {
      pathNodes.unshift(sourceId);
    }

    return {
      pathFound: pathNodes.length > 0 && pathNodes[0] === sourceId,
      pathNodes,
      pathEdges,
      totalCost: distances[targetId] !== Infinity ? distances[targetId].toFixed(2) : 0
    };
  }

  // Run full network recalculation
  recalculate() {
    const mstResult = this.computeMST(this.activeScenario);
    const shortestPathResult = this.computeShortestPath(
      this.selectedRoute.source,
      this.selectedRoute.target,
      this.activeScenario
    );

    // Compute dynamic scenario indicators based on community weight
    // As gamma increases, community score increases while commute time changes slightly
    const gamma = this.weights.gammaCommunity;
    const alpha = this.weights.alphaDistance;

    let commuteMinutes = 29.4;
    let commScore = 94.6;
    let algoScore = 88.5;

    if (this.activeScenario === 'baseline') {
      commuteMinutes = 38.6;
      commScore = 48.0;
      algoScore = 41.2;
    } else if (this.activeScenario === 'algorithmic') {
      commuteMinutes = 26.2;
      commScore = 23.5;
      algoScore = 94.2;
    } else {
      // Dynamic hybrid tuning
      commuteMinutes = (32.0 - (alpha * 6.5) + (gamma * 2.2)).toFixed(1);
      commScore = (60.0 + (gamma * 42.0) - (alpha * 12.0)).toFixed(1);
      commScore = Math.min(99.0, Math.max(35.0, commScore));
      algoScore = (70.0 + (alpha * 30.0) - (gamma * 8.0)).toFixed(1);
      algoScore = Math.min(98.0, Math.max(50.0, algoScore));
    }

    this.latestState = {
      scenario: this.activeScenario,
      mst: mstResult,
      shortestPath: shortestPathResult,
      metrics: {
        commuteMinutes,
        commScore,
        algoScore,
        networkEdgesTotal: this.edges.length,
        mstEdgeCount: mstResult.mstEdges.length
      }
    };

    return this.latestState;
  }
}

if (typeof window !== 'undefined') {
  window.MeridianGraphEngine = MeridianGraphEngine;
}

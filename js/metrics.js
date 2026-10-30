/**
 * MERIDIAN: Scenario Metrics & Analytics Dashboard Engine
 * Computes scenario deltas, renders Chart.js comparisons, and manages decision tracking.
 */

class MeridianMetricsEngine {
  constructor(data, graphEngine) {
    this.data = data;
    this.graph = graphEngine;
    this.chartInstance = null;
  }

  // Calculate live deltas compared to baseline
  getComparisonData(scenarioKey) {
    const base = this.data.scenarios.baseline.metrics;
    const target = this.data.scenarios[scenarioKey].metrics;

    const commuteDelta = (((target.avgCommuteMinutes - base.avgCommuteMinutes) / base.avgCommuteMinutes) * 100).toFixed(1);
    const distanceDelta = (((target.totalNetworkLengthKm - base.totalNetworkLengthKm) / base.totalNetworkLengthKm) * 100).toFixed(1);
    const congestionDelta = (((target.bottleneckCongestionIndex - base.bottleneckCongestionIndex) / base.bottleneckCongestionIndex) * 100).toFixed(1);
    const resourceDelta = (((target.resourceUtilityLossPercent - base.resourceUtilityLossPercent) / base.resourceUtilityLossPercent) * 100).toFixed(1);
    const cvsDelta = (target.communityValidationScore - base.communityValidationScore).toFixed(1);

    return {
      scenario: this.data.scenarios[scenarioKey],
      raw: target,
      deltas: {
        commute: (commuteDelta > 0 ? `+${commuteDelta}%` : `${commuteDelta}%`),
        distance: (distanceDelta > 0 ? `+${distanceDelta}%` : `${distanceDelta}%`),
        congestion: (congestionDelta > 0 ? `+${congestionDelta}%` : `${congestionDelta}%`),
        resource: (resourceDelta > 0 ? `+${resourceDelta}%` : `${resourceDelta}%`),
        cvs: (cvsDelta > 0 ? `+${cvsDelta}%` : `${cvsDelta}%`)
      }
    };
  }

  // Render Radar Chart comparing 3 Scenarios
  renderRadarChart(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');

    this.chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: [
          'Vehicular Flow',
          'Pedestrian Safety',
          'Market / Cultural Heritage',
          'Flood Resilience',
          'Capital Feasibility',
          'Resident Consensus'
        ],
        datasets: [
          {
            label: '1. Baseline Real-World (OSM)',
            data: [42, 48, 85, 30, 95, 48],
            backgroundColor: 'rgba(244, 63, 94, 0.15)',
            borderColor: '#f43f5e',
            borderWidth: 1.5,
            pointBackgroundColor: '#f43f5e',
            pointRadius: 3
          },
          {
            label: '2. Pure Algorithmic MST',
            data: [94, 38, 20, 45, 60, 23],
            backgroundColor: 'rgba(2, 132, 199, 0.15)',
            borderColor: '#0284c7',
            borderWidth: 1.5,
            pointBackgroundColor: '#0284c7',
            pointRadius: 3
          },
          {
            label: '3. Meridian Community Hybrid',
            data: [86, 95, 96, 92, 85, 95],
            backgroundColor: 'rgba(16, 185, 129, 0.25)',
            borderColor: '#10b981',
            borderWidth: 2,
            pointBackgroundColor: '#10b981',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(203, 213, 225, 0.4)' },
            grid: { color: 'rgba(203, 213, 225, 0.3)' },
            pointLabels: {
              font: { family: 'Geist', size: 10, weight: '500' },
              color: '#334155'
            },
            ticks: {
              display: false,
              backdropColor: 'transparent',
              stepSize: 20
            },
            suggestedMin: 0,
            suggestedMax: 100
          }
        },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              boxWidth: 10,
              font: { family: 'Geist', size: 11 },
              color: '#475569'
            }
          }
        }
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.MeridianMetricsEngine = MeridianMetricsEngine;
}

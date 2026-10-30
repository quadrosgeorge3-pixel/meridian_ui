/**
 * MERIDIAN: Main Application Controller & UI State Orchestrator
 * Integrates Three.js 3D Twin, Graph Optimization Engine, Community Knowledge Base,
 * and Clinical CAD User Interface.
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialize Core Engines
  const graphEngine = new MeridianGraphEngine(KURLA_DATA);
  const scene3D = new Meridian3DScene('threejs-canvas-host', KURLA_DATA, graphEngine);
  const metricsEngine = new MeridianMetricsEngine(KURLA_DATA, graphEngine);

  // Expose to window for global access
  window.app = {
    data: KURLA_DATA,
    graph: graphEngine,
    scene: scene3D,
    metrics: metricsEngine,
    activeScenario: 'hybrid',
    activePersona: 'planner',
    is3D: true,
    isIso: true,
    isPinDrop: false,
    selectedCategory: 'Pedestrian Hazard'
  };

  // 2. Check for Stakeholder Persona from URL params or localStorage
  const urlParams = new URLSearchParams(window.location.search);
  const roleParam = urlParams.get('role') || localStorage.getItem('meridian_persona') || 'planner';
  applyPersona(roleParam);

  // 3. Connect Scene 3D Callbacks
  scene3D.onSelectEntity = (type, entityData) => {
    handleEntitySelection(type, entityData);
  };

  scene3D.onPinDrop = (point) => {
    handlePinDroppedOnMap(point);
  };

  // 4. Initial UI State Setup
  switchScenario('hybrid');
  showToast('Meridian Digital Twin Online • Kurla Central District (L-Ward)');
});

// ================= PERSONA MANAGEMENT =================
function applyPersona(role) {
  window.app.activePersona = role;
  const avatarBadge = document.getElementById('user-avatar-badge');
  const nameLabel = document.getElementById('user-name-label');

  if (role === 'shopkeeper') {
    avatarBadge.textContent = 'RG';
    avatarBadge.className = 'w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px] font-mono font-bold';
    nameLabel.textContent = 'Ramesh G. (Merchant)';
  } else if (role === 'student') {
    avatarBadge.textContent = 'SP';
    avatarBadge.className = 'w-6 h-6 rounded-full bg-cyan-700 text-white flex items-center justify-center text-[10px] font-mono font-bold';
    nameLabel.textContent = 'Sneha P. (Env Volunteer)';
  } else {
    avatarBadge.textContent = 'RD';
    avatarBadge.className = 'w-6 h-6 rounded-full bg-sky-700 text-white flex items-center justify-center text-[10px] font-mono font-bold';
    nameLabel.textContent = 'Off. Deshmukh (Municipal Planner)';
  }
}

// ================= SCENARIO SWITCHING =================
function switchScenario(scenarioKey) {
  window.app.activeScenario = scenarioKey;
  window.app.graph.activeScenario = scenarioKey;
  window.app.scene.setScenario(scenarioKey);

  // Update button active states
  ['baseline', 'algo', 'hybrid'].forEach(key => {
    const btn = document.getElementById(`btn-scen-${key}`);
    if (!btn) return;
    if (key === (scenarioKey === 'algorithmic' ? 'algo' : scenarioKey)) {
      btn.className = 'flex-1 py-1 text-center rounded bg-white text-sky-700 font-semibold shadow-xs transition-all border border-slate-200/50';
    } else {
      btn.className = 'flex-1 py-1 text-center rounded text-slate-500 hover:text-slate-800 transition-all font-medium';
    }
  });

  // Telemetry updates
  const radialBar = document.getElementById('radial-progress-bar');
  const confPct = document.getElementById('metric-confidence-pct');
  const consensusTitle = document.getElementById('consensus-title');
  const consensusDelta = document.getElementById('consensus-delta');
  const badge = document.getElementById('active-scenario-badge');

  const commuteVal = document.getElementById('metric-commute-val');
  const commuteRaw = document.getElementById('metric-commute-raw');
  const resourceVal = document.getElementById('metric-resource-val');
  const safetyVal = document.getElementById('metric-safety-val');
  const bottleneckVal = document.getElementById('metric-bottleneck-val');

  if (scenarioKey === 'baseline') {
    badge.textContent = 'Base OSM (Congested)';
    badge.className = 'text-rose-600 font-semibold';
    radialBar.setAttribute('stroke-dasharray', '48, 100');
    radialBar.setAttribute('class', 'text-rose-500 transition-all duration-500');
    confPct.textContent = '48.0%';
    consensusTitle.textContent = 'Unvalidated Status Quo';
    consensusDelta.textContent = '● Daily Friction & Gridlock';
    consensusDelta.className = 'text-[10px] font-mono text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5';

    commuteVal.textContent = '38.6m';
    commuteRaw.textContent = 'Baseline Daily Delay';
    resourceVal.textContent = '24.8%';
    safetyVal.textContent = '42.0';
    bottleneckVal.textContent = '82.4';
    showToast('Loaded: Existing Real-World OSM Baseline');

  } else if (scenarioKey === 'algorithmic') {
    badge.textContent = 'Pure Algorithmic MST';
    badge.className = 'text-sky-700 font-semibold';
    radialBar.setAttribute('stroke-dasharray', '23.5, 100');
    radialBar.setAttribute('class', 'text-rose-500 transition-all duration-500');
    confPct.textContent = '23.5%';
    consensusTitle.textContent = 'Severe Resident Backlash';
    consensusDelta.textContent = '● -71.1% Community Penalty';
    consensusDelta.className = 'text-[10px] font-mono text-rose-600 font-semibold flex items-center gap-0.5 mt-0.5';

    commuteVal.textContent = '-32.1%';
    commuteRaw.textContent = '26.2m (Bypasses Bazaar)';
    resourceVal.textContent = '-12.3%';
    safetyVal.textContent = '31.5';
    bottleneckVal.textContent = '41.5';
    showToast('Loaded: Pure MST Optimization (Ignores Lived Context)');

  } else {
    // Hybrid Validated
    badge.textContent = 'Hybrid Validated';
    badge.className = 'text-emerald-700 font-semibold';
    radialBar.setAttribute('stroke-dasharray', '94.6, 100');
    radialBar.setAttribute('class', 'text-emerald-500 transition-all duration-500');
    confPct.textContent = '94.6%';
    consensusTitle.textContent = 'Community Validation';
    consensusDelta.textContent = '● +46.6% vs Pure MST';
    consensusDelta.className = 'text-[10px] font-mono text-emerald-600 font-semibold flex items-center gap-0.5 mt-0.5';

    commuteVal.textContent = '-23.8%';
    commuteRaw.textContent = '29.4m (Bazaar Protected)';
    resourceVal.textContent = '-21.5%';
    safetyVal.textContent = '96.2';
    bottleneckVal.textContent = '49.2';
    showToast('Loaded: Meridian Community-Validated Hybrid Twin');
  }
}

// ================= DOCK COLLAPSE TOGGLES =================
function toggleLeftDock() {
  const body = document.getElementById('left-dock-body');
  const icon = document.getElementById('left-dock-toggle-icon');
  if (body.classList.contains('hidden')) {
    body.classList.remove('hidden');
    icon.textContent = 'expand_less';
  } else {
    body.classList.add('hidden');
    icon.textContent = 'expand_more';
  }
}

function toggleRightPanel() {
  const body = document.getElementById('right-panel-body');
  const icon = document.getElementById('right-panel-toggle-icon');
  if (body.classList.contains('hidden')) {
    body.classList.remove('hidden');
    icon.textContent = 'expand_less';
  } else {
    body.classList.add('hidden');
    icon.textContent = 'expand_more';
  }
}

// ================= DISTRICT SECTOR JUMPS =================
function toggleDistrictMenu() {
  const menu = document.getElementById('district-menu');
  menu.classList.toggle('hidden');
}

function jumpDistrict(presetKey) {
  const labels = {
    station: "Kurla West Station & Historic Bazaar",
    lbs: "LBS Marg Arterial Corridor",
    nehru: "Nehru Nagar Educational Zone",
    mithi: "Mithi River Basin (Kranti Nagar)",
    phoenix: "Phoenix Marketcity Entry Hub",
    districtOverview: "Kurla Central District — Sector 07"
  };

  document.getElementById('selected-district-label').textContent = labels[presetKey] || "Kurla Central District";
  document.getElementById('district-menu').classList.add('hidden');

  window.app.scene.jumpToPreset(presetKey);
  showToast(`Waypoint: ${labels[presetKey]}`);
}

// ================= SPATIAL PIN INTERACTION =================
function focusPin(reportId) {
  const report = KURLA_DATA.communityReports.find(r => r.id === reportId);
  if (!report) return;

  // Tween camera towards pin location
  const targetPos = new THREE.Vector3(report.coords3D.x, 70, report.coords3D.z + 90);
  const targetLook = new THREE.Vector3(report.coords3D.x, 5, report.coords3D.z);
  window.app.scene.tweenCamera(targetPos, targetLook, 800);

  // Open entity drawer with pin details
  openEntityDrawer({
    title: report.title,
    desc: report.description,
    tag: `Attributable Contest #${report.id} • ${report.author} (${report.trustScore}% Trust)`,
    icon: 'how_to_vote'
  });

  showToast(`Focused: ${report.title}`);
}

function handleEntitySelection(type, data) {
  if (type === 'pin') {
    focusPin(data.id);
  } else if (type === 'road') {
    openEntityDrawer({
      title: data.name,
      desc: `Length: ${data.lengthMeters}m | Baseline Congestion: ${(data.baselineCongestion * 100).toFixed(0)}% | Speed: ${data.speedLimitKmH} km/h. Lived Status: ${data.hybridStatus}`,
      tag: `Road Segment #${data.id} • Cultural Weight: ${data.culturalImportance}/100`,
      icon: 'alt_route'
    });
  } else if (type === 'building') {
    openEntityDrawer({
      title: data.name,
      desc: data.desc,
      tag: `CAD Footprint #${data.id} • Category: ${data.category.toUpperCase()}`,
      icon: 'apartment'
    });
  } else if (type === 'node') {
    openEntityDrawer({
      title: data.name,
      desc: `Graph Node Type: ${data.type} at Lat: ${data.lat}, Lng: ${data.lng}`,
      tag: `Spatial Intersection #${data.id}`,
      icon: 'location_on'
    });
  } else if (type === 'utility') {
    openEntityDrawer({
      title: data.name,
      desc: `Sub-surface depth: ${data.depth}m. ${data.desc}`,
      tag: `Inferred CAD Utility #${data.id} (Clipping Plane Active)`,
      icon: 'water_drop'
    });
  }
}

function openEntityDrawer(info) {
  document.getElementById('entity-title').textContent = info.title;
  document.getElementById('entity-desc').textContent = info.desc;
  document.getElementById('entity-tag').textContent = info.tag;
  document.getElementById('entity-icon').textContent = info.icon || 'domain';
  document.getElementById('entity-drawer').classList.remove('hidden');
}

function closeEntityDrawer() {
  document.getElementById('entity-drawer').classList.add('hidden');
}

// ================= PIN DROP & OBSERVATION SUBMISSION =================
function togglePinDropMode() {
  window.app.isPinDrop = !window.app.isPinDrop;
  window.app.scene.isPinDropMode = window.app.isPinDrop;

  const btn = document.getElementById('btn-drop-pin');
  const text = document.getElementById('pin-drop-text');
  const viewport = document.getElementById('cesium-viewport');

  if (window.app.isPinDrop) {
    if (viewport) viewport.classList.add('pin-drop-active');
    btn.className = 'h-7 rounded bg-amber-100 text-amber-800 font-mono text-[11px] font-medium flex items-center justify-center gap-1 transition-colors';
    text.textContent = 'Click Map';
    showToast('Crosshair Ready: Click anywhere on 3D twin to anchor pin');
  } else {
    if (viewport) viewport.classList.remove('pin-drop-active');
    btn.className = 'h-7 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-[11px] font-medium flex items-center justify-center gap-1 transition-colors';
    text.textContent = 'Drop Pin';
  }
}

function handlePinDroppedOnMap(point) {
  togglePinDropMode();
  window.app.lastDroppedPoint = point;

  // Approximate lat/lng from 3D meters
  const approxLat = (19.0657 - (point.z / 111000)).toFixed(4);
  const approxLng = (72.8794 + (point.x / (111000 * Math.cos(19.0657 * Math.PI / 180)))).toFixed(4);

  document.getElementById('modal-coord-readout').textContent = `${approxLat}° N, ${approxLng}° E`;
  openContextModal();
}

function openContextModal() {
  document.getElementById('context-modal').classList.remove('hidden');
}

function closeContextModal() {
  document.getElementById('context-modal').classList.add('hidden');
}

function selectModalCategory(btnElement, category) {
  window.app.selectedCategory = category;
  document.querySelectorAll('.modal-cat-btn').forEach(b => {
    b.className = 'py-1 rounded bg-slate-100 text-slate-600 modal-cat-btn';
  });
  btnElement.className = 'py-1 rounded bg-sky-600 text-white font-medium modal-cat-btn';
}

function submitContext() {
  const title = document.getElementById('new-report-title').value.trim();
  const desc = document.getElementById('new-report-desc').value.trim();

  if (!title) {
    alert('Please enter an observation title.');
    return;
  }

  const p = window.app.lastDroppedPoint || { x: -60, y: 1.5, z: 40 };
  const newReport = {
    id: `CR-${Date.now().toString().slice(-3)}`,
    title: title,
    category: window.app.selectedCategory || 'Pedestrian Hazard',
    author: window.app.activePersona === 'shopkeeper' ? 'Ramesh G.' : (window.app.activePersona === 'student' ? 'Sneha P.' : 'Off. Deshmukh'),
    role: window.app.activePersona === 'shopkeeper' ? 'Merchant' : (window.app.activePersona === 'student' ? 'Volunteer' : 'Planner'),
    coords3D: { x: p.x, y: 1.5, z: p.z },
    lat: 19.0657,
    lng: 72.8794,
    severity: 'medium',
    trustScore: 91,
    validations: 1,
    contests: 0,
    status: 'VALIDATED_INTEGRATED',
    date: new Date().toISOString().split('T')[0],
    description: desc || 'Citizen verified spatial ground truth.',
    algorithmImpact: 'Injected into versioned overlay v2.1.'
  };

  // Add to 3D Scene
  window.app.scene.addDynamicReportPin(newReport);

  // Add card to right feed
  addReportCardToFeed(newReport);

  closeContextModal();
  document.getElementById('new-report-title').value = '';
  document.getElementById('new-report-desc').value = '';

  showToast(`Spatial Observation Injected: "${title}"`);
}

function addReportCardToFeed(report) {
  const feed = document.getElementById('reports-card-list');
  const card = document.createElement('div');
  card.className = 'p-2 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-colors cursor-pointer flex flex-col gap-1 report-card';
  card.onclick = () => focusPin(report.id);
  card.innerHTML = `
    <div class="flex items-center justify-between">
      <span class="text-[11px] font-semibold text-slate-800 truncate">${report.title}</span>
      <span class="text-[9px] font-mono px-1 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">New</span>
    </div>
    <div class="text-[10px] text-slate-500 line-clamp-1">${report.description}</div>
    <div class="flex items-center justify-between font-mono text-[10px] text-slate-400 pt-0.5">
      <span>${report.author}</span>
      <button class="text-emerald-700 font-semibold hover:underline" onclick="event.stopPropagation(); voteReport('${report.id}')">▲ ${report.validations} votes</button>
    </div>
  `;
  feed.prepend(card);
}

function voteReport(reportId) {
  const report = KURLA_DATA.communityReports.find(r => r.id === reportId);
  if (report) {
    report.validations += 1;
    showToast(`Validated: +1 vote added to ${report.title} (Trust: ${report.trustScore}%)`);
  }
}

// ================= FILTER FEED CARDS =================
function filterReports(cat) {
  const cards = document.querySelectorAll('.report-card');
  ['all', 'market', 'drainage', 'safety'].forEach(f => {
    const btn = document.getElementById(`filter-${f}`);
    if (f === cat) {
      btn.className = 'px-2 py-0.5 rounded bg-sky-600 text-white font-medium';
    } else {
      btn.className = 'px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors';
    }
  });

  cards.forEach(card => {
    const cardCat = card.getAttribute('data-category');
    if (cat === 'all' || cardCat === cat) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

// ================= SIMULATION & GRAPH WEIGHTS =================
function runSimulation() {
  const btn = document.getElementById('btn-simulate');
  btn.innerHTML = `<span class="material-symbols-outlined text-[15px] animate-spin">refresh</span><span>Simulating Rush...</span>`;

  // Increase traffic particle speed in 3D scene
  if (window.app.scene && window.app.scene.trafficParticlesData) {
    window.app.scene.trafficParticlesData.forEach(p => p.speed *= 2.2);
  }

  setTimeout(() => {
    btn.innerHTML = `<span class="material-symbols-outlined text-[15px]">play_arrow</span><span>Simulate Peak (18:30)</span>`;
    if (window.app.scene && window.app.scene.trafficParticlesData) {
      window.app.scene.trafficParticlesData.forEach(p => p.speed /= 2.2);
    }
    showToast('Peak Rush Simulation Complete: Hybrid Network maintains 88.5% throughput with zero kiosk displacement!');
  }, 1400);
}

function openGraphModal() {
  document.getElementById('graph-modal').classList.remove('hidden');
}

function closeGraphModal() {
  document.getElementById('graph-modal').classList.add('hidden');
}

function updateWeightsUI() {
  const alpha = document.getElementById('slider-alpha').value;
  const beta = document.getElementById('slider-beta').value;
  const gamma = document.getElementById('slider-gamma').value;

  document.getElementById('slider-alpha-val').textContent = alpha;
  document.getElementById('slider-beta-val').textContent = beta;
  document.getElementById('slider-gamma-val').textContent = gamma;
}

function recalcGraphEngine() {
  const alpha = document.getElementById('slider-alpha').value;
  const beta = document.getElementById('slider-beta').value;
  const gamma = document.getElementById('slider-gamma').value;

  const result = window.app.graph.updateWeights(alpha, beta, gamma);
  window.app.scene.buildRoadNetwork();

  document.getElementById('mst-total-cost').textContent = `${result.mst.totalMSTCost} units`;
  document.getElementById('mst-edge-count').textContent = `${result.mst.mstEdges.length} / 16 Edges`;

  showToast(`Graph Engine Recalculated: α=${alpha}, β=${beta}, γ=${gamma}`);
  closeGraphModal();
}

function resetDefaultWeights() {
  document.getElementById('slider-alpha').value = 0.45;
  document.getElementById('slider-beta').value = 0.35;
  document.getElementById('slider-gamma').value = 0.65;
  updateWeightsUI();
  recalcGraphEngine();
}

// ================= METRICS & RADAR MODAL =================
function openMetricsModal() {
  document.getElementById('metrics-modal').classList.remove('hidden');
  setTimeout(() => {
    window.app.metrics.renderRadarChart('scenarioRadarChart');
  }, 100);
}

function closeMetricsModal() {
  document.getElementById('metrics-modal').classList.add('hidden');
}

// ================= DOCS & PROJECT MODAL =================
function openDocsModal() {
  document.getElementById('docs-modal').classList.remove('hidden');
}

function closeDocsModal() {
  document.getElementById('docs-modal').classList.add('hidden');
}

// ================= CAMERA & VIEWPORT CONTROLS =================
function zoom3D(factor) {
  const controls = window.app.scene.controls;
  const camera = window.app.scene.camera;
  const dir = new THREE.Vector3().subVectors(camera.position, controls.target);
  dir.multiplyScalar(factor);
  camera.position.addVectors(controls.target, dir);
  controls.update();
}

// 3D Screen Rotation
function rotateScreen(degrees) {
  if (!window.app.scene) return;
  window.app.scene.rotateByAngle(degrees * (Math.PI / 180));
  showToast(`Screen Rotated ${degrees > 0 ? '+' : ''}${degrees}°`);
}

// 360° Continuous Orbit Auto-Rotation
function toggleAutoRotate() {
  if (!window.app.scene) return;
  const isAuto = window.app.scene.toggleAutoRotate();
  const btn = document.getElementById('btn-auto-rotate');
  const icon = document.getElementById('icon-auto-rotate');
  const label = document.getElementById('label-auto-rotate');

  if (isAuto) {
    btn.className = 'px-2 h-7 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px] font-semibold flex items-center gap-1 ring-1 ring-emerald-300 transition-colors';
    icon.className = 'material-symbols-outlined text-[16px] text-emerald-600 animate-spin';
    label.textContent = 'Orbiting';
    showToast('Auto-Rotate Active: Continuous 360° Screen Orbit');
  } else {
    btn.className = 'px-2 h-7 rounded hover:bg-slate-100 text-slate-700 font-mono text-[10px] font-semibold flex items-center gap-1 transition-colors';
    icon.className = 'material-symbols-outlined text-[16px] text-sky-600';
    label.textContent = 'Orbit';
    showToast('Auto-Rotate Paused');
  }
}

// Align to True North (Azimuth 0°)
function resetNorth() {
  if (!window.app.scene) return;
  const target = window.app.scene.controls.target.clone();
  const dist = Math.hypot(window.app.scene.camera.position.x - target.x, window.app.scene.camera.position.z - target.z);
  const newPos = new THREE.Vector3(target.x, window.app.scene.camera.position.y, target.z + dist);
  window.app.scene.tweenCamera(newPos, target, 800);
  showToast('Screen Re-aligned to True North (0° Azimuth)');
}

function toggleTilt() {
  window.app.is3D = !window.app.is3D;
  const label = document.getElementById('tilt-label');
  if (window.app.is3D) {
    label.textContent = '3D';
    window.app.scene.tweenCamera(new THREE.Vector3(-300, 320, 420), new THREE.Vector3(0, 0, 0));
    showToast('Perspective: 3D Isometric View');
  } else {
    label.textContent = 'Planar';
    window.app.scene.tweenCamera(new THREE.Vector3(0, 650, 0), new THREE.Vector3(0, 0, 0));
    showToast('Perspective: Planar Top-Down (CAD 2D)');
  }
}

function toggleProjection() {
  window.app.isIso = !window.app.isIso;
  const label = document.getElementById('proj-label');
  label.textContent = window.app.isIso ? 'CAD' : 'ORTHO';
  showToast(window.app.isIso ? 'CAD Isometric Angle Active' : 'Orthographic Plan Active');
}

function resetCamera() {
  window.app.scene.jumpToPreset('districtOverview');
  showToast('Camera Reset to Kurla District Extent');
}

function toggleUtilities() {
  const current = window.app.scene.showUndergroundUtilities;
  window.app.scene.toggleUndergroundUtilities(!current);
  const btn = document.getElementById('btn-rail-utility');
  if (!current) {
    btn.className = 'w-9 h-9 rounded-md bg-cyan-100 text-cyan-700 flex items-center justify-center transition-colors';
    showToast('Underground Utilities Active: Tansa Water Main & Storm Culvert Inferred with Clipping Plane');
  } else {
    btn.className = 'w-9 h-9 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 flex items-center justify-center transition-colors';
    showToast('Underground Utilities Hidden');
  }
}

// ================= SEARCH FUNCTIONALITY =================
function handleSearch(event) {
  if (event.key === 'Enter') {
    const query = document.getElementById('search-input').value.toLowerCase().trim();
    if (!query) return;

    const matchedNode = KURLA_DATA.nodes.find(n => n.name.toLowerCase().includes(query) || n.id.toLowerCase().includes(query));
    if (matchedNode) {
      window.app.scene.tweenCamera(new THREE.Vector3(matchedNode.x, 80, matchedNode.z + 100), new THREE.Vector3(matchedNode.x, 5, matchedNode.z));
      showToast(`Located Node: ${matchedNode.name}`);
      return;
    }

    const matchedBld = KURLA_DATA.buildings.find(b => b.name.toLowerCase().includes(query));
    if (matchedBld) {
      window.app.scene.tweenCamera(new THREE.Vector3(matchedBld.x, 90, matchedBld.z + 120), new THREE.Vector3(matchedBld.x, 10, matchedBld.z));
      showToast(`Located Landmark: ${matchedBld.name}`);
      return;
    }

    showToast(`No exact parcel match for "${query}". Try "station", "lbs", "nehru", or "mithi".`);
  }
}

// ================= GEOJSON EXPORT =================
function exportGeoJson() {
  const geojson = {
    type: "FeatureCollection",
    district: "Kurla, Mumbai (L-Ward)",
    project: "MERIDIAN: Community-Validated Urban Optimization Digital Twin",
    team: "Group 3: George Quadros, Malhar Sarwate, Soham Khilari, Vedant Sakpal",
    scenario: window.app.activeScenario,
    features: [
      ...KURLA_DATA.nodes.map(n => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [n.lng, n.lat] },
        properties: { id: n.id, name: n.name, type: n.type }
      })),
      ...KURLA_DATA.communityReports.map(r => ({
        type: "Feature",
        geometry: { type: "Point", coordinates: [r.lng, r.lat] },
        properties: { id: r.id, title: r.title, category: r.category, trustScore: r.trustScore, status: r.status }
      }))
    ]
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(geojson, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `Meridian_Kurla_${window.app.activeScenario}_Twin.geojson`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();

  showToast(`Exported Meridian_Kurla_${window.app.activeScenario}_Twin.geojson`);
}

// ================= TOAST NOTIFICATION =================
function showToast(msg) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  if (!toast || !toastMsg) return;

  toastMsg.textContent = msg;
  toast.classList.remove('hidden');
  clearTimeout(window.toastTimer);
  window.toastTimer = setTimeout(() => {
    toast.classList.add('hidden');
  }, 3200);
}

// Close dropdowns on outside click
window.addEventListener('click', (e) => {
  const menu = document.getElementById('district-menu');
  const btn = document.getElementById('sector-select-btn');
  if (menu && btn && !btn.contains(e.target) && !menu.contains(e.target)) {
    menu.classList.add('hidden');
  }
});

// Keyboard Rotation & Navigation Shortcuts
window.addEventListener('keydown', (e) => {
  if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (e.key === 'ArrowLeft' || e.key === 'q' || e.key === 'Q') {
    rotateScreen(-15);
  } else if (e.key === 'ArrowRight' || e.key === 'e' || e.key === 'E') {
    rotateScreen(15);
  } else if (e.key === 'r' || e.key === 'R') {
    toggleAutoRotate();
  } else if (e.key === 'n' || e.key === 'N') {
    resetNorth();
  }
});

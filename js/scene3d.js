/**
 * MERIDIAN: 3D Urban Digital Twin Rendering Engine
 * Geo-accurate Kurla District Visualization with CAD Flat-Shaded Aesthetic,
 * Frustum/LOD Optimization, Underground Utility Clipping Planes & Raycasting.
 */

class Meridian3DScene {
  constructor(containerId, data, graphEngine) {
    this.container = document.getElementById(containerId);
    this.data = data;
    this.graph = graphEngine;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.controls = null;
    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // Scene groups
    this.groundGroup = new THREE.Group();
    this.buildingsGroup = new THREE.Group();
    this.roadsGroup = new THREE.Group();
    this.utilitiesGroup = new THREE.Group();
    this.pinsGroup = new THREE.Group();
    this.trafficParticlesGroup = new THREE.Group();

    // Clipping plane for underground utility visualization
    this.globalClippingPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 0);
    this.showUndergroundUtilities = false;
    this.showMSTOnly = false;
    this.showPathOnly = false;
    this.activeScenario = 'hybrid';

    // Interactive selection
    this.hoveredObject = null;
    this.selectedObject = null;
    this.isPinDropMode = false;

    // Callbacks
    this.onSelectEntity = null;
    this.onPinDrop = null;

    this.init();
  }

  init() {
    const width = this.container.clientWidth || window.innerWidth;
    const height = this.container.clientHeight || window.innerHeight;

    // 1. Scene setup with CAD background
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0b0f17);
    this.scene.fog = new THREE.FogExp2(0x0b0f17, 0.0012);

    // 2. Camera setup (Perspective with CAD isometric defaults)
    this.camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    this.camera.position.set(-300, 320, 420);

    // 3. Renderer with anti-aliasing and clipping planes enabled
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.localClippingEnabled = true;
    this.renderer.shadowMap.enabled = false; // Flat-shaded CAD style optimized for consumer hardware
    this.container.appendChild(this.renderer.domElement);

    // 4. Orbit Controls with smooth damping & free screen rotation
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enableRotate = true;
    this.controls.rotateSpeed = 1.0;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.04; // Prevent camera going below ground
    this.controls.minDistance = 30;
    this.controls.maxDistance = 1600;
    this.controls.target.set(0, 0, 0);
    this.controls.autoRotate = false;
    this.controls.autoRotateSpeed = 2.0;

    // Track mouse drag distance to distinguish between screen rotation and clicking
    this.mouseDownPos = { x: 0, y: 0 };
    this.container.addEventListener('mousedown', (e) => {
      this.mouseDownPos.x = e.clientX;
      this.mouseDownPos.y = e.clientY;
    });

    // 5. Lighting (Clean CAD architectural illumination)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x38bdf8, 0.6);
    dirLight1.position.set(200, 400, 200);
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x94a3b8, 0.4);
    dirLight2.position.set(-200, 200, -200);
    this.scene.add(dirLight2);

    // 6. Build Hierarchy
    this.scene.add(this.groundGroup);
    this.scene.add(this.buildingsGroup);
    this.scene.add(this.roadsGroup);
    this.scene.add(this.utilitiesGroup);
    this.scene.add(this.pinsGroup);
    this.scene.add(this.trafficParticlesGroup);

    // 7. Construct Geo-Accurate Kurla Layout
    this.buildTerrainAndFeatures();
    this.buildCADBuildings();
    this.buildRoadNetwork();
    this.buildUndergroundUtilities();
    this.buildCommunityPins();
    this.initTrafficParticles();

    // 8. Event listeners
    window.addEventListener('resize', () => this.onWindowResize());
    this.container.addEventListener('mousemove', (e) => this.onMouseMove(e));
    this.container.addEventListener('click', (e) => this.onClick(e));

    // 9. Start Animation Loop
    this.animate();
  }

  buildTerrainAndFeatures() {
    this.groundGroup.clear();

    // Main Ground Grid Plane
    const groundGeo = new THREE.PlaneGeometry(1600, 1600, 32, 32);
    const groundMat = new THREE.MeshBasicMaterial({
      color: 0x0f172a,
      wireframe: false,
      transparent: true,
      opacity: 0.95
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.5;
    ground.userData = { type: 'ground' };
    this.groundGroup.add(ground);

    // CAD Grid helper
    const grid = new THREE.GridHelper(1600, 80, 0x0284c7, 0x1e293b);
    grid.position.y = -0.2;
    this.groundGroup.add(grid);

    // Mithi River Ribbon on the West
    const riverCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-360, 0.2, -500),
      new THREE.Vector3(-340, 0.2, -250),
      new THREE.Vector3(-350, 0.2, 0),
      new THREE.Vector3(-390, 0.2, 300),
      new THREE.Vector3(-450, 0.2, 500)
    ]);
    const riverGeo = new THREE.TubeGeometry(riverCurve, 40, 30, 8, false);
    const riverMat = new THREE.MeshBasicMaterial({
      color: 0x0284c7,
      transparent: true,
      opacity: 0.55
    });
    const riverMesh = new THREE.Mesh(riverGeo, riverMat);
    riverMesh.scale.set(1, 0.05, 1);
    riverMesh.userData = { type: 'landmark', name: 'Mithi River Basin (Ecological & Flood Plain Buffer)' };
    this.groundGroup.add(riverMesh);

    // Central & Harbour Railway Track Corridor running through Kurla Station
    const trackGeo = new THREE.PlaneGeometry(28, 1100);
    const trackMat = new THREE.MeshBasicMaterial({
      color: 0x334155,
      transparent: true,
      opacity: 0.8
    });
    const track = new THREE.Mesh(trackGeo, trackMat);
    track.rotation.x = -Math.PI / 2;
    track.position.set(10, 0.1, 0);
    track.userData = { type: 'railway', name: 'Central & Harbour Line Suburban Rail Corridor' };
    this.groundGroup.add(track);

    // Railway rails (white dashed lines)
    const railsHelper = new THREE.GridHelper(1100, 44, 0x64748b, 0x475569);
    railsHelper.scale.set(0.024, 1, 1);
    railsHelper.position.set(10, 0.3, 0);
    this.groundGroup.add(railsHelper);
  }

  buildCADBuildings() {
    this.buildingsGroup.clear();

    const buildingMaterial = new THREE.MeshLambertMaterial({
      color: 0x1e293b,
      flatShading: true,
      transparent: true,
      opacity: 0.92
    });

    const highlightMaterials = {
      transit: new THREE.MeshLambertMaterial({ color: 0x0284c7, flatShading: true }),
      commercial: new THREE.MeshLambertMaterial({ color: 0x38bdf8, flatShading: true }),
      civic: new THREE.MeshLambertMaterial({ color: 0xf59e0b, flatShading: true }),
      historic: new THREE.MeshLambertMaterial({ color: 0x10b981, flatShading: true }),
      residential: new THREE.MeshLambertMaterial({ color: 0x334155, flatShading: true }),
      utility: new THREE.MeshLambertMaterial({ color: 0x06b6d4, flatShading: true })
    };

    const edgeMaterial = new THREE.LineBasicMaterial({
      color: 0x475569,
      linewidth: 1
    });

    this.data.buildings.forEach(b => {
      const geo = new THREE.BoxGeometry(b.width, b.height, b.length);
      const mat = highlightMaterials[b.category] || buildingMaterial;
      const mesh = new THREE.Mesh(geo, mat);

      mesh.position.set(b.x, b.height / 2, b.z);
      mesh.userData = {
        type: 'building',
        data: b
      };

      // CAD Wireframe Edges
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(line);

      this.buildingsGroup.add(mesh);
    });

    // Procedural surrounding generic CAD blocks for urban density
    const seedPositions = [
      { x: -100, z: -180, w: 35, l: 45, h: 22 },
      { x: -70, z: -240, w: 40, l: 50, h: 28 },
      { x: -160, z: -100, w: 30, l: 30, h: 18 },
      { x: -110, z: 70, w: 45, l: 35, h: 24 },
      { x: -60, z: 220, w: 50, l: 40, h: 20 },
      { x: 130, z: -160, w: 35, l: 60, h: 26 },
      { x: 180, z: -210, w: 45, l: 45, h: 22 },
      { x: 140, z: 180, w: 55, l: 40, h: 24 },
      { x: 230, z: 190, w: 50, l: 45, h: 20 },
      { x: 300, z: -160, w: 40, l: 40, h: 18 },
      { x: -280, z: 20, w: 35, l: 50, h: 22 },
      { x: -290, z: 180, w: 40, l: 45, h: 25 },
      { x: -30, z: -320, w: 45, l: 55, h: 30 },
      { x: 70, z: -350, w: 40, l: 45, h: 24 },
      { x: -290, z: -300, w: 35, l: 60, h: 26 }
    ];

    seedPositions.forEach((pos, idx) => {
      const geo = new THREE.BoxGeometry(pos.w, pos.h, pos.l);
      const mesh = new THREE.Mesh(geo, buildingMaterial);
      mesh.position.set(pos.x, pos.h / 2, pos.z);
      mesh.userData = {
        type: 'building_generic',
        name: `Urban District Infill Parcel #${100 + idx}`,
        category: 'residential_commercial'
      };
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, edgeMaterial);
      mesh.add(line);
      this.buildingsGroup.add(mesh);
    });
  }

  buildRoadNetwork() {
    this.roadsGroup.clear();

    const nodeLookup = new Map();
    this.data.nodes.forEach(n => nodeLookup.set(n.id, n));

    const mstResult = this.graph.computeMST(this.activeScenario);
    const mstEdgeIds = new Set(mstResult.mstEdges.map(e => e.id));

    this.data.edges.forEach(edge => {
      const u = nodeLookup.get(edge.source);
      const v = nodeLookup.get(edge.target);
      if (!u || !v) return;

      const p1 = new THREE.Vector3(u.x, 0.8, u.z);
      const p2 = new THREE.Vector3(v.x, 0.8, v.z);

      const distance = p1.distanceTo(p2);
      const midPoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);

      // Color coding depending on active scenario
      let roadColor = 0x38bdf8; // default cyan
      let roadWidth = 5.5;

      if (this.activeScenario === 'baseline') {
        // High congestion = red/amber
        if (edge.baselineCongestion > 0.8) {
          roadColor = 0xf43f5e; // red
        } else if (edge.baselineCongestion > 0.6) {
          roadColor = 0xf59e0b; // amber
        } else {
          roadColor = 0x10b981; // green
        }
      } else if (this.activeScenario === 'algorithmic') {
        // Pure MST links are bright cyan, discarded links are dim grey
        if (mstEdgeIds.has(edge.id)) {
          roadColor = 0x06b6d4; // bright cyan
          roadWidth = 6.5;
        } else {
          roadColor = 0x475569; // pruned edge
          roadWidth = 3.0;
        }
      } else if (this.activeScenario === 'hybrid') {
        // Community-validated hybrid:
        // Protected pedestrian/heritage corridors = emerald green
        if (edge.culturalImportance > 75) {
          roadColor = 0x10b981; // emerald
          roadWidth = 6.0;
        } else if (mstEdgeIds.has(edge.id)) {
          roadColor = 0x38bdf8; // arterial blue
          roadWidth = 6.0;
        } else {
          roadColor = 0x64748b; // local collector
          roadWidth = 4.0;
        }
      }

      // Create roadway mesh
      const roadGeo = new THREE.BoxGeometry(roadWidth, 0.6, distance);
      const roadMat = new THREE.MeshBasicMaterial({
        color: roadColor,
        transparent: true,
        opacity: 0.95
      });
      const roadMesh = new THREE.Mesh(roadGeo, roadMat);

      roadMesh.position.copy(midPoint);
      roadMesh.lookAt(p2);
      roadMesh.rotateY(Math.PI / 2); // align along orientation

      roadMesh.userData = {
        type: 'road',
        data: edge,
        sourceNode: u,
        targetNode: v,
        isMST: mstEdgeIds.has(edge.id)
      };

      // Add center dashed line
      const lineGeo = new THREE.BufferGeometry().setFromPoints([p1, p2]);
      const lineMat = new THREE.LineDashedMaterial({
        color: 0xffffff,
        dashSize: 3,
        gapSize: 2,
        linewidth: 1
      });
      const centerLine = new THREE.Line(lineGeo, lineMat);
      centerLine.computeLineDistances();
      centerLine.position.y += 0.4;
      roadMesh.add(centerLine);

      this.roadsGroup.add(roadMesh);
    });

    // Add Intersection Node Markers
    this.data.nodes.forEach(node => {
      const nodeGeo = new THREE.CylinderGeometry(4.5, 4.5, 1.2, 16);
      const nodeMat = new THREE.MeshBasicMaterial({
        color: 0x38bdf8,
        wireframe: false
      });
      const nodeMesh = new THREE.Mesh(nodeGeo, nodeMat);
      nodeMesh.position.set(node.x, 1.0, node.z);
      nodeMesh.userData = {
        type: 'intersection',
        data: node
      };
      this.roadsGroup.add(nodeMesh);
    });
  }

  buildUndergroundUtilities() {
    this.utilitiesGroup.clear();

    const pipeMatWater = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.4,
      clippingPlanes: this.showUndergroundUtilities ? [] : [this.globalClippingPlane]
    });
    const pipeMatDrain = new THREE.MeshStandardMaterial({
      color: 0x14b8a6,
      roughness: 0.4,
      clippingPlanes: this.showUndergroundUtilities ? [] : [this.globalClippingPlane]
    });
    const pipeMatPower = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.4,
      clippingPlanes: this.showUndergroundUtilities ? [] : [this.globalClippingPlane]
    });

    this.data.undergroundUtilities.forEach(util => {
      const points = util.path.map(p => new THREE.Vector3(p.x, util.depth, p.z));
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 2.5, 8, false);

      let mat = pipeMatWater;
      if (util.id.includes('STORM')) mat = pipeMatDrain;
      if (util.id.includes('POWER')) mat = pipeMatPower;

      const mesh = new THREE.Mesh(tubeGeo, mat);
      mesh.userData = {
        type: 'utility',
        data: util
      };
      this.utilitiesGroup.add(mesh);
    });

    this.utilitiesGroup.visible = this.showUndergroundUtilities;
  }

  buildCommunityPins() {
    this.pinsGroup.clear();

    this.data.communityReports.forEach(report => {
      const pinGroup = new THREE.Group();
      pinGroup.position.set(report.coords3D.x, report.coords3D.y, report.coords3D.z);

      // Pin Needle
      const needleGeo = new THREE.CylinderGeometry(0.3, 0.3, 14, 8);
      const needleMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const needle = new THREE.Mesh(needleGeo, needleMat);
      needle.position.y = 7;
      pinGroup.add(needle);

      // Pin Head (Sphere)
      let pinColor = 0x38bdf8;
      if (report.severity === 'critical') pinColor = 0xf43f5e;
      else if (report.category.includes('Cultural')) pinColor = 0x10b981;
      else if (report.category.includes('Flood')) pinColor = 0x06b6d4;

      const headGeo = new THREE.SphereGeometry(3.5, 16, 16);
      const headMat = new THREE.MeshBasicMaterial({ color: pinColor });
      const head = new THREE.Mesh(headGeo, headMat);
      head.position.y = 14;
      pinGroup.add(head);

      // Outer Pulse Ring
      const ringGeo = new THREE.RingGeometry(4.5, 6.0, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.65
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.y = 14;
      ring.rotation.x = Math.PI / 2;
      ring.userData = { isPulseRing: true };
      pinGroup.add(ring);

      pinGroup.userData = {
        type: 'community_pin',
        data: report
      };

      this.pinsGroup.add(pinGroup);
    });
  }

  initTrafficParticles() {
    this.trafficParticlesGroup.clear();

    const particleCount = 180;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    this.trafficParticlesData = [];

    for (let i = 0; i < particleCount; i++) {
      const randomEdge = this.data.edges[Math.floor(Math.random() * this.data.edges.length)];
      const progress = Math.random();
      const speed = (0.003 + Math.random() * 0.005) * (this.activeScenario === 'baseline' ? 0.4 : 1.2);

      this.trafficParticlesData.push({
        edge: randomEdge,
        progress,
        speed,
        direction: Math.random() > 0.5 ? 1 : -1
      });

      positions[i * 3] = 0;
      positions[i * 3 + 1] = 1.2;
      positions[i * 3 + 2] = 0;

      // Color
      colors[i * 3] = 0.22;
      colors[i * 3 + 1] = 0.74;
      colors[i * 3 + 2] = 0.97;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 4.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85
    });

    this.trafficPoints = new THREE.Points(geometry, material);
    this.trafficParticlesGroup.add(this.trafficPoints);
  }

  updateTrafficParticles() {
    if (!this.trafficPoints) return;

    const positions = this.trafficPoints.geometry.attributes.position.array;
    const nodeLookup = new Map();
    this.data.nodes.forEach(n => nodeLookup.set(n.id, n));

    for (let i = 0; i < this.trafficParticlesData.length; i++) {
      const pData = this.trafficParticlesData[i];
      pData.progress += pData.speed;
      if (pData.progress > 1.0) pData.progress = 0.0;

      const u = nodeLookup.get(pData.edge.source);
      const v = nodeLookup.get(pData.edge.target);

      if (u && v) {
        const t = pData.direction === 1 ? pData.progress : 1 - pData.progress;
        positions[i * 3] = u.x + (v.x - u.x) * t;
        positions[i * 3 + 1] = 1.6;
        positions[i * 3 + 2] = u.z + (v.z - u.z) * t;
      }
    }

    this.trafficPoints.geometry.attributes.position.needsUpdate = true;
  }

  setScenario(scenario) {
    this.activeScenario = scenario;
    this.buildRoadNetwork();
    this.initTrafficParticles();
  }

  toggleUndergroundUtilities(enabled) {
    this.showUndergroundUtilities = enabled;
    this.utilitiesGroup.visible = enabled;
    this.buildUndergroundUtilities();
  }

  jumpToPreset(presetKey) {
    const presets = {
      station: { pos: new THREE.Vector3(-40, 90, 110), target: new THREE.Vector3(-40, 5, -10) },
      lbs: { pos: new THREE.Vector3(-220, 180, 200), target: new THREE.Vector3(-220, 5, -10) },
      nehru: { pos: new THREE.Vector3(210, 120, 160), target: new THREE.Vector3(210, 5, 20) },
      mithi: { pos: new THREE.Vector3(-340, 140, -50), target: new THREE.Vector3(-340, 5, -180) },
      phoenix: { pos: new THREE.Vector3(-140, 130, -260), target: new THREE.Vector3(-140, 5, -390) },
      districtOverview: { pos: new THREE.Vector3(-300, 340, 420), target: new THREE.Vector3(0, 0, 0) },
      topDown: { pos: new THREE.Vector3(0, 550, 0), target: new THREE.Vector3(0, 0, 0) }
    };

    const targetPreset = presets[presetKey] || presets.districtOverview;
    this.tweenCamera(targetPreset.pos, targetPreset.target);
  }

  tweenCamera(targetPos, targetLookAt, duration = 1000) {
    const startPos = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    const startTime = performance.now();

    const animateTween = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);
      const ease = 0.5 - Math.cos(progress * Math.PI) / 2; // Ease in-out

      this.camera.position.lerpVectors(startPos, targetPos, ease);
      this.controls.target.lerpVectors(startTarget, targetLookAt, ease);
      this.controls.update();

      if (progress < 1.0) {
        requestAnimationFrame(animateTween);
      }
    };

    requestAnimationFrame(animateTween);
  }

  // Smooth Screen Horizontal Orbit Rotation
  rotateByAngle(angleRadians, duration = 600) {
    const target = this.controls.target.clone();
    const offset = new THREE.Vector3().subVectors(this.camera.position, target);
    
    // Compute current horizontal radius & angle in X-Z plane
    const radius = Math.hypot(offset.x, offset.z);
    const currentAngle = Math.atan2(offset.z, offset.x);
    const targetAngle = currentAngle + angleRadians;

    const newX = target.x + radius * Math.cos(targetAngle);
    const newZ = target.z + radius * Math.sin(targetAngle);
    const newPos = new THREE.Vector3(newX, this.camera.position.y, newZ);

    this.tweenCamera(newPos, target, duration);
  }

  rotateLeft(degrees = 45) {
    this.rotateByAngle(-(degrees * Math.PI / 180));
  }

  rotateRight(degrees = 45) {
    this.rotateByAngle((degrees * Math.PI / 180));
  }

  toggleAutoRotate() {
    this.controls.autoRotate = !this.controls.autoRotate;
    return this.controls.autoRotate;
  }

  onMouseMove(event) {
    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
  }

  onClick(event) {
    // Prevent raycasting click if user dragged the mouse to rotate the screen
    if (this.mouseDownPos) {
      const dragDistance = Math.hypot(event.clientX - this.mouseDownPos.x, event.clientY - this.mouseDownPos.y);
      if (dragDistance > 6) {
        return; // User was rotating/panning the screen
      }
    }

    const rect = this.container.getBoundingClientRect();
    this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.mouse, this.camera);

    // If in pin drop mode, drop pin on ground plane
    if (this.isPinDropMode) {
      const groundHits = this.raycaster.intersectObjects(this.groundGroup.children, true);
      if (groundHits.length > 0) {
        const pt = groundHits[0].point;
        if (this.onPinDrop) {
          this.onPinDrop(pt);
        }
      }
      return;
    }

    // Check click on pins first
    const pinHits = this.raycaster.intersectObjects(this.pinsGroup.children, true);
    if (pinHits.length > 0) {
      let root = pinHits[0].object;
      while (root.parent && root.parent !== this.pinsGroup) {
        root = root.parent;
      }
      if (root.userData && root.userData.data) {
        if (this.onSelectEntity) this.onSelectEntity('pin', root.userData.data);
        return;
      }
    }

    // Check click on road segments
    const roadHits = this.raycaster.intersectObjects(this.roadsGroup.children, true);
    if (roadHits.length > 0) {
      const item = roadHits[0].object;
      if (item.userData && item.userData.type === 'road') {
        if (this.onSelectEntity) this.onSelectEntity('road', item.userData.data);
        return;
      }
      if (item.userData && item.userData.type === 'intersection') {
        if (this.onSelectEntity) this.onSelectEntity('node', item.userData.data);
        return;
      }
    }

    // Check click on buildings
    const buildingHits = this.raycaster.intersectObjects(this.buildingsGroup.children, true);
    if (buildingHits.length > 0) {
      const bld = buildingHits[0].object;
      if (bld.userData && bld.userData.data) {
        if (this.onSelectEntity) this.onSelectEntity('building', bld.userData.data);
        return;
      }
    }

    // Check click on utilities if active
    if (this.showUndergroundUtilities) {
      const utilHits = this.raycaster.intersectObjects(this.utilitiesGroup.children, true);
      if (utilHits.length > 0) {
        const util = utilHits[0].object;
        if (util.userData && util.userData.data) {
          if (this.onSelectEntity) this.onSelectEntity('utility', util.userData.data);
          return;
        }
      }
    }
  }

  addDynamicReportPin(report) {
    this.data.communityReports.unshift(report);
    this.buildCommunityPins();
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    // Update orbit controls
    this.controls.update();

    // Dynamically calculate Azimuth Angle from camera to target
    if (this.controls) {
      const dir = new THREE.Vector3().subVectors(this.camera.position, this.controls.target);
      const angleRad = Math.atan2(dir.x, dir.z);
      const azimuthDeg = Math.round((angleRad * (180 / Math.PI) + 360) % 360);
      
      const azimuthEl = document.getElementById('hud-azimuth-val');
      const needleEl = document.getElementById('compass-needle-icon');
      if (azimuthEl) {
        azimuthEl.textContent = `${azimuthDeg.toString().padStart(3, '0')}°`;
      }
      if (needleEl) {
        needleEl.style.transform = `rotate(${-azimuthDeg}deg)`;
      }
    }

    // Pulse animation for pin rings
    const time = performance.now() * 0.003;
    this.pinsGroup.children.forEach(pin => {
      pin.children.forEach(child => {
        if (child.userData && child.userData.isPulseRing) {
          const s = 1.0 + Math.sin(time * 3) * 0.2;
          child.scale.set(s, s, 1);
        }
      });
    });

    // Update traffic particles
    this.updateTrafficParticles();

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  }
}

if (typeof window !== 'undefined') {
  window.Meridian3DScene = Meridian3DScene;
}

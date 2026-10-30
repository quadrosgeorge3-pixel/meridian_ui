/**
 * MERIDIAN: Community-Validated Urban Optimization Digital Twin
 * District: Kurla, Mumbai (Pilot Study District)
 * Data Layer & Community Knowledge Base
 */

const KURLA_DATA = {
  districtName: "Kurla Central Urban District, Mumbai",
  centerCoords: { lat: 19.0657, lng: 72.8794 }, // Kurla Junction
  bounds: {
    north: 19.0820, // Phoenix Marketcity / Kamani
    south: 19.0520, // CST Road / SCLR / BKC Border
    east: 72.8940,  // Nehru Nagar / Eastern Express Highway
    west: 72.8680   // Mithi River / LBS Marg West
  },

  // Key District Waypoints and Graph Nodes (X: East-West, Z: North-South in 3D CAD meters)
  nodes: [
    { id: "N_KURLA_STN_W", name: "Kurla West Station Forecourt", x: -40, z: -10, type: "transit_hub", lat: 19.0657, lng: 72.8788 },
    { id: "N_KURLA_STN_E", name: "Kurla East Station & Bus Terminus", x: 60, z: -15, type: "transit_hub", lat: 19.0661, lng: 72.8805 },
    { id: "N_LBS_KURLA_JNC", name: "LBS Marg - Station Road Junction", x: -220, z: -10, type: "arterial", lat: 19.0658, lng: 72.8735 },
    { id: "N_LBS_NORTH_KAMANI", name: "LBS Marg - Kamani Junction", x: -210, z: -320, type: "arterial", lat: 19.0760, lng: 72.8740 },
    { id: "N_PHOENIX_MALL", name: "Phoenix Marketcity Entry Corridor", x: -140, z: -390, type: "commercial", lat: 19.0785, lng: 72.8765 },
    { id: "N_LBS_SOUTH_CST", name: "LBS Marg - CST Road / SCLR Jnc", x: -230, z: 290, type: "arterial", lat: 19.0560, lng: 72.8730 },
    { id: "N_BKC_CONNECTOR", name: "CST Road / BKC Elevated Gateway", x: -380, z: 280, type: "highway_link", lat: 19.0558, lng: 72.8680 },
    { id: "N_OLD_BAZAAR", name: "Old Kurla Bazaar (Station Road)", x: -120, z: -10, type: "local_market", lat: 19.0657, lng: 72.8760 },
    { id: "N_QURESHI_NAGAR", name: "Kasaiwada / Qureshi Nagar Hub", x: -160, z: 120, type: "residential_historic", lat: 19.0610, lng: 72.8750 },
    { id: "N_BHABHA_HOSPITAL", name: "KB Bhabha Municipal Hospital", x: -80, z: 140, type: "civic_health", lat: 19.0605, lng: 72.8775 },
    { id: "N_NEHRU_NAGAR_CIRCLE", name: "Nehru Nagar Central Circle", x: 210, z: 20, type: "residential_hub", lat: 19.0665, lng: 72.8850 },
    { id: "N_NEHRU_SCHOOL_ZONE", name: "Nehru Nagar Educational Enclave", x: 260, z: -90, type: "school_zone", lat: 19.0700, lng: 72.8865 },
    { id: "N_SG_BARVE_NORTH", name: "SG Barve Marg (Towards Tilak Nagar)", x: 220, z: -280, type: "collector", lat: 19.0755, lng: 72.8855 },
    { id: "N_SCLR_EAST_FLYOVER", name: "Santacruz-Chembur Link Road (East)", x: 190, z: 310, type: "highway_link", lat: 19.0550, lng: 72.8845 },
    { id: "N_MITHI_KRANTI_NAGAR", name: "Mithi River Basin (Kranti Nagar)", x: -340, z: -180, type: "drainage_critical", lat: 19.0710, lng: 72.8690 },
    { id: "N_KAMGAR_NAGAR", name: "Kamgar Nagar Residential Grid", x: 350, z: 140, type: "residential_hub", lat: 19.0620, lng: 72.8895 }
  ],

  // Road Network Segments (Edges) connecting graph nodes
  edges: [
    {
      id: "E_BAZAAR_STN",
      source: "N_OLD_BAZAAR",
      target: "N_KURLA_STN_W",
      name: "Kurla West Station Road (Historic Bazaar)",
      lengthMeters: 380,
      baselineCongestion: 0.92, // 92% delay index
      speedLimitKmH: 20,
      baselineStatus: "Severely congested mixed pedestrian-auto corridor. Severe bottlenecks.",
      algoStatus: "PROPOSED DEMOLITION / 4-LANE WIDENING (Flattens 120+ vendor kiosks)",
      hybridStatus: "PRESERVED HERITAGE PEDESTRIAN PROMENADE + One-way electric feeder loop",
      communityPenalty: 95, // High penalty if bulldozed
      culturalImportance: 98
    },
    {
      id: "E_LBS_BAZAAR",
      source: "N_LBS_KURLA_JNC",
      target: "N_OLD_BAZAAR",
      name: "Station Road (LBS Marg to Bazaar)",
      lengthMeters: 450,
      baselineCongestion: 0.85,
      speedLimitKmH: 25,
      baselineStatus: "Dual 2-lane roadway choked by curbside parking and autorickshaw queues.",
      algoStatus: "Aggressively widened corridor.",
      hybridStatus: "Regulated transit-only right-of-way with smart loading bay zones.",
      communityPenalty: 40,
      culturalImportance: 65
    },
    {
      id: "E_LBS_ARTERIAL_N",
      source: "N_LBS_KURLA_JNC",
      target: "N_LBS_NORTH_KAMANI",
      name: "Lal Bahadur Shastri (LBS) Marg (North Arterial)",
      lengthMeters: 1200,
      baselineCongestion: 0.88,
      speedLimitKmH: 45,
      baselineStatus: "Major arterial with 3 bottleneck chokepoints and frequent flooding.",
      algoStatus: "Grade-separated 6-lane express priority corridor.",
      hybridStatus: "Integrated 6-lane smart arterial with subterranean storm drainage culverts.",
      communityPenalty: 20,
      culturalImportance: 30
    },
    {
      id: "E_KAMANI_PHOENIX",
      source: "N_LBS_NORTH_KAMANI",
      target: "N_PHOENIX_MALL",
      name: "Kamani - Phoenix Retail Feeder",
      lengthMeters: 480,
      baselineCongestion: 0.74,
      speedLimitKmH: 35,
      baselineStatus: "Weekend mall traffic spillover onto LBS Marg.",
      algoStatus: "Direct dedicated underpass connector.",
      hybridStatus: "Direct dedicated underpass connector with pedestrian skybridge.",
      communityPenalty: 15,
      culturalImportance: 20
    },
    {
      id: "E_LBS_ARTERIAL_S",
      source: "N_LBS_KURLA_JNC",
      target: "N_LBS_SOUTH_CST",
      name: "Lal Bahadur Shastri (LBS) Marg (South)",
      lengthMeters: 1100,
      baselineCongestion: 0.82,
      speedLimitKmH: 45,
      baselineStatus: "High commercial auto repair shops spilling onto shoulder.",
      algoStatus: "Widened high-speed corridor bypassing Kasaiwada access.",
      hybridStatus: "Widened arterial with dedicated service access for local artisan auto cluster.",
      communityPenalty: 50,
      culturalImportance: 45
    },
    {
      id: "E_CST_BKC_LINK",
      source: "N_LBS_SOUTH_CST",
      target: "N_BKC_CONNECTOR",
      name: "CST Road / BKC Elevated Ramp",
      lengthMeters: 620,
      baselineCongestion: 0.65,
      speedLimitKmH: 60,
      baselineStatus: "Elevated connector with heavy peak rush to BKC financial hub.",
      algoStatus: "Direct MST trunk edge connecting western corridor.",
      hybridStatus: "High-capacity transit lane prioritization with automated dynamic signals.",
      communityPenalty: 10,
      culturalImportance: 15
    },
    {
      id: "E_QURESHI_ACCESS",
      source: "N_LBS_KURLA_JNC",
      target: "N_QURESHI_NAGAR",
      name: "Qureshi Nagar / Kasaiwada Connector",
      lengthMeters: 550,
      baselineCongestion: 0.70,
      speedLimitKmH: 25,
      baselineStatus: "Dense artisan neighborhood with narrow internal lanes.",
      algoStatus: "SEVERED/CLOSED TO TRAFFIC (Algorithmic graph considers edge low-speed redundant)",
      hybridStatus: "RESTORED & UPGRADED: Permeable paved shared street with emergency vehicle clearance.",
      communityPenalty: 92,
      culturalImportance: 95
    },
    {
      id: "E_QURESHI_BHABHA",
      source: "N_QURESHI_NAGAR",
      target: "N_BHABHA_HOSPITAL",
      name: "Hospital Emergency Access Alley",
      lengthMeters: 380,
      baselineCongestion: 0.58,
      speedLimitKmH: 30,
      baselineStatus: "Critical ambulance route often blocked by double parking.",
      algoStatus: "Classified as minor secondary path.",
      hybridStatus: "CRITICAL PROTECTED CIVIC CORRIDOR: Enforced green corridor for ambulances.",
      communityPenalty: 88,
      culturalImportance: 85
    },
    {
      id: "E_BHABHA_STN",
      source: "N_BHABHA_HOSPITAL",
      target: "N_KURLA_STN_W",
      name: "Bhabha Hospital - Kurla West Subway Link",
      lengthMeters: 490,
      baselineCongestion: 0.68,
      speedLimitKmH: 25,
      baselineStatus: "Pedestrian subway connection under central railway tracks.",
      algoStatus: "Standard pedestrian path.",
      hybridStatus: "Widened, well-lit universal-access ramped transit corridor.",
      communityPenalty: 30,
      culturalImportance: 70
    },
    {
      id: "E_RAILWAY_FLYOVER_SUBWAY",
      source: "N_KURLA_STN_W",
      target: "N_KURLA_STN_E",
      name: "Kurla Station East-West Rail Crossing",
      lengthMeters: 320,
      baselineCongestion: 0.95,
      speedLimitKmH: 15,
      baselineStatus: "Severe pedestrian bottleneck crossing 8 railway tracks via aging FOBs.",
      algoStatus: "Single mega-footbridge connecting commercial platforms.",
      hybridStatus: "Multi-modal integrated transit deck with barrier-free escalators & cycle lane.",
      communityPenalty: 80,
      culturalImportance: 90
    },
    {
      id: "E_NEHRU_CIRC_STN",
      source: "N_KURLA_STN_E",
      target: "N_NEHRU_NAGAR_CIRCLE",
      name: "SG Barve Marg (Kurla East Station to Nehru Circle)",
      lengthMeters: 620,
      baselineCongestion: 0.78,
      speedLimitKmH: 35,
      baselineStatus: "Continuous BEST bus movement conflicting with auto stands and pedestrians.",
      algoStatus: "Standard 4-lane vehicle expansion.",
      hybridStatus: "Dedicated bus rapid transit (BRT) lane + organized auto drop-off bays.",
      communityPenalty: 45,
      culturalImportance: 60
    },
    {
      id: "E_NEHRU_SCHOOL_PATH",
      source: "N_NEHRU_NAGAR_CIRCLE",
      target: "N_NEHRU_SCHOOL_ZONE",
      name: "Nehru Nagar Educational Access Lane",
      lengthMeters: 410,
      baselineCongestion: 0.50,
      speedLimitKmH: 20,
      baselineStatus: "Quiet residential lane serving 3 municipal schools and 2,800 students.",
      algoStatus: "HIGH-SPEED ARTERIAL BYPASS (Algorithms turn this into an eastern vehicular bypass!)",
      hybridStatus: "REJECTED HIGH-SPEED ROUTE: Preserved as 15km/h 'Safe School Zone' with speed tables.",
      communityPenalty: 98,
      culturalImportance: 95
    },
    {
      id: "E_BARVE_NORTH",
      source: "N_NEHRU_SCHOOL_ZONE",
      target: "N_SG_BARVE_NORTH",
      name: "SG Barve Marg Extension North",
      lengthMeters: 750,
      baselineCongestion: 0.62,
      speedLimitKmH: 40,
      baselineStatus: "Link towards Tilak Nagar and Chembur West.",
      algoStatus: "Optimized graph connector.",
      hybridStatus: "Standard optimized collector with sidewalk enhancement.",
      communityPenalty: 25,
      culturalImportance: 40
    },
    {
      id: "E_SCLR_EAST_CONNECT",
      source: "N_NEHRU_NAGAR_CIRCLE",
      target: "N_SCLR_EAST_FLYOVER",
      name: "Nehru Nagar - SCLR East Ramp Link",
      lengthMeters: 920,
      baselineCongestion: 0.72,
      speedLimitKmH: 50,
      baselineStatus: "Connects Kurla East to the Chembur flyover system.",
      algoStatus: "Primary MST eastern arterial spine.",
      hybridStatus: "Retained high-flow connector with noise barriers along residential edges.",
      communityPenalty: 35,
      culturalImportance: 30
    },
    {
      id: "E_KAMGAR_LINK",
      source: "N_NEHRU_NAGAR_CIRCLE",
      target: "N_KAMGAR_NAGAR",
      name: "Kamgar Nagar Residential Feeder",
      lengthMeters: 580,
      baselineCongestion: 0.45,
      speedLimitKmH: 30,
      baselineStatus: "Local residential collector with tree canopy.",
      algoStatus: "Retained standard edge.",
      hybridStatus: "Protected green corridor with bioswales for rainwater catchment.",
      communityPenalty: 40,
      culturalImportance: 55
    },
    {
      id: "E_MITHI_LBS_DRAIN",
      source: "N_LBS_KURLA_JNC",
      target: "N_MITHI_KRANTI_NAGAR",
      name: "Kranti Nagar - Mithi River Culvert Pathway",
      lengthMeters: 620,
      baselineCongestion: 0.40,
      speedLimitKmH: 15,
      baselineStatus: "Unpaved informal levee road prone to annual monsoon submergence.",
      algoStatus: "PRUNED FROM NETWORK (Algorithm discards low-speed, high-curvature path)",
      hybridStatus: "CRITICAL CLIMATE ADAPTATION CORRIDOR: Elevated levee road + reinforced floodgate utility access.",
      communityPenalty: 90,
      culturalImportance: 85
    }
  ],

  // 3D District Landmark Buildings for CAD Rendering
  buildings: [
    {
      id: "BLD_KURLA_STN",
      name: "Kurla Railway Junction Station Complex",
      category: "transit",
      x: 10, z: -12, width: 85, length: 140, height: 28,
      color: 0x38bdf8,
      desc: "Central & Harbour line suburban junction. 8 platforms, 350,000 daily commuters."
    },
    {
      id: "BLD_PHOENIX_MALL",
      name: "Phoenix Marketcity Kurla",
      category: "commercial",
      x: -140, z: -390, width: 110, length: 160, height: 42,
      color: 0x818cf8,
      desc: "4.1 million sq ft mixed-use retail, entertainment, and commercial campus."
    },
    {
      id: "BLD_BHABHA_HOSPITAL",
      name: "KB Bhabha Municipal General Hospital",
      category: "civic",
      x: -80, z: 140, width: 70, length: 65, height: 35,
      color: 0xef4444,
      desc: "Primary civic healthcare facility serving greater Kurla and surrounding settlements."
    },
    {
      id: "BLD_NEHRU_HOUSING_A",
      name: "Nehru Nagar Co-Op Housing Colony A",
      category: "residential",
      x: 190, z: -30, width: 60, length: 80, height: 24,
      color: 0x64748b,
      desc: "Middle-income residential cooperative society established in the 1960s."
    },
    {
      id: "BLD_NEHRU_HOUSING_B",
      name: "Nehru Nagar Co-Op Housing Colony B",
      category: "residential",
      x: 270, z: 20, width: 65, length: 75, height: 26,
      color: 0x64748b,
      desc: "Residential enclave with shaded community gardens and internal walkways."
    },
    {
      id: "BLD_MUNICIPAL_SCHOOL",
      name: "Nehru Nagar Municipal Composite School",
      category: "civic",
      x: 260, z: -90, width: 55, length: 70, height: 20,
      color: 0xf59e0b,
      desc: "Public educational institution serving 2,800+ students from primary to secondary."
    },
    {
      id: "BLD_QURESHI_FABRIC",
      name: "Kasaiwada / Qureshi Nagar Artisan Block",
      category: "historic",
      x: -160, z: 120, width: 90, length: 85, height: 18,
      color: 0x10b981,
      desc: "High-density generational craft and food trade settlements with dense alleyways."
    },
    {
      id: "BLD_LBS_COMMERCIAL_1",
      name: "LBS Commercial Hub & Auto Garages",
      category: "commercial",
      x: -230, z: 80, width: 45, length: 110, height: 32,
      color: 0x94a3b8,
      desc: "Arterial commercial frontage housing motor spare markets and offices."
    },
    {
      id: "BLD_LBS_COMMERCIAL_2",
      name: "LBS North Business Centre",
      category: "commercial",
      x: -220, z: -180, width: 50, length: 95, height: 36,
      color: 0x94a3b8,
      desc: "Multi-tenant office complex and logistics depot."
    },
    {
      id: "BLD_BUS_DEPOT_EAST",
      name: "Kurla Nehru Nagar MSRTC & BEST Bus Depot",
      category: "transit",
      x: 120, z: 60, width: 80, length: 110, height: 16,
      color: 0x38bdf8,
      desc: "Key inter-city and intra-city transit nexus connecting suburban Mumbai to Konkan."
    },
    {
      id: "BLD_HOLY_CROSS",
      name: "Holy Cross Church Kurla (Built 1588)",
      category: "historic",
      x: -280, z: -100, width: 40, length: 55, height: 22,
      color: 0xa855f7,
      desc: "Historical Portuguese-era heritage church and community landmark."
    },
    {
      id: "BLD_MITHI_PUMPING_STN",
      name: "Mithi River Stormwater Pumping Station",
      category: "utility",
      x: -360, z: -120, width: 50, length: 45, height: 15,
      color: 0x06b6d4,
      desc: "Municipal drainage infrastructure designed to combat monsoon tidal backflow."
    }
  ],

  // Underground Utility Networks (Inferred CAD Pipelines with Clipping Plane Inspection)
  undergroundUtilities: [
    {
      id: "UTIL_WATER_MAIN",
      name: "Tansa-Vaitarna 1800mm Potable Water Trunk Main",
      depth: -6.5, // meters underground
      color: 0x0284c7, // deep cyan
      path: [
        { x: -250, z: -400 },
        { x: -220, z: -10 },
        { x: -230, z: 290 },
        { x: -380, z: 350 }
      ],
      desc: "Critical potable water pipeline supplying western suburban zones. High vulnerability to road construction vibrations."
    },
    {
      id: "UTIL_STORM_CULVERT",
      name: "Kurla West Box Drain Culvert (Discharge to Mithi)",
      depth: -4.2,
      color: 0x14b8a6, // teal
      path: [
        { x: -40, z: -10 },
        { x: -120, z: -10 },
        { x: -220, z: -10 },
        { x: -340, z: -180 }
      ],
      desc: "Crucial monsoon drainage outfall. Algorithms proposed placing bridge pilings through this channel without ground truth!"
    },
    {
      id: "UTIL_POWER_CABLE",
      name: "Nehru Nagar 33kV Underground Power Feeder",
      depth: -2.8,
      color: 0xf59e0b, // amber
      path: [
        { x: 60, z: -15 },
        { x: 210, z: 20 },
        { x: 260, z: -90 },
        { x: 350, z: 140 }
      ],
      desc: "Sub-surface electrical grid. Clipping plane reveals interference with proposed eastern high-speed underpass."
    }
  ],

  // Community Feedback, Corrections & Contests (Pre-seeded Ground Truth Data)
  communityReports: [
    {
      id: "CR-101",
      title: "Preserve Historic Station Road Bazaar Corridors",
      category: "Cultural / Market Anchor",
      author: "Ramesh Gupta",
      role: "Shopkeeper / Merchant Assoc.",
      lat: 19.0657,
      lng: 72.8760,
      coords3D: { x: -120, y: 1.5, z: -10 },
      severity: "critical",
      trustScore: 96,
      validations: 142,
      contests: 4,
      status: "VALIDATED_INTEGRATED",
      date: "2026-08-14",
      description: "The algorithmic MST model treats Station Road as an inefficient bottleneck and proposes a 4-lane demolition corridor. This would destroy 120+ registered fruit, textile, and hardware stalls dating back over 70 years, wrecking 450 livelihood families. We demand pedestrianization with dedicated cargo delivery windows instead.",
      algorithmImpact: "Algorithm penalized by +95 weight. Switched from vehicular demolition to pedestrianized transit promenade.",
      version: "v1.2"
    },
    {
      id: "CR-102",
      title: "Omitted Monsoon Storm Drain Outfall at Kranti Nagar",
      category: "Flood Hazard / Missing Infrastructure",
      author: "Sneha Patil",
      role: "College Student / Environmental Volunteer",
      lat: 19.0710,
      lng: 72.8690,
      coords3D: { x: -340, y: 1.5, z: -180 },
      severity: "high",
      trustScore: 92,
      validations: 98,
      contests: 1,
      status: "VALIDATED_INTEGRATED",
      date: "2026-08-16",
      description: "Overpass API spatial data has no record of the localized box drain culvert discharging into Mithi River here. During the July 26 deluge and yearly monsoons, this chokepoint floods up to 4.5 feet. The proposed algorithm routed a bypass over the embankment that would collapse the retaining wall.",
      algorithmImpact: "Added underground drainage utility node. Inferred clipping plane applied to preserve embankment integrity.",
      version: "v1.2"
    },
    {
      id: "CR-103",
      title: "School Zone Pedestrian Safety Hazard in Nehru Nagar",
      category: "Pedestrian Hazard / Child Safety",
      author: "Farhan Shaikh",
      role: "Community Volunteer / PTA Secretary",
      lat: 19.0700,
      lng: 72.8865,
      coords3D: { x: 260, y: 1.5, z: -90 },
      severity: "critical",
      trustScore: 94,
      validations: 177,
      contests: 2,
      status: "VALIDATED_INTEGRATED",
      date: "2026-08-17",
      description: "The pure shortest-path Dijkstra algorithm converted our quiet residential school street into a high-speed cut-through between SG Barve Marg and Tilak Nagar. 2,800 children walk here daily between 7 AM and 2 PM. High-speed traffic here is unacceptable.",
      algorithmImpact: "Algorithm rejected arterial classification. Enforced 15 km/h residential traffic calming and speed cushions.",
      version: "v1.2"
    },
    {
      id: "CR-104",
      title: "Unmapped Informal Artisan Settlement in Kasaiwada",
      category: "Missing Building / Stale Civic Data",
      author: "Abdul Karim",
      role: "Local Resident & Leather Craftsman",
      lat: 19.0610,
      lng: 72.8750,
      coords3D: { x: -160, y: 1.5, z: 120 },
      severity: "high",
      trustScore: 89,
      validations: 83,
      contests: 3,
      status: "VALIDATED_INTEGRATED",
      date: "2026-08-18",
      description: "Municipal GIS lists parcel 402/B as vacant unzoned land. In reality, over 80 micro-artisan workshops and 220 families have resided here for 5 decades. The algorithm proposed an access highway ramp straight through this lived community.",
      algorithmImpact: "Building footprint imported into CAD layer. Road geometry re-aligned around community boundary.",
      version: "v1.2"
    },
    {
      id: "CR-105",
      title: "Kamani Junction U-Turn Conflict with Phoenix Traffic",
      category: "Inaccurate Road Flow",
      author: "Officer R. Deshmukh",
      role: "Municipal Traffic Cell / Planner",
      lat: 19.0760,
      lng: 72.8740,
      coords3D: { x: -210, y: 1.5, z: -320 },
      severity: "medium",
      trustScore: 95,
      validations: 64,
      contests: 0,
      status: "UNDER_REVIEW",
      date: "2026-08-19",
      description: "OSM directionality markers indicate a bidirectional right-turn lane, which Mumbai Traffic Police banned in 2024. Traffic must use the grade-separated flyover U-turn 300m north. Current model produces unrealistic simulation queues.",
      algorithmImpact: "Edge weight directional penalty adjusted. Simulation flow matches real peak volumes.",
      version: "v1.3"
    }
  ],

  // Scenario Performance Pre-Calculated Benchmark Metrics
  scenarios: {
    baseline: {
      name: "Existing Real-World Network (OSM Baseline)",
      code: "baseline",
      badgeColor: "rose",
      colorHex: "#f43f5e",
      tagline: "Unoptimized, high-congestion status quo plagued by historical chokepoints and unquantified delays.",
      metrics: {
        avgCommuteMinutes: 38.6,
        commuteDelta: "0.0%",
        totalNetworkLengthKm: 46.2,
        distanceDelta: "0.0%",
        bottleneckCongestionIndex: 82.4, // out of 100
        resourceUtilityLossPercent: 24.8,
        communityValidationScore: 48.0, // Low because residents suffer daily friction
        algorithmicEfficiencyScore: 41.2,
        compositeFeasibilityIndex: 44.6
      },
      strengths: ["Lived community familiarity", "Zero capital expenditure"],
      weaknesses: ["Severe traffic gridlock", "Frequent monsoon flooding", "High vehicle emissions", "No disaster access"]
    },
    algorithmic: {
      name: "Pure Algorithmic Optimization (MST & Shortest Path)",
      code: "algorithmic",
      badgeColor: "cyan",
      colorHex: "#06b6d4",
      tagline: "Computed purely from raw spatial nodes and geometric distance without lived human context.",
      metrics: {
        avgCommuteMinutes: 26.2,
        commuteDelta: "-32.1%",
        totalNetworkLengthKm: 38.4,
        distanceDelta: "-16.8%",
        bottleneckCongestionIndex: 41.5,
        resourceUtilityLossPercent: 12.3,
        communityValidationScore: 23.5, // Extreme resident backlash
        algorithmicEfficiencyScore: 94.2,
        compositeFeasibilityIndex: 58.8
      },
      strengths: ["Highest mathematical throughput", "Minimal overall road length", "Direct arterial links"],
      weaknesses: ["Demolishes historic 70-year bazaar", "High-speed traffic through school zone", "Ignores Mithi flood plane", "Severe public protest risk"]
    },
    hybrid: {
      name: "Meridian Community-Validated Hybrid Digital Twin",
      code: "hybrid",
      badgeColor: "emerald",
      colorHex: "#10b981",
      tagline: "Algorithmically optimized weighted graph balanced by attributable community validation and contest scoring.",
      metrics: {
        avgCommuteMinutes: 29.4,
        commuteDelta: "-23.8%",
        totalNetworkLengthKm: 41.8,
        distanceDelta: "-9.5%",
        bottleneckCongestionIndex: 49.2,
        resourceUtilityLossPercent: 14.1,
        communityValidationScore: 94.6, // High resident & planner consensus
        algorithmicEfficiencyScore: 88.5,
        compositeFeasibilityIndex: 91.5
      },
      strengths: ["Station bazaar preserved as pedestrian promenade", "School zone protected", "Mithi culvert integrated", "94.6% community consensus"],
      weaknesses: ["Requires phased implementation", "Moderate municipal coordination needed"]
    }
  },

  // Versioned Overlays
  versionHistory: [
    { version: "v1.0", title: "Raw OSM Ingestion via Overpass API", date: "2026-08-01", author: "Data Engine", status: "Base Layer" },
    { version: "v1.1", title: "Automated MST Minimum Spanning Tree", date: "2026-08-08", author: "Optimization Engine", status: "Generated" },
    { version: "v1.2", title: "Community Contests & Corrections Ingested", date: "2026-08-18", author: "Citizen Stakeholders", status: "Reviewed" },
    { version: "v2.0", title: "Meridian Validated Hybrid District Twin", date: "2026-08-20", author: "Group 3 Multi-Stakeholder", status: "Production Release" }
  ]
};

// Export to window
if (typeof window !== 'undefined') {
  window.KURLA_DATA = KURLA_DATA;
}

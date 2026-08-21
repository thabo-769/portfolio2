import { Project } from '../types';

export const projectsData: Project[] = [
  {
    id: 'blade-ai',
    number: '01',
    title: 'Blade AI',
    tagline: 'AI-Powered Autonomous Development & Coding Workspace',
    shortDescription: 'AI-powered development platform designed to assist developers with coding, problem solving, and software engineering.',
    longDescription: 'Blade AI is a cutting-edge artificial intelligence development platform designed for modern software engineers. It provides intelligent context-aware code completions, real-time bug diagnosis, automated test generation, and deep architectural suggestions directly in an interactive browser canvas.',
    category: 'AI & Fullstack',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
    technologies: ['React 19', 'TypeScript', 'Gemini AI API', 'Supabase', 'Node.js', 'Tailwind CSS', 'WebSockets'],
    liveUrl: 'https://blade-ai.app',
    githubUrl: 'https://github.com/thabo/blade-ai',
    featured: true,
    year: 2024,
    role: 'Lead Full-Stack Architect',
    duration: '6 Months',
    challenge: 'Minimizing inference latency while maintaining rich state synchronization across complex multi-file coding workflows.',
    solution: 'Designed an optimistic state update layer powered by WebSockets, edge workers, and client-side code caching for sub-100ms UI responsiveness.',
    features: [
      'Multi-model LLM orchestration with context stream caching',
      'Real-time interactive code sandboxing & AST parsing',
      'Autonomous debugging assistant with step-by-step resolution',
      'Collaborative live coding sessions with instant peer sharing'
    ],
    metrics: [
      { label: 'Active Users', value: '5,000+' },
      { label: 'Lighthouse Score', value: '98/100' },
      { label: 'Avg Load Time', value: '1.2s' },
      { label: 'Code Gen Speed', value: '<250ms' }
    ]
  },
  {
    id: 'foodora',
    number: '02',
    title: 'Foodora',
    tagline: 'Modern Food E-Commerce & Fleet Delivery Ecosystem',
    shortDescription: 'Modern food e-commerce platform connecting customers with food stores, suppliers, and hyper-local delivery services.',
    longDescription: 'A high-performance food delivery ecosystem integrating customer mobile/web ordering, kitchen management dispatchers, driver GPS telemetry, and instant secure payment gateways.',
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'Next.js', 'Node.js', 'Supabase', 'Stripe', 'Mapbox GL', 'Tailwind CSS'],
    liveUrl: 'https://foodora.app',
    githubUrl: 'https://github.com/thabo/foodora',
    featured: false,
    year: 2024,
    role: 'Full-Stack Developer',
    duration: '4 Months',
    challenge: 'Handling real-time driver location updates without draining customer device batteries or saturating backend webhooks.',
    solution: 'Implemented delta-compression telemetry over WebSockets and optimized geofencing queries using PostGIS on Supabase.',
    features: [
      'Live GPS order tracking with estimated arrival calculation',
      'Multi-vendor cart routing and split invoice payments',
      'Dynamic menu recommendation engine based on user preferences',
      'Vendor dashboard with real-time sales analytics'
    ],
    metrics: [
      { label: 'Monthly Orders', value: '12,500+' },
      { label: 'Payment Success', value: '99.8%' },
      { label: 'Driver Latency', value: '45ms' }
    ]
  },
  {
    id: 'real-estate',
    number: '03',
    title: 'Real Estate Platform',
    tagline: 'Interactive Property Marketplace & Spatial Visualizer',
    shortDescription: 'Modern property marketplace for discovering, exploring, and acquiring luxury and commercial real estate.',
    longDescription: 'An enterprise property portal featuring 3D virtual floorplan explorations, high-resolution geospatial filtering, mortgage amortization calculators, and direct certified broker communications.',
    category: 'Real Estate',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'TypeScript', 'Three.js', 'Supabase', 'Google Maps API', 'Framer Motion'],
    liveUrl: 'https://realestate.app',
    githubUrl: 'https://github.com/thabo/real-estate',
    featured: false,
    year: 2023,
    role: 'Frontend & 3D Specialist',
    duration: '3 Months',
    challenge: 'Rendering heavy 3D architectural models smoothly on both mobile smartphones and high-resolution desktop screens.',
    solution: 'Engineered automatic progressive LOD (Level of Detail) meshes in Three.js and lazy-loaded WebP texture atlases.',
    features: [
      '3D Interactive Virtual Tour canvas with room navigation',
      'Spatial boundary search with neighborhood amenity layers',
      'Instant mortgage and tax calculation engine',
      'Direct schedule-a-viewing calendar synchronization'
    ],
    metrics: [
      { label: 'Properties Listed', value: '1,200+' },
      { label: 'Virtual Tour Views', value: '45,000+' },
      { label: 'Conversion Rate', value: '+34%' }
    ]
  },
  {
    id: 'mweya-energy',
    number: '04',
    title: 'Mweya Green Energy',
    tagline: 'Clean Renewable Energy Solutions & Sustainability Showcase',
    shortDescription: 'Professional showcase and operational platform for renewable solar and clean energy initiatives in Southern Africa.',
    longDescription: 'A bespoke corporate energy portal delivering interactive solar yield estimations, carbon offset calculators, project investment dashboards, and client telemetry for commercial solar installations.',
    category: 'Clean Energy',
    image: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'Tailwind CSS', 'Framer Motion', 'Chart.js', 'Vite', 'Formspree'],
    liveUrl: 'https://mweyagreen.energy',
    githubUrl: 'https://github.com/thabolanez4/mweya-green-energy',
    featured: false,
    year: 2023,
    role: 'Frontend Developer & UI Designer',
    duration: '2 Months',
    challenge: 'Communicating complex environmental metrics and financial ROI in an accessible, visually compelling format.',
    solution: 'Designed intuitive interactive charts and slider calculators with instantaneous energy savings projections.',
    features: [
      'Solar energy ROI & carbon offset calculator',
      'Interactive project grid showcasing commercial installations',
      'Editorial corporate storytelling with smooth scroll narratives',
      'Accessible multi-lingual layout structure'
    ],
    metrics: [
      { label: 'Clean Megawatts Tracked', value: '15 MW' },
      { label: 'Corporate Inquiries', value: '+180%' },
      { label: 'Page Speed Score', value: '99/100' }
    ]
  },
  {
    id: 'white-lions',
    number: '05',
    title: 'White Lions Legacies',
    tagline: 'Immersive Cultural Heritage & Digital Legacy Archive',
    shortDescription: 'Digital experience and interactive 3D archive celebrating African cultural heritage, wildlife preservation, and legacies.',
    longDescription: 'An award-winning cultural storytelling application leveraging WebGL particle systems, 3D artifact exploration, and ambient audio soundscapes to preserve cultural narratives for future generations.',
    category: 'Digital Experience',
    image: 'https://images.unsplash.com/photo-1534177616072-ef7dc120449d?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'Three.js', 'WebGL Shaders', 'Web Audio API', 'Tailwind CSS'],
    liveUrl: 'https://whitelions.legacy',
    githubUrl: 'https://github.com/thabolanez4/white-lions-legacies',
    featured: false,
    year: 2023,
    role: 'Creative Developer',
    duration: '3 Months',
    challenge: 'Balancing artistic WebGL visual richness with seamless cross-device mobile performance.',
    solution: 'Created custom vertex shaders for particles and dynamic resolution scaling based on device FPS monitor.',
    features: [
      '3D Particle canvas reacting dynamically to cursor and scroll',
      'Spatial 3D artifact viewer with rotation and inspection',
      'Adaptive ambient audio landscape with mute controls',
      'Accessible text transcriptions and WCAG AA contrast compliance'
    ],
    metrics: [
      { label: 'Global Visitors', value: '80,000+' },
      { label: 'Avg Session Time', value: '4m 32s' },
      { label: 'Award', value: 'Design Excellence' }
    ]
  },
  {
    id: 'nexus-health',
    number: '06',
    title: 'Nexus Health',
    tagline: 'AI-Powered Telemedicine & Encrypted Patient Vitals Engine',
    shortDescription: 'HIPAA-compliant telemedicine platform with real-time video consultation, automated clinical triage, and vitals sync.',
    longDescription: 'An enterprise healthcare platform bridging remote clinics and specialists through end-to-end encrypted WebRTC channels, automated symptom triage via AI, and direct electronic health record (EHR) synchronization.',
    category: 'AI & Fullstack',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'TypeScript', 'WebRTC', 'Node.js', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    liveUrl: 'https://nexus-health.app',
    githubUrl: 'https://github.com/thabolanez4/nexus-health',
    featured: true,
    year: 2024,
    role: 'Full-Stack Lead',
    duration: '5 Months',
    challenge: 'Ensuring zero packet loss on video streams in low-bandwidth rural networks while enforcing strict end-to-end encryption.',
    solution: 'Designed adaptive bitrate WebRTC mesh routing with VP9 fallback codec and AES-GCM-256 client-side payload encryption.',
    features: [
      'Ultra low-latency HD video consultations with interactive whiteboard',
      'AI triage assistant providing differential diagnostic preliminary notes',
      'Direct Bluetooth medical sensor readings (pulse oximeters, BP monitors)',
      'Automated prescription dispatch with digital cryptographic signing'
    ],
    metrics: [
      { label: 'Consultations', value: '18,000+' },
      { label: 'Call Reliability', value: '99.94%' },
      { label: 'Triage Accuracy', value: '96.2%' }
    ]
  },
  {
    id: 'krypton-pay',
    number: '07',
    title: 'Krypton Pay',
    tagline: 'Sub-Second Cross-Border Digital Wallet & Settlement Rail',
    shortDescription: 'Multi-currency settlement network enabling instant international remittance with zero hidden exchange markups.',
    longDescription: 'A high-throughput financial infrastructure gateway engineered in Go and Next.js, processing cross-border settlements across 40+ currencies with real-time automated liquidity routing and ledger validation.',
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Next.js', 'Go (Golang)', 'Redis', 'PostgreSQL', 'Stripe API', 'Docker'],
    liveUrl: 'https://kryptonpay.io',
    githubUrl: 'https://github.com/thabolanez4/krypton-pay',
    featured: false,
    year: 2024,
    role: 'Backend & Systems Engineer',
    duration: '4 Months',
    challenge: 'Preventing double-spend race conditions under concurrent burst traffic of over 5,000 transactions per second.',
    solution: 'Built distributed distributed locking using Redis Redlock and idempotent double-entry database transactions in PostgreSQL.',
    features: [
      'Instant multi-currency exchange with live interbank FX price feeds',
      'Virtual and physical debit card issuance via Stripe Treasury API',
      'Automated fraud detection engine with suspicious pattern flags',
      'Biometric authentication verification and session sandboxing'
    ],
    metrics: [
      { label: 'Volume Processed', value: '$4.2M+' },
      { label: 'Avg Settle Time', value: '<420ms' },
      { label: 'Fraud Rate', value: '<0.001%' }
    ]
  },
  {
    id: 'cloudpulse-metrics',
    number: '08',
    title: 'CloudPulse Metrics',
    tagline: 'Real-Time Kubernetes Infrastructure & Anomaly Detection',
    shortDescription: 'High-density observability platform analyzing container telemetry, log spikes, and cluster health with automated alerts.',
    longDescription: 'An enterprise cloud observability dashboard built for DevOps teams. Aggregates billions of telemetry points per day into interactive heatmaps, distributed trace graphs, and automated root-cause incident analyses.',
    category: 'Cloud & DevOps',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'TypeScript', 'FastAPI', 'Python', 'Prometheus', 'ClickHouse', 'Tailwind CSS'],
    liveUrl: 'https://cloudpulse.dev',
    githubUrl: 'https://github.com/thabolanez4/cloudpulse-metrics',
    featured: false,
    year: 2024,
    role: 'Cloud Architect',
    duration: '3 Months',
    challenge: 'Visualizing 100,000+ data points smoothly in the browser without freezing the DOM or dropping frame rates.',
    solution: 'Leveraged WebGL Canvas rendering pipelines for time-series charts and ClickHouse columnar queries for sub-second aggregations.',
    features: [
      'Real-time Kubernetes node and pod resource saturation heatmaps',
      'Automated anomaly detection with ML-driven threshold forecasting',
      'Distributed OpenTelemetry trace visualizer with waterfall breakdowns',
      'Slack and PagerDuty webhook alert cascade integration'
    ],
    metrics: [
      { label: 'Events / Sec', value: '50,000+' },
      { label: 'Query Latency', value: '18ms' },
      { label: 'MTTR Reduction', value: '-45%' }
    ]
  },
  {
    id: 'aura-soundworks',
    number: '09',
    title: 'Aura Soundworks',
    tagline: 'Algorithmic Web Audio Synthesizer & Spatial Sequencer',
    shortDescription: 'Interactive digital audio workstation (DAW) in the browser featuring generative MIDI patterns and spatial reverberation.',
    longDescription: 'A browser-based audio workstation powered by WebAudio API and WebAssembly DSP modules. Allows musicians to sculpt subtractive synthesizers, program polyrhythmic step sequencers, and export studio-quality stems.',
    category: 'Digital Experience',
    image: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80',
    technologies: ['TypeScript', 'React', 'Web Audio API', 'WebAssembly', 'Canvas 2D', 'Tailwind CSS'],
    liveUrl: 'https://aurasound.app',
    githubUrl: 'https://github.com/thabolanez4/aura-soundworks',
    featured: false,
    year: 2023,
    role: 'Audio DSP & Frontend Engineer',
    duration: '3 Months',
    challenge: 'Achieving zero audio buffer underruns and sample-accurate scheduling within browser JavaScript event loops.',
    solution: 'Built custom AudioWorklet processors with shared array buffers in WebAssembly to process sound off the main thread.',
    features: [
      '16-Track polyphonic step sequencer with swing and probability',
      'Subtractive 3-oscillator synth engine with customizable LFOs and filters',
      'Spatial binaural 3D panning with room impulse responses',
      'WAV stem recording, multi-track export, and MIDI controller input'
    ],
    metrics: [
      { label: 'Audio Latency', value: '<5ms' },
      { label: 'Tracks Created', value: '25,000+' },
      { label: 'Frame Rate', value: 'Solid 60 FPS' }
    ]
  },
  {
    id: 'estatepulse',
    number: '10',
    title: 'EstatePulse AI',
    tagline: 'Predictive Geospatial Valuation & Commercial Investment Engine',
    shortDescription: 'AI-driven commercial real estate analytics platform forecasting land value appreciation and yield trajectories.',
    longDescription: 'A commercial real estate intelligence suite combining municipal zoning records, historical foot traffic telemetry, and demographic shifts to generate institutional-grade property valuation predictions.',
    category: 'Real Estate',
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Next.js', 'Python', 'GeoPandas', 'Mapbox GL', 'Supabase', 'Tailwind CSS'],
    liveUrl: 'https://estatepulse.ai',
    githubUrl: 'https://github.com/thabolanez4/estatepulse-ai',
    featured: false,
    year: 2023,
    role: 'Full-Stack & Data Specialist',
    duration: '4 Months',
    challenge: 'Fusing disparate municipal parcel shapes with live census and satellite telemetry into a unified spatial index.',
    solution: 'Constructed an H3 hexagonal geospatial indexing pipeline on PostGIS for instant spatial polygon queries.',
    features: [
      'Interactive 3D building height and footprint choropleth overlays',
      'Predictive 5-year internal rate of return (IRR) cash flow simulations',
      'Automated zoning regulation summaries and redevelopment feasibility',
      'Exportable investment memos with customized risk models'
    ],
    metrics: [
      { label: 'Parcels Indexed', value: '450,000+' },
      { label: 'Accuracy Score', value: '94.8%' },
      { label: 'Institutional Deals', value: '$85M+' }
    ]
  },
  {
    id: 'solaria-grid',
    number: '11',
    title: 'Solaria Grid IoT',
    tagline: 'Smart Commercial Microgrid Telemetry & Battery Optimization',
    shortDescription: 'Industrial IoT portal coordinating solar arrays, battery reserves, and grid feed-in tariffs for energy independence.',
    longDescription: 'A mission-critical energy management system built for industrial facilities to monitor solar generation, optimize battery storage discharge cycles during peak tariff hours, and prevent grid blackout penalties.',
    category: 'Clean Energy',
    image: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'Node.js', 'MQTT', 'InfluxDB', 'Chart.js', 'Tailwind CSS'],
    liveUrl: 'https://solariagrid.energy',
    githubUrl: 'https://github.com/thabolanez4/solaria-grid-iot',
    featured: false,
    year: 2024,
    role: 'IoT Systems Engineer',
    duration: '3 Months',
    challenge: 'Streaming continuous sensor metrics from 200+ inverter gateways over unreliable cellular uplinks.',
    solution: 'Deployed MQTT lightweight broker with edge queue buffering and compressed batch synchronization to InfluxDB.',
    features: [
      'Live power flow diagram showing real-time watt generation and consumption',
      'Automated peak-shaving battery discharge algorithm saving up to 32% on bills',
      'Predictive maintenance alerts for failing inverter strings',
      'Carbon compliance certificates and regulatory ESG report generation'
    ],
    metrics: [
      { label: 'Energy Managed', value: '28 GWh' },
      { label: 'Peak Cost Cut', value: '-31.5%' },
      { label: 'Sensor Uptime', value: '99.98%' }
    ]
  },
  {
    id: 'vanguard-lms',
    number: '12',
    title: 'Vanguard LMS',
    tagline: 'Adaptive AI-Powered Interactive Engineering Academy',
    shortDescription: 'Next-generation learning platform with live in-browser coding sandboxes, AI mentorship, and structured skill trees.',
    longDescription: 'An interactive developer education platform delivering hands-on computer science modules, browser-based Linux terminals, real-time code evaluation, and personalized skill-gap diagnostic curriculums.',
    category: 'AI & Fullstack',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Next.js 14', 'Django', 'Python', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
    liveUrl: 'https://vanguardlms.dev',
    githubUrl: 'https://github.com/thabolanez4/vanguard-lms',
    featured: false,
    year: 2024,
    role: 'Lead Architect',
    duration: '4 Months',
    challenge: 'Executing student untrusted code safely in isolated containers within sub-second turnaround times.',
    solution: 'Designed an isolated gVisor container runtime pool with memory limits and strict syscall filters.',
    features: [
      'Embedded multi-language IDE with autocompletion and live output',
      'AI tutor providing contextual hints without revealing direct answers',
      'Dynamic gamified skill mastery trees with verifiable certificates',
      'Cohort peer review system with inline diff comments'
    ],
    metrics: [
      { label: 'Active Students', value: '14,000+' },
      { label: 'Code Runs / Day', value: '120,000' },
      { label: 'Course Completion', value: '78%' }
    ]
  },
  {
    id: 'orbit-workspace',
    number: '13',
    title: 'Orbit Workspace',
    tagline: 'Offline-First Real-Time Collaborative Canvas & Docs',
    shortDescription: 'Blazing-fast collaborative workspace combining freeform spatial canvases, markdown docs, and instant syncing.',
    longDescription: 'A productivity environment built on Conflict-Free Replicated Data Types (CRDTs). Empowers distributed product teams to diagram architecture, write technical specs, and organize sprints with seamless offline support.',
    category: 'AI & Fullstack',
    image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80',
    technologies: ['React', 'TypeScript', 'WebSockets', 'Yjs (CRDTs)', 'IndexedDB', 'Tailwind CSS'],
    liveUrl: 'https://orbitworkspace.io',
    githubUrl: 'https://github.com/thabolanez4/orbit-workspace',
    featured: false,
    year: 2024,
    role: 'Frontend & Distributed State Specialist',
    duration: '3 Months',
    challenge: 'Ensuring zero merge conflicts and seamless local-first persistence when users reconnect after offline editing.',
    solution: 'Implemented Yjs state vector reconciliation with IndexedDB persistent storage and WebSocket broadcast rooms.',
    features: [
      'Multiplayer real-time cursors with presence avatars and typing hints',
      'Hybrid block-based document editor with code execution embeds',
      'Infinite zoomable spatial canvas with smart connective auto-routing',
      'Full offline functionality with instant zero-conflict cloud synchronization'
    ],
    metrics: [
      { label: 'Daily Sync Ops', value: '2.5M+' },
      { label: 'Sync Latency', value: '<25ms' },
      { label: 'Offline Recovery', value: '100% Reliable' }
    ]
  },
  {
    id: 'scent-and-stone',
    number: '14',
    title: 'Scent & Stone',
    tagline: 'Headless Luxury Fragrance Boutique with 3D Configurator',
    shortDescription: 'Editorial luxury e-commerce experience featuring 3D bottle customization, fragrance notes visualization, and checkout.',
    longDescription: 'A headless luxury shopping destination for bespoke perfumes. Features real-time 3D glass rendering, custom engraving simulations, interactive olfactive pyramid breakdowns, and high-conversion Stripe checkout.',
    category: 'E-commerce',
    image: 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Next.js', 'Shopify Storefront API', 'Three.js', 'Tailwind CSS', 'Stripe'],
    liveUrl: 'https://scentandstone.luxury',
    githubUrl: 'https://github.com/thabolanez4/scent-and-stone',
    featured: false,
    year: 2023,
    role: 'Frontend & 3D Specialist',
    duration: '2.5 Months',
    challenge: 'Rendering realistic glass refraction and liquid physics inside a WebGL bottle at 60 FPS on mobile devices.',
    solution: 'Crafted custom Three.js physical transmission shaders with screen-space approximations and baked irradiance maps.',
    features: [
      '3D Bottle customizer with real-time metallic cap and typography engraving',
      'Interactive olfactive pyramid exploring Top, Heart, and Base notes',
      'Seamless headless Shopify cart and one-click Apple Pay checkout',
      'Bespoke sample discovery box builder with dynamic discount bundles'
    ],
    metrics: [
      { label: 'Average Order Value', value: '$185' },
      { label: 'Cart Conversion', value: '+42%' },
      { label: '3D Interactions', value: '110,000+' }
    ]
  },
  {
    id: 'sentinel-guard',
    number: '15',
    title: 'Sentinel CyberGuard',
    tagline: 'Automated CI/CD Vulnerability Scanner & Supply Chain Guard',
    shortDescription: 'DevSecOps security engine scanning source code, open-source dependencies, and Docker images for zero-day exploits.',
    longDescription: 'An automated security engine integrating into GitHub Actions and GitLab CI. Generates Software Bill of Materials (SBOM), detects secrets leakage, checks CVE databases, and recommends automated code patches.',
    category: 'Cloud & DevOps',
    image: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1000&q=80',
    technologies: ['Go', 'Python', 'React', 'Docker', 'GraphQL', 'GitHub API', 'Tailwind CSS'],
    liveUrl: 'https://sentinelguard.security',
    githubUrl: 'https://github.com/thabolanez4/sentinel-guard',
    featured: false,
    year: 2024,
    role: 'Security & DevOps Engineer',
    duration: '4 Months',
    challenge: 'Parsing complex multi-language ASTs and dependency lockfiles with near-zero build pipeline delay.',
    solution: 'Engineered a concurrent Go scanner that performs parallel static analysis in under 4 seconds per commit.',
    features: [
      'Automated Pull Request security check comments with 1-click patch PRs',
      'Deep secret detection engine scanning commits, branches, and git history',
      'CycloneDX and SPDX Software Bill of Materials (SBOM) generation',
      'Executive vulnerability trend reports with remediation countdowns'
    ],
    metrics: [
      { label: 'Scans Completed', value: '350,000+' },
      { label: 'Vulnerabilities Fixed', value: '28,000+' },
      { label: 'Avg Scan Time', value: '3.8s' }
    ]
  }
];

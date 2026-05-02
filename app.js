const DATA_URL = "data/models.json";
const COUNTRY_GEOJSON_URL = "https://raw.githubusercontent.com/johan/world.geo.json/master/countries.geo.json";
const BRAZIL_STATES_GEOJSON_URL = "https://raw.githubusercontent.com/giuliano-macedo/geodata-br-states/main/geojson/br_states.json";
const VIEW_PREFS_KEY = "llmTimelineViewPreferences";
const VALID_VIEWS = new Set(["timeline", "years", "map", "table", "sources"]);
const VALID_MAP_LAYERS = new Set(["companies", "labs", "datacenters", "all"]);
const VALID_LANE_MODES = new Set(["company", "all"]);
const VALID_TABLE_DATE_ORDERS = new Set(["desc", "asc"]);
const AI_CATEGORIES = ["LLMs", "Imagem", "Video", "Audio/Transcricao", "Musica"];
const VALID_AI_CATEGORIES = new Set(AI_CATEGORIES);
const TIMELINE_EVENT_EDGE_PX = 108;

const state = {
  metadata: {},
  canonicalModels: [],
  filters: {
    query: "",
    aiCategory: "LLMs",
    company: "all",
    type: "all",
    family: "all",
    year: "all",
    yearStart: "all",
    yearEnd: "all"
  },
  tableDateOrder: "desc",
  view: "timeline",
  laneMode: "company",
  mapLayer: "all",
  selectedId: null,
  selectedMapCompany: null,
  companyGlobe: null,
  globeResizeObserver: null,
  globeLayoutLocations: [],
  countryBorderFeatures: [],
  countryBordersLoaded: false,
  countryBordersRequest: null,
  brazilStateBorderFeatures: [],
  brazilStateBordersLoaded: false,
  brazilStateBordersRequest: null
};

const companyColors = {
  OpenAI: "#0f766e",
  Anthropic: "#a16207",
  Google: "#2563eb",
  xAI: "#111827",
  "Moonshot AI": "#7c3aed",
  "Z.AI": "#dc2626",
  Xiaomi: "#ea580c",
  DeepSeek: "#0891b2",
  "Maritaca AI": "#047857",
  "Mistral AI": "#e25822",
  NVIDIA: "#76b900",
  Suno: "#be185d",
  Udio: "#6d28d9",
  "Black Forest Labs": "#166534",
  ByteDance: "#0f172a",
  Kuaishou: "#f97316",
  Alibaba: "#c2410c",
  MiniMax: "#7c2d12"
};

const dataCenterStatusColors = {
  Operacional: "#22c55e",
  "Em construcao": "#f59e0b",
  Planejado: "#38bdf8",
  Anunciado: "#8b5cf6",
  Pausado: "#94a3b8"
};

const researchLabColors = {
  Consorcio: "#0f766e",
  Universidade: "#2563eb",
  Instituto: "#7c3aed",
  "Lab corporativo": "#be185d"
};

const companyLocations = [
  {
    company: "Alibaba",
    city: "Hangzhou",
    region: "Zhejiang",
    country: "China",
    address: "969 West Wen Yi Road, Yuhang District",
    lat: 30.286,
    lng: 120.032,
    sourceName: "Alibaba Group",
    sourceUrl: "https://www.alibabagroup.com/en-US/faqs-corporate-information"
  },
  {
    company: "Anthropic",
    site: "Headquarters",
    city: "San Francisco",
    region: "California",
    country: "United States",
    address: "548 Market Street",
    lat: 37.7895,
    lng: -122.4005,
    sourceName: "Anthropic Help Center",
    sourceUrl: "https://support.anthropic.com/en/articles/10023646-i-think-a-user-is-infringing-my-copyright-or-other-intellectual-property-how-do-i-report-it"
  },
  {
    company: "Anthropic",
    site: "AI research hub",
    city: "New York",
    region: "New York",
    country: "United States",
    address: "New York City, NY",
    lat: 40.7128,
    lng: -74.006,
    notes: "Public careers pages list AI Research & Engineering roles in New York City; exact office address is not published there.",
    sourceName: "Anthropic Careers",
    sourceUrl: "https://www.anthropic.com/careers/jobs"
  },
  {
    company: "Anthropic",
    site: "AI research hub",
    city: "Seattle",
    region: "Washington",
    country: "United States",
    address: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    notes: "Public careers pages list AI Research & Engineering roles in Seattle; exact office address is not published there.",
    sourceName: "Anthropic Careers",
    sourceUrl: "https://www.anthropic.com/careers/jobs"
  },
  {
    company: "Anthropic",
    site: "AI research hub",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    notes: "Public careers pages list London roles across AI safety and research; exact office address is not published there.",
    sourceName: "Anthropic Careers",
    sourceUrl: "https://www.anthropic.com/careers/jobs"
  },
  {
    company: "Anthropic",
    site: "EMEA operations hub",
    city: "Dublin",
    region: "Dublin",
    country: "Ireland",
    address: "Dublin, Ireland",
    lat: 53.3498,
    lng: -6.2603,
    notes: "Public careers pages list Dublin roles; exact office address is not published there.",
    sourceName: "Anthropic Careers",
    sourceUrl: "https://www.anthropic.com/careers/jobs"
  },
  {
    company: "Anthropic",
    site: "AI research hub",
    city: "Zurich",
    region: "Zurich",
    country: "Switzerland",
    address: "Zurich, Switzerland",
    lat: 47.3769,
    lng: 8.5417,
    notes: "Public careers pages list pre-training and production model post-training roles in Zurich; exact office address is not published there.",
    sourceName: "Anthropic Careers",
    sourceUrl: "https://www.anthropic.com/careers/jobs"
  },
  {
    company: "Black Forest Labs",
    city: "Freiburg im Breisgau",
    region: "Baden-Wurttemberg",
    country: "Germany",
    address: "Bertoldstrasse 48",
    lat: 47.9961,
    lng: 7.8494,
    sourceName: "Craft",
    sourceUrl: "https://craft.co/black-forest-labs/locations"
  },
  {
    company: "ByteDance",
    city: "Beijing",
    region: "Beijing",
    country: "China",
    address: "43 North 3rd Ring West Road",
    lat: 39.9678,
    lng: 116.3212,
    sourceName: "Craft",
    sourceUrl: "https://craft.co/bytedance/locations"
  },
  {
    company: "DeepSeek",
    city: "Hangzhou",
    region: "Zhejiang",
    country: "China",
    address: "169 North Huancheng Road, Gongshu District",
    lat: 30.2879,
    lng: 120.1717,
    sourceName: "Craft",
    sourceUrl: "https://craft.co/hangzhou-deepseek-artificial-intelligence/locations"
  },
  {
    company: "Google",
    site: "Google DeepMind London",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "Google DeepMind, King's Cross, 6 Pancras Square",
    lat: 51.5335,
    lng: -0.1251,
    sourceName: "Google DeepMind",
    sourceUrl: "https://deepmind.google/about/"
  },
  {
    company: "Google",
    site: "Google DeepMind Bay Area",
    city: "Mountain View",
    region: "California",
    country: "United States",
    address: "Google DeepMind Bay Area / Googleplex",
    lat: 37.422,
    lng: -122.0841,
    notes: "Google DeepMind lists Bay Area as a location; marker uses the Google Mountain View campus area.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind Bangalore",
    city: "Bangalore",
    region: "Karnataka",
    country: "India",
    address: "Bangalore, India",
    lat: 12.9716,
    lng: 77.5946,
    notes: "Google DeepMind lists Bangalore as a location; exact office address is not published on that page.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind Cambridge",
    city: "Cambridge",
    region: "Massachusetts",
    country: "United States",
    address: "Cambridge, MA",
    lat: 42.3736,
    lng: -71.1097,
    notes: "Google DeepMind lists Cambridge (US) as a location; exact office address is not published on that page.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind Montreal",
    city: "Montreal",
    region: "Quebec",
    country: "Canada",
    address: "Montreal, Quebec",
    lat: 45.5017,
    lng: -73.5673,
    notes: "Google DeepMind lists Montreal as a location; exact office address is not published on that page.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind New York",
    city: "New York",
    region: "New York",
    country: "United States",
    address: "111 8th Avenue",
    lat: 40.7411,
    lng: -74.0038,
    notes: "Google DeepMind lists New York City as a location; marker uses the public Google office at 111 8th Avenue.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind Paris",
    city: "Paris",
    region: "Ile-de-France",
    country: "France",
    address: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    notes: "Google DeepMind lists Paris as a location; exact office address is not published on that page.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind Tokyo",
    city: "Tokyo",
    region: "Tokyo",
    country: "Japan",
    address: "Tokyo, Japan",
    lat: 35.6762,
    lng: 139.6503,
    notes: "Google DeepMind lists Tokyo as a location; exact office address is not published on that page.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind Toronto",
    city: "Toronto",
    region: "Ontario",
    country: "Canada",
    address: "Toronto, Ontario",
    lat: 43.6532,
    lng: -79.3832,
    notes: "Google DeepMind lists Toronto as a location; exact office address is not published on that page.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Google",
    site: "Google DeepMind Zurich",
    city: "Zurich",
    region: "Zurich",
    country: "Switzerland",
    address: "Zurich, Switzerland",
    lat: 47.3769,
    lng: 8.5417,
    notes: "Google DeepMind lists Zurich as a location; exact office address is not published on that page.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
  },
  {
    company: "Kuaishou",
    city: "Beijing",
    region: "Beijing",
    country: "China",
    address: "No. 29, Xierqi Middle Road, Haidian District",
    lat: 40.0539,
    lng: 116.3074,
    sourceName: "Kuaishou IR",
    sourceUrl: "https://ir.kuaishou.com/investor-resources/investor-faqs"
  },
  {
    company: "Maritaca AI",
    city: "Campinas",
    region: "Sao Paulo",
    country: "Brazil",
    address: "Campinas, SP",
    lat: -22.9056,
    lng: -47.0608,
    sourceName: "LinkedIn",
    sourceUrl: "https://www.linkedin.com/company/maritaca-ai"
  },
  {
    company: "Meta",
    site: "Meta AI / FAIR New York",
    city: "New York",
    region: "New York",
    country: "United States",
    address: "Meta AI / FAIR, Astor Place, 770 Broadway",
    lat: 40.7305,
    lng: -73.9911,
    sourceName: "Meta AI / FAIR",
    sourceUrl: "https://ai.meta.com/"
  },
  {
    company: "Meta",
    site: "Meta Platforms HQ / MSL",
    city: "Menlo Park",
    region: "California",
    country: "United States",
    address: "1 Meta Way (formerly 1 Hacker Way)",
    lat: 37.4848,
    lng: -122.1484,
    notes: "Corporate headquarters and principal Menlo Park AI hub; Meta Superintelligence Labs is organized inside Meta's AI work.",
    sourceName: "SEC EDGAR",
    sourceUrl: "https://www.sec.gov/Archives/edgar/data/1326801/000132680125000058/0001326801-25-000058-index.htm"
  },
  {
    company: "Meta",
    site: "Meta AI / FAIR London",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "Meta King's Cross offices",
    lat: 51.5352,
    lng: -0.1264,
    notes: "Meta identifies London as an AI research tech hub; marker uses the King's Cross office area.",
    sourceName: "Meta Newsroom",
    sourceUrl: "https://about.fb.com/news/2022/03/the-prince-of-wales-and-the-duchess-of-cornwall-are-officially-opening-metas-london-kings-cross-offices/"
  },
  {
    company: "Meta",
    site: "Meta AI / FAIR Paris",
    city: "Paris",
    region: "Ile-de-France",
    country: "France",
    address: "FAIR Paris hub",
    lat: 48.8566,
    lng: 2.3522,
    notes: "FAIR's European AI research center was announced in Paris; exact current office address is not published on the referenced page.",
    sourceName: "Meta Newsroom",
    sourceUrl: "https://about.fb.com/fr/news/2015/06/facebook-choisit-paris-pour-installer-sa-nouvelle-equipe-de-recherche-europeenne-sur-lintelligence-artificielle/"
  },
  {
    company: "Meta",
    site: "Meta AI / FAIR Seattle",
    city: "Seattle",
    region: "Washington",
    country: "United States",
    address: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    notes: "Meta Engineering lists Seattle among FAIR's international labs; marker is city-level.",
    sourceName: "Meta Engineering",
    sourceUrl: "https://engineering.fb.com/2018/12/05/ai-research/fair-fifth-anniversary/"
  },
  {
    company: "Meta",
    site: "Meta AI / FAIR Pittsburgh",
    city: "Pittsburgh",
    region: "Pennsylvania",
    country: "United States",
    address: "Pittsburgh, PA",
    lat: 40.4406,
    lng: -79.9959,
    notes: "Meta Engineering lists Pittsburgh among FAIR's international labs; marker is city-level.",
    sourceName: "Meta Engineering",
    sourceUrl: "https://engineering.fb.com/2018/12/05/ai-research/fair-fifth-anniversary/"
  },
  {
    company: "Meta",
    site: "Meta AI / FAIR Tel Aviv",
    city: "Tel Aviv",
    region: "Tel Aviv",
    country: "Israel",
    address: "Tel Aviv, Israel",
    lat: 32.0853,
    lng: 34.7818,
    notes: "Meta identifies Tel Aviv as one of its EMEA AI research tech hubs; marker is city-level.",
    sourceName: "Meta Newsroom",
    sourceUrl: "https://about.fb.com/news/2023/06/a-spotlight-on-the-four-emea-tech-hubs-pioneering-metas-ai-research-around-the-world/amp/"
  },
  {
    company: "Meta",
    site: "Meta AI / FAIR Montreal",
    city: "Montreal",
    region: "Quebec",
    country: "Canada",
    address: "Montreal, Quebec",
    lat: 45.5017,
    lng: -73.5673,
    notes: "Meta Engineering lists Montreal among FAIR's international labs; marker is city-level.",
    sourceName: "Meta Engineering",
    sourceUrl: "https://engineering.fb.com/2018/12/05/ai-research/fair-fifth-anniversary/"
  },
  {
    company: "Meta",
    site: "Meta AI EMEA tech hub Zurich",
    city: "Zurich",
    region: "Zurich",
    country: "Switzerland",
    address: "Zurich, Switzerland",
    lat: 47.3769,
    lng: 8.5417,
    notes: "Meta's EMEA AI research article spotlights Zurich alongside Paris, London and Tel Aviv; marker is city-level.",
    sourceName: "Meta Newsroom",
    sourceUrl: "https://about.fb.com/news/2023/06/a-spotlight-on-the-four-emea-tech-hubs-pioneering-metas-ai-research-around-the-world/amp/"
  },
  {
    company: "MiniMax",
    city: "Shanghai",
    region: "Shanghai",
    country: "China",
    address: "No. 65 Guiqing Road, Xuhui District",
    lat: 31.1706,
    lng: 121.4135,
    sourceName: "CB Insights",
    sourceUrl: "https://www.cbinsights.com/company/minimax-ai"
  },
  {
    company: "Mistral AI",
    site: "Headquarters",
    city: "Paris",
    region: "Ile-de-France",
    country: "France",
    address: "15 rue des Halles",
    lat: 48.8623,
    lng: 2.3468,
    sourceName: "Mistral AI Legal Notice",
    sourceUrl: "https://legal.mistral.ai/legal-notice"
  },
  {
    company: "Mistral AI",
    site: "London hub",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    notes: "Mistral AI careers identifies colleagues in London; exact office address is not published there.",
    sourceName: "Mistral AI Careers",
    sourceUrl: "https://mistral.ai/careers"
  },
  {
    company: "Mistral AI",
    site: "Palo Alto hub",
    city: "Palo Alto",
    region: "California",
    country: "United States",
    address: "Palo Alto, CA",
    lat: 37.4419,
    lng: -122.143,
    notes: "Mistral AI careers identifies colleagues in Palo Alto; exact office address is not published there.",
    sourceName: "Mistral AI Careers",
    sourceUrl: "https://mistral.ai/careers"
  },
  {
    company: "Moonshot AI",
    city: "Beijing",
    region: "Beijing",
    country: "China",
    address: "13F, Building 1, JD Technology Building, 76 Zhichun Road",
    lat: 39.976,
    lng: 116.3377,
    sourceName: "Moonshot AI",
    sourceUrl: "https://www.moonshot.cn/about"
  },
  {
    company: "NVIDIA",
    city: "Santa Clara",
    region: "California",
    country: "United States",
    address: "2788 San Tomas Expressway",
    lat: 37.3701,
    lng: -121.9653,
    sourceName: "NVIDIA",
    sourceUrl: "https://www.nvidia.com/object/map.html"
  },
  {
    company: "OpenAI",
    site: "Headquarters",
    city: "San Francisco",
    region: "California",
    country: "United States",
    address: "1455 3rd Street",
    lat: 37.7708,
    lng: -122.3892,
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/policies/eu-terms-of-use/"
  },
  {
    company: "OpenAI",
    site: "London office",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    notes: "OpenAI announced London as its first international office; exact office address is not published on the announcement page.",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/blog/introducing-openai-london"
  },
  {
    company: "OpenAI",
    site: "Dublin office",
    city: "Dublin",
    region: "Dublin",
    country: "Ireland",
    address: "Dublin, Ireland",
    lat: 53.3498,
    lng: -6.2603,
    notes: "OpenAI careers lists Dublin roles; exact office address is not published there.",
    sourceName: "OpenAI Careers",
    sourceUrl: "https://openai.com/careers/search/"
  },
  {
    company: "OpenAI",
    site: "Tokyo office",
    city: "Tokyo",
    region: "Tokyo",
    country: "Japan",
    address: "Tokyo, Japan",
    lat: 35.6762,
    lng: 139.6503,
    notes: "OpenAI careers lists Tokyo roles; exact office address is not published there.",
    sourceName: "OpenAI Careers",
    sourceUrl: "https://openai.com/careers/search/"
  },
  {
    company: "OpenAI",
    site: "New York office",
    city: "New York",
    region: "New York",
    country: "United States",
    address: "New York City, NY",
    lat: 40.7128,
    lng: -74.006,
    notes: "OpenAI announced New York City as part of its global office expansion; exact office address is not published on the referenced page.",
    sourceName: "OpenAI / LinkedIn",
    sourceUrl: "https://www.linkedin.com/news/story/openai-to-open-global-offices-6357505/"
  },
  {
    company: "OpenAI",
    site: "Seattle office",
    city: "Seattle",
    region: "Washington",
    country: "United States",
    address: "Seattle, WA",
    lat: 47.6062,
    lng: -122.3321,
    notes: "OpenAI announced Seattle as part of its global office expansion; exact office address is not published on the referenced page.",
    sourceName: "OpenAI / LinkedIn",
    sourceUrl: "https://www.linkedin.com/news/story/openai-to-open-global-offices-6357505/"
  },
  {
    company: "OpenAI",
    site: "Paris office",
    city: "Paris",
    region: "Ile-de-France",
    country: "France",
    address: "Paris, France",
    lat: 48.8566,
    lng: 2.3522,
    notes: "OpenAI announced Paris as part of its global office expansion; exact office address is not published on the referenced page.",
    sourceName: "OpenAI / LinkedIn",
    sourceUrl: "https://www.linkedin.com/news/story/openai-to-open-global-offices-6357505/"
  },
  {
    company: "OpenAI",
    site: "Brussels office",
    city: "Brussels",
    region: "Brussels",
    country: "Belgium",
    address: "Brussels, Belgium",
    lat: 50.8503,
    lng: 4.3517,
    notes: "OpenAI announced Brussels as part of its global office expansion; exact office address is not published on the referenced page.",
    sourceName: "OpenAI / LinkedIn",
    sourceUrl: "https://www.linkedin.com/news/story/openai-to-open-global-offices-6357505/"
  },
  {
    company: "OpenAI",
    site: "Singapore office",
    city: "Singapore",
    region: "Singapore",
    country: "Singapore",
    address: "Singapore",
    lat: 1.3521,
    lng: 103.8198,
    notes: "OpenAI announced Singapore as part of its global office expansion; exact office address is not published on the referenced page.",
    sourceName: "OpenAI / LinkedIn",
    sourceUrl: "https://www.linkedin.com/news/story/openai-to-open-global-offices-6357505/"
  },
  {
    company: "Suno",
    city: "Cambridge",
    region: "Massachusetts",
    country: "United States",
    address: "Harvard Square",
    lat: 42.3736,
    lng: -71.119,
    sourceName: "Suno",
    sourceUrl: "https://suno.com/about?_rsc=yqfsr"
  },
  {
    company: "Udio",
    city: "New York",
    region: "New York",
    country: "United States",
    address: "New York, NY",
    lat: 40.7624,
    lng: -73.968,
    sourceName: "LinkedIn",
    sourceUrl: "https://www.linkedin.com/company/udiomusic"
  },
  {
    company: "xAI",
    city: "Palo Alto",
    region: "California",
    country: "United States",
    address: "Palo Alto headquarters",
    lat: 37.4419,
    lng: -122.143,
    sourceName: "xAI",
    sourceUrl: "https://x.ai/about"
  },
  {
    company: "Xiaomi",
    city: "Beijing",
    region: "Beijing",
    country: "China",
    address: "Xiaomi Campus, 33 Xierqi Middle Road, Haidian District",
    lat: 40.0503,
    lng: 116.2989,
    sourceName: "Xiaomi IR",
    sourceUrl: "https://ir.mi.com/investor-resources/ir-contacts/"
  },
  {
    company: "Z.AI",
    city: "Beijing",
    region: "Beijing",
    country: "China",
    address: "10F, Building 9, No. 1 Yard, Zhongguancun East Road",
    lat: 39.9978,
    lng: 116.3262,
    sourceName: "Z.ai",
    sourceUrl: "https://www.zhipuai.cn/en/contact"
  }
];

const researchLabs = [
  {
    id: "pt-center-responsible-ai",
    name: "Center for Responsible AI",
    organization: "Unbabel-led national consortium",
    category: "Consorcio",
    city: "Lisbon",
    region: "Lisbon",
    country: "Portugal",
    address: "Lisbon, Portugal",
    lat: 38.7223,
    lng: -9.1393,
    focus: "Responsible AI, fairness, explainability, privacy, sustainability",
    notes: "EUR 78M consortium joining startups, research centers and industry to build responsible AI products and research capacity in Portugal.",
    sourceName: "Center for Responsible AI",
    sourceUrl: "https://centerforresponsible.ai/the-center/"
  },
  {
    id: "pt-sail-inesc-id",
    name: "SAIL - Sustainable Artificial Intelligence Laboratory",
    organization: "INESC-ID / Instituto Superior Tecnico",
    category: "Instituto",
    city: "Lisbon",
    region: "Lisbon",
    country: "Portugal",
    address: "Rua Alves Redol, 9",
    lat: 38.7369,
    lng: -9.1387,
    focus: "Sustainable and trustworthy AI, explainability, reasoning, AI ethics and regulation",
    notes: "Horizon Europe Centre of Excellence with EUR 27.2M total funding, led by INESC-ID with MPI-SWS and DFKI.",
    sourceName: "INESC-ID",
    sourceUrl: "https://www.inesc-id.pt/inesc-id-secures-e27-2-million-to-establish-the-sustainable-artificial-intelligence-laboratory-sail-centre-of-excellence/"
  },
  {
    id: "pt-nova-lincs",
    name: "NOVA LINCS Intelligent Systems",
    organization: "NOVA University Lisbon",
    category: "Universidade",
    city: "Caparica",
    region: "Setubal",
    country: "Portugal",
    address: "Campus de Caparica, 2829-516 Caparica",
    lat: 38.661,
    lng: -9.205,
    focus: "Intelligent systems, knowledge representation, trustworthy ML, multimodal systems",
    notes: "Portuguese computer science lab with an Intelligent Systems group described as a leading national AI research group.",
    sourceName: "NOVA LINCS",
    sourceUrl: "https://nova-lincs.di.fct.unl.pt/areas/knowledge-based-systems/"
  },
  {
    id: "br-c4ai-usp",
    name: "C4AI - Center for Artificial Intelligence",
    organization: "USP / IBM / FAPESP",
    category: "Universidade",
    city: "Sao Paulo",
    region: "Sao Paulo",
    country: "Brazil",
    address: "InovaUSP, Av. Prof. Lucio Martins Rodrigues, 370",
    lat: -23.559,
    lng: -46.733,
    focus: "Portuguese NLP, indigenous languages, climate and ocean ML, health, agribusiness, AI and society",
    notes: "Engineering Research Center launched in 2020; headquartered at InovaUSP with additional USP campuses and partners.",
    sourceName: "FAPESP",
    sourceUrl: "https://www.fapesp.br/cpa/center_for_artificial_intelligence_%28c4ai%29/77"
  },
  {
    id: "br-ceia-ufg",
    name: "CEIA - Centro de Excelencia em IA",
    organization: "Universidade Federal de Goias",
    category: "Universidade",
    city: "Goiania",
    region: "Goias",
    country: "Brazil",
    address: "Alameda Palmeiras, Quadra D, Campus Samambaia, Instituto de Informatica da UFG",
    lat: -16.6038,
    lng: -49.2637,
    focus: "AI and data science for industry, public sector, health, agribusiness and autonomous systems",
    notes: "UFG center founded in 2019 with Embrapii unit status, AI supercomputers and a broad applied research portfolio.",
    sourceName: "CEIA-UFG",
    sourceUrl: "https://ceia.ufg.br/ceia/"
  },
  {
    id: "br-cpa-ia-senai-cimatec",
    name: "CPA-IA - Centro de Pesquisa Aplicada em IA para a Industria",
    organization: "SENAI CIMATEC",
    category: "Instituto",
    city: "Salvador",
    region: "Bahia",
    country: "Brazil",
    address: "Av. Orlando Gomes, 1845, Piata",
    lat: -12.9386,
    lng: -38.3643,
    focus: "Industrial AI, data science, open multi-user AI platform for Brazilian industry",
    notes: "Applied AI center backed by FAPESP, MCTI and CGI.br, hosted at SENAI CIMATEC.",
    sourceName: "CPA-IA",
    sourceUrl: "https://cpaia.senaicimatec.com.br/sobre/quem-somos"
  },
  {
    id: "br-hiaac-unicamp-eldorado",
    name: "H.IAAC - Hub de IA e Arquiteturas Cognitivas",
    organization: "Unicamp / Instituto Eldorado",
    category: "Consorcio",
    city: "Campinas",
    region: "Sao Paulo",
    country: "Brazil",
    address: "Universidade Estadual de Campinas",
    lat: -22.817,
    lng: -47.0696,
    focus: "AI architectures, mobile and embedded intelligent systems, cognitive architectures",
    notes: "MCTI/Softex initiative executed by Instituto Eldorado and Unicamp, with space at Unicamp for about 50 researchers.",
    sourceName: "Instituto Eldorado",
    sourceUrl: "https://www.eldorado.org.br/noticia/hub-de-inteligencia-artificial-e-arquiteturas-cognitivas-h-iaac-e-inaugurado-na-unicamp/"
  },
  {
    id: "br-inct-tildiar-ufmg",
    name: "INCT TILDIAR",
    organization: "DCC UFMG / MCTI / national research network",
    category: "Universidade",
    city: "Belo Horizonte",
    region: "Minas Gerais",
    country: "Brazil",
    address: "Av. Antonio Carlos, 6627, ICEx, Pampulha",
    lat: -19.87,
    lng: -43.9678,
    focus: "Responsible AI for computational linguistics, information quality, privacy, Portuguese-language AI",
    notes: "National institute hosted at DCC UFMG, connecting more than 30 universities and research centers.",
    sourceName: "INCT TILDIAR",
    sourceUrl: "https://tildiar.dcc.ufmg.br/"
  },
  {
    id: "mx-unam-iimas-ai-lab",
    name: "Laboratorio de Inteligencia Artificial y Alta Tecnologia",
    organization: "UNAM / IIMAS",
    category: "Universidade",
    city: "Mexico City",
    region: "CDMX",
    country: "Mexico",
    address: "Instituto de Investigaciones en Matematicas Aplicadas y en Sistemas, Ciudad Universitaria",
    lat: 19.3269,
    lng: -99.1805,
    focus: "AI, machine learning, data science, NLP, computer vision and high-technology training",
    notes: "UNAM laboratory inaugurated at IIMAS with support from Huawei and Mexican public institutions.",
    sourceName: "Gaceta UNAM",
    sourceUrl: "https://www.gaceta.unam.mx/inaugura-el-iimas-laboratorio-de-inteligencia-artificial-y-alta-tecnologia/"
  },
  {
    id: "mx-cimat-ai",
    name: "CIMAT Computer Science AI Research",
    organization: "Centro de Investigacion en Matematicas",
    category: "Instituto",
    city: "Guanajuato",
    region: "Guanajuato",
    country: "Mexico",
    address: "Jalisco S/N, Col. Valenciana",
    lat: 21.0393,
    lng: -101.2565,
    focus: "Machine learning, NLP, multimodal generative models, computer vision, robotics and statistical computing",
    notes: "Public research center with internationally recognized computer science programs and explicit AI/LLM research agenda.",
    sourceName: "CIMAT",
    sourceUrl: "https://www.cimat.mx/investigacion/seccion-ciencias-de-la-computacion/"
  },
  {
    id: "cl-cenia",
    name: "CENIA - Centro Nacional de Inteligencia Artificial",
    organization: "National AI center / Chilean university alliance",
    category: "Instituto",
    city: "Santiago",
    region: "Region Metropolitana",
    country: "Chile",
    address: "Edificio de Innovacion UC, Vicuña Mackenna 4860, Piso 2",
    lat: -33.5002,
    lng: -70.6155,
    focus: "AI research, technology transfer, public policy, Latam-GPT and regional benchmarks",
    notes: "Chile's national AI center and one of the clearest Latin American AI coordination hubs.",
    sourceName: "CENIA",
    sourceUrl: "https://cenia.cl/"
  },
  {
    id: "ar-liaa-uba-conicet",
    name: "LIAA - Laboratorio de Inteligencia Artificial Aplicada",
    organization: "UBA / CONICET",
    category: "Universidade",
    city: "Buenos Aires",
    region: "Ciudad Autonoma de Buenos Aires",
    country: "Argentina",
    address: "Oficina 2106, Pabellon 0+Infinito, Ciudad Universitaria",
    lat: -34.5419,
    lng: -58.4432,
    focus: "Applied AI, computational neuroscience, NLP, dialogue systems, speech recognition and computer vision",
    notes: "Interdisciplinary AI laboratory at UBA and CONICET, with research spanning health, justice, industry and machine learning.",
    sourceName: "LIAA",
    sourceUrl: "https://www.liaa.dc.uba.ar/"
  },
  {
    id: "ar-cifasis-conicet-unr",
    name: "CIFASIS Machine Learning and Applications",
    organization: "CONICET / Universidad Nacional de Rosario",
    category: "Instituto",
    city: "Rosario",
    region: "Santa Fe",
    country: "Argentina",
    address: "Bv. 27 de Febrero 210 bis",
    lat: -32.964,
    lng: -60.652,
    focus: "Machine learning, intelligent information processing, bioinformatics, agroinformatics, multimedia signals",
    notes: "CONICET-UNR institute with long-running AI-related groups, including machine learning and applications.",
    sourceName: "CIFASIS",
    sourceUrl: "https://www.cifasis-conicet.gov.ar/"
  }
];

const aiDataCenters = [
  {
    id: "xai-colossus-memphis",
    company: "xAI",
    name: "Colossus 1",
    status: "Operacional",
    city: "Memphis",
    region: "Tennessee",
    country: "United States",
    address: "3231 Riverport Rd, Memphis, TN",
    lat: 35.052,
    lng: -90.147,
    power: "150 MW grid + 150 MW backup; fase 2 ~300 MW",
    accelerators: "200.000 GPUs",
    acceleratorType: "NVIDIA Hopper H100/H200",
    notes: "Cluster original de 100.000 H100, com expansao para 200.000 GPUs Hopper.",
    sourceName: "NVIDIA",
    sourceUrl: "https://nvidianews.nvidia.com/news/spectrum-x-ethernet-networking-xai-colossus"
  },
  {
    id: "xai-colossus-2-memphis",
    company: "xAI",
    name: "Colossus 2",
    status: "Em construcao",
    city: "Memphis",
    region: "Tennessee",
    country: "United States",
    address: "Tulane Rd / Whitehaven area, Memphis, TN",
    lat: 35.023,
    lng: -90.018,
    power: "N/D; projeto descrito como gigawatt-scale",
    accelerators: "110.000 em instalacao; meta publica de 1.000.000+",
    acceleratorType: "NVIDIA GB200",
    notes: "Expansao do Colossus em propriedade de cerca de 1 milhao de ft2.",
    sourceName: "WMC Action News 5",
    sourceUrl: "https://www.actionnews5.com/2025/07/22/xai-begins-installing-computing-infrastructure-colossus-2/"
  },
  {
    id: "openai-stargate-abilene",
    company: "OpenAI",
    name: "Stargate Abilene",
    status: "Operacional",
    city: "Abilene",
    region: "Texas",
    country: "United States",
    address: "5502 Spinks Rd, Abilene, TX",
    lat: 32.441,
    lng: -99.892,
    power: "1,2 GW alvo; 200 MW+ em operacao inicial",
    accelerators: "450.000+ GPUs planejadas",
    acceleratorType: "NVIDIA GB200",
    notes: "Campus Crusoe/Oracle usado para cargas da OpenAI; primeiros edificios operacionais.",
    sourceName: "Data Center Dynamics",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/openai-and-oracle-to-deploy-450000-gb200-gpus-at-stargate-abilene-data-center/"
  },
  {
    id: "openai-stargate-shackelford",
    company: "OpenAI",
    name: "Stargate Shackelford County",
    status: "Planejado",
    city: "Albany",
    region: "Texas",
    country: "United States",
    address: "Shackelford County, TX",
    lat: 32.743,
    lng: -99.354,
    power: "Parte dos 5,5 GW Oracle + Abilene",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Site Stargate anunciado pela OpenAI, Oracle e SoftBank; coordenada aproximada do condado.",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/index/five-new-stargate-sites"
  },
  {
    id: "openai-stargate-dona-ana",
    company: "OpenAI",
    name: "Stargate Dona Ana County",
    status: "Planejado",
    city: "Las Cruces",
    region: "New Mexico",
    country: "United States",
    address: "Dona Ana County, NM",
    lat: 32.3199,
    lng: -106.7637,
    power: "Parte dos 5,5 GW Oracle + Abilene",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Site Stargate anunciado; coordenada aproximada do condado.",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/index/five-new-stargate-sites"
  },
  {
    id: "openai-stargate-lordstown",
    company: "OpenAI",
    name: "Stargate Lordstown",
    status: "Em construcao",
    city: "Lordstown",
    region: "Ohio",
    country: "United States",
    address: "Lordstown, OH",
    lat: 41.1656,
    lng: -80.8576,
    power: "Parte de 1,5 GW SoftBank/OpenAI",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "SoftBank iniciou construcao; operacao prevista para o ano seguinte ao anuncio.",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/index/five-new-stargate-sites"
  },
  {
    id: "openai-stargate-milam",
    company: "OpenAI",
    name: "Stargate Milam County",
    status: "Planejado",
    city: "Cameron",
    region: "Texas",
    country: "United States",
    address: "Milam County, TX",
    lat: 30.8532,
    lng: -96.9769,
    power: "Parte de 1,5 GW SoftBank/OpenAI",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Site com infraestrutura energetica da SB Energy; coordenada aproximada do condado.",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/index/five-new-stargate-sites"
  },
  {
    id: "microsoft-fairwater",
    company: "Microsoft",
    name: "Fairwater AI Datacenter",
    status: "Em construcao",
    city: "Mount Pleasant",
    region: "Wisconsin",
    country: "United States",
    address: "Mount Pleasant, WI",
    lat: 42.7125,
    lng: -87.8945,
    power: "N/D",
    accelerators: "Centenas de milhares",
    acceleratorType: "NVIDIA GPUs",
    notes: "AI datacenter de 315 acres e 1,2 milhao de ft2; conclusao planejada para 2026.",
    sourceName: "Microsoft",
    sourceUrl: "https://blogs.microsoft.com/blog/2025/09/18/inside-the-worlds-most-powerful-ai-datacenter/"
  },
  {
    id: "meta-hyperion",
    company: "Meta",
    name: "Hyperion",
    status: "Em construcao",
    city: "Rayville",
    region: "Louisiana",
    country: "United States",
    address: "Richland Parish, near Holly Ridge / Rayville, LA",
    lat: 32.417,
    lng: -91.517,
    power: "Multi-GW; 2 GW+ ate 2030, potencial 5 GW",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Maior cluster de treinamento de IA da Meta, segundo a propria empresa.",
    sourceName: "Meta",
    sourceUrl: "https://about.fb.com/news/2025/12/metas-richland-parish-data-center-supports-louisiana-economy-875-million-in-contracts/"
  },
  {
    id: "meta-prometheus",
    company: "Meta",
    name: "Prometheus",
    status: "Em construcao",
    city: "New Albany",
    region: "Ohio",
    country: "United States",
    address: "New Albany, OH",
    lat: 40.0812,
    lng: -82.8088,
    power: "1 GW",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Cluster de IA da Meta previsto para entrar em operacao em 2026.",
    sourceName: "AP News",
    sourceUrl: "https://apnews.com/article/0eb051a9a11d96f7ce200e186ad13476"
  },
  {
    id: "aws-project-rainier",
    company: "Anthropic",
    name: "AWS Project Rainier",
    status: "Operacional",
    city: "New Carlisle",
    region: "Indiana",
    country: "United States",
    address: "St. Joseph County, IN",
    lat: 41.7003,
    lng: -86.5095,
    power: "Ate 2,2 GW no campus completo",
    accelerators: "500.000+ chips; meta de 1.000.000+",
    acceleratorType: "AWS Trainium2",
    notes: "Infraestrutura AWS usada pela Anthropic para treinar e servir Claude.",
    sourceName: "Amazon",
    sourceUrl: "https://www.aboutamazon.com/news/aws/aws-project-rainier-ai-trainium-chips-compute-cluster"
  },
  {
    id: "tesla-cortex",
    company: "Tesla",
    name: "Cortex",
    status: "Operacional",
    city: "Austin",
    region: "Texas",
    country: "United States",
    address: "Tesla Gigafactory Texas, Austin, TX",
    lat: 30.221,
    lng: -97.617,
    power: "130 MW inicial; ate 500 MW planejado",
    accelerators: "50.000 GPUs operacionais; expansao para ~100.000",
    acceleratorType: "NVIDIA H100/H200",
    notes: "Cluster de treinamento de FSD/Optimus da Tesla em Giga Texas.",
    sourceName: "Data Center Dynamics",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/teslas-50000-gpu-cortex-supercomputer-went-live-in-q4-2024/"
  },
  {
    id: "sensetime-aidc-shanghai",
    company: "SenseTime",
    name: "SenseTime AIDC",
    status: "Operacional",
    city: "Shanghai",
    region: "Shanghai",
    country: "China",
    address: "Lingang New Area, Shanghai",
    lat: 30.895,
    lng: 121.93,
    power: "N/D",
    accelerators: "5.000 racks",
    acceleratorType: "N/D",
    notes: "Capacidade de projeto de 3,74 EFLOPS, depois reportada acima de 8 EFLOPS.",
    sourceName: "Investment Monitor",
    sourceUrl: "https://www.investmentmonitor.ai/news/sensetime-ai-asia-data-centre-shanghai/"
  },
  {
    id: "china-unicom-xining",
    company: "China Unicom",
    name: "Xining AI Data Center",
    status: "Operacional",
    city: "Xining",
    region: "Qinghai",
    country: "China",
    address: "Xining, Qinghai",
    lat: 36.6171,
    lng: 101.7782,
    power: "N/D",
    accelerators: "23.000 chips de IA",
    acceleratorType: "Chips domesticos: Alibaba T-Head, MetaX, Biren e outros",
    notes: "3.579 PFLOPS atuais; meta local de 20.000 PFLOPS.",
    sourceName: "Data Center Dynamics",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/china-unicom-builds-massive-data-center-with-locally-developed-ai-chips/"
  },
  {
    id: "alibaba-shaoguan",
    company: "Alibaba",
    name: "Shaoguan Zhenwu Cluster",
    status: "Operacional",
    city: "Shaoguan",
    region: "Guangdong",
    country: "China",
    address: "Shaoguan data centre, Guangdong",
    lat: 24.8104,
    lng: 113.5975,
    power: "N/D",
    accelerators: "10.000 cards",
    acceleratorType: "Alibaba T-Head Zhenwu",
    notes: "Cluster domestico em parceria com China Telecom.",
    sourceName: "SCMP",
    sourceUrl: "https://www.scmp.com/tech/article/3349335/ai-race-us-intensifies-chinas-alibaba-launches-10000-card-computing-cluster"
  },
  {
    id: "shenzhen-ascend-cluster",
    company: "Huawei",
    name: "Shenzhen Ascend Cluster",
    status: "Operacional",
    city: "Shenzhen",
    region: "Guangdong",
    country: "China",
    address: "Shenzhen, Guangdong",
    lat: 22.5431,
    lng: 114.0579,
    power: "N/D",
    accelerators: "10.000 cards",
    acceleratorType: "Huawei Ascend 910C",
    notes: "11.000 PFLOPS; combinado com fase anterior, 14.000 PFLOPS.",
    sourceName: "SCMP",
    sourceUrl: "https://www.scmp.com/tech/big-tech/article/3348502/shenzhen-activates-chinas-first-10000-card-ai-cluster-domestic-chips"
  },
  {
    id: "huawei-guian",
    company: "Huawei",
    name: "Gui'an Ascend Cloud Cluster",
    status: "Operacional",
    city: "Gui'an New Area",
    region: "Guizhou",
    country: "China",
    address: "Gui'an New Area, Guizhou",
    lat: 26.401,
    lng: 106.63,
    power: "N/D",
    accelerators: "160.000 cards em rede",
    acceleratorType: "Huawei Ascend / CloudMatrix 384",
    notes: "432 supernodes; rede nacional com hubs em Gui'an, Ulanqab, Horqin e Wuhu.",
    sourceName: "Gizmochina",
    sourceUrl: "https://www.gizmochina.com/2025/08/29/huawei-cloud-reports-250-growth-in-ai-computing-power/"
  },
  {
    id: "bytedance-vnet-china",
    company: "ByteDance",
    name: "VNET AI Capacity for Doubao",
    status: "Anunciado",
    city: "China",
    region: "Multiple sites",
    country: "China",
    address: "VNET sites in China; locations not public",
    lat: 35.8617,
    lng: 104.1954,
    power: "500 MW contratado",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Acordo de capacidade para Doubao e outras cargas de IA; ponto no mapa e aproximacao nacional.",
    sourceName: "Data Center Dynamics",
    sourceUrl: "https://www.datacenterdynamics.com/en/news/tiktok-owner-bytedance-signs-500mw-vnet-china-data-center-deal/"
  },
  {
    id: "openai-stargate-uae",
    company: "OpenAI",
    name: "Stargate UAE",
    status: "Em construcao",
    city: "Abu Dhabi",
    region: "Abu Dhabi",
    country: "United Arab Emirates",
    address: "UAE-US AI Campus, Abu Dhabi",
    lat: 24.4539,
    lng: 54.3773,
    power: "1 GW cluster; dentro de campus UAE-US de 5 GW; 200 MW previstos para 2026",
    accelerators: "N/D",
    acceleratorType: "NVIDIA GPUs previstas; modelo e quantidade publica nao detalhados",
    notes: "Nao aparece como cancelado: OpenAI anunciou o projeto em maio de 2025 e G42/Khazna reportou progresso de construcao da primeira fase de 200 MW.",
    sourceName: "G42",
    sourceUrl: "https://www.prnewswire.com/news-releases/g42-provides-update-on-construction-of-stargate-uae-ai-infrastructure-cluster-302586401.html"
  },
  {
    id: "openai-stargate-norway",
    company: "OpenAI",
    name: "Stargate Norway / Narvik AI Gigafactory",
    status: "Em construcao",
    city: "Narvik",
    region: "Nordland",
    country: "Norway",
    address: "Kvandal / Narvik, Northern Norway",
    lat: 68.4385,
    lng: 17.4273,
    power: "230 MW inicial; ambicao de +290 MW",
    accelerators: "100.000 GPUs alvo ate fim de 2026",
    acceleratorType: "NVIDIA GPUs",
    notes: "Anunciado por OpenAI, Nscale e Aker. Reportes de abril de 2026 indicam que a estrutura comercial pode ter mudado para leasing via Microsoft/Nscale, mas o campus europeu segue relevante.",
    sourceName: "OpenAI",
    sourceUrl: "https://openai.com/index/introducing-stargate-norway/"
  },
  {
    id: "openai-stargate-uk-paused",
    company: "OpenAI",
    name: "Stargate UK",
    status: "Pausado",
    city: "North Tyneside",
    region: "England",
    country: "United Kingdom",
    address: "Cobalt Park / Blyth area, North East England",
    lat: 55.025,
    lng: -1.49,
    power: "N/D",
    accelerators: "8.000 GPUs previstos inicialmente; potencial de 31.000",
    acceleratorType: "NVIDIA GPUs",
    notes: "Anunciado em setembro de 2025, mas pausado em abril de 2026 por custos de energia e incerteza regulatoria; nao esta ativo no momento.",
    sourceName: "The Guardian",
    sourceUrl: "https://www.theguardian.com/technology/2026/apr/09/openai-pulls-out-of-landmark-31bn-uk-investment"
  },
  {
    id: "microsoft-nscale-loughton",
    company: "Microsoft",
    name: "Nscale Loughton AI Campus",
    status: "Em construcao",
    city: "Loughton",
    region: "England",
    country: "United Kingdom",
    address: "Loughton, Essex",
    lat: 51.649,
    lng: 0.055,
    power: "50 MW inicial; escalavel para 90 MW",
    accelerators: "23.040 GPUs",
    acceleratorType: "NVIDIA GB300",
    notes: "Projeto Nscale/Microsoft separado do Stargate UK pausado; previsto para entregar capacidade de IA no Reino Unido em 2027.",
    sourceName: "Nscale",
    sourceUrl: "https://www.nscale.com/press-releases/nscale-uk-ai-infrastructure-announcement"
  },
  {
    id: "mistral-compute-essonne",
    company: "Mistral AI",
    name: "Mistral Compute / Eclairion",
    status: "Em construcao",
    city: "Paris-Saclay",
    region: "Essonne",
    country: "France",
    address: "Essonne, near the Paris-Saclay campus",
    lat: 48.708,
    lng: 2.164,
    power: "N/D",
    accelerators: "18.000 GPUs",
    acceleratorType: "NVIDIA GB300 / Blackwell-class",
    notes: "Plataforma europeia de IA da Mistral, hospedada na Franca em parceria com Eclairion.",
    sourceName: "Le Monde",
    sourceUrl: "https://www.lemonde.fr/en/economy/article/2025/06/12/at-vivatech-emmanuel-macron-hails-historic-partnership-between-mistral-ai-and-nvidia_6742267_19.html"
  },
  {
    id: "nebius-lappeenranta",
    company: "Nebius",
    name: "Lappeenranta AI Factory",
    status: "Em construcao",
    city: "Lappeenranta",
    region: "South Karelia",
    country: "Finland",
    address: "Lappeenranta, Finland",
    lat: 61.0583,
    lng: 28.1869,
    power: "310 MW",
    accelerators: "N/D",
    acceleratorType: "NVIDIA systems planned",
    notes: "Nova AI factory dedicada; primeira capacidade prevista para clientes em 2027.",
    sourceName: "Nebius",
    sourceUrl: "https://nebius.com/newsroom/nebius-to-construct-310-mw-ai-factory-in-finland"
  },
  {
    id: "nvidia-telekom-munich",
    company: "NVIDIA",
    name: "Industrial AI Cloud Munich",
    status: "Operacional",
    city: "Munich",
    region: "Bavaria",
    country: "Germany",
    address: "Tucherpark, Munich",
    lat: 48.151,
    lng: 11.603,
    power: "N/D",
    accelerators: "Quase 10.000 GPUs",
    acceleratorType: "NVIDIA Blackwell: DGX B200 e RTX PRO Server GPUs",
    notes: "AI factory soberana operada pela Deutsche Telekom em solo alemao para industria, pesquisa, startups e setor publico.",
    sourceName: "Deutsche Telekom",
    sourceUrl: "https://www.telekom.com/en/media/media-information/archive/germany-s-first-ai-factory-for-industry-1101670"
  }
];

const els = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheElements();
  syncStickyOffsets();
  loadViewPreferences();
  syncViewControls();
  bindEvents();

  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const payload = await response.json();
    state.metadata = payload.metadata || {};
    state.canonicalModels = normalizeModels(payload.models || []);
    state.selectedId = allModels()[0]?.id || null;
    renderLastUpdated();
    populateFilters();
    render();
  } catch (error) {
    document.querySelector("main").innerHTML = `
      <section class="error-panel">
        <h2>Falha ao carregar a base</h2>
        <p>${escapeHtml(error.message)}</p>
        <p>Verifique se <code>${DATA_URL}</code> foi publicado no caminho correto.</p>
      </section>
    `;
  }
}

function cacheElements() {
  Object.assign(els, {
    topbar: document.querySelector(".topbar"),
    controls: document.querySelector(".controls"),
    searchInput: document.getElementById("searchInput"),
    aiCategoryFilter: document.getElementById("aiCategoryFilter"),
    companyFilter: document.getElementById("companyFilter"),
    typeFilter: document.getElementById("typeFilter"),
    familyFilter: document.getElementById("familyFilter"),
    yearFilter: document.getElementById("yearFilter"),
    yearStartFilter: document.getElementById("yearStartFilter"),
    yearEndFilter: document.getElementById("yearEndFilter"),
    tableDateOrder: document.getElementById("tableDateOrder"),
    metricModels: document.getElementById("metricModels"),
    metricCompanies: document.getElementById("metricCompanies"),
    metricYears: document.getElementById("metricYears"),
    metricSources: document.getElementById("metricSources"),
    timeline: document.getElementById("timeline"),
    timelineScale: document.getElementById("timelineScale"),
    modelDetails: document.getElementById("modelDetails"),
    yearChart: document.getElementById("yearChart"),
    companyGlobe: document.getElementById("companyGlobe"),
    companyLocationList: document.getElementById("companyLocationList"),
    mapSummary: document.getElementById("mapSummary"),
    mapLayerButtons: document.querySelectorAll("[data-map-layer]"),
    modelsTable: document.getElementById("modelsTable"),
    sourcesList: document.getElementById("sourcesList")
  });
}

function bindEvents() {
  window.addEventListener("resize", syncStickyOffsets);

  els.searchInput.addEventListener("input", (event) => {
    state.filters.query = event.target.value.trim().toLowerCase();
    saveViewPreferences();
    render();
  });

  for (const [key, element] of [
    ["aiCategory", els.aiCategoryFilter],
    ["company", els.companyFilter],
    ["type", els.typeFilter],
    ["family", els.familyFilter],
    ["year", els.yearFilter],
    ["yearStart", els.yearStartFilter],
    ["yearEnd", els.yearEndFilter]
  ]) {
    element.addEventListener("change", (event) => {
      state.filters[key] = event.target.value;
      if (key === "aiCategory") {
        state.filters.type = "all";
        syncFilterControls();
      }
      saveViewPreferences();
      render();
    });
  }

  document.querySelectorAll("[data-view]").forEach((button) => {
    button.addEventListener("click", () => {
      state.view = button.dataset.view;
      syncViewControls();
      saveViewPreferences();
      render();
    });
  });

  document.querySelectorAll("[data-lane-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.laneMode = button.dataset.laneMode;
      syncViewControls();
      saveViewPreferences();
      renderTimeline(filteredModels());
    });
  });

  els.mapLayerButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mapLayer = VALID_MAP_LAYERS.has(button.dataset.mapLayer) ? button.dataset.mapLayer : "all";
      state.selectedMapCompany = null;
      syncViewControls();
      renderCompanyMap();
    });
  });

  els.tableDateOrder.addEventListener("change", (event) => {
    state.tableDateOrder = VALID_TABLE_DATE_ORDERS.has(event.target.value) ? event.target.value : "desc";
    saveViewPreferences();
    renderTable(filteredModels());
  });
}

function renderLastUpdated() {
  const element = document.getElementById("lastUpdated");
  if (!element) return;

  const correction = state.metadata.last_correction;
  const date = correction?.date || state.metadata.updated_at;
  const description = correction?.description_pt;
  const formattedDate = date ? formatDate(date) : "data nao informada";
  element.textContent = description
    ? `Ultima atualizacao: ${formattedDate} - ${description}`
    : `Ultima atualizacao: ${formattedDate}`;
  syncStickyOffsets();
}

function normalizeModels(models) {
  return models
    .filter(Boolean)
    .map((model) => ({
      ...model,
      sources: normalizeSources(model),
      ai_category: normalizeAiCategories(model.ai_category),
      model_type: Array.isArray(model.model_type) ? model.model_type : String(model.model_type || "").split(",").map((item) => item.trim()).filter(Boolean),
      year: Number(String(model.release_date || "").slice(0, 4)),
      timestamp: Date.parse(`${model.release_date}T00:00:00`)
    }))
    .sort((a, b) => a.timestamp - b.timestamp || a.company.localeCompare(b.company) || a.model.localeCompare(b.model));
}

function normalizeAiCategories(value) {
  const rawCategories = Array.isArray(value) ? value : value ? [value] : ["LLMs"];
  const categories = rawCategories
    .map((category) => String(category).trim())
    .filter((category) => VALID_AI_CATEGORIES.has(category));

  return categories.length ? categories : ["LLMs"];
}

function allModels() {
  return state.canonicalModels;
}

function normalizeSources(model) {
  const rawSources = Array.isArray(model.sources)
    ? model.sources
    : model.source
      ? [model.source]
      : [];

  return rawSources
    .map((source) => ({
      source,
      url: normalizeHttpsUrl(source?.url)
    }))
    .filter(({ source, url }) => source && url)
    .map(({ source, url }) => ({
      title: source.title || "Fonte oficial",
      url,
      publisher: source.publisher || model.company,
      date_basis: source.date_basis || ""
    }));
}

function normalizeHttpsUrl(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch {
    return "";
  }
}

function populateFilters() {
  const models = allModels();
  fillSelect(els.aiCategoryFilter, ["LLMs", "all", ...AI_CATEGORIES.filter((category) => category !== "LLMs")], "Todos");
  fillSelect(els.companyFilter, ["all", ...unique(models.map((model) => model.company))], "Todas");
  fillSelect(els.typeFilter, ["all", ...unique(models.flatMap((model) => model.model_type))], "Todos");
  fillSelect(els.familyFilter, ["all", ...unique(models.map((model) => model.family))], "Todas");

  const years = unique(models.map((model) => model.year)).sort((a, b) => a - b);
  fillSelect(els.yearFilter, ["all", ...years], "Todos");
  fillSelect(els.yearStartFilter, ["all", ...years], "Inicio");
  fillSelect(els.yearEndFilter, ["all", ...years], "Fim");
  syncFilterControls();
  syncStickyOffsets();
  saveViewPreferences();
}

function fillSelect(element, values, allLabel) {
  element.innerHTML = values.map((value) => {
    const label = value === "all" ? allLabel : value;
    return `<option value="${escapeHtml(String(value))}">${escapeHtml(String(label))}</option>`;
  }).join("");
}

function syncFilterControls() {
  els.searchInput.value = state.filters.query;
  state.filters.aiCategory = optionExists(els.aiCategoryFilter, state.filters.aiCategory) ? state.filters.aiCategory : "LLMs";
  state.filters.company = optionExists(els.companyFilter, state.filters.company) ? state.filters.company : "all";
  state.filters.type = optionExists(els.typeFilter, state.filters.type) ? state.filters.type : "all";
  state.filters.family = optionExists(els.familyFilter, state.filters.family) ? state.filters.family : "all";
  state.filters.year = optionExists(els.yearFilter, state.filters.year) ? state.filters.year : "all";
  state.filters.yearStart = optionExists(els.yearStartFilter, state.filters.yearStart) ? state.filters.yearStart : "all";
  state.filters.yearEnd = optionExists(els.yearEndFilter, state.filters.yearEnd) ? state.filters.yearEnd : "all";

  els.aiCategoryFilter.value = state.filters.aiCategory;
  els.companyFilter.value = state.filters.company;
  els.typeFilter.value = state.filters.type;
  els.familyFilter.value = state.filters.family;
  els.yearFilter.value = state.filters.year;
  els.yearStartFilter.value = state.filters.yearStart;
  els.yearEndFilter.value = state.filters.yearEnd;
  els.tableDateOrder.value = VALID_TABLE_DATE_ORDERS.has(state.tableDateOrder) ? state.tableDateOrder : "desc";
}

function syncViewControls() {
  document.querySelectorAll("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === state.view);
  });
  document.querySelectorAll("[data-lane-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.laneMode === state.laneMode);
  });
  els.mapLayerButtons?.forEach((button) => {
    button.classList.toggle("active", button.dataset.mapLayer === state.mapLayer);
  });
}

function syncStickyOffsets() {
  const compactLayout = window.matchMedia("(max-width: 760px)").matches;
  const topbarHeight = compactLayout ? 0 : Math.ceil(els.topbar?.getBoundingClientRect().height || 0);
  const controlsHeight = Math.ceil(els.controls?.getBoundingClientRect().height || 0);
  document.documentElement.style.setProperty("--sticky-filter-top", `${topbarHeight}px`);
  document.documentElement.style.setProperty("--sticky-filter-height", `${controlsHeight}px`);
}

function loadViewPreferences() {
  try {
    const prefs = JSON.parse(localStorage.getItem(VIEW_PREFS_KEY) || "{}");
    if (VALID_VIEWS.has(prefs.view)) state.view = prefs.view;
    if (VALID_LANE_MODES.has(prefs.laneMode)) state.laneMode = prefs.laneMode;
    if (VALID_MAP_LAYERS.has(prefs.mapLayer)) state.mapLayer = prefs.mapLayer;
    if (VALID_TABLE_DATE_ORDERS.has(prefs.tableDateOrder)) state.tableDateOrder = prefs.tableDateOrder;
    if (prefs.filters && typeof prefs.filters === "object") {
      state.filters = {
        ...state.filters,
        ...Object.fromEntries(
          Object.entries(prefs.filters)
            .filter(([key, value]) => key in state.filters && typeof value === "string")
        )
      };
    }
  } catch {
    localStorage.removeItem(VIEW_PREFS_KEY);
  }
}

function saveViewPreferences() {
  try {
    localStorage.setItem(VIEW_PREFS_KEY, JSON.stringify({
      view: state.view,
      laneMode: state.laneMode,
      mapLayer: state.mapLayer,
      tableDateOrder: state.tableDateOrder,
      filters: state.filters
    }));
  } catch {
    // Prefer keeping the app usable when browser storage is unavailable.
  }
}

function optionExists(select, value) {
  return [...select.options].some((option) => option.value === String(value));
}

function unique(values) {
  return [...new Set(values.filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
}

function filteredModels() {
  return allModels().filter((model) => {
    const queryTarget = [
      model.model,
      model.company,
      model.family,
      model.release_stage,
      model.description_pt,
      ...(model.ai_category || []),
      ...(model.model_type || [])
    ].join(" ").toLowerCase();

    if (state.filters.query && !queryTarget.includes(state.filters.query)) return false;
    if (state.filters.aiCategory !== "all" && !model.ai_category.includes(state.filters.aiCategory)) return false;
    if (state.filters.company !== "all" && model.company !== state.filters.company) return false;
    if (state.filters.type !== "all" && !model.model_type.includes(state.filters.type)) return false;
    if (state.filters.family !== "all" && model.family !== state.filters.family) return false;
    if (state.filters.year !== "all" && model.year !== Number(state.filters.year)) return false;
    if (state.filters.yearStart !== "all" && model.year < Number(state.filters.yearStart)) return false;
    if (state.filters.yearEnd !== "all" && model.year > Number(state.filters.yearEnd)) return false;
    return true;
  });
}

function render() {
  document.querySelectorAll(".view").forEach((view) => {
    view.classList.toggle("active-view", view.id === `${state.view}View`);
  });

  const models = filteredModels();
  if (!models.some((model) => model.id === state.selectedId)) {
    state.selectedId = models[0]?.id || null;
  }

  renderMetrics(models);
  renderTimeline(models);
  renderYearChart(models);
  renderCompanyMap();
  renderTable(models);
  renderSources(models);
  renderDetails(models.find((model) => model.id === state.selectedId));
}

function renderMetrics(models) {
  const years = models.map((model) => model.year).filter(Boolean);
  els.metricModels.textContent = models.length;
  els.metricCompanies.textContent = unique(models.map((model) => model.company)).length;
  els.metricYears.textContent = years.length ? `${Math.min(...years)}-${Math.max(...years)}` : "-";
  els.metricSources.textContent = models.reduce((total, model) => total + model.sources.length, 0);
}

function renderTimeline(models) {
  if (!models.length) {
    els.timelineScale.innerHTML = "";
    els.timeline.innerHTML = `<div class="empty-state">Nenhum modelo no filtro atual.</div>`;
    return;
  }

  const min = Math.min(...models.map((model) => model.timestamp));
  const max = Math.max(...models.map((model) => model.timestamp));
  const span = Math.max(max - min, 1);
  const years = buildScaleYears(models);
  els.timelineScale.innerHTML = years.map((year) => {
    const left = ((Date.parse(`${year}-01-01T00:00:00`) - min) / span) * 100;
    return `<span style="left:clamp(24px, ${clamp(left, 0, 100)}%, calc(100% - 24px))">${year}</span>`;
  }).join("");

  const laneGroups = state.laneMode === "all"
    ? [["Todos", models]]
    : unique(models.map((model) => model.company)).map((company) => [company, models.filter((model) => model.company === company)]);

  els.timeline.innerHTML = laneGroups.map(([label, laneModels]) => {
    const events = laneModels.map((model, index) => {
      const left = ((model.timestamp - min) / span) * 100;
      const color = colorFor(model.company);
      const stack = index % 4;
      return `
        <button class="timeline-event ${model.id === state.selectedId ? "selected" : ""}"
          type="button"
          data-id="${escapeHtml(model.id)}"
          style="left:clamp(${TIMELINE_EVENT_EDGE_PX}px, ${clamp(left, 0, 100)}%, calc(100% - ${TIMELINE_EVENT_EDGE_PX}px)); --event-color:${color}; --stack:${stack};"
          title="${escapeHtml(model.company)} - ${escapeHtml(model.model)}">
          <span>${formatDate(model.release_date)}</span>
          <strong>${escapeHtml(model.model)}</strong>
        </button>
      `;
    }).join("");

    return `
      <div class="timeline-lane">
        <div class="lane-label">${escapeHtml(label)}</div>
        <div class="lane-track">${events}</div>
      </div>
    `;
  }).join("");

  els.timeline.querySelectorAll(".timeline-event").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedId = button.dataset.id;
      render();
    });
  });
}

function buildScaleYears(models) {
  const minYear = Math.min(...models.map((model) => model.year));
  const maxYear = Math.max(...models.map((model) => model.year));
  const years = [];
  for (let year = minYear; year <= maxYear; year += 1) years.push(year);
  return years;
}

function renderDetails(model) {
  if (!model) {
    els.modelDetails.innerHTML = `<div class="empty-state">Selecione um modelo.</div>`;
    return;
  }

  els.modelDetails.innerHTML = `
    <div class="detail-heading">
      <span class="dot" style="background:${colorFor(model.company)}"></span>
      <div>
        <p>${escapeHtml(model.company)} - ${escapeHtml(model.family)}</p>
        <h2>${escapeHtml(model.model)}</h2>
      </div>
    </div>
    <dl>
      <div><dt>Data</dt><dd>${formatDate(model.release_date)}</dd></div>
      <div><dt>Estagio</dt><dd>${escapeHtml(model.release_stage)}</dd></div>
      <div><dt>Tipo de IA</dt><dd>${model.ai_category.map(categoryPill).join("")}</dd></div>
      <div><dt>Tipos</dt><dd>${model.model_type.map(typePill).join("")}</dd></div>
      <div><dt>Confianca</dt><dd>${escapeHtml(model.confidence || "nao informada")}</dd></div>
    </dl>
    <p>${escapeHtml(model.description_pt || "")}</p>
    ${renderSourceBasis(model)}
    ${renderSourceLinks(model, "primary")}
  `;
}

function renderYearChart(models) {
  if (!models.length) {
    els.yearChart.innerHTML = `<div class="empty-state">Nenhum modelo no filtro atual.</div>`;
    return;
  }

  const byYear = new Map();
  models.forEach((model) => {
    if (!byYear.has(model.year)) byYear.set(model.year, []);
    byYear.get(model.year).push(model);
  });

  const maxCount = Math.max(...[...byYear.values()].map((items) => items.length));
  els.yearChart.innerHTML = [...byYear.entries()]
    .sort(([a], [b]) => a - b)
    .map(([year, yearModels]) => {
      const byCompany = unique(yearModels.map((model) => model.company)).map((company) => {
        const count = yearModels.filter((model) => model.company === company).length;
        const width = (count / yearModels.length) * 100;
        return `<span title="${escapeHtml(company)}: ${count}" style="width:${width}%; background:${colorFor(company)}"></span>`;
      }).join("");
      return `
        <div class="year-row">
          <div class="year-label">${year}</div>
          <div class="year-bar-wrap">
            <div class="year-bar" style="width:${Math.max((yearModels.length / maxCount) * 100, 6)}%">
              ${byCompany}
            </div>
          </div>
          <div class="year-count">${yearModels.length}</div>
          <div class="year-models">${yearModels.map((model) => escapeHtml(model.model)).join(", ")}</div>
        </div>
      `;
    }).join("");
}

function renderCompanyMap() {
  if (!els.companyLocationList || !els.mapSummary || !els.companyGlobe) return;

  const locations = locationsForMap();
  const countries = unique(locations.map((location) => location.country));
  const companyCount = locations.filter((location) => location.kind === "company").length;
  const labCount = locations.filter((location) => location.kind === "lab").length;
  const dataCenterCount = locations.filter((location) => location.kind === "datacenter").length;
  const missingCompanies = missingLocationCompanies();

  els.mapSummary.innerHTML = `
    ${companyCount ? `<span>${companyCount} sedes</span>` : ""}
    ${labCount ? `<span>${labCount} labs IA</span>` : ""}
    ${dataCenterCount ? `<span>${dataCenterCount} data centers</span>` : ""}
    <span>${countries.length} paises</span>
    ${(state.mapLayer === "companies" || state.mapLayer === "all") && missingCompanies.length ? `<span>${missingCompanies.length} sem coordenada</span>` : ""}
  `;

  renderCompanyLocationList(locations);
  if (state.view !== "map") return;

  requestAnimationFrame(() => {
    if (typeof Globe !== "function") {
      els.companyGlobe.innerHTML = `<div class="globe-fallback">Nao foi possivel carregar o mapa 3D.</div>`;
      return;
    }

    if (!state.companyGlobe) initCompanyGlobe();
    updateCompanyGlobe(locations);
  });
}

function locationsForMap() {
  const items = [];
  if (state.mapLayer === "companies" || state.mapLayer === "all") {
    items.push(...companyLocationsForMap());
  }
  if (state.mapLayer === "labs" || state.mapLayer === "all") {
    items.push(...researchLabsForMap());
  }
  if (state.mapLayer === "datacenters" || state.mapLayer === "all") {
    items.push(...dataCentersForMap());
  }
  return items.sort((a, b) => (
    a.kind.localeCompare(b.kind)
    || mapItemTitle(a).localeCompare(mapItemTitle(b))
  ));
}

function companyLocationsForMap() {
  const companiesInData = new Set(allModels().map((model) => model.company));
  const selectedCompany = state.filters.company !== "all" ? state.filters.company : null;
  return companyLocations
    .filter((location) => companiesInData.has(location.company))
    .filter((location) => !selectedCompany || location.company === selectedCompany)
    .map((location) => ({
      ...location,
      kind: "company",
      mapKey: `company:${slugify([
        location.company,
        location.site,
        location.city,
        location.address
      ].filter(Boolean).join(":"))}`
    }));
}

function researchLabsForMap() {
  return researchLabs.map((location) => ({
    ...location,
    kind: "lab",
    mapKey: `lab:${location.id}`
  }));
}

function dataCentersForMap() {
  const selectedCompany = state.filters.company !== "all" ? state.filters.company : null;
  return aiDataCenters
    .filter((location) => !selectedCompany || location.company === selectedCompany)
    .map((location) => ({
      ...location,
      kind: "datacenter",
      mapKey: `datacenter:${location.id}`
    }));
}

function missingLocationCompanies() {
  const mappedCompanies = new Set(companyLocations.map((location) => location.company));
  return unique(allModels().map((model) => model.company))
    .filter((company) => !mappedCompanies.has(company));
}

function initCompanyGlobe() {
  els.companyGlobe.innerHTML = "";
  state.companyGlobe = Globe()
    .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
    .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
    .backgroundImageUrl("https://unpkg.com/three-globe/example/img/night-sky.png")
    .showAtmosphere(true)
    .atmosphereColor("#c7f0ff")
    .atmosphereAltitude(0.18)
    .polygonsData([])
    .polygonGeoJsonGeometry("geometry")
    .polygonCapColor(() => "rgba(15, 23, 42, 0.01)")
    .polygonSideColor(() => "rgba(15, 23, 42, 0)")
    .polygonStrokeColor((feature) => (
      feature.boundaryKind === "brazil-state"
        ? "rgba(250, 204, 21, 0.76)"
        : "rgba(226, 232, 240, 0.42)"
    ))
    .polygonAltitude((feature) => (feature.boundaryKind === "brazil-state" ? 0.002 : 0.001))
    .polygonLabel(() => "")
    .polygonsTransitionDuration(0)
    .labelsData([])
    .htmlLat("displayLat")
    .htmlLng("displayLng")
    .htmlAltitude(0.001)
    .htmlElement(createCompanyMarker)
    .htmlTransitionDuration(0)
    .arcsData([])
    .arcStartLat("lat")
    .arcStartLng("lng")
    .arcEndLat("displayLat")
    .arcEndLng("displayLng")
    .arcColor((location) => [
      colorForMapItem(location),
      "rgba(255,255,255,0.78)"
    ])
    .arcAltitude(0.006)
    .arcStroke(0.42)
    .arcDashLength(0.08)
    .arcDashGap(0.04)
    .arcDashAnimateTime(1900)
    (els.companyGlobe);

  const controls = state.companyGlobe.controls();
  controls.autoRotate = false;
  controls.enableDamping = true;

  resizeCompanyGlobe();
  state.companyGlobe.pointOfView({ lat: 25, lng: 15, altitude: 2.15 }, 0);
  loadCountryBorders();
  loadBrazilStateBorders();

  if ("ResizeObserver" in window && !state.globeResizeObserver) {
    state.globeResizeObserver = new ResizeObserver(resizeCompanyGlobe);
    state.globeResizeObserver.observe(els.companyGlobe);
  }
}

function updateCompanyGlobe(locations) {
  if (!state.companyGlobe) return;
  const layoutLocations = layoutCompanyMarkers(locations);
  state.globeLayoutLocations = layoutLocations;
  resizeCompanyGlobe();
  state.companyGlobe
    .pointsData([])
    .labelsData([])
    .htmlElementsData(layoutLocations)
    .arcsData(layoutLocations.filter((location) => location.hasLeaderLine));
}

function resizeCompanyGlobe() {
  if (!state.companyGlobe || !els.companyGlobe) return;
  const rect = els.companyGlobe.getBoundingClientRect();
  const width = Math.max(Math.round(rect.width), 320);
  const height = Math.max(Math.round(rect.height), 420);
  state.companyGlobe.width(width).height(height);
}

function loadCountryBorders() {
  if (!state.companyGlobe || state.countryBordersLoaded) return;
  if (state.countryBordersRequest) return;

  state.countryBordersRequest = fetch(COUNTRY_GEOJSON_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((geojson) => {
      if (!state.companyGlobe) return;
      state.countryBordersLoaded = true;
      state.countryBorderFeatures = (geojson.features || []).map((feature) => ({
        ...feature,
        boundaryKind: "country"
      }));
      updateBoundaryPolygons();
    })
    .catch((error) => {
      state.countryBordersRequest = null;
      console.warn("Nao foi possivel carregar as fronteiras dos paises.", error);
    });
}

function loadBrazilStateBorders() {
  if (!state.companyGlobe || state.brazilStateBordersLoaded) return;
  if (state.brazilStateBordersRequest) return;

  state.brazilStateBordersRequest = fetch(BRAZIL_STATES_GEOJSON_URL)
    .then((response) => {
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then((geojson) => {
      if (!state.companyGlobe) return;
      state.brazilStateBordersLoaded = true;
      state.brazilStateBorderFeatures = (geojson.features || []).map((feature) => ({
        ...feature,
        boundaryKind: "brazil-state"
      }));
      updateBoundaryPolygons();
    })
    .catch((error) => {
      state.brazilStateBordersRequest = null;
      console.warn("Nao foi possivel carregar as fronteiras dos estados do Brasil.", error);
    });
}

function updateBoundaryPolygons() {
  if (!state.companyGlobe) return;
  state.companyGlobe.polygonsData([
    ...state.countryBorderFeatures,
    ...state.brazilStateBorderFeatures
  ]);
}

function selectCompanyOnMap(location) {
  if (!location) return;
  state.selectedMapCompany = location.mapKey;
  renderCompanyLocationList(locationsForMap());
  updateCompanyGlobe(locationsForMap());
}

function createCompanyMarker(location) {
  const wrapper = document.createElement("div");
  wrapper.className = "globe-marker-anchor";
  wrapper.style.setProperty("--marker-color", colorForMapItem(location));

  const button = document.createElement("button");
  button.type = "button";
  button.className = "globe-company-marker";
  if (location.mapKey === state.selectedMapCompany) button.classList.add("selected");
  button.title = `${mapItemTitle(location)} - ${location.city}, ${location.country}`;

  const pin = document.createElement("span");
  pin.className = "marker-pin";

  const flag = document.createElement("span");
  flag.className = "marker-flag";
  flag.textContent = mapItemInitials(location);

  const label = document.createElement("span");
  label.className = "marker-label";
  label.textContent = mapItemTitle(location);

  button.append(pin, flag, label);
  button.addEventListener("click", (event) => {
    event.stopPropagation();
    selectCompanyOnMap(location);
  });
  button.addEventListener("wheel", zoomGlobeFromMarker, { passive: false });

  wrapper.append(button);
  return wrapper;
}

function zoomGlobeFromMarker(event) {
  event.preventDefault();
  event.stopPropagation();

  const canvas = els.companyGlobe?.querySelector("canvas");
  if (!canvas) return;

  canvas.dispatchEvent(new WheelEvent("wheel", {
    bubbles: true,
    cancelable: true,
    deltaX: event.deltaX,
    deltaY: event.deltaY,
    deltaZ: event.deltaZ,
    deltaMode: event.deltaMode,
    clientX: event.clientX,
    clientY: event.clientY,
    screenX: event.screenX,
    screenY: event.screenY,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
    altKey: event.altKey,
    metaKey: event.metaKey
  }));
}

function renderCompanyLocationList(locations) {
  if (!locations.length) {
    els.companyLocationList.innerHTML = `<div class="empty-state">Nenhum ponto para o filtro atual.</div>`;
    return;
  }

  const selectedCompany = locations.some((location) => location.mapKey === state.selectedMapCompany)
    ? state.selectedMapCompany
    : null;

  els.companyLocationList.innerHTML = locations
    .map((location) => renderMapLocationCard(location, selectedCompany))
    .join("");

  els.companyLocationList.querySelectorAll("[data-map-company]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedMapCompany = button.dataset.mapCompany;
      renderCompanyLocationList(locations);
      updateCompanyGlobe(locations);
      focusCompanyOnGlobe(state.selectedMapCompany);
    });
  });
}

function renderMapLocationCard(location, selectedCompany) {
  const selectedClass = location.mapKey === selectedCompany ? " selected" : "";
  const datacenterClass = location.kind === "datacenter" ? " datacenter" : "";
  const labClass = location.kind === "lab" ? " lab" : "";
  const details = location.kind === "datacenter"
    ? `
      <small>${escapeHtml(location.status)} - ${escapeHtml(location.city)}, ${escapeHtml(location.country)}</small>
      <em>${escapeHtml(location.address)}</em>
      <em>Potencia: ${escapeHtml(location.power || "N/D")}</em>
      <em>Compute: ${escapeHtml(location.accelerators || "N/D")} / ${escapeHtml(location.acceleratorType || "N/D")}</em>
    `
    : location.kind === "lab"
      ? `
        <small>${escapeHtml(location.category)} - ${escapeHtml(location.city)}, ${escapeHtml(location.country)}</small>
        <em>${escapeHtml(location.organization)}</em>
        <em>${escapeHtml(location.focus)}</em>
        <em>${escapeHtml(location.address)}</em>
      `
      : `
      <small>${escapeHtml(location.city)}, ${escapeHtml(location.country)}</small>
      <em>${escapeHtml(location.address)}</em>
    `;

  return `
    <article class="company-location-card${datacenterClass}${labClass}${selectedClass}" style="--company-color:${colorForMapItem(location)}">
      <button type="button" data-map-company="${escapeAttribute(location.mapKey)}">
        <span class="location-flag">${escapeHtml(mapItemInitials(location))}</span>
        <span>
          <strong>${escapeHtml(mapItemTitle(location))}</strong>
          ${details}
        </span>
      </button>
      ${location.notes ? `<p class="map-card-note">${escapeHtml(location.notes)}</p>` : ""}
      <a href="${escapeAttribute(location.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(location.sourceName)}</a>
    </article>
  `;
}

function focusCompanyOnGlobe(company) {
  const location = state.globeLayoutLocations.find((item) => item.mapKey === company)
    || locationsForMap().find((item) => item.mapKey === company);
  if (!location || !state.companyGlobe) return;
  state.companyGlobe.pointOfView({
    lat: location.displayLat ?? location.lat,
    lng: location.displayLng ?? location.lng,
    altitude: 1.45
  }, 900);
}

function layoutCompanyMarkers(locations) {
  const remaining = [...locations].sort((a, b) => mapItemTitle(a).localeCompare(mapItemTitle(b)));
  const laidOut = [];
  const clusterDistance = 0.28;

  while (remaining.length) {
    const seed = remaining.shift();
    const cluster = [seed];

    for (let index = remaining.length - 1; index >= 0; index -= 1) {
      if (distanceDegrees(seed, remaining[index]) <= clusterDistance) {
        cluster.push(remaining[index]);
        remaining.splice(index, 1);
      }
    }

    if (cluster.length === 1) {
      laidOut.push({
        ...seed,
        displayLat: seed.lat,
        displayLng: seed.lng,
        hasLeaderLine: false
      });
      continue;
    }

    const centerLat = average(cluster.map((location) => location.lat));
    const centerLng = average(cluster.map((location) => location.lng));
    const spread = Math.min(0.92, 0.26 + cluster.length * 0.07);

    cluster
      .sort((a, b) => mapItemTitle(a).localeCompare(mapItemTitle(b)))
      .forEach((location, index) => {
        const angle = (-90 + (360 / cluster.length) * index) * Math.PI / 180;
        const latOffset = Math.sin(angle) * spread * 0.72;
        const lngOffset = Math.cos(angle) * spread / Math.max(0.48, Math.cos(centerLat * Math.PI / 180));
        const displayLat = clamp(centerLat + latOffset, -78, 78);
        const displayLng = wrapLng(centerLng + lngOffset);

        laidOut.push({
          ...location,
          displayLat,
          displayLng,
          hasLeaderLine: distanceDegrees(location, { lat: displayLat, lng: displayLng }) > 0.12
        });
      });
  }

  return laidOut.sort((a, b) => mapItemTitle(a).localeCompare(mapItemTitle(b)));
}

function distanceDegrees(a, b) {
  const latDelta = a.lat - b.lat;
  const lngDelta = (a.lng - b.lng) * Math.cos(((a.lat + b.lat) / 2) * Math.PI / 180);
  return Math.sqrt(latDelta ** 2 + lngDelta ** 2);
}

function average(values) {
  return values.reduce((total, value) => total + value, 0) / values.length;
}

function wrapLng(lng) {
  if (lng > 180) return lng - 360;
  if (lng < -180) return lng + 360;
  return lng;
}

function mapItemTitle(location) {
  if (location.kind === "datacenter") return location.name;
  if (location.kind === "lab") return location.name;
  return location.site ? `${location.company} - ${location.site}` : location.company;
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "location";
}

function mapItemInitials(location) {
  if (location.kind === "datacenter") return "AI";
  if (location.kind === "lab") return "LAB";
  return companyInitials(location.company);
}

function colorForMapItem(location) {
  if (location.kind === "datacenter") {
    return dataCenterStatusColors[location.status] || "#38bdf8";
  }
  if (location.kind === "lab") {
    return researchLabColors[location.category] || "#0f766e";
  }
  return colorFor(location.company);
}

function companyInitials(company) {
  if (company === "xAI") return "xAI";
  if (company === "Z.AI") return "ZAI";
  if (company === "OpenAI") return "OAI";
  const words = String(company).replaceAll(".", " ").split(/\s+/).filter(Boolean);
  const initials = words.map((word) => word[0]).join("").toUpperCase();
  return initials.slice(0, 3) || company.slice(0, 3).toUpperCase();
}

function renderTable(models) {
  const sortedModels = sortModelsForTable(models);
  els.modelsTable.innerHTML = sortedModels.map((model) => `
    <tr>
      <td>${formatDate(model.release_date)}</td>
      <td><span class="company-chip" style="--chip-color:${colorFor(model.company)}">${escapeHtml(model.company)}</span></td>
      <td><strong>${escapeHtml(model.model)}</strong></td>
      <td>${escapeHtml(model.family)}</td>
      <td>${model.ai_category.map(categoryPill).join("")}</td>
      <td>${model.model_type.map(typePill).join("")}</td>
      <td>${escapeHtml(model.description_pt || "")}</td>
      <td>${renderSourceLinks(model, "compact")}</td>
    </tr>
  `).join("");
}

function sortModelsForTable(models) {
  const direction = state.tableDateOrder === "asc" ? 1 : -1;
  return [...models].sort((a, b) => (
    ((a.timestamp - b.timestamp) * direction)
    || a.company.localeCompare(b.company)
    || a.model.localeCompare(b.model)
  ));
}

function renderSources(models) {
  const groups = unique(models.map((model) => model.company)).map((company) => {
    const items = models.filter((model) => model.company === company);
    return `
      <section class="source-group">
        <h2><span class="dot" style="background:${colorFor(company)}"></span>${escapeHtml(company)}</h2>
        <ul>
          ${items.map((model) => `
            <li>
              <time>${formatDate(model.release_date)}</time>
              <strong>${escapeHtml(model.model)}</strong>
              ${renderSourceLinks(model, "compact")}
              ${renderSourceBasis(model)}
            </li>
          `).join("")}
        </ul>
      </section>
    `;
  }).join("");
  els.sourcesList.innerHTML = groups || `<div class="empty-state">Nenhuma fonte no filtro atual.</div>`;
}

function renderSourceLinks(model, variant = "compact") {
  const sources = model.sources || [];
  if (!sources.length) return `<span class="muted-text">Sem fonte</span>`;

  const className = variant === "primary" ? "source-links-list primary" : "source-links-list compact";
  return `
    <div class="${className}">
      ${sources.map((source) => `
        <a class="${variant === "primary" ? "primary-link" : ""}"
          href="${escapeAttribute(source.url)}"
          target="_blank"
          rel="noreferrer">${escapeHtml(source.title)}</a>
      `).join("")}
    </div>
  `;
}

function renderSourceBasis(model) {
  const sources = (model.sources || []).filter((source) => source.date_basis);
  if (!sources.length) return "";
  if (sources.length === 1) return `<p class="date-basis">${escapeHtml(sources[0].date_basis)}</p>`;

  return `
    <ul class="source-basis-list">
      ${sources.map((source) => `
        <li><strong>${escapeHtml(source.title)}:</strong> ${escapeHtml(source.date_basis)}</li>
      `).join("")}
    </ul>
  `;
}

function colorFor(company) {
  return companyColors[company] || "#475569";
}

function typePill(type) {
  return `<span class="type-pill">${escapeHtml(type)}</span>`;
}

function categoryPill(category) {
  return `<span class="type-pill category-pill">${escapeHtml(category)}</span>`;
}

function formatDate(value) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return escapeHtml(value).replaceAll("`", "&#096;");
}

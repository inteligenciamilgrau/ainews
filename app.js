const DATA_URL = "data/models.json";
const MAP_STYLE_URLS = {
  dark: "https://tiles.openfreemap.org/styles/dark",
  light: "https://tiles.openfreemap.org/styles/bright"
};
const MAP_FALLBACK_STYLE_URL = "https://demotiles.maplibre.org/style.json";
const MAP_SATELLITE_TILE_URL = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
const MAP_ADMIN_BOUNDARY_LAYER_IDS = ["ai-admin-boundaries-casing", "ai-admin-boundaries"];
const MAP_FLAG_ICON_PREFIX = "ai-location-flag-";
const MAP_FLAG_MIN_ZOOM = 3.2;
const MAP_OVERLAP_CLUSTER_LIMIT = 3;
const MAP_VISIBLE_MARKER_PADDING = 96;
const VIEW_PREFS_KEY = "llmTimelineViewPreferences";
const VALID_VIEWS = new Set(["timeline", "years", "map", "table", "sources", "history"]);
const VALID_MAP_LAYERS = new Set(["companies", "labs", "datacenters", "all"]);
const VALID_MAP_BASE_MODES = new Set(["map", "earth", "hybrid"]);
const VALID_MAP_SCALES = new Set(["globe", "country", "city", "street"]);
const VALID_LANE_MODES = new Set(["company", "all"]);
const VALID_TABLE_DATE_ORDERS = new Set(["desc", "asc"]);
const AI_CATEGORIES = ["LLMs", "Imagem", "Video", "Audio/Transcricao", "Musica", "Robotica/World models"];
const VALID_AI_CATEGORIES = new Set(AI_CATEGORIES);
const AI_CATEGORY_LABELS = {
  Video: "Vídeo",
  "Audio/Transcricao": "Áudio/Transcrição",
  Musica: "Música",
  "Robotica/World models": "Robótica/World models"
};
const MULTI_FILTER_KEYS = ["aiCategory", "company", "type", "family", "year"];
const DEFAULT_MULTI_FILTERS = {
  aiCategory: ["LLMs"],
  company: ["all"],
  type: ["all"],
  family: ["all"],
  year: ["all"]
};
const TIMELINE_EVENT_EDGE_PX = 108;

const state = {
  metadata: {},
  canonicalModels: [],
  filters: {
    query: "",
    aiCategory: [...DEFAULT_MULTI_FILTERS.aiCategory],
    company: [...DEFAULT_MULTI_FILTERS.company],
    type: [...DEFAULT_MULTI_FILTERS.type],
    family: [...DEFAULT_MULTI_FILTERS.family],
    year: [...DEFAULT_MULTI_FILTERS.year],
    yearStart: "all",
    yearEnd: "all"
  },
  tableDateOrder: "desc",
  view: "timeline",
  laneMode: "company",
  mapLayer: "all",
  mapBaseMode: "hybrid",
  mapLabels: false,
  mapScale: "globe",
  selectedId: null,
  selectedMapCompany: null,
  companyMap: null,
  mapStyleMode: "dark",
  mapStyleFallbackActive: false,
  mapFallbackTried: false,
  mapHasInitialView: false,
  mapFullscreen: false,
  mapPopup: null,
  mapPreviewPopup: null,
  mapPreviewKey: null,
  mapClusterPopup: null,
  mapClusterHideTimer: null,
  mapOverlapUpdateFrame: null,
  mapHtmlMarkers: [],
  mapMarkerLocations: []
};

const companyColors = {
  "AI Singapore": "#0f766e",
  "Aleph Alpha": "#2563eb",
  Apple: "#52525b",
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
  Microsoft: "#38bdf8",
  NVIDIA: "#76b900",
  Suno: "#be185d",
  Udio: "#6d28d9",
  "Black Forest Labs": "#166534",
  ByteDance: "#0f172a",
  Kuaishou: "#f97316",
  Ai2: "#0e7490",
  Alibaba: "#c2410c",
  Amazon: "#ff9900",
  "AI21 Labs": "#334155",
  "Core42": "#7c3aed",
  Baidu: "#1d4ed8",
  Cohere: "#39594d",
  Cursor: "#0f172a",
  "Danish Foundation Models": "#dc2626",
  Databricks: "#ef4444",
  ElevenLabs: "#111827",
  IBM: "#0f62fe",
  Ideogram: "#ec4899",
  "Lelapa AI": "#16a34a",
  "Leonardo.Ai": "#0891b2",
  "LG AI Research": "#a50034",
  "Luma AI": "#7c3aed",
  Midjourney: "#6b7280",
  MiniMax: "#7c2d12",
  NAVER: "#03c75a",
  Runway: "#0f172a",
  "Sakana AI": "#0284c7",
  "Sarvam AI": "#ea580c",
  Sber: "#21a038",
  "Stability AI": "#0d9488",
  "Swiss AI Initiative": "#dc2626",
  "Technology Innovation Institute": "#0f766e",
  Yandex: "#ffcc00",
  Tencent: "#2563eb"
};

const dataCenterStatusColors = {
  Operacional: "#22c55e",
  "Em construcao": "#f59e0b",
  Planejado: "#38bdf8",
  Anunciado: "#8b5cf6",
  Pausado: "#94a3b8"
};

const dataCenterStatusLabels = {
  "Em construcao": "Em construção"
};

const researchLabColors = {
  Consorcio: "#0f766e",
  Universidade: "#2563eb",
  Instituto: "#7c3aed",
  Formacao: "#d97706",
  "Lab corporativo": "#be185d"
};

const researchLabCategoryLabels = {
  Consorcio: "Consórcio",
  Formacao: "Formação em IA"
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
    company: "AI21 Labs",
    site: "Headquarters / Jamba",
    city: "Tel Aviv",
    region: "Tel Aviv",
    country: "Israel",
    address: "Tel Aviv, Israel",
    lat: 32.0853,
    lng: 34.7818,
    notes: "Marker is city-level because a current public street address was not found on AI21's official pages.",
    sourceName: "AI21 Labs / Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/AI21_Labs"
  },
  {
    company: "Ai2",
    site: "Allen Institute for AI / Molmo",
    city: "Seattle",
    region: "Washington",
    country: "United States",
    address: "3800 Latona Ave NE, Suite 300",
    lat: 47.6537,
    lng: -122.3258,
    sourceName: "Ai2 Contact",
    sourceUrl: "https://allenai.org/contact"
  },
  {
    company: "AI Singapore",
    site: "SEA-LION",
    city: "Singapore",
    region: "Singapore",
    country: "Singapore",
    address: "3 Research Link, #02-04, Innovation 4.0",
    lat: 1.2966,
    lng: 103.7764,
    sourceName: "SEA-LION",
    sourceUrl: "https://sea-lion.ai/"
  },
  {
    company: "Aleph Alpha",
    site: "Headquarters / Luminous",
    city: "Heidelberg",
    region: "Baden-Wurttemberg",
    country: "Germany",
    address: "Heidelberg, Germany",
    lat: 49.3988,
    lng: 8.6724,
    notes: "Marker is city-level because the official Luminous post identifies Aleph Alpha as Heidelberg-based but does not publish a current street address there.",
    sourceName: "Aleph Alpha",
    sourceUrl: "https://aleph-alpha.com/luminous-european-ai-closes-gap-to-world-leaders/"
  },
  {
    company: "Core42",
    site: "Jais / Sovereign AI infrastructure",
    city: "Abu Dhabi",
    region: "Abu Dhabi",
    country: "United Arab Emirates",
    address: "Abu Dhabi, UAE",
    lat: 24.4539,
    lng: 54.3773,
    notes: "Marker is city-level for Core42/G42's Abu Dhabi base and Jais-related sovereign AI work.",
    sourceName: "Core42",
    sourceUrl: "https://www.core42.ai/"
  },
  {
    company: "Danish Foundation Models",
    site: "Munin collaboration",
    city: "Copenhagen",
    region: "Capital Region",
    country: "Denmark",
    address: "Copenhagen, Denmark",
    lat: 55.6761,
    lng: 12.5683,
    notes: "National collaboration across Danish universities and research institutions; marker is city-level for the Danish AI ecosystem rather than a single office.",
    sourceName: "Danish Foundation Models",
    sourceUrl: "https://www.foundationmodels.dk/"
  },
  {
    company: "Ideogram",
    site: "Headquarters / Ideogram 4.0",
    city: "Toronto",
    region: "Ontario",
    country: "Canada",
    address: "Toronto, Ontario",
    lat: 43.6532,
    lng: -79.3832,
    notes: "Marker is city-level because a current public street address was not found on Ideogram's official pages.",
    sourceName: "Ideogram",
    sourceUrl: "https://ideogram.ai/models/4.0/"
  },
  {
    company: "Lelapa AI",
    site: "InkubaLM / Vulavula",
    city: "Johannesburg",
    region: "Gauteng",
    country: "South Africa",
    address: "Johannesburg, South Africa",
    lat: -26.2041,
    lng: 28.0473,
    notes: "Marker is city-level, reflecting Lelapa AI's South African roots and Johannesburg launch context.",
    sourceName: "Lelapa AI",
    sourceUrl: "https://lelapa.ai/"
  },
  {
    company: "Leonardo.Ai",
    site: "Phoenix / Lucid Origin",
    city: "Sydney",
    region: "New South Wales",
    country: "Australia",
    address: "Sydney, NSW",
    lat: -33.8688,
    lng: 151.2093,
    notes: "Marker is city-level for Leonardo.Ai's Sydney headquarters and Australian origin.",
    sourceName: "Leonardo.Ai",
    sourceUrl: "https://leonardo.ai/"
  },
  {
    company: "LG AI Research",
    site: "EXAONE",
    city: "Seoul",
    region: "Seoul",
    country: "South Korea",
    address: "Seoul, South Korea",
    lat: 37.5665,
    lng: 126.978,
    notes: "Marker is city-level because LG AI Research's public model pages do not publish a stable research office address.",
    sourceName: "LG AI EXAONE",
    sourceUrl: "https://huggingface.co/LGAI-EXAONE"
  },
  {
    company: "NAVER",
    site: "HyperCLOVA X",
    city: "Seongnam",
    region: "Gyeonggi-do",
    country: "South Korea",
    address: "NAVER 1784, 95 Jeongjail-ro, Bundang-gu",
    lat: 37.3595,
    lng: 127.1052,
    sourceName: "HyperCLOVA X",
    sourceUrl: "https://clova.ai/en/hyperclova"
  },
  {
    company: "Sarvam AI",
    site: "Sarvam 30B / 105B",
    city: "Bengaluru",
    region: "Karnataka",
    country: "India",
    address: "732, Chinmaya Mission Hospital Road, Indiranagar Stage 1",
    lat: 12.9784,
    lng: 77.6408,
    sourceName: "Sarvam AI",
    sourceUrl: "https://www.sarvam.ai/"
  },
  {
    company: "Sber",
    site: "GigaChat / Kandinsky",
    city: "Moscow",
    region: "Moscow",
    country: "Russia",
    address: "Sberbank City, Kutuzovsky Prospekt 32",
    lat: 55.7405,
    lng: 37.5334,
    sourceName: "Sber Developers",
    sourceUrl: "https://developers.sber.ru/portal/products/gigachat-api"
  },
  {
    company: "Swiss AI Initiative",
    site: "Apertus",
    city: "Zurich",
    region: "Zurich",
    country: "Switzerland",
    address: "Zurich, Switzerland",
    lat: 47.3769,
    lng: 8.5417,
    notes: "Initiative spans EPFL, ETH Zurich and CSCS; marker uses Zurich at city level for the Swiss AI Initiative ecosystem.",
    sourceName: "Apertus",
    sourceUrl: "https://apertvs.ai/"
  },
  {
    company: "Technology Innovation Institute",
    site: "Falcon",
    city: "Abu Dhabi",
    region: "Abu Dhabi",
    country: "United Arab Emirates",
    address: "Abu Dhabi, UAE",
    lat: 24.4539,
    lng: 54.3773,
    notes: "Marker is city-level for TII's Abu Dhabi research base and Falcon model family.",
    sourceName: "Falcon LLM",
    sourceUrl: "https://falconllm.tii.ae/"
  },
  {
    company: "Yandex",
    site: "YandexGPT / Alice AI",
    city: "Moscow",
    region: "Moscow",
    country: "Russia",
    address: "16 Leo Tolstoy Street",
    lat: 55.7339,
    lng: 37.5871,
    sourceName: "Yandex AI Studio",
    sourceUrl: "https://aistudio.yandex.ru/en/model-gallery"
  },
  {
    company: "Amazon",
    site: "Amazon HQ / Amazon Nova",
    city: "Seattle",
    region: "Washington",
    country: "United States",
    address: "Seattle HQ campus / Denny Triangle and South Lake Union",
    lat: 47.6156,
    lng: -122.3394,
    notes: "Amazon Nova is offered through AWS/Amazon Bedrock; marker uses Amazon's Seattle headquarters campus.",
    sourceName: "List of Amazon locations",
    sourceUrl: "https://en.wikipedia.org/wiki/List_of_Amazon_locations"
  },
  {
    company: "Apple",
    site: "Headquarters / Apple Intelligence",
    city: "Cupertino",
    region: "California",
    country: "United States",
    address: "One Apple Park Way",
    lat: 37.3346,
    lng: -122.0090,
    sourceName: "Apple",
    sourceUrl: "https://www.apple.com/contact/"
  },
  {
    company: "Anthropic",
    site: "Headquarters",
    city: "San Francisco",
    region: "California",
    country: "United States",
    address: "548 Market Street, PMB 90375, San Francisco, CA 94104-5401",
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
    site: "AI research/fellows location",
    city: "Ontario",
    region: "Ontario",
    country: "Canada",
    address: "Ontario, Canada",
    lat: 50,
    lng: -85,
    notes: "Public careers pages list AI Research & Engineering fellowship roles in Ontario, Canada; exact office address is not published there.",
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
    company: "Cohere",
    site: "Headquarters / Command",
    city: "Toronto",
    region: "Ontario",
    country: "Canada",
    address: "Toronto, Ontario",
    lat: 43.6532,
    lng: -79.3832,
    notes: "Marker is city-level because a current public street address was not found on Cohere's official pages.",
    sourceName: "Cohere / Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Cohere"
  },
  {
    company: "Cursor",
    site: "San Francisco hub",
    city: "San Francisco",
    region: "California",
    country: "United States",
    address: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    notes: "Cursor's official careers page lists San Francisco among its active locations; marker is city-level because a public office address is not published there.",
    sourceName: "Cursor Careers",
    sourceUrl: "https://cursor.com/careers"
  },
  {
    company: "Databricks",
    site: "Headquarters / DBRX",
    city: "San Francisco",
    region: "California",
    country: "United States",
    address: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    notes: "Marker is city-level because Databricks' Bay Area office footprint has changed over time.",
    sourceName: "Databricks / Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Databricks"
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
    company: "ElevenLabs",
    site: "Global hub / Eleven",
    city: "New York",
    region: "New York",
    country: "United States",
    address: "New York, NY",
    lat: 40.7128,
    lng: -74.006,
    notes: "ElevenLabs lists New York, London and Warsaw as global hubs; marker uses the New York hub at city level.",
    sourceName: "ElevenLabs Careers",
    sourceUrl: "https://elevenlabs.io/careers"
  },
  {
    company: "Google",
    site: "Google DeepMind London",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "6 Pancras Square, King's Cross, London N1C 4AG",
    lat: 51.5335,
    lng: -0.1251,
    notes: "Google DeepMind lists London as a location; address uses the public Google King's Cross campus at 6 Pancras Square.",
    sourceName: "Google DeepMind Careers",
    sourceUrl: "https://deepmind.google/careers/"
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
    company: "Luma AI",
    site: "Luma / Ray",
    city: "Palo Alto",
    region: "California",
    country: "United States",
    address: "Palo Alto, CA",
    lat: 37.4419,
    lng: -122.143,
    notes: "Marker is city-level because a current public office address was not found on Luma's official pages.",
    sourceName: "Economic Times",
    sourceUrl: "https://m.economictimes.com/tech/startups/lumas-amit-jain-says-fragmented-ai-tools-impacting-creative-workflows-launches-unified-intelligence/articleshow/129154626.cms"
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
    site: "Headquarters",
    city: "Shanghai",
    region: "Shanghai",
    country: "China",
    address: "No. 65 Guiqing Road, 11th Floor, Building B, Xinyan Building, Xuhui District",
    lat: 31.1706,
    lng: 121.4135,
    notes: "CB Insights lists MiniMax's headquarters at this Shanghai address; marker coordinates are approximate for Guiqing Road in Xuhui.",
    sourceName: "CB Insights",
    sourceUrl: "https://www.cbinsights.com/company/minimax-ai"
  },
  {
    company: "Microsoft",
    site: "Headquarters / Microsoft AI hub",
    city: "Redmond",
    region: "Washington",
    country: "United States",
    address: "One Microsoft Way",
    lat: 47.6423,
    lng: -122.1368,
    notes: "Microsoft's global headquarters and a listed Microsoft AI location; marker uses the Redmond campus.",
    sourceName: "Microsoft Office Locations / Microsoft AI Careers",
    sourceUrl: "https://www.microsoft.com/en-us/about/office-locations"
  },
  {
    company: "Microsoft",
    site: "Microsoft AI Bay Area hub",
    city: "Mountain View",
    region: "California",
    country: "United States",
    address: "Mountain View, CA",
    lat: 37.3861,
    lng: -122.0839,
    notes: "Microsoft AI describes Bay Area teams in Berkeley, San Francisco and Mountain View; exact MAI office address is not published there.",
    sourceName: "Microsoft AI About",
    sourceUrl: "https://microsoft.ai/about/"
  },
  {
    company: "Microsoft",
    site: "Microsoft AI London hub",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    notes: "Microsoft AI identifies London as an AI hub for language models, foundational AI tools and responsible innovation.",
    sourceName: "Microsoft AI About",
    sourceUrl: "https://microsoft.ai/about/"
  },
  {
    company: "Microsoft",
    site: "Microsoft AI Zurich hub",
    city: "Zurich",
    region: "Zurich",
    country: "Switzerland",
    address: "Zurich, Switzerland",
    lat: 47.3769,
    lng: 8.5417,
    notes: "Microsoft AI careers lists Superintelligence Team roles in Zurich; exact office address is not published there.",
    sourceName: "Microsoft AI Careers",
    sourceUrl: "https://microsoft.ai/careers/"
  },
  {
    company: "Midjourney",
    site: "Independent research lab / V8.1",
    city: "San Francisco",
    region: "California",
    country: "United States",
    address: "San Francisco, CA",
    lat: 37.7749,
    lng: -122.4194,
    notes: "Marker is city-level because Midjourney does not publish a stable public office address.",
    sourceName: "Midjourney / Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Midjourney"
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
    site: "Headquarters / AI research hub",
    city: "Beijing",
    region: "Beijing",
    country: "China",
    address: "13F, Building 1, JD Technology Building, 76 Zhichun Road",
    lat: 39.976,
    lng: 116.3377,
    notes: "Moonshot publishes this Beijing contact address. I found recruiting signals for AI roles in other Chinese cities, but no official exact research-center addresses suitable for map pins.",
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
    company: "Runway",
    site: "Headquarters / Gen",
    city: "New York",
    region: "New York",
    country: "United States",
    address: "Manhattan, New York City, NY",
    lat: 40.7831,
    lng: -73.9712,
    notes: "Marker is city-level because a current public street address was not found on Runway's official pages.",
    sourceName: "Runway / Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Runway_(company)"
  },
  {
    company: "Sakana AI",
    site: "Headquarters / AI Scientist, Namazu and Fugu",
    city: "Tokyo",
    region: "Tokyo",
    country: "Japan",
    address: "Azabudai Hills Mori JP Tower 22F, 1-3-1 Azabudai, Minato-ku",
    lat: 35.6602,
    lng: 139.7406,
    sourceName: "Sakana AI Corporate Info",
    sourceUrl: "https://sakana.ai/company-info/"
  },
  {
    company: "Stability AI",
    site: "Headquarters / Stable Diffusion",
    city: "London",
    region: "England",
    country: "United Kingdom",
    address: "London, UK",
    lat: 51.5074,
    lng: -0.1278,
    notes: "Marker is city-level because a current public office address was not found on Stability AI's official pages.",
    sourceName: "Stability AI / Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Stability_AI"
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
    company: "Tencent",
    site: "Headquarters / Hunyuan",
    city: "Shenzhen",
    region: "Guangdong",
    country: "China",
    address: "Tencent Binhai Mansion, Nanshan District",
    lat: 22.527,
    lng: 113.9349,
    sourceName: "Tencent / Wikipedia",
    sourceUrl: "https://en.wikipedia.org/wiki/Tencent"
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
    id: "br-inovai-ufrn",
    name: "InovAI Lab - Laboratório de Inovação em IA",
    organization: "Instituto Metrópole Digital / UFRN",
    category: "Universidade",
    city: "Natal",
    region: "Rio Grande do Norte",
    country: "Brazil",
    address: "R. das Engenharias, s/n, Campus Central da UFRN, Lagoa Nova",
    lat: -5.8327,
    lng: -35.2054,
    focus: "AI for bioinformatics, health, specialized hardware, tactile internet, robotics and automation",
    notes: "Research and innovation center hosted at IMD-UFRN, linked to graduate programs and national and international research networks.",
    sourceName: "InovAI Lab",
    sourceUrl: "https://inovailab.imd.ufrn.br/"
  },
  {
    id: "br-cereia-ufc",
    name: "Cereia - Centro de Referência em Inteligência Artificial",
    organization: "UFC / FAPESP / MCTI / MCom / CGI.br",
    category: "Consorcio",
    city: "Fortaleza",
    region: "Ceará",
    country: "Brazil",
    address: "Campus do Pici, Universidade Federal do Ceará",
    lat: -3.7457,
    lng: -38.5746,
    focus: "AI, IoT and big data for disease prevention, diagnostics, low-cost therapies and remote patient monitoring",
    notes: "Applied AI center hosted by UFC, with six priority research lines focused on health and professional training.",
    sourceName: "FAPESP",
    sourceUrl: "https://www.fapesp.br/cpa/centro_de_referencia_em_inteligencia_artificial_%28cereia%29/158"
  },
  {
    id: "br-cpa-cybersecurity-ufpe",
    name: "Centro de Excelência em IA para Segurança Cibernética",
    organization: "CIn-UFPE / FAPESP / MCTI / CGI.br",
    category: "Consorcio",
    city: "Recife",
    region: "Pernambuco",
    country: "Brazil",
    address: "Av. Jornalista Aníbal Fernandes, s/n, Cidade Universitária",
    lat: -8.0555,
    lng: -34.9516,
    focus: "Responsible AI for cyber resilience, attack and defense, adversarial learning and cyber-physical systems",
    notes: "National and international network headquartered at CIn-UFPE, with researchers from all Brazilian regions and industry partners.",
    sourceName: "CIn-UFPE",
    sourceUrl: "https://portal.cin.ufpe.br/2023/09/11/conheca-o-centro-de-excelencia-em-inteligencia-artificial-para-seguranca-cibernetica-sediados-no-cin-ufpe/"
  },
  {
    id: "br-praia-ufpe",
    name: "PRAIA - Pesquisa Realmente Aplicada em IA",
    organization: "CIn-UFPE / SENAI / national research network",
    category: "Consorcio",
    city: "Recife",
    region: "Pernambuco",
    country: "Brazil",
    address: "Av. Jornalista Aníbal Fernandes, s/n, Cidade Universitária",
    lat: -8.0562,
    lng: -34.9508,
    focus: "Applied AI for education, workforce development, competency-based learning and Industry 4.0",
    notes: "Academia-industry hub focused on inclusive education, AI training and applied innovation for public and private organizations.",
    sourceName: "CIn-UFPE",
    sourceUrl: "https://portal.cin.ufpe.br/pesquisa-e-extensao/pesquisa/grupos-de-pesquisa/praia/"
  },
  {
    id: "br-cpa-renewables-ufrj",
    name: "Centro de Excelência em IA para Energias Renováveis",
    organization: "COPPE-UFRJ / FAPESP / MCTI / CGI.br",
    category: "Consorcio",
    city: "Rio de Janeiro",
    region: "Rio de Janeiro",
    country: "Brazil",
    address: "Centro de Tecnologia, Cidade Universitária, Ilha do Fundão",
    lat: -22.8623,
    lng: -43.2291,
    focus: "Scientific machine learning for wind, solar, biomass, green hydrogen and renewable-energy operations",
    notes: "Applied research center operating at COPPE's Lamce facilities to support Brazil's energy transition.",
    sourceName: "COPPE-UFRJ",
    sourceUrl: "https://coppe.ufrj.br/planeta-coppe/coppe-sediara-o-centro-de-excelencia-em-inteligencia-artificial-para-energia-renovaveis/"
  },
  {
    id: "br-cpa-cdii",
    name: "CPA-CDII - Ciência de Dados para a Indústria Inteligente",
    organization: "USP / Unicamp / Unesp / AI2 / SENAI-SP / FAPESP",
    category: "Consorcio",
    city: "São Carlos",
    region: "São Paulo",
    country: "Brazil",
    address: "ICMC-USP, Av. Trabalhador São-carlense, 400",
    lat: -22.0053,
    lng: -47.8953,
    focus: "AI, data engineering, distributed and federated ML, computer vision and NLP for smart industry",
    notes: "Multi-campus applied research center with nodes at USP, Unicamp, Unesp Bauru and AI2-Unesp, plus SENAI-SP.",
    sourceName: "CPA-CDII",
    sourceUrl: "https://cemeai.icmc.usp.br/CDII/"
  },
  {
    id: "br-liarea-inpe",
    name: "LIAREA - IA para Aplicações Aeroespaciais e Ambientais",
    organization: "Instituto Nacional de Pesquisas Espaciais",
    category: "Instituto",
    city: "São José dos Campos",
    region: "São Paulo",
    country: "Brazil",
    address: "Av. dos Astronautas, 1758, Jardim da Granja",
    lat: -23.2085,
    lng: -45.8598,
    focus: "AI for remote sensing, weather and climate, astrophysics, space geophysics and aerospace engineering",
    notes: "INPE laboratory created in 2024 to consolidate AI R&D across environmental, space and aerospace applications.",
    sourceName: "INPE",
    sourceUrl: "https://www.gov.br/inpe/pt-br/area-conhecimento/pesquisa-aplicada-e-desenvolvimento-tecnologico/laboratorios-banco-de-testes-grupos-p-d/laboratorio-de-inteligencia-artificial-para-aplicacoes-aeroespaciais-e-ambientais-2013-liarea"
  },
  {
    id: "br-liaa-ien",
    name: "LIAA - Laboratório de Inteligência Artificial Aplicada",
    organization: "Instituto de Engenharia Nuclear / CNEN",
    category: "Instituto",
    city: "Rio de Janeiro",
    region: "Rio de Janeiro",
    country: "Brazil",
    address: "R. Hélio de Almeida, 75, Cidade Universitária, Ilha do Fundão",
    lat: -22.8606,
    lng: -43.2282,
    focus: "Evolutionary computing, swarm intelligence, deep learning, fuzzy logic and robotics for nuclear engineering",
    notes: "Applied AI laboratory founded in 2006, expanding from nuclear systems to environmental, radiological and robotic applications.",
    sourceName: "IEN-CNEN",
    sourceUrl: "https://www.gov.br/ien/pt-br/pesquisa-e-desenvolvimento/laboratorios/laboratorio-de-inteligencia-artificial-aplicada"
  },
  {
    id: "br-liamf-ufpr",
    name: "LIAMF - Laboratório de IA e Métodos Formais",
    organization: "Universidade Federal do Paraná",
    category: "Universidade",
    city: "Curitiba",
    region: "Paraná",
    country: "Brazil",
    address: "Centro Politécnico, Jardim das Américas",
    lat: -25.4499,
    lng: -49.2319,
    focus: "Classical AI, logic, knowledge representation, planning, theorem proving, NLP, ML and optimization",
    notes: "UFPR research group combining theoretical, experimental and applied work in AI and formal methods.",
    sourceName: "LIAMF-UFPR",
    sourceUrl: "https://www.inf.ufpr.br/liamf/"
  },
  {
    id: "br-gia-unb",
    name: "GIA - Grupo de Inteligência Artificial",
    organization: "Universidade de Brasília",
    category: "Universidade",
    city: "Brasília",
    region: "Distrito Federal",
    country: "Brazil",
    address: "Campus Universitário Darcy Ribeiro, Asa Norte",
    lat: -15.7639,
    lng: -47.8708,
    focus: "Machine learning, NLP, computer vision, bio-inspired computing and visual analytics",
    notes: "UnB group active in research, teaching and extension, with national and international collaborations.",
    sourceName: "GIA-UnB",
    sourceUrl: "https://gia.unb.br/"
  },
  {
    id: "br-recodai-unicamp",
    name: "Recod.ai - Laboratório de Inteligência Artificial",
    organization: "Instituto de Computação / Unicamp",
    category: "Universidade",
    city: "Campinas",
    region: "São Paulo",
    country: "Brazil",
    address: "Av. Albert Einstein, 1251, Cidade Universitária",
    lat: -22.8149,
    lng: -47.0643,
    focus: "Frontier AI, machine learning, complex-data inference, computer vision and digital forensics",
    notes: "Unicamp laboratory conducting research on multimedia, social, spatial and temporal data, with major applied partnerships.",
    sourceName: "Instituto de Computação - Unicamp",
    sourceUrl: "https://ic.unicamp.br/pesquisa/projetos-e-laboratorios-de-pesquisa/"
  },
  {
    id: "br-lia-ufpa",
    name: "LIA - Laboratório de Inteligência Analítica",
    organization: "Faculdade de Computação / UFPA",
    category: "Universidade",
    city: "Belém",
    region: "Pará",
    country: "Brazil",
    address: "R. Augusto Corrêa, 1, Campus Universitário do Guamá",
    lat: -1.4738833,
    lng: -48.4543741,
    focus: "Autonomous intelligent systems, optimization, simulation, ML, multi-agent systems and fuzzy systems",
    notes: "UFPA laboratory applying computational mathematics and AI to bioeconomy, logistics, energy, finance and industry.",
    sourceName: "LIA-UFPA",
    sourceUrl: "https://lia.ufpa.br/"
  },
  {
    id: "br-bacharelado-ia-uftm",
    name: "Bacharelado em Inteligência Artificial",
    organization: "Universidade Federal do Triângulo Mineiro",
    category: "Formacao",
    city: "Uberaba",
    region: "Minas Gerais",
    country: "Brazil",
    address: "Unidade III, Av. Dr. Randolfo Borges Júnior, 1400, Bloco N",
    lat: -19.7472,
    lng: -47.9476,
    focus: "Undergraduate education in AI, machine learning, data science, mathematics, computing and responsible use of data",
    notes: "Public, in-person evening bachelor's degree authorized in 2026 and offered through Brazil's Sisu admissions system.",
    sourceName: "UFTM",
    sourceUrl: "https://www.uftm.edu.br/inteligencia-artificial"
  },
  {
    id: "br-bacharelado-ia-uffs",
    name: "Bacharelado em IA, Inovação, Governança e Direitos Humanos",
    organization: "Universidade Federal da Fronteira Sul",
    category: "Formacao",
    city: "Realeza",
    region: "Paraná",
    country: "Brazil",
    address: "Av. Edmundo Gaievski, 1000, acesso pela Rodovia PR-182, km 466",
    lat: -25.7658,
    lng: -53.5323,
    focus: "Undergraduate AI education with innovation, public governance, ethics, transparency and human-rights foundations",
    notes: "Four-year public bachelor's degree implemented at the UFFS Realeza campus in 2026.",
    sourceName: "UFFS",
    sourceUrl: "https://www.uffs.edu.br/uffs/inteligencia-artificial/perfil-do-curso"
  },
  {
    id: "br-bacharelado-ia-ufj",
    name: "Bacharelado em Inteligência Artificial",
    organization: "Universidade Federal de Jataí",
    category: "Formacao",
    city: "Jataí",
    region: "Goiás",
    country: "Brazil",
    address: "Campus Jatobá, BR-364, km 195, 3800",
    lat: -17.9239,
    lng: -51.7185,
    focus: "Undergraduate education in intelligent agents, ML, responsible AI, governance, innovation and applied research",
    notes: "In-person evening bachelor's degree launched in 2026 with a regional-development and responsible-innovation mission.",
    sourceName: "UFJ",
    sourceUrl: "https://ufj.edu.br/IA/"
  },
  {
    id: "br-bacharelado-ia-ufopa",
    name: "Bacharelado em Inteligência Artificial",
    organization: "Universidade Federal do Oeste do Pará",
    category: "Formacao",
    city: "Santarém",
    region: "Pará",
    country: "Brazil",
    address: "Unidade Tapajós, R. Vera Paz, s/n, Salé",
    lat: -2.4172,
    lng: -54.7408,
    focus: "Undergraduate AI education linked to scientific and technological challenges of the Amazon region",
    notes: "Public, in-person evening bachelor's program with 40 authorized places and a curriculum designed for Amazonian development needs.",
    sourceName: "UFOPA",
    sourceUrl: "https://proen.ufopa.edu.br/media/file/site/proen/documentos/2025/7d407063-75db-4281-9b39-54cb7bb76cb9.pdf"
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
    notes: "Cluster original de 100.000 H100, com expansão para 200.000 GPUs Hopper.",
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
    accelerators: "110.000 em instalação; meta pública de 1.000.000+",
    acceleratorType: "NVIDIA GB200",
    notes: "Expansão do Colossus em propriedade de cerca de 1 milhão de ft2.",
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
    power: "1,2 GW alvo; 200 MW+ em operação inicial",
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
    notes: "SoftBank iniciou construção; operação prevista para o ano seguinte ao anúncio.",
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
    notes: "AI datacenter de 315 acres e 1,2 milhão de ft2; conclusão planejada para 2026.",
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
    power: "Multi-GW; 2 GW+ até 2030, potencial 5 GW",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Maior cluster de treinamento de IA da Meta, segundo a própria empresa.",
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
    notes: "Cluster de IA da Meta previsto para entrar em operação em 2026.",
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
    power: "130 MW inicial; até 500 MW planejado",
    accelerators: "50.000 GPUs operacionais; expansão para ~100.000",
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
    notes: "Acordo de capacidade para Doubao e outras cargas de IA; ponto no mapa é aproximação nacional.",
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
    acceleratorType: "NVIDIA GPUs previstas; modelo e quantidade pública não detalhados",
    notes: "Não aparece como cancelado: OpenAI anunciou o projeto em maio de 2025 e G42/Khazna reportou progresso de construção da primeira fase de 200 MW.",
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
    accelerators: "100.000 GPUs alvo até fim de 2026",
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
    notes: "Anunciado em setembro de 2025, mas pausado em abril de 2026 por custos de energia e incerteza regulatória; não está ativo no momento.",
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
    notes: "AI factory soberana operada pela Deutsche Telekom em solo alemão para indústria, pesquisa, startups e setor público.",
    sourceName: "Deutsche Telekom",
    sourceUrl: "https://www.telekom.com/en/media/media-information/archive/germany-s-first-ai-factory-for-industry-1101670"
  },
  {
    id: "meta-sturgeon-county",
    company: "Meta",
    name: "Sturgeon County AI Data Center",
    status: "Em construcao",
    city: "Sturgeon County",
    region: "Alberta",
    country: "Canada",
    address: "Sturgeon County, near Edmonton, Alberta",
    lat: 53.785,
    lng: -113.55,
    power: "932 MW power plant tied to site; described as about 1 GW",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Meta's first AI data center in Canada and its largest outside the United States; announced with closed-loop cooling and local infrastructure investment.",
    sourceName: "AP News",
    sourceUrl: "https://apnews.com/article/meta-ai-data-center-canada-922a7d15ab730ec53b934269fc00a0fa"
  },
  {
    id: "microsoft-fairwater-2-atlanta",
    company: "Microsoft",
    name: "Fairwater 2 Atlanta",
    status: "Em construcao",
    city: "Atlanta",
    region: "Georgia",
    country: "United States",
    address: "Atlanta, GA",
    lat: 33.749,
    lng: -84.388,
    power: "Fairwater network described as multi-GW; site-level N/D",
    accelerators: "Centenas de milhares no conjunto Fairwater",
    acceleratorType: "NVIDIA GPUs",
    notes: "Two-story AI datacenter connected to the Wisconsin Fairwater complex by a high-speed network; supports Microsoft, OpenAI and other AI developers.",
    sourceName: "AP News",
    sourceUrl: "https://apnews.com/article/anthropic-ai-data-centers-fluidstack-b5e99d485d08ed1ced68a701723c3843"
  },
  {
    id: "meta-reliance-jamnagar",
    company: "Meta / Reliance",
    name: "Jamnagar AI Data Centre",
    status: "Planejado",
    city: "Jamnagar",
    region: "Gujarat",
    country: "India",
    address: "Jamnagar, Gujarat",
    lat: 22.4707,
    lng: 70.0577,
    power: "168 MW inicial; opcao de escala",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Built-to-suit AI-enabled capacity developed by Reliance and leased by Meta, with renewable energy and desalinated seawater cooling planned.",
    sourceName: "Times of India",
    sourceUrl: "https://timesofindia.indiatimes.com/business/reliance-and-meta-to-develop-ai-enabled-data-centre-in-jamnagar/articleshow/131624466.cms"
  },
  {
    id: "anthropic-terawulf-hawesville",
    company: "Anthropic / TeraWulf",
    name: "Justified Data AI Campus",
    status: "Planejado",
    city: "Hawesville",
    region: "Kentucky",
    country: "United States",
    address: "Former Century Aluminum site, Hawesville, KY",
    lat: 37.9001,
    lng: -86.7544,
    power: "401 MW critical IT load; 480 MW existing site availability",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "20-year lease for Anthropic workloads; initial capacity expected in late 2027, with full ramp in early 2028.",
    sourceName: "MarketWatch",
    sourceUrl: "https://www.marketwatch.com/story/terawulfs-stock-surges-after-a-19-billion-deal-with-anthropic-6899d3bc"
  },
  {
    id: "anthropic-fluidstack-texas",
    company: "Anthropic / Fluidstack",
    name: "Fluidstack Texas AI Site",
    status: "Planejado",
    city: "Texas",
    region: "Texas",
    country: "United States",
    address: "Texas; exact site not public",
    lat: 31.0,
    lng: -99.0,
    power: "Parte de programa de US$50 bi; site-level N/D",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Anthropic announced custom data centers in Texas and New York with Fluidstack; exact locations and electricity sources were not disclosed.",
    sourceName: "AP News",
    sourceUrl: "https://apnews.com/article/anthropic-ai-data-centers-fluidstack-b5e99d485d08ed1ced68a701723c3843"
  },
  {
    id: "anthropic-fluidstack-new-york",
    company: "Anthropic / Fluidstack",
    name: "Fluidstack New York AI Site",
    status: "Planejado",
    city: "New York State",
    region: "New York",
    country: "United States",
    address: "New York; exact site not public",
    lat: 43.0,
    lng: -75.5,
    power: "Parte de programa de US$50 bi; site-level N/D",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "State-level marker for Anthropic's Fluidstack buildout; AP reported that exact locations and electricity sources were not disclosed.",
    sourceName: "AP News",
    sourceUrl: "https://apnews.com/article/anthropic-ai-data-centers-fluidstack-b5e99d485d08ed1ced68a701723c3843"
  },
  {
    id: "hummingbird-ai-trinidad",
    company: "Hummingbird AI",
    name: "Trinidad AI Infrastructure Facility",
    status: "Anunciado",
    city: "Port of Spain",
    region: "Trinidad",
    country: "Trinidad and Tobago",
    address: "Trinidad and Tobago; exact site not public",
    lat: 10.6549,
    lng: -61.5019,
    power: "150 MW propostos",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "MOU for preliminary cooperation, due diligence and coordination for an AI infrastructure and data center facility; early-stage project.",
    sourceName: "AP News",
    sourceUrl: "https://apnews.com/article/trinidad-tobago-data-centers-ernst-young-a4d9efd41ae303b58f3f0cea695dcc3e"
  },
  {
    id: "ey-trinidad-datacenter",
    company: "Ernst & Young / partners",
    name: "Trinidad Large-Scale Data Center",
    status: "Anunciado",
    city: "Port of Spain",
    region: "Trinidad",
    country: "Trinidad and Tobago",
    address: "Trinidad and Tobago; exact site not public",
    lat: 10.6549,
    lng: -61.4619,
    power: "300 MW propostos",
    accelerators: "N/D",
    acceleratorType: "N/D",
    notes: "Framework agreement for a large-scale data center to be developed with third-party partners; early-stage project.",
    sourceName: "AP News",
    sourceUrl: "https://apnews.com/article/trinidad-tobago-data-centers-ernst-young-a4d9efd41ae303b58f3f0cea695dcc3e"
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
    mapShell: document.getElementById("mapShell"),
    companyMap: document.getElementById("companyMap"),
    companyLocationList: document.getElementById("companyLocationList"),
    mapSummary: document.getElementById("mapSummary"),
    mapLayerButtons: document.querySelectorAll("[data-map-layer]"),
    mapBaseButtons: document.querySelectorAll("[data-map-base]"),
    mapLabelButtons: document.querySelectorAll("[data-map-labels]"),
    mapScaleButtons: document.querySelectorAll("[data-map-scale]"),
    mapFullscreenButton: document.querySelector("[data-map-fullscreen]"),
    mapLoading: document.getElementById("mapLoading"),
    mapError: document.getElementById("mapError"),
    modelsTable: document.getElementById("modelsTable"),
    sourcesList: document.getElementById("sourcesList")
  });
}

function bindEvents() {
  window.addEventListener("resize", () => {
    syncStickyOffsets();
    state.companyMap?.resize();
    scheduleMapOverlapMarkerUpdate();
  });

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
    ["year", els.yearFilter]
  ]) {
    bindMultiFilter(key, element);
  }

  for (const [key, element] of [
    ["yearStart", els.yearStartFilter],
    ["yearEnd", els.yearEndFilter]
  ]) {
    element.addEventListener("change", (event) => {
      state.filters[key] = event.target.value;
      saveViewPreferences();
      render();
    });
  }

  document.addEventListener("click", (event) => {
    if (!(event.target instanceof Element) || !event.target.closest(".multi-filter")) {
      closeMultiFilterMenus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (state.mapFullscreen) {
      event.preventDefault();
      setMapFullscreen(false);
      return;
    }
    closeMultiFilterMenus();
  });

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
      saveViewPreferences();
      renderCompanyMap();
    });
  });

  els.mapBaseButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mapBaseMode = VALID_MAP_BASE_MODES.has(button.dataset.mapBase) ? button.dataset.mapBase : "hybrid";
      syncViewControls();
      saveViewPreferences();
      applyMapBaseMode(state.mapBaseMode);
    });
  });

  els.mapLabelButtons.forEach((button) => {
    button.addEventListener("click", () => {
      state.mapLabels = button.dataset.mapLabels === "on";
      syncViewControls();
      saveViewPreferences();
      applyMapBaseMode(state.mapBaseMode);
    });
  });

  els.mapScaleButtons.forEach((button) => {
    button.addEventListener("click", () => {
      applyMapScale(button.dataset.mapScale);
      saveViewPreferences();
    });
  });

  els.mapFullscreenButton?.addEventListener("click", () => {
    setMapFullscreen(!state.mapFullscreen);
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
  const formattedDate = date ? formatDate(date) : "data não informada";
  element.textContent = description
    ? `Última atualização: ${formattedDate} - ${description}`
    : `Última atualização: ${formattedDate}`;
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
  fillMultiFilter(els.aiCategoryFilter, "aiCategory", ["LLMs", "all", ...AI_CATEGORIES.filter((category) => category !== "LLMs")], "Todos");
  fillMultiFilter(els.companyFilter, "company", ["all", ...unique(models.map((model) => model.company))], "Todas");
  fillMultiFilter(els.typeFilter, "type", ["all", ...unique(models.flatMap((model) => model.model_type))], "Todos");
  fillMultiFilter(els.familyFilter, "family", ["all", ...unique(models.map((model) => model.family))], "Todas");

  const years = unique(models.map((model) => model.year)).sort((a, b) => a - b);
  fillMultiFilter(els.yearFilter, "year", ["all", ...years], "Todos");
  fillSelect(els.yearStartFilter, ["all", ...years], "Início");
  fillSelect(els.yearEndFilter, ["all", ...years], "Fim");
  syncFilterControls();
  syncStickyOffsets();
  saveViewPreferences();
}

function fillSelect(element, values, allLabel) {
  element.innerHTML = values.map((value) => {
    const label = value === "all" ? allLabel : AI_CATEGORY_LABELS[value] || value;
    return `<option value="${escapeHtml(String(value))}">${escapeHtml(String(label))}</option>`;
  }).join("");
}

function bindMultiFilter(key, element) {
  element.addEventListener("click", (event) => {
    if (!(event.target instanceof Element)) return;
    const toggle = event.target.closest("[data-multi-filter-toggle]");
    if (!toggle || !element.contains(toggle)) return;

    const shouldOpen = !element.classList.contains("open");
    closeMultiFilterMenus(element);
    element.classList.toggle("open", shouldOpen);
    toggle.setAttribute("aria-expanded", String(shouldOpen));
    const menu = element.querySelector(".multi-filter-menu");
    if (menu) menu.hidden = !shouldOpen;
  });

  element.addEventListener("change", (event) => {
    if (!(event.target instanceof HTMLInputElement) || event.target.type !== "checkbox") return;
    state.filters[key] = readMultiFilterSelection(element, event.target.value);
    syncMultiFilter(element, key);
    saveViewPreferences();
    render();
  });
}

function fillMultiFilter(element, key, values, allLabel) {
  const fieldLabel = element.closest(".filter-field")?.querySelector("span")?.textContent?.trim() || "Filtro";
  const menuId = `${key}MultiFilterMenu`;
  const options = values.map((value, index) => {
    const stringValue = String(value);
    const label = stringValue === "all" ? allLabel : AI_CATEGORY_LABELS[stringValue] || stringValue;
    const inputId = `${key}-${slugify(stringValue) || index}`;
    return `
      <label class="multi-filter-option" for="${escapeAttribute(inputId)}">
        <input id="${escapeAttribute(inputId)}" type="checkbox" value="${escapeAttribute(stringValue)}" data-filter-value>
        <span>${escapeHtml(label)}</span>
      </label>
    `;
  }).join("");

  element.innerHTML = `
    <button class="multi-filter-toggle" type="button" data-multi-filter-toggle aria-expanded="false" aria-controls="${escapeAttribute(menuId)}">
      <span class="multi-filter-summary" data-multi-filter-summary>${escapeHtml(fieldLabel)}</span>
      <span class="multi-filter-count" data-multi-filter-count></span>
      <span class="multi-filter-chevron" aria-hidden="true">&#9662;</span>
    </button>
    <div class="multi-filter-menu" id="${escapeAttribute(menuId)}" role="group" aria-label="${escapeAttribute(fieldLabel)}" hidden>
      ${options}
    </div>
  `;
}

function readMultiFilterSelection(element, changedValue) {
  const checked = Array.from(element.querySelectorAll("input[data-filter-value]:checked"))
    .map((input) => input.value);
  if (changedValue === "all" && checked.includes("all")) return ["all"];

  const specificValues = checked.filter((value) => value !== "all");
  return specificValues.length ? specificValues : ["all"];
}

function syncMultiFilter(element, key) {
  const validValues = multiFilterValues(element);
  state.filters[key] = normalizeMultiFilterValues(key, state.filters[key], validValues);
  const selected = state.filters[key];
  const selectedSet = new Set(selected.map(String));

  element.querySelectorAll("input[data-filter-value]").forEach((input) => {
    input.checked = selectedSet.has(input.value);
  });

  const summary = element.querySelector("[data-multi-filter-summary]");
  const count = element.querySelector("[data-multi-filter-count]");
  const selectedLabels = selected
    .filter((value) => value !== "all")
    .map((value) => multiFilterLabelForValue(element, value));

  if (summary) {
    summary.textContent = selected.includes("all")
      ? multiFilterLabelForValue(element, "all")
      : selectedLabels.slice(0, 2).join(", ");
  }
  if (count) {
    const overflow = selectedLabels.length - 2;
    count.textContent = selected.includes("all")
      ? ""
      : overflow > 0
        ? `+${overflow}`
        : "";
  }

  const toggle = element.querySelector("[data-multi-filter-toggle]");
  if (toggle) toggle.setAttribute("aria-expanded", String(element.classList.contains("open")));
}

function normalizeMultiFilterValues(key, value, validValues = []) {
  const fallback = DEFAULT_MULTI_FILTERS[key] || ["all"];
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === "string"
      ? [value]
      : fallback;
  const validSet = new Set(validValues.map(String));
  const selected = rawValues
    .map((item) => String(item))
    .filter((item) => validSet.has(item));

  if (!selected.length) return [...fallback];
  if (selected.includes("all")) return ["all"];
  return [...new Set(selected)];
}

function multiFilterValues(element) {
  return Array.from(element.querySelectorAll("input[data-filter-value]"))
    .map((input) => input.value);
}

function multiFilterLabelForValue(element, value) {
  const input = Array.from(element.querySelectorAll("input[data-filter-value]"))
    .find((candidate) => candidate.value === String(value));
  return input?.closest(".multi-filter-option")?.querySelector("span")?.textContent?.trim() || String(value);
}

function filterHasAll(key) {
  return selectedFilterValues(key).includes("all");
}

function selectedFilterValues(key) {
  return Array.isArray(state.filters[key])
    ? state.filters[key].map(String)
    : [String(state.filters[key] || "all")];
}

function selectedCompaniesForFilter() {
  const companies = selectedFilterValues("company").filter((company) => company !== "all");
  return companies.length ? new Set(companies) : null;
}

function closeMultiFilterMenus(exceptElement = null) {
  document.querySelectorAll(".multi-filter.open").forEach((element) => {
    if (element === exceptElement) return;
    element.classList.remove("open");
    element.querySelector("[data-multi-filter-toggle]")?.setAttribute("aria-expanded", "false");
    const menu = element.querySelector(".multi-filter-menu");
    if (menu) menu.hidden = true;
  });
}

function syncFilterControls() {
  els.searchInput.value = state.filters.query;
  for (const [key, element] of [
    ["aiCategory", els.aiCategoryFilter],
    ["company", els.companyFilter],
    ["type", els.typeFilter],
    ["family", els.familyFilter],
    ["year", els.yearFilter]
  ]) {
    syncMultiFilter(element, key);
  }
  state.filters.yearStart = optionExists(els.yearStartFilter, state.filters.yearStart) ? state.filters.yearStart : "all";
  state.filters.yearEnd = optionExists(els.yearEndFilter, state.filters.yearEnd) ? state.filters.yearEnd : "all";

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
  els.mapBaseButtons?.forEach((button) => {
    button.classList.toggle("active", button.dataset.mapBase === state.mapBaseMode);
  });
  els.mapLabelButtons?.forEach((button) => {
    const activeValue = state.mapLabels ? "on" : "off";
    button.classList.toggle("active", button.dataset.mapLabels === activeValue);
  });
  els.mapScaleButtons?.forEach((button) => {
    button.classList.toggle("active", button.dataset.mapScale === state.mapScale);
  });
  syncMapFullscreenControls();
}

function setMapFullscreen(enabled) {
  state.mapFullscreen = Boolean(enabled);
  syncMapFullscreenControls();

  requestAnimationFrame(() => {
    state.companyMap?.resize();
    scheduleMapOverlapMarkerUpdate();
    if (state.mapFullscreen) {
      scrollSelectedMapLocationIntoView();
    }
  });
}

function syncMapFullscreenControls() {
  els.mapShell?.classList.toggle("map-fullscreen", state.mapFullscreen);
  document.body.classList.toggle("map-fullscreen-open", state.mapFullscreen);

  if (!els.mapFullscreenButton) return;
  els.mapFullscreenButton.classList.toggle("active", state.mapFullscreen);
  els.mapFullscreenButton.setAttribute("aria-pressed", String(state.mapFullscreen));
  els.mapFullscreenButton.setAttribute(
    "aria-label",
    state.mapFullscreen ? "Sair da tela cheia do mapa" : "Abrir mapa em tela cheia"
  );
  els.mapFullscreenButton.title = state.mapFullscreen ? "Sair da tela cheia (Esc)" : "Abrir mapa em tela cheia";
  els.mapFullscreenButton.textContent = state.mapFullscreen ? "Sair" : "Tela cheia";
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
    if (VALID_MAP_BASE_MODES.has(prefs.mapBaseMode)) state.mapBaseMode = prefs.mapBaseMode;
    if (typeof prefs.mapLabels === "boolean") state.mapLabels = prefs.mapLabels;
    if (VALID_MAP_SCALES.has(prefs.mapScale)) state.mapScale = prefs.mapScale;
    if (VALID_TABLE_DATE_ORDERS.has(prefs.tableDateOrder)) state.tableDateOrder = prefs.tableDateOrder;
    if (VALID_TABLE_DATE_ORDERS.has(prefs.historyEventDateOrder)) historyState.eventDateOrder = prefs.historyEventDateOrder;
    if (prefs.filters && typeof prefs.filters === "object") {
      const restoredFilters = { ...state.filters };
      for (const [key, value] of Object.entries(prefs.filters)) {
        if (!(key in restoredFilters)) continue;
        if (MULTI_FILTER_KEYS.includes(key)) {
          if (Array.isArray(value)) restoredFilters[key] = value.map(String);
          if (typeof value === "string") restoredFilters[key] = [value];
        } else if (typeof value === "string") {
          restoredFilters[key] = value;
        }
      }
      state.filters = restoredFilters;
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
      mapBaseMode: state.mapBaseMode,
      mapLabels: state.mapLabels,
      mapScale: state.mapScale,
      tableDateOrder: state.tableDateOrder,
      historyEventDateOrder: historyState.eventDateOrder,
      filters: state.filters
    }));
  } catch {
    // Prefer keeping the app usable when browser storage is unavailable.
  }
}

function optionExists(select, value) {
  return Array.from(select?.options || []).some((option) => option.value === String(value));
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
    if (!filterHasAll("aiCategory") && !model.ai_category.some((category) => selectedFilterValues("aiCategory").includes(category))) return false;
    if (!filterHasAll("company") && !selectedFilterValues("company").includes(model.company)) return false;
    if (!filterHasAll("type") && !model.model_type.some((type) => selectedFilterValues("type").includes(type))) return false;
    if (!filterHasAll("family") && !selectedFilterValues("family").includes(model.family)) return false;
    if (!filterHasAll("year") && !selectedFilterValues("year").includes(String(model.year))) return false;
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
  try { renderHistory(); } catch (e) {
    const c = document.getElementById("historyView");
    if (c) c.innerHTML = `<p style="padding:24px;color:var(--muted)">Erro ao carregar história.</p>`;
  }
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

  const companies = unique(models.map((model) => model.company));
  const laneGroups = state.laneMode === "all"
    ? [{
      label: "Todos",
      laneModels: models,
      indexLabel: companies.length,
      meta: `${companies.length} ${companies.length === 1 ? "empresa" : "empresas"} no filtro`
    }]
    : companies.map((company, index) => ({
      label: company,
      laneModels: models.filter((model) => model.company === company),
      indexLabel: String(index + 1).padStart(2, "0")
    }));

  els.timeline.innerHTML = laneGroups.map(({ label, laneModels, indexLabel, meta }) => {
    const events = laneModels.map((model, index) => {
      const left = ((model.timestamp - min) / span) * 100;
      const color = model.is_negative ? "#ef4444" : colorFor(model.company);
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
        <div class="lane-label">
          <span class="lane-index">${escapeHtml(indexLabel)}</span>
          <span class="lane-name">${escapeHtml(label)}</span>
          ${meta ? `<span class="lane-meta">${escapeHtml(meta)}</span>` : ""}
        </div>
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
      <span class="dot" style="background:${model.is_negative ? '#ef4444' : colorFor(model.company)}"></span>
      <div>
        <p>${escapeHtml(model.company)} - ${escapeHtml(model.family)}</p>
        <h2>${escapeHtml(model.model)}</h2>
      </div>
    </div>
    <dl>
      <div><dt>Data</dt><dd>${formatDate(model.release_date)}</dd></div>
      <div><dt>Estágio</dt><dd>${escapeHtml(model.release_stage)}</dd></div>
      <div><dt>Tipo de IA</dt><dd>${model.ai_category.map(categoryPill).join("")}</dd></div>
      <div><dt>Tipos</dt><dd>${model.model_type.map(typePill).join("")}</dd></div>
      <div><dt>Confiança</dt><dd>${escapeHtml(model.confidence || "não informada")}</dd></div>
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
  if (!els.companyLocationList || !els.mapSummary || !els.companyMap) return;

  const locations = locationsForMap();
  if (state.selectedMapCompany && !locations.some((location) => location.mapKey === state.selectedMapCompany)) {
    state.selectedMapCompany = null;
  }

  const countries = unique(locations.map((location) => location.country));
  const companyCount = locations.filter((location) => location.kind === "company").length;
  const labCount = locations.filter((location) => location.kind === "lab").length;
  const dataCenterCount = locations.filter((location) => location.kind === "datacenter").length;
  const missingCompanies = missingLocationCompanies();

  els.mapSummary.innerHTML = `
    ${companyCount ? `<span>${companyCount} sedes</span>` : ""}
    ${labCount ? `<span>${labCount} iniciativas IA</span>` : ""}
    ${dataCenterCount ? `<span>${dataCenterCount} data centers</span>` : ""}
    <span>${countries.length} países</span>
    ${(state.mapLayer === "companies" || state.mapLayer === "all") && missingCompanies.length ? `<span>${missingCompanies.length} sem coordenada</span>` : ""}
  `;

  renderCompanyLocationList(locations);
  if (state.view !== "map") return;

  requestAnimationFrame(() => {
    if (typeof maplibregl === "undefined") {
      showMapError("Não foi possível carregar o MapLibre GL JS.");
      return;
    }

    if (!state.companyMap) initCompanyMap();
    state.companyMap?.resize();
    updateCompanyMap(locations);
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
  const selectedCompanies = selectedCompaniesForFilter();
  return companyLocations
    .filter((location) => companiesInData.has(location.company))
    .filter((location) => !selectedCompanies || selectedCompanies.has(location.company))
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
  const selectedCompanies = selectedCompaniesForFilter();
  return aiDataCenters
    .filter((location) => !selectedCompanies || selectedCompanies.has(location.company))
    .map((location) => ({
      ...location,
      kind: "datacenter",
      mapKey: `datacenter:${location.id}`
    }));
}

function missingLocationCompanies() {
  const mappedCompanies = new Set(companyLocations.map((location) => location.company));
  const selectedCompanies = selectedCompaniesForFilter();
  return unique(allModels().map((model) => model.company))
    .filter((company) => !selectedCompanies || selectedCompanies.has(company))
    .filter((company) => !mappedCompanies.has(company));
}

function initCompanyMap() {
  clearMapError();
  els.mapLoading.hidden = false;
  state.mapFallbackTried = false;
  state.mapStyleFallbackActive = false;
  state.mapStyleMode = mapStyleModeForBaseMode(state.mapBaseMode);

  try {
    state.companyMap = new maplibregl.Map({
      container: els.companyMap,
      style: MAP_STYLE_URLS[state.mapStyleMode],
      center: [8, 16],
      zoom: 1.35,
      pitch: 0,
      bearing: 0,
      renderWorldCopies: false,
      attributionControl: false,
      canvasContextAttributes: { antialias: true }
    });
  } catch (error) {
    showMapError(`Erro ao iniciar mapa: ${error.message}`);
    return;
  }

  const map = state.companyMap;
  map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), "top-right");
  map.addControl(new maplibregl.AttributionControl({ compact: true }), "bottom-right");

  map.on("error", handleMapError);
  map.on("styleimagemissing", (event) => {
    if (String(event.id || "").startsWith(MAP_FLAG_ICON_PREFIX)) return;
    if (!map.hasImage(event.id)) {
      map.addImage(event.id, { width: 1, height: 1, data: new Uint8Array(4) });
    }
  });
  map.on("style.load", () => {
    try {
      map.setProjection({ type: "globe" });
    } catch (error) {
      console.warn("Não foi possível ativar a projeção globo.", error);
    }

    configureMapSky();
    addSatelliteLayer();
    addAdminBoundaryLayers();
    addMapLocationLayers();
    applyMapBaseMode(state.mapBaseMode);
    updateCompanyMap(locationsForMap());
  });
  map.on("load", () => {
    els.mapLoading.hidden = true;
    clearMapError();
    syncMapScaleFromMap();
  });
  map.on("move", () => {
    syncMapScaleFromMap();
  });
  map.on("zoom", () => {
    syncMapScaleFromMap();
  });
  map.on("moveend", () => {
    scheduleMapOverlapMarkerUpdate();
  });
  map.on("zoomend", () => {
    scheduleMapOverlapMarkerUpdate();
  });

  setTimeout(() => {
    if (!els.mapLoading.hidden && state.companyMap) {
      els.mapLoading.hidden = true;
      showMapError("O mapa está demorando para carregar. Algumas camadas podem aparecer aos poucos.");
    }
  }, 15000);
}

function handleMapError(event) {
  const error = event.error || event;
  const message = String(error?.message || error || "");
  console.warn("[mapa]", error);

  if (!state.mapFallbackTried && /style/i.test(message)) {
    state.mapFallbackTried = true;
    state.mapStyleFallbackActive = true;
    state.companyMap?.setStyle(MAP_FALLBACK_STYLE_URL, { diff: false });
    return;
  }

  if (!state.companyMap?.loaded() && message) {
    showMapError(`Falha ao carregar mapa: ${message}`);
  }
}

function configureMapSky() {
  const map = state.companyMap;
  if (!map?.setSky) return;

  try {
    map.setSky({
      "sky-color": "#07111f",
      "horizon-color": "#18314a",
      "fog-color": "#07111f",
      "sky-horizon-blend": 0.45,
      "horizon-fog-blend": 0.55,
      "fog-ground-blend": 0.18,
      "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 1, 5, 1, 7, 0]
    });
  } catch (error) {
    console.warn("Não foi possível configurar o céu do mapa.", error);
  }
}

function addSatelliteLayer() {
  const map = state.companyMap;
  if (!map || map.getSource("satellite-source")) return;

  map.addSource("satellite-source", {
    type: "raster",
    tiles: [MAP_SATELLITE_TILE_URL],
    tileSize: 256,
    maxzoom: 19,
    attribution: "Tiles Esri - World Imagery"
  });

  const layers = map.getStyle().layers || [];
  const firstLineOrSymbol = layers.find((layer) => layer.type === "line" || layer.type === "symbol");

  map.addLayer({
    id: "satellite-layer",
    type: "raster",
    source: "satellite-source",
    layout: { visibility: "none" },
    paint: {
      "raster-opacity": 0.95,
      "raster-saturation": -0.08,
      "raster-contrast": 0.08
    }
  }, firstLineOrSymbol?.id);
}

function addAdminBoundaryLayers() {
  const map = state.companyMap;
  if (!map || !map.getSource("openmaptiles") || map.getLayer("ai-admin-boundaries")) return;

  const layers = map.getStyle().layers || [];
  const firstBaseSymbol = layers.find((layer) => layer.type === "symbol" && !layer.id.startsWith("ai-"));
  const boundaryFilter = [
    "all",
    ["==", ["to-number", ["get", "admin_level"], -1], 4],
    ["!=", ["to-number", ["get", "maritime"], 0], 1],
    ["!=", ["to-number", ["get", "disputed"], 0], 1],
    ["!", ["has", "claimed_by"]]
  ];

  map.addLayer({
    id: "ai-admin-boundaries-casing",
    type: "line",
    source: "openmaptiles",
    "source-layer": "boundary",
    minzoom: 3,
    filter: boundaryFilter,
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-opacity": 0.82,
      "line-width": ["interpolate", ["linear"], ["zoom"], 3, 1.5, 5, 2.4, 8, 3.2, 12, 5.2]
    }
  }, firstBaseSymbol?.id);

  map.addLayer({
    id: "ai-admin-boundaries",
    type: "line",
    source: "openmaptiles",
    "source-layer": "boundary",
    minzoom: 3,
    filter: boundaryFilter,
    layout: {
      "line-cap": "round",
      "line-join": "round"
    },
    paint: {
      "line-opacity": 0.92,
      "line-width": ["interpolate", ["linear"], ["zoom"], 3, 0.8, 5, 1.2, 8, 1.7, 12, 2.8]
    }
  }, firstBaseSymbol?.id);

  applyAdminBoundaryPaint();
}

function addMapLocationLayers() {
  const map = state.companyMap;
  if (!map || map.getSource("ai-locations")) return;
  const locations = locationsForMap();

  registerMapFlagImages(locations);

  map.addSource("ai-locations", {
    type: "geojson",
    data: buildMapLocationsGeoJson(locations)
  });

  map.addLayer({
    id: "ai-locations-halo",
    type: "circle",
    source: "ai-locations",
    filter: ["==", ["get", "selected"], true],
    paint: {
      "circle-radius": ["interpolate", ["linear"], ["zoom"], 0, 13, 6, 21, 12, 30, 16, 42],
      "circle-color": ["get", "color"],
      "circle-opacity": 0.18,
      "circle-stroke-color": "#ffffff",
      "circle-stroke-width": 1
    }
  });

  map.addLayer({
    id: "ai-locations-ring",
    type: "circle",
    source: "ai-locations",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        ["case", ["==", ["get", "selected"], true], 10, 7],
        6,
        ["case", ["==", ["get", "selected"], true], 15, 11],
        12,
        ["case", ["==", ["get", "selected"], true], 22, 17],
        16,
        ["case", ["==", ["get", "selected"], true], 30, 24]
      ],
      "circle-color": "rgba(255,255,255,0)",
      "circle-stroke-color": "#f8fafc",
      "circle-stroke-opacity": 0.88,
      "circle-stroke-width": [
        "case",
        ["==", ["get", "selected"], true],
        2.8,
        ["==", ["get", "kind"], "datacenter"],
        2.2,
        1.4
      ]
    }
  });

  map.addLayer({
    id: "ai-locations-core",
    type: "circle",
    source: "ai-locations",
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        0,
        ["case", ["==", ["get", "selected"], true], 5, 3.5],
        6,
        ["case", ["==", ["get", "selected"], true], 8, 5.5],
        12,
        ["case", ["==", ["get", "selected"], true], 11, 8],
        16,
        ["case", ["==", ["get", "selected"], true], 16, 12]
      ],
      "circle-color": ["get", "color"],
      "circle-stroke-color": "#020617",
      "circle-stroke-width": 1.8
    }
  });

  map.addLayer({
    id: "ai-locations-flags",
    type: "symbol",
    source: "ai-locations",
    minzoom: MAP_FLAG_MIN_ZOOM,
    layout: {
      "visibility": "none",
      "icon-image": ["get", "flagIcon"],
      "icon-anchor": "bottom",
      "icon-size": ["interpolate", ["linear"], ["zoom"], 4, 0.72, 8, 0.88, 14, 1.04, 16, 1.12],
      "icon-allow-overlap": false,
      "icon-ignore-placement": false,
      "icon-padding": 6
    },
    paint: {
      "icon-opacity": [
        "interpolate",
        ["linear"],
        ["zoom"],
        MAP_FLAG_MIN_ZOOM,
        0,
        MAP_FLAG_MIN_ZOOM + 0.55,
        1
      ]
    }
  });

  const handleLocationClick = (event) => {
    const location = locationFromMapEvent(event);
    hideMapPreviewPopup();
    selectCompanyOnMap(location, { popup: true, focus: false });
  };
  const handleLocationPreview = (event) => {
    const location = locationFromMapEvent(event);
    showMapPreviewPopup(location, event.lngLat);
  };

  ["ai-locations-core", "ai-locations-flags"].forEach((layerId) => {
    map.on("click", layerId, handleLocationClick);
    map.on("mousemove", layerId, handleLocationPreview);
    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
      hideMapPreviewPopup();
    });
  });
}

function locationFromMapEvent(event) {
  const feature = event.features?.[0];
  return locationsForMap().find((item) => item.mapKey === feature?.properties?.mapKey);
}

function updateCompanyMap(locations) {
  const map = state.companyMap;
  if (!map?.getSource("ai-locations")) return;

  registerMapFlagImages(locations);
  map.getSource("ai-locations").setData(buildMapLocationsGeoJson(locations));
  state.mapMarkerLocations = locations;
  updateMapOverlapMarkers(locations);
  syncMapScaleFromMap();

  if (!state.mapHasInitialView && locations.length) {
    state.mapHasInitialView = true;
    applyMapScale(state.mapScale, { animate: false });
  }
}

function updateMapOverlapMarkers(locations = []) {
  const map = state.companyMap;
  if (!map || typeof maplibregl === "undefined") return;

  clearMapHtmlMarkers();
  state.mapMarkerLocations = locations;
  hideMapClusterPopup();

  const visibleLocations = locations.filter(isMapLocationVisibleForHtmlMarker);
  if (!visibleLocations.length) {
    return;
  }

  const groups = groupMapLocationsByScreenOverlap(visibleLocations);
  groups.forEach((group) => {
    if (group.locations.length > MAP_OVERLAP_CLUSTER_LIMIT) {
      addMapClusterMarker(group);
      return;
    }

    const offsets = mapMarkerOffsetsForGroup(group.locations.length);
    group.locations.forEach((location, index) => {
      addMapFlagHtmlMarker(location, offsets[index], group.locations.length);
    });
  });
}

function scheduleMapOverlapMarkerUpdate() {
  if (state.mapOverlapUpdateFrame) return;
  state.mapOverlapUpdateFrame = window.requestAnimationFrame(() => {
    state.mapOverlapUpdateFrame = null;
    updateMapOverlapMarkers(state.mapMarkerLocations);
  });
}

function clearMapHtmlMarkers() {
  state.mapHtmlMarkers.forEach((marker) => marker.remove());
  state.mapHtmlMarkers = [];
}

function isMapLocationVisibleForHtmlMarker(location) {
  const map = state.companyMap;
  if (!map || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return false;

  const point = map.project([location.lng, location.lat]);
  if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) return false;

  const canvas = map.getCanvas();
  const padding = MAP_VISIBLE_MARKER_PADDING;
  const insideViewport = point.x >= -padding
    && point.x <= canvas.clientWidth + padding
    && point.y >= -padding
    && point.y <= canvas.clientHeight + padding;
  if (!insideViewport) return false;

  if (isMapLocationBehindGlobe(location)) return false;

  return true;
}

function isMapLocationBehindGlobe(location) {
  const map = state.companyMap;
  const projection = map?.getProjection?.();
  const projectionName = projection?.name || projection?.type;
  if (projectionName !== "globe" || map.getZoom() >= 5.6) return false;

  const center = map.getCenter();
  return angularDistanceDegrees(center.lat, center.lng, location.lat, location.lng) > 90;
}

function groupMapLocationsByScreenOverlap(locations) {
  const map = state.companyMap;
  const radius = mapOverlapRadiusPx();
  const maxGeoDistanceKm = mapOverlapMaxGeoDistanceKm();
  const points = locations
    .filter((location) => Number.isFinite(location.lat) && Number.isFinite(location.lng))
    .map((location, index) => ({
      index,
      location,
      point: map.project([location.lng, location.lat])
    }));

  const used = new Set();
  const groups = [];

  points.forEach((point) => {
    if (used.has(point.index)) return;

    const group = [point];
    used.add(point.index);

    points
      .filter((candidate) => !used.has(candidate.index))
      .map((candidate) => ({
        candidate,
        screenDistance: screenDistance(point.point, candidate.point)
      }))
      .filter(({ candidate, screenDistance: distance }) => (
        distance <= radius
        && mapLocationsGeoDistanceKm(point.location, candidate.location) <= maxGeoDistanceKm
      ))
      .sort((a, b) => a.screenDistance - b.screenDistance)
      .forEach(({ candidate }) => {
        if (used.has(candidate.index)) return;
        const overlapsEntireGroup = group.every((member) => (
          screenDistance(member.point, candidate.point) <= radius
          && mapLocationsGeoDistanceKm(member.location, candidate.location) <= maxGeoDistanceKm
        ));
        if (!overlapsEntireGroup) return;

        group.push(candidate);
        used.add(candidate.index);
      });

    groups.push(mapOverlapGroup(group));
  });

  return groups;
}

function mapOverlapGroup(points) {
  const locations = points
    .map((point) => point.location)
    .sort((a, b) => (
      a.kind.localeCompare(b.kind)
      || mapItemTitle(a).localeCompare(mapItemTitle(b))
    ));
  const centerPoint = points.reduce((center, point) => ({
    x: center.x + point.point.x / points.length,
    y: center.y + point.point.y / points.length
  }), { x: 0, y: 0 });
  const anchorPoint = points.find((point) => point.location.mapKey === state.selectedMapCompany)
    || points.reduce((closest, point) => (
      screenDistance(point.point, centerPoint) < screenDistance(closest.point, centerPoint) ? point : closest
    ), points[0]);

  return {
    locations,
    center: [anchorPoint.location.lng, anchorPoint.location.lat],
    centerPoint
  };
}

function mapOverlapRadiusPx() {
  const zoom = state.companyMap?.getZoom?.() || 0;
  if (zoom < 3) return 34;
  if (zoom < 6) return 30;
  if (zoom < 10) return 28;
  return 26;
}

function mapOverlapMaxGeoDistanceKm() {
  const zoom = state.companyMap?.getZoom?.() || 0;
  if (zoom < 3) return 450;
  if (zoom < 6) return 180;
  if (zoom < 10) return 70;
  return 30;
}

function screenDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function mapLocationsGeoDistanceKm(a, b) {
  return angularDistanceDegrees(a.lat, a.lng, b.lat, b.lng) * 111.195;
}

function angularDistanceDegrees(latA, lngA, latB, lngB) {
  const toRadians = Math.PI / 180;
  const phiA = latA * toRadians;
  const phiB = latB * toRadians;
  const deltaPhi = (latB - latA) * toRadians;
  const deltaLambda = normalizeLongitudeDelta(lngB - lngA) * toRadians;
  const haversine = Math.sin(deltaPhi / 2) ** 2
    + Math.cos(phiA) * Math.cos(phiB) * Math.sin(deltaLambda / 2) ** 2;

  return (2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(Math.max(0, 1 - haversine)))) / toRadians;
}

function normalizeLongitudeDelta(delta) {
  return ((delta + 540) % 360) - 180;
}

function mapMarkerOffsetsForGroup(count) {
  if (count <= 1) return [{ x: 0, y: 0 }];
  if (count === 2) {
    return [
      { x: -44, y: -34 },
      { x: 44, y: -34 }
    ];
  }

  return [
    { x: 0, y: -58 },
    { x: -50, y: -18 },
    { x: 50, y: -18 }
  ];
}

function addMapFlagHtmlMarker(location, offset, groupSize) {
  const map = state.companyMap;
  const element = document.createElement("div");
  const leaderLength = Math.max(Math.hypot(offset.x, offset.y) - 12, 0);
  const leaderAngle = Math.atan2(offset.y, offset.x) * (180 / Math.PI);

  element.className = `map-overlap-anchor${groupSize > 1 ? " spread" : " single"}`;
  element.style.setProperty("--offset-x", `${offset.x}px`);
  element.style.setProperty("--offset-y", `${offset.y}px`);
  element.style.setProperty("--leader-length", `${leaderLength}px`);
  element.style.setProperty("--leader-angle", `${leaderAngle}deg`);
  element.style.setProperty("--marker-color", colorForMapItem(location));

  const kindClass = location.kind === "datacenter" ? " datacenter" : location.kind === "lab" ? " lab" : "";
  const selectedClass = location.mapKey === state.selectedMapCompany ? " selected" : "";
  element.innerHTML = `
    <span class="map-marker-leader" aria-hidden="true"></span>
    <button class="map-flag-marker${kindClass}${selectedClass}" type="button" title="${escapeAttribute(mapItemTitle(location))}">
      <span class="map-marker-pole" aria-hidden="true"></span>
      <span class="map-marker-pin" aria-hidden="true"></span>
      <span class="map-marker-flag">${escapeHtml(mapItemInitials(location))}</span>
      <span class="map-marker-label">${escapeHtml(mapItemTitle(location))}</span>
    </button>
  `;

  const button = element.querySelector("button");
  button.addEventListener("click", () => {
    hideMapClusterPopup();
    hideMapPreviewPopup();
    selectCompanyOnMap(location, { popup: true, focus: false });
  });
  button.addEventListener("mouseenter", () => {
    showMapPreviewPopup(location, [location.lng, location.lat]);
  });
  button.addEventListener("mouseleave", hideMapPreviewPopup);
  button.addEventListener("focus", () => {
    showMapPreviewPopup(location, [location.lng, location.lat]);
  });
  button.addEventListener("blur", hideMapPreviewPopup);

  const marker = new maplibregl.Marker({ element, anchor: "center" })
    .setLngLat([location.lng, location.lat])
    .addTo(map);
  state.mapHtmlMarkers.push(marker);
}

function addMapClusterMarker(group) {
  const map = state.companyMap;
  const hasSelected = group.locations.some((location) => location.mapKey === state.selectedMapCompany);
  const element = document.createElement("button");
  element.className = `map-cluster-marker${hasSelected ? " selected" : ""}`;
  element.type = "button";
  element.title = `${group.locations.length} pontos sobrepostos`;
  element.innerHTML = `
    <strong>${group.locations.length}</strong>
    <span>pontos</span>
  `;

  element.addEventListener("mouseenter", () => {
    showMapClusterPopup(group);
  });
  element.addEventListener("mouseleave", queueHideMapClusterPopup);
  element.addEventListener("focus", () => {
    showMapClusterPopup(group);
  });
  element.addEventListener("blur", queueHideMapClusterPopupIfFocusLeaves);
  element.addEventListener("click", () => {
    showMapClusterPopup(group);
  });

  const marker = new maplibregl.Marker({ element, anchor: "center" })
    .setLngLat(group.center)
    .addTo(map);
  state.mapHtmlMarkers.push(marker);
}

function showMapClusterPopup(group) {
  const map = state.companyMap;
  if (!map || typeof maplibregl === "undefined") return;

  cancelMapClusterPopupHide();
  hideMapPreviewPopup();
  state.mapPopup?.remove();
  state.mapPopup = null;
  state.mapClusterPopup?.remove();

  state.mapClusterPopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    className: "map-cluster-popup",
    offset: 18,
    maxWidth: "340px"
  })
    .setLngLat(group.center)
    .setHTML(mapClusterPopupHtml(group.locations))
    .addTo(map);

  const popupElement = state.mapClusterPopup.getElement();
  popupElement.addEventListener("mouseenter", cancelMapClusterPopupHide);
  popupElement.addEventListener("mouseleave", queueHideMapClusterPopup);
  popupElement.querySelectorAll("[data-map-cluster-location]").forEach((button) => {
    button.addEventListener("click", () => {
      const location = group.locations.find((item) => item.mapKey === button.dataset.mapClusterLocation);
      if (!location) return;
      hideMapClusterPopup();
      selectCompanyOnMap(location, { popup: true });
    });
  });
}

function mapClusterPopupHtml(locations) {
  return `
    <div class="map-cluster-popup-panel">
      <span>${locations.length} marcadores sobrepostos</span>
      <strong>Escolha um ponto</strong>
      <div class="map-cluster-list">
        ${locations.map((location) => `
          <button type="button" data-map-cluster-location="${escapeAttribute(location.mapKey)}" style="--company-color:${colorForMapItem(location)}">
            <span>${escapeHtml(mapItemInitials(location))}</span>
            <span>
              <strong>${escapeHtml(mapItemTitle(location))}</strong>
              <small>${escapeHtml(mapKindLabel(location))} - ${escapeHtml(location.city || location.region || "")}, ${escapeHtml(location.country || "")}</small>
            </span>
          </button>
        `).join("")}
      </div>
    </div>
  `;
}

function queueHideMapClusterPopup() {
  cancelMapClusterPopupHide();
  state.mapClusterHideTimer = window.setTimeout(hideMapClusterPopup, 220);
}

function queueHideMapClusterPopupIfFocusLeaves() {
  cancelMapClusterPopupHide();
  state.mapClusterHideTimer = window.setTimeout(() => {
    const popupElement = state.mapClusterPopup?.getElement();
    if (popupElement?.contains(document.activeElement)) return;
    hideMapClusterPopup();
  }, 220);
}

function cancelMapClusterPopupHide() {
  if (!state.mapClusterHideTimer) return;
  window.clearTimeout(state.mapClusterHideTimer);
  state.mapClusterHideTimer = null;
}

function hideMapClusterPopup() {
  cancelMapClusterPopupHide();
  state.mapClusterPopup?.remove();
  state.mapClusterPopup = null;
}

function registerMapFlagImages(locations) {
  const map = state.companyMap;
  if (!map) return;

  locations.forEach((location) => {
    const iconId = mapFlagIconId(location);
    if (map.hasImage(iconId)) return;

    const imageData = createMapFlagImage(location);
    if (!imageData) return;

    try {
      map.addImage(iconId, imageData, { pixelRatio: 2 });
    } catch (error) {
      console.warn("Não foi possível registrar bandeira do mapa.", error);
    }
  });
}

function createMapFlagImage(location) {
  const canvas = document.createElement("canvas");
  const pixelRatio = 2;
  const width = 68;
  const height = 66;
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;

  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.scale(pixelRatio, pixelRatio);
  const color = colorForMapItem(location);
  const pinX = 25;
  const pinY = 58;

  ctx.save();
  ctx.shadowColor = "rgba(2, 6, 23, 0.42)";
  ctx.shadowBlur = 8;
  ctx.shadowOffsetY = 5;

  ctx.strokeStyle = "#f8fafc";
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(pinX, pinY - 5);
  ctx.lineTo(pinX, 22);
  ctx.stroke();

  ctx.fillStyle = color;
  fillRoundedRect(ctx, 27, 14, 34, 22, 5);

  if (location.kind === "datacenter") {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.72)";
    ctx.lineWidth = 2;
    strokeRoundedRect(ctx, 29, 16, 30, 18, 3);
  } else {
    ctx.strokeStyle = "rgba(255, 255, 255, 0.42)";
    ctx.lineWidth = 1;
    strokeRoundedRect(ctx, 27, 14, 34, 22, 5);
  }

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(pinX, pinY, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  const initials = mapItemInitials(location);
  let fontSize = initials.length > 2 ? 8.5 : 10.5;
  ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
  while (ctx.measureText(initials).width > 25 && fontSize > 7) {
    fontSize -= 0.5;
    ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
  }
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(initials, 44, 25.5);

  return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function fillRoundedRect(ctx, x, y, width, height, radius) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.fill();
}

function strokeRoundedRect(ctx, x, y, width, height, radius) {
  roundedRectPath(ctx, x, y, width, height, radius);
  ctx.stroke();
}

function roundedRectPath(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function mapFlagIconId(location) {
  return `${MAP_FLAG_ICON_PREFIX}${slugify(location.kind)}-${slugify(mapItemInitials(location))}-${slugify(colorForMapItem(location))}`;
}

function buildMapLocationsGeoJson(locations) {
  return {
    type: "FeatureCollection",
    features: locations.map((location) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [location.lng, location.lat]
      },
      properties: mapFeatureProperties(location)
    }))
  };
}

function mapFeatureProperties(location) {
  return {
    mapKey: location.mapKey,
    kind: location.kind,
    label: mapItemTitle(location),
    initials: mapItemInitials(location),
    city: location.city || "",
    country: location.country || "",
    color: colorForMapItem(location),
    flagIcon: mapFlagIconId(location),
    selected: location.mapKey === state.selectedMapCompany
  };
}

function applyMapBaseMode(mode) {
  const map = state.companyMap;
  state.mapBaseMode = VALID_MAP_BASE_MODES.has(mode) ? mode : "hybrid";
  syncViewControls();
  if (!map) return;

  const desiredStyleMode = mapStyleModeForBaseMode(state.mapBaseMode);
  if (!state.mapStyleFallbackActive && state.mapStyleMode !== desiredStyleMode) {
    state.mapStyleMode = desiredStyleMode;
    state.mapFallbackTried = false;
    map.setStyle(MAP_STYLE_URLS[desiredStyleMode], { diff: false });
    return;
  }

  if (!map?.getStyle()?.layers) return;

  const showSatellite = state.mapBaseMode === "earth" || state.mapBaseMode === "hybrid";
  if (map.getLayer("satellite-layer")) {
    map.setLayoutProperty("satellite-layer", "visibility", showSatellite ? "visible" : "none");
  }

  const backgroundTypes = new Set(["background", "fill", "fill-extrusion", "hillshade", "raster"]);
  (map.getStyle().layers || []).forEach((layer) => {
    if (layer.id === "satellite-layer" || layer.id.startsWith("ai-locations-") || layer.id.startsWith("ai-admin-")) return;

    const labelLayer = isBaseLabelLayer(layer);
    let visible = true;
    if (state.mapBaseMode === "earth") {
      visible = labelLayer && state.mapLabels;
    } else if (state.mapBaseMode === "hybrid") {
      visible = !backgroundTypes.has(layer.type);
    }
    if (labelLayer && !state.mapLabels) visible = false;
    if (labelLayer && state.mapLabels) applyReadableMapLabelPaint(layer.id);

    try {
      map.setLayoutProperty(layer.id, "visibility", visible ? "visible" : "none");
    } catch {
      // Some style layers cannot be toggled in older fallback styles.
    }
  });

  applyAdminBoundaryPaint();
}

function mapStyleModeForBaseMode(mode) {
  return mode === "map" ? "light" : "dark";
}

function applyAdminBoundaryPaint() {
  const map = state.companyMap;
  if (!map) return;

  const lightMap = state.mapBaseMode === "map";
  const paintByLayer = {
    "ai-admin-boundaries-casing": {
      "line-color": lightMap ? "rgba(255, 255, 255, 0.96)" : "rgba(2, 6, 23, 0.88)",
      "line-opacity": lightMap ? 0.9 : 0.86
    },
    "ai-admin-boundaries": {
      "line-color": lightMap ? "#334155" : "#fde047",
      "line-opacity": lightMap ? 0.82 : 0.94
    }
  };

  MAP_ADMIN_BOUNDARY_LAYER_IDS.forEach((layerId) => {
    if (!map.getLayer(layerId)) return;
    Object.entries(paintByLayer[layerId]).forEach(([property, value]) => {
      try {
        map.setPaintProperty(layerId, property, value);
      } catch {
        // Fallback styles may not expose the OpenMapTiles boundary layer.
      }
    });
  });
}

function isBaseLabelLayer(layer) {
  return layer.type === "symbol"
    && layer.layout
    && Object.prototype.hasOwnProperty.call(layer.layout, "text-field");
}

function applyReadableMapLabelPaint(layerId) {
  const map = state.companyMap;
  if (!map?.getLayer(layerId)) return;
  const lightMap = state.mapBaseMode === "map";

  const labelPaint = {
    "text-color": lightMap ? "#111827" : "#f8fafc",
    "text-halo-color": lightMap ? "rgba(255, 255, 255, 0.94)" : "rgba(2, 6, 23, 0.92)",
    "text-halo-width": lightMap ? 2.4 : 2.2,
    "text-halo-blur": lightMap ? 0.35 : 0.45
  };

  Object.entries(labelPaint).forEach(([property, value]) => {
    try {
      map.setPaintProperty(layerId, property, value);
    } catch {
      // Some fallback styles can reject text paint overrides on specific layers.
    }
  });
}

function applyMapScale(scale, options = {}) {
  const map = state.companyMap;
  const targetScale = VALID_MAP_SCALES.has(scale) ? scale : "globe";
  state.mapScale = targetScale;
  syncViewControls();
  if (!map) return;

  const animate = options.animate !== false;
  const referenceLocation = getMapReferenceLocation();

  if (targetScale === "globe") {
    const camera = { center: [8, 16], zoom: 1.35, pitch: 0, bearing: 0 };
    animate ? map.flyTo({ ...camera, speed: 0.85, curve: 1.35, essential: true }) : map.jumpTo(camera);
    return;
  }

  if (targetScale === "country") {
    fitCountryScale(referenceLocation, animate);
    return;
  }

  if (!referenceLocation) {
    fitLocationsOnMap(locationsForMap(), { animate, maxZoom: 3.2 });
    return;
  }

  const camera = targetScale === "street"
    ? { center: [referenceLocation.lng, referenceLocation.lat], zoom: 16.2, pitch: 58, bearing: -18 }
    : { center: [referenceLocation.lng, referenceLocation.lat], zoom: 10.8, pitch: 35, bearing: 0 };

  animate ? map.flyTo({ ...camera, speed: 0.85, curve: 1.35, essential: true }) : map.jumpTo(camera);
}

function fitCountryScale(referenceLocation, animate) {
  const countryLocations = referenceLocation
    ? locationsForMap().filter((location) => location.country === referenceLocation.country)
    : locationsForMap();

  if (!countryLocations.length) return;
  if (countryLocations.length === 1) {
    const only = countryLocations[0];
    const camera = { center: [only.lng, only.lat], zoom: 4.4, pitch: 0, bearing: 0 };
    animate
      ? state.companyMap.flyTo({ ...camera, speed: 0.85, curve: 1.35, essential: true })
      : state.companyMap.jumpTo(camera);
    return;
  }

  fitLocationsOnMap(countryLocations, { animate, maxZoom: 5.1 });
}

function fitLocationsOnMap(locations, options = {}) {
  const map = state.companyMap;
  const bounds = mapBoundsForLocations(locations);
  if (!map || !bounds) return;

  map.fitBounds(bounds, {
    padding: { top: 90, right: 90, bottom: 90, left: 90 },
    maxZoom: options.maxZoom || 8,
    duration: options.animate === false ? 0 : 900,
    essential: true
  });
}

function mapBoundsForLocations(locations) {
  const validLocations = locations.filter((location) => Number.isFinite(location.lat) && Number.isFinite(location.lng));
  if (!validLocations.length || typeof maplibregl === "undefined") return null;

  const bounds = new maplibregl.LngLatBounds();
  validLocations.forEach((location) => bounds.extend([location.lng, location.lat]));
  return bounds;
}

function getMapReferenceLocation() {
  const locations = locationsForMap();
  const selected = locations.find((location) => location.mapKey === state.selectedMapCompany);
  if (selected) return selected;

  const selectedCompanies = selectedCompaniesForFilter();
  if (selectedCompanies) {
    const companyLocation = locations.find((location) => selectedCompanies.has(location.company));
    if (companyLocation) return companyLocation;
  }

  return locations.find((location) => location.country === "Brazil")
    || locations.find((location) => location.country === "United States")
    || locations[0]
    || null;
}

function selectCompanyOnMap(location, options = {}) {
  if (!location) return;
  state.selectedMapCompany = location.mapKey;
  renderCompanyLocationList(locationsForMap());
  updateCompanyMap(locationsForMap());

  if (options.focus !== false) {
    focusCompanyOnMap(location.mapKey);
  }
  if (options.popup) {
    showMapPopup(location);
  }
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
      const location = locations.find((item) => item.mapKey === button.dataset.mapCompany);
      selectCompanyOnMap(location, { popup: true });
    });
  });

  scrollSelectedMapLocationIntoView();
}

function scrollSelectedMapLocationIntoView() {
  const list = els.companyLocationList;
  const selectedCard = list?.querySelector(".company-location-card.selected");
  if (!list || !selectedCard) return;

  const padding = 12;
  const listRect = list.getBoundingClientRect();
  const cardRect = selectedCard.getBoundingClientRect();
  const cardTop = cardRect.top - listRect.top + list.scrollTop;
  const cardBottom = cardRect.bottom - listRect.top + list.scrollTop;
  const visibleTop = list.scrollTop;
  const visibleBottom = visibleTop + list.clientHeight;
  let targetScroll = null;

  if (cardTop < visibleTop + padding) {
    targetScroll = Math.max(0, cardTop - padding);
  } else if (cardBottom > visibleBottom - padding) {
    targetScroll = cardBottom - list.clientHeight + padding;
  }

  if (targetScroll === null) return;

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  list.scrollTo({
    top: targetScroll,
    behavior: reduceMotion ? "auto" : "smooth"
  });
}

function renderMapLocationCard(location, selectedCompany) {
  const selectedClass = location.mapKey === selectedCompany ? " selected" : "";
  const datacenterClass = location.kind === "datacenter" ? " datacenter" : "";
  const labClass = location.kind === "lab" ? " lab" : "";
  const details = location.kind === "datacenter"
    ? `
      <small>${escapeHtml(dataCenterStatusLabel(location.status))} - ${escapeHtml(location.city)}, ${escapeHtml(location.country)}</small>
      <em>${escapeHtml(location.address)}</em>
      <em>Potência: ${escapeHtml(location.power || "N/D")}</em>
      <em>Compute: ${escapeHtml(location.accelerators || "N/D")} / ${escapeHtml(location.acceleratorType || "N/D")}</em>
    `
    : location.kind === "lab"
      ? `
        <small>${escapeHtml(researchLabCategoryLabel(location.category))} - ${escapeHtml(location.city)}, ${escapeHtml(location.country)}</small>
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

function focusCompanyOnMap(company) {
  const map = state.companyMap;
  const location = locationsForMap().find((item) => item.mapKey === company);
  if (!location || !map) return;

  state.mapScale = map.getZoom() >= 14 ? "street" : "city";
  syncViewControls();
  map.flyTo({
    center: [location.lng, location.lat],
    zoom: Math.max(map.getZoom(), 10.8),
    pitch: map.getZoom() >= 14 ? 58 : 35,
    bearing: map.getZoom() >= 14 ? -18 : 0,
    speed: 0.85,
    curve: 1.35,
    essential: true
  });
}

function showMapPopup(location) {
  const map = state.companyMap;
  if (!map || typeof maplibregl === "undefined") return;

  hideMapPreviewPopup();
  hideMapClusterPopup();
  state.mapPopup?.remove();
  state.mapPopup = new maplibregl.Popup({ closeButton: true, closeOnClick: false, offset: 14, maxWidth: "300px" })
    .setLngLat([location.lng, location.lat])
    .setHTML(mapPopupHtml(location, { source: true }))
    .addTo(map);
}

function showMapPreviewPopup(location, lngLat) {
  const map = state.companyMap;
  if (!location || !map || typeof maplibregl === "undefined") return;

  hideMapClusterPopup();
  if (state.mapPreviewKey === location.mapKey && state.mapPreviewPopup) {
    state.mapPreviewPopup.setLngLat(lngLat || [location.lng, location.lat]);
    return;
  }

  hideMapPreviewPopup();
  state.mapPreviewKey = location.mapKey;
  state.mapPreviewPopup = new maplibregl.Popup({
    closeButton: false,
    closeOnClick: false,
    closeOnMove: false,
    className: "map-preview-popup",
    offset: 14,
    maxWidth: "300px"
  })
    .setLngLat(lngLat || [location.lng, location.lat])
    .setHTML(mapPopupHtml(location, { source: false }))
    .addTo(map);
}

function hideMapPreviewPopup() {
  state.mapPreviewPopup?.remove();
  state.mapPreviewPopup = null;
  state.mapPreviewKey = null;
}

function mapPopupHtml(location, options = {}) {
  return `
    <div class="map-popup">
      <span>${escapeHtml(mapKindLabel(location))}</span>
      <strong>${escapeHtml(mapItemTitle(location))}</strong>
      <p>${escapeHtml(location.address || `${location.city}, ${location.country}`)}</p>
      ${location.notes ? `<small>${escapeHtml(location.notes)}</small>` : ""}
      ${options.source ? `<a href="${escapeAttribute(location.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(location.sourceName)}</a>` : ""}
    </div>
  `;
}

function syncMapScaleFromMap() {
  const map = state.companyMap;
  if (!map) return;

  const zoom = map.getZoom();
  setMapScaleFromZoom(zoom);
}

function setMapScaleFromZoom(zoom) {
  const scale = zoom < MAP_FLAG_MIN_ZOOM
    ? "globe"
    : zoom < 7
      ? "country"
      : zoom < 14
        ? "city"
        : "street";

  if (state.mapScale !== scale) {
    state.mapScale = scale;
    syncViewControls();
  }
}

function showMapError(message) {
  if (!els.mapError) return;
  els.mapError.hidden = false;
  els.mapError.textContent = message;
  if (els.mapLoading) els.mapLoading.hidden = true;
}

function clearMapError() {
  if (!els.mapError) return;
  els.mapError.hidden = true;
  els.mapError.textContent = "";
}

function mapKindLabel(location) {
  if (location.kind === "datacenter") return "Data center";
  if (location.kind === "lab") return "Lab IA";
  return "Sede";
}

function dataCenterStatusLabel(status) {
  return dataCenterStatusLabels[status] || status;
}

function researchLabCategoryLabel(category) {
  return researchLabCategoryLabels[category] || category;
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
      <td><span class="company-chip" style="--chip-color:${model.is_negative ? '#ef4444' : colorFor(model.company)}">${escapeHtml(model.company)}</span></td>
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
  return `<span class="type-pill category-pill">${escapeHtml(AI_CATEGORY_LABELS[category] || category)}</span>`;
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

// ===== História (Stories) =====

const historyState = {
  activeStoryId: null,
  expandedEventIds: new Set(),
  expandedExtendedEventIds: new Set(),
  eventDateOrder: "desc"
};

const storiesData = [
  {
    id: "musk-vs-openai",
    title: "Musk vs. OpenAI",
    subtitle: "A batalha pelo fim lucrativo da IA",
    summary: "Desde 2015, Elon Musk e a OpenAI travam um conflito sobre se a organização traiu sua missão original sem fins lucrativos. Em maio de 2026, um júri federal encerrou o processo — mas não a disputa.",
    lastUpdated: "2026-05-18",
    tags: ["OpenAI", "Elon Musk", "Processo judicial", "Corporativo"],
    events: [
      {
        date: "2026-05-18",
        title: "Musk perde o processo",
        importance: "O processo termina por prazo, não por uma resposta judicial definitiva sobre a missão da OpenAI.",
        summary: "Júri federal decidiu unanimemente contra Musk após menos de duas horas de deliberação. A decisão foi por prescrição, não pelo mérito.",
        details: "Um júri federal em Oakland decidiu contra Elon Musk unanimemente, concluindo que todas as suas alegações excediam o prazo prescricional. A juíza Yvonne Gonzalez Rogers concordou, afirmando haver 'evidências extensas' para apoiar a decisão do júri. Musk chamou a decisão de 'tecnicidade de calendário' e prometeu recorrer. Seu advogado disse que o recurso seria baseado parcialmente na 'doutrina de violação contínua', que pode estender o prazo prescricional em casos com um longo padrão de conduta irregular. O júri não decidiu se a OpenAI traiu sua missão — apenas que o processo foi ajuizado tarde demais.",
        extended: [
          {
            text: "Em 18 de maio de 2026, depois de um julgamento de três semanas em Oakland, um júri consultivo de nove pessoas decidiu por unanimidade que Elon Musk demorou demais para levar sua ação contra a OpenAI, Sam Altman, Greg Brockman e Microsoft ao tribunal. A deliberação levou menos de duas horas. A juíza Yvonne Gonzalez Rogers aceitou a conclusão do júri como decisão da corte e encerrou as alegações de Musk nessa ação.",
            sources: [
              { title: "AP: court rejects Musk claims", url: "https://apnews.com/article/musk-openai-trial-verdict-0b9b0bfaffe96f2c930341f52dfe4f8c" },
              { title: "NPR/KPBS: jury dismisses all claims", url: "https://www.kpbs.org/news/science-technology/2026/05/18/jury-dismisses-all-claims-in-elon-musks-lawsuit-against-openai-ceo-sam-altman" }
            ]
          },
          {
            text: "O ponto decisivo não foi se a OpenAI traiu ou não a missão sem fins lucrativos anunciada em sua fundação. A defesa venceu na barreira do prazo prescricional: segundo a tese aceita no veredito, os danos que Musk dizia ter sofrido já teriam ocorrido cedo demais para sustentar a ação ajuizada em 2024. Por isso, o júri não precisou resolver o núcleo narrativo da briga, que era a acusação de que a OpenAI teria abandonado sua finalidade beneficente para perseguir lucro privado.",
            sources: [
              { title: "TechCrunch: statute of limitations defense", url: "https://techcrunch.com/2026/05/18/elon-musk-has-lost-his-lawsuit-against-sam-altman-and-openai/" },
              { title: "NPR/KPBS: merits were sidestepped", url: "https://www.kpbs.org/news/science-technology/2026/05/18/jury-dismisses-all-claims-in-elon-musks-lawsuit-against-openai-ceo-sam-altman" }
            ]
          },
          {
            text: "Na prática, a derrota retirou desse processo a ameaça imediata de indenizações e de uma ordem judicial que pudesse interferir na estrutura da OpenAI. O julgamento havia revisitado promessas feitas na origem da empresa, documentos antigos e a ruptura entre Musk e os líderes da OpenAI, mas terminou por uma pergunta mais estreita: quando Musk já tinha informações suficientes para processar.",
            sources: [
              { title: "TechCrunch: verdict consequences", url: "https://techcrunch.com/2026/05/18/elon-musk-has-lost-his-lawsuit-against-sam-altman-and-openai/" },
              { title: "AP: three-week trial and dismissal", url: "https://apnews.com/article/musk-openai-trial-verdict-0b9b0bfaffe96f2c930341f52dfe4f8c" }
            ]
          },
          {
            text: "Musk reagiu dizendo que a corte não avaliou o mérito da disputa e indicou que recorreria. Seus advogados também sinalizaram recurso. Isso faz deste evento um encerramento importante da fase de julgamento, mas não um consenso sobre a pergunta histórica que alimenta a história inteira: se a evolução corporativa da OpenAI preservou ou rompeu a promessa feita quando ela nasceu como organização sem fins lucrativos.",
            sources: [
              { title: "AP: Musk says he will appeal", url: "https://apnews.com/article/musk-openai-trial-verdict-0b9b0bfaffe96f2c930341f52dfe4f8c" },
              { title: "TechCrunch: appeal response after verdict", url: "https://techcrunch.com/2026/05/18/elon-musk-has-lost-his-lawsuit-against-sam-altman-and-openai/" }
            ]
          }
        ],
        links: [
          { title: "TechCrunch: Musk loses lawsuit against OpenAI", url: "https://techcrunch.com/2026/05/18/elon-musk-has-lost-his-lawsuit-against-sam-altman-and-openai/" },
          { title: "MIT Tech Review: Elon Musk suit OpenAI verdict", url: "https://www.technologyreview.com/2026/05/18/1137488/elon-musk-suit-openai-verdict/" },
          { title: "Al Jazeera: Elon Musk loses lawsuit against OpenAI", url: "https://www.aljazeera.com/news/2026/5/18/elon-musk-loses-lawsuit-against-openai" },
          { title: "NPR: Musk Altman OpenAI jury verdict", url: "https://www.npr.org/2026/05/18/nx-s1-5822366/musk-altman-openai-jury-verdict-claims-dismissed" },
          { title: "CNN: OpenAI Musk lawsuit verdict", url: "https://www.cnn.com/2026/05/18/tech/openai-musk-lawsuit-verdict" },
          { title: "PBS NewsHour: Jury sides with OpenAI", url: "https://www.pbs.org/newshour/nation/jury-sides-with-openai-saying-elon-musks-lawsuit-was-not-filed-on-time" }
        ]
      },
      {
        date: "2026-04-27",
        title: "Julgamento começa em Oakland",
        importance: "A briga sai do debate público e chega a um júri com pedidos que poderiam redesenhar a OpenAI.",
        summary: "Início do julgamento expõe a ruptura entre Musk e Altman. Musk pedia devolução de até US$ 180 bilhões em 'ganhos ilícitos' e a remoção de Altman e Brockman.",
        details: "O julgamento teve início em Oakland, expondo a ruptura entre Musk e Altman. Musk pedia que OpenAI e Microsoft devolvessem até US$ 180 bilhões em 'ganhos ilícitos', a remoção de Altman e Brockman da liderança, e o desfazimento da reestruturação de 2025 que permitiu o crescimento do braço com fins lucrativos. Os advogados da OpenAI argumentaram que a missão da empresa não havia mudado, que ainda era governada pelo conselho de uma fundação sem fins lucrativos, e que Musk só entrou com o processo após fundar sua própria empresa concorrente, a xAI. A defesa chamou a ação de 'tentativa hipócrita de sabotar um concorrente'.",
        extended: [
          {
            text: "O julgamento começou em 27 de abril de 2026 no tribunal federal de Oakland com a seleção do júri. Sam Altman e Greg Brockman compareceram ao tribunal nessa abertura; Elon Musk não estava presente na seleção, mas era esperado como testemunha mais adiante. A juíza Yvonne Gonzalez Rogers apresentou ao grupo de jurados um caso centrado em promessas, supostas quebras dessas promessas e na passagem da OpenAI de uma origem sem fins lucrativos para uma operação com afiliada lucrativa.",
            sources: [
              { title: "GeekWire: inside the courthouse on April 27", url: "https://www.geekwire.com/2026/musk-v-altman-inside-the-courthouse-as-microsofts-13-billion-openai-bet-goes-on-trial/" }
            ]
          },
          {
            text: "A abertura do julgamento deixou claro que a briga não era apenas pessoal. Musk alegava que Altman, Brockman e a OpenAI violaram deveres ligados a uma missão beneficente e que a Microsoft ajudou essa transformação. A pergunta colocada diante do processo era se a estrutura comercial que sustentou a escalada da OpenAI preservou ou rompeu os compromissos assumidos quando a organização nasceu.",
            sources: [
              { title: "GeekWire: claims described to the jury pool", url: "https://www.geekwire.com/2026/musk-v-altman-inside-the-courthouse-as-microsofts-13-billion-openai-bet-goes-on-trial/" },
              { title: "Yahoo/UPI: trial challenges OpenAI for-profit status", url: "https://finance.yahoo.com/sectors/technology/articles/elon-musk-sam-altman-head-164558480.html" }
            ]
          },
          {
            text: "O impacto potencial era grande. Segundo a cobertura do início do julgamento, o perito de danos de Musk calculava uma demanda combinada de até US$ 134 bilhões contra OpenAI e Microsoft, e uma vitória poderia direcionar pagamentos para o braço sem fins lucrativos da OpenAI. Em paralelo, a disputa podia atingir a reorganização corporativa da empresa e manter Altman e Brockman sob ameaça de remoção de posições de liderança.",
            sources: [
              { title: "GeekWire: damages stakes for OpenAI and Microsoft", url: "https://www.geekwire.com/2026/musk-v-altman-inside-the-courthouse-as-microsofts-13-billion-openai-bet-goes-on-trial/" },
              { title: "Axios: damages and Altman ouster stakes", url: "https://www.axios.com/2026/05/18/musk-loses-ai-trial-openai-altman" }
            ]
          },
          {
            text: "A Microsoft não era figurante nessa fase. A empresa havia investido mais de US$ 13 bilhões na OpenAI desde 2019 e defendia que entrou como parceira comercial sem ser informada de restrições beneficentes ligadas às contribuições de Musk. Ao mesmo tempo, sua defesa já apontava para uma via processual que acabaria decisiva: sustentar que Musk sabia da participação da Microsoft cedo demais para processar apenas em 2024.",
            sources: [
              { title: "GeekWire: Microsoft's role and defense", url: "https://www.geekwire.com/2026/musk-v-altman-inside-the-courthouse-as-microsofts-13-billion-openai-bet-goes-on-trial/" }
            ]
          }
        ],
        links: [
          { title: "Yahoo Finance: Musk OpenAI jury trial begin", url: "https://finance.yahoo.com/news/musk-openai-jury-trial-begin-231611771.html" },
          { title: "Malay Mail: Musk's lawsuit heads to trial April 27", url: "https://malaymail.com/news/money/2026/01/14/elon-musks-lawsuit-against-openai-and-microsoft-heads-to-trial-april-27/205387" }
        ]
      },
      {
        date: "2026-01-15",
        title: "Juíza rejeita pedido de arquivamento",
        importance: "Essa decisão mantém viva a ação que chegaria ao julgamento de 2026.",
        summary: "Juíza federal Yvonne Gonzalez Rogers rejeitou pedidos da OpenAI e Microsoft para encerrar as alegações remanescentes antes do julgamento.",
        extended: [
          {
            text: "Em 15 de janeiro de 2026, a juíza federal Yvonne Gonzalez Rogers rejeitou os pedidos da OpenAI e da Microsoft para evitar o julgamento das alegações remanescentes de Elon Musk. A decisão foi publicada como a última barreira relevante antes de um júri ouvir o caso, com julgamento previsto para o fim de abril em Oakland.",
            sources: [
              { title: "Bloomberg Law: last chance to avoid trial denied", url: "https://news.bloomberglaw.com/legal-ops-and-tech/openai-microsoft-lose-last-chance-to-avoid-trial-with-musk" },
              { title: "Yahoo/Bloomberg: case proceeds to late-April jury trial", url: "https://uk.finance.yahoo.com/news/openai-microsoft-lose-last-chance-023334905.html" }
            ]
          },
          {
            text: "A decisão não foi uma vitória final de Musk no mérito. O tribunal não declarou que a OpenAI traiu sua missão; concluiu que as questões restantes não deveriam morrer antes do julgamento. Segundo a cobertura da decisão, Rogers afirmou que o registro ainda era misto, mas que Musk sustentava de modo plausível que seu apoio teria sido condicionado a OpenAI permanecer aberta e sem fins lucrativos, termos ligados à carta e à missão da organização.",
            sources: [
              { title: "Yahoo/GuruFocus: mixed record and plausible conditions", url: "https://finance.yahoo.com/news/judge-sends-musks-openai-lawsuit-175551430.html" }
            ]
          },
          {
            text: "A importância histórica do despacho é que ele preservou a pergunta central para a etapa pública seguinte. Musk alegava que a OpenAI, depois de aceitar bilhões em financiamento da Microsoft e caminhar para uma estrutura mais comercial, havia rompido compromissos de origem. A OpenAI respondeu que o processo era infundado e parte de um padrão de assédio, mas teve de levar a defesa ao julgamento em vez de encerrar a briga nessa fase.",
            sources: [
              { title: "Bloomberg Law: claims about founding mission and Microsoft funding", url: "https://news.bloomberglaw.com/privacy-and-data-security/openai-microsoft-lose-last-chance-to-avoid-trial-with-musk" },
              { title: "The Japan Times/Bloomberg: OpenAI statement after ruling", url: "https://www.japantimes.co.jp/business/2026/01/16/tech/elon-musk-openai-microsoft-trial/" }
            ]
          },
          {
            text: "Vista dentro da cronologia inteira, a decisão de janeiro explica por que a história chegou a abril e maio de 2026. Ela abriu a porta para o julgamento, mas não impediu que a defesa continuasse insistindo em problemas de prazo e de prova. Meses depois, o caso terminaria quando o júri aceitou que Musk havia processado tarde demais.",
            sources: [
              { title: "Bloomberg Law: late-April trial ordered", url: "https://news.bloomberglaw.com/legal-ops-and-tech/openai-microsoft-lose-last-chance-to-avoid-trial-with-musk" },
              { title: "AP: later verdict dismissed claims as too late", url: "https://apnews.com/article/musk-openai-trial-verdict-0b9b0bfaffe96f2c930341f52dfe4f8c" }
            ]
          }
        ],
        details: "A juíza federal Yvonne Gonzalez Rogers rejeitou os pedidos da OpenAI e da Microsoft para arquivar o caso, permitindo que Musk levasse suas alegações a um júri. Essa decisão foi considerada uma vitória temporária para Musk, pois significava que as questões centrais — se a OpenAI traiu sua missão original — poderiam ser examinadas em julgamento. A decisão abriu caminho para o julgamento de abril de 2026.",
        links: [
          { title: "Bloomberg Law: OpenAI and Microsoft lose last chance to avoid trial", url: "https://news.bloomberglaw.com/legal-ops-and-tech/openai-microsoft-lose-last-chance-to-avoid-trial-with-musk" },
          { title: "Yahoo/Bloomberg: Judge sends Musk suit to jury trial", url: "https://finance.yahoo.com/news/judge-sends-musks-openai-lawsuit-175551430.html" }
        ]
      },
      {
        date: "2024-11-14",
        title: "Microsoft incluída como ré",
        importance: "A disputa passa a mirar também o parceiro que financiou a expansão comercial da OpenAI.",
        summary: "Queixa emendada adicionou a Microsoft como corré, expandindo o escopo do litígio por conta dos bilhões investidos e dos direitos de propriedade intelectual obtidos.",
        details: "Uma queixa emendada adicionou a Microsoft como ré no processo, expandindo o escopo do litígio. A lógica era que a Microsoft — com seus bilhões de investimento e direitos sobre a propriedade intelectual da OpenAI — também teria se beneficiado da suposta transformação indevida da organização sem fins lucrativos em uma empresa com fins lucrativos. O primeiro investimento da Microsoft foi de US$ 1 bilhão em 2019; em 2023, chegou a US$ 10 bilhões com direitos de propriedade intelectual.",
        extended: [
          {
            text: "Em 14 de novembro de 2024, Musk protocolou a primeira queixa emendada do processo federal. O documento passou a listar a Microsoft entre os réus, ao lado de Altman, Brockman, entidades da OpenAI, Reid Hoffman e Deannah Templeton. A mesma peça também trouxe xAI como autora e Shivon Zilis em pedido derivativo em nome da OpenAI, ampliando a disputa para além da relação original entre Musk e os fundadores da empresa.",
            sources: [
              { title: "First Amended Complaint: filing and parties", url: "https://storage.courtlistener.com/recap/gov.uscourts.cand.433688/gov.uscourts.cand.433688.32.0_1.pdf" },
              { title: "Court order on motions to dismiss FAC", url: "https://assets.alm.com/55/9a/e00fdd11463781f6348bb3cbe5bf/musk-v-open-ai-mtd-order.pdf" }
            ]
          },
          {
            text: "A entrada da Microsoft mudou o foco do litígio. A queixa não tratava a parceira apenas como financiadora da OpenAI: ela a colocava dentro da teoria de que a OpenAI teria se afastado da missão sem fins lucrativos e, ao mesmo tempo, ajudado a criar barreiras competitivas no mercado de modelos e plataformas de IA generativa.",
            sources: [
              { title: "First Amended Complaint: claims listed in the caption", url: "https://storage.courtlistener.com/recap/gov.uscourts.cand.433688/gov.uscourts.cand.433688.32.0_1.pdf" },
              { title: "DOJ/FTC: allegations in the FAC", url: "https://www.ftc.gov/system/files/ftc_gov/pdf/2323044openaimuskvaltmanamicusbrief.pdf" }
            ]
          },
          {
            text: "Entre as novas frentes estavam alegações antitruste. A queixa emendada incluiu pedidos sob o Sherman Act e o Clayton Act. O DOJ e a FTC, ao apresentar manifestação de interesse em janeiro de 2025, registraram que os autores alegavam violações baseadas em condutas que afetariam o mercado de modelos e plataformas de IA generativa; os órgãos não endossaram os fatos alegados, mas explicaram como regras sobre diretorias interligadas e boicotes coletivos poderiam se aplicar ao debate.",
            sources: [
              { title: "First Amended Complaint: antitrust counts", url: "https://storage.courtlistener.com/recap/gov.uscourts.cand.433688/gov.uscourts.cand.433688.32.0_1.pdf" },
              { title: "DOJ/FTC: Statement of Interest", url: "https://www.ftc.gov/system/files/ftc_gov/pdf/2323044openaimuskvaltmanamicusbrief.pdf" }
            ]
          },
          {
            text: "Uma parte concreta dessa narrativa passou por vínculos de governança. A queixa apontou Reid Hoffman por ter ocupado assentos nos conselhos de OpenAI e Microsoft em períodos sobrepostos e Deannah Templeton por ter sido executiva da Microsoft e observadora sem voto no conselho da OpenAI. Esses vínculos sustentavam a acusação de diretorias interligadas; depois, o pedido de liminar de Musk buscou impedir condutas que, segundo ele, poderiam explorar informação competitivamente sensível ou coordenação entre as duas organizações.",
            sources: [
              { title: "DOJ/FTC: board overlap allegations", url: "https://www.ftc.gov/system/files/ftc_gov/pdf/2323044openaimuskvaltmanamicusbrief.pdf" },
              { title: "Preliminary injunction motion after FAC", url: "https://storage.courtlistener.com/recap/gov.uscourts.cand.433688/gov.uscourts.cand.433688.46.0.pdf" }
            ]
          },
          {
            text: "Historicamente, este tópico importa porque transforma a Microsoft de pano de fundo econômico em alvo processual direto. Daqui em diante, a disputa deixa de perguntar apenas se a OpenAI rompeu sua promessa fundadora; ela passa a perguntar também se a aliança comercial, tecnológica e de governança com a Microsoft teria ampliado o dano alegado por Musk e por seu concorrente xAI.",
            sources: [
              { title: "First Amended Complaint: Microsoft named defendant", url: "https://storage.courtlistener.com/recap/gov.uscourts.cand.433688/gov.uscourts.cand.433688.32.0_1.pdf" },
              { title: "Reuters/CNBC: lawsuit expanded with Microsoft and antitrust claims", url: "https://www.cnbc.com/2024/11/15/musk-expands-lawsuit-against-openai-adding-microsoft-and-antitrust-claims.html" }
            ]
          }
        ],
        links: [
          { title: "First Amended Complaint: Musk v. Altman", url: "https://storage.courtlistener.com/recap/gov.uscourts.cand.433688/gov.uscourts.cand.433688.32.0_1.pdf" },
          { title: "DOJ/FTC: Statement of Interest", url: "https://www.ftc.gov/system/files/ftc_gov/pdf/2323044openaimuskvaltmanamicusbrief.pdf" },
          { title: "Yahoo Finance: trial background and Microsoft claims", url: "https://finance.yahoo.com/news/musk-openai-jury-trial-begin-231611771.html" }
        ]
      },
      {
        date: "2024-08-05",
        title: "Musk reajuíza ação no tribunal federal",
        importance: "O processo federal vira o caminho jurídico que realmente segue até o julgamento.",
        summary: "Após retirar a ação da corte estadual, Musk reajuizou no Tribunal Distrital dos EUA para o Distrito Norte da Califórnia, com alegações reformuladas.",
        details: "Após ter retirado a ação da corte estadual da Califórnia, Musk reajuizou no Tribunal Distrital dos EUA para o Distrito Norte da Califórnia. A mudança para o tribunal federal foi estratégica, buscando uma jurisdição diferente para as alegações reformuladas e mais abrangentes. Essa versão do processo seria a que chegaria ao julgamento de 2026.",
        extended: [
          {
            text: "Em 5 de agosto de 2024, Musk abriu um novo processo no Tribunal Distrital dos EUA para o Distrito Norte da Califórnia contra Sam Altman, Greg Brockman e entidades da OpenAI. A queixa federal apareceu menos de dois meses depois de ele retirar, em 11 de junho, a ação estadual anterior em São Francisco. Na prática, não era só uma reabertura mecânica: era a escolha de uma nova via processual para continuar a mesma disputa de fundo.",
            sources: [
              { title: "Federal complaint: filing date and defendants", url: "https://www.courthousenews.com/wp-content/uploads/2024/08/elon-musk-v-sam-altman-complaint.pdf" },
              { title: "Reuters/CNBC: suit filed after prior case withdrawal", url: "https://www.cnbc.com/2024/08/05/elon-musk-revives-lawsuit-against-openai-sam-altman-in-federal-court.html" }
            ]
          },
          {
            text: "A nova queixa recontou a origem da OpenAI sob uma acusação de engano. Segundo Musk, Altman e Brockman o convenceram a apoiar e cofundar uma organização sem fins lucrativos, aberta e voltada à segurança da humanidade; depois, teriam transformado a empresa em veículo para lucro privado e parceria estreita com a Microsoft. A OpenAI negou a narrativa e já havia divulgado e-mails para sustentar que Musk conhecia a necessidade de capital e chegou a discutir uma estrutura lucrativa.",
            sources: [
              { title: "Federal complaint: alleged founding inducement", url: "https://www.courthousenews.com/wp-content/uploads/2024/08/elon-musk-v-sam-altman-complaint.pdf" },
              { title: "OpenAI: Elon Musk and OpenAI", url: "https://openai.com/index/elon-musk-and-openai/" },
              { title: "Reuters/CNBC: alleged manipulation narrative", url: "https://www.cnbc.com/2024/08/05/elon-musk-revives-lawsuit-against-openai-sam-altman-in-federal-court.html" }
            ]
          },
          {
            text: "O desenho jurídico ficou mais agressivo do que no primeiro processo estadual. A queixa federal listou 15 pedidos, incluindo fraude, conspiração para fraude, ajuda e incentivo à fraude, violações federais de RICO, quebra de contratos, quebra de dever fiduciário, publicidade enganosa, enriquecimento sem causa e pedidos declaratórios. Esse empilhamento de teses mostra que Musk tentou transformar uma disputa sobre missão institucional em uma ação com múltiplos caminhos para indenização e intervenção judicial.",
            sources: [
              { title: "Federal complaint: causes of action", url: "https://www.courthousenews.com/wp-content/uploads/2024/08/elon-musk-v-sam-altman-complaint.pdf" },
              { title: "NPR/AP: federal suit with fraud and RICO claims", url: "https://www.npr.org/2024/08/06/nx-s1-5065832/elon-musk-lawsuit-openai-sam-altman" }
            ]
          },
          {
            text: "A queixa também antecipou o conflito sobre controle e recursos da OpenAI. Musk pediu, entre outras medidas, restituição de ganhos que os réus teriam obtido por conduta ilícita, reparação por contribuições feitas sob suposto engano e declarações judiciais sobre o que a OpenAI poderia fazer com tecnologia e ativos ligados à missão original. Isso ajuda a explicar por que a ação federal se tornou a base do litígio que, depois de emendas e decisões intermediárias, chegaria ao julgamento de 2026.",
            sources: [
              { title: "Federal complaint: prayer for relief", url: "https://www.courthousenews.com/wp-content/uploads/2024/08/elon-musk-v-sam-altman-complaint.pdf" },
              { title: "Court order: claims proceeding after amended complaint", url: "https://assets.alm.com/55/9a/e00fdd11463781f6348bb3cbe5bf/musk-v-open-ai-mtd-order.pdf" }
            ]
          },
          {
            text: "Na cronologia da história, este evento é a ponte entre a denúncia pública de fevereiro e o caso que realmente sobreviveu no tribunal federal. O processo ainda mudaria muito: em novembro de 2024 a Microsoft entraria como ré e surgiriam alegações antitruste. Mas o trilho processual usado para levar a briga adiante começa aqui, com a queixa federal de agosto.",
            sources: [
              { title: "Federal complaint: August 2024 case opening", url: "https://www.courthousenews.com/wp-content/uploads/2024/08/elon-musk-v-sam-altman-complaint.pdf" },
              { title: "First Amended Complaint: November expansion", url: "https://storage.courtlistener.com/recap/gov.uscourts.cand.433688/gov.uscourts.cand.433688.32.0_1.pdf" }
            ]
          }
        ],
        links: [
          { title: "Federal Complaint: Musk v. Altman", url: "https://www.courthousenews.com/wp-content/uploads/2024/08/elon-musk-v-sam-altman-complaint.pdf" },
          { title: "Reuters/CNBC: Musk revives lawsuit in federal court", url: "https://www.cnbc.com/2024/08/05/elon-musk-revives-lawsuit-against-openai-sam-altman-in-federal-court.html" },
          { title: "MIT Technology Review: chronology of the revived case", url: "https://www.technologyreview.com/2026/05/18/1137488/elon-musk-suit-openai-verdict/" }
        ]
      },
      {
        date: "2024-06-11",
        title: "Musk retira processo da corte estadual",
        importance: "O recuo separa a primeira ação da versão reformulada que Musk levaria adiante.",
        summary: "Os advogados de Musk pediram ao tribunal estadual da Califórnia para arquivar o caso sem justificativa. Arquivado 'sem prejuízo', podendo ser reajuizado.",
        details: "Os advogados de Musk pediram ao tribunal estadual da Califórnia para arquivar o caso sem dar razão. O processo foi arquivado 'sem prejuízo', o que significa que poderia ser reajuizado. Especulou-se que a retirada foi tática, para apresentar um caso mais robusto em outra jurisdição. Menos de dois meses depois, Musk reajuizou o processo no tribunal federal.",
        extended: [
          {
            text: "Em 11 de junho de 2024, os advogados de Musk pediram à Superior Court da Califórnia em São Francisco que dispensasse a ação estadual inteira contra OpenAI, Sam Altman e Greg Brockman. O pedido não trouxe uma explicação pública para a retirada. Por isso, o evento marcou um recuo processual brusco em um caso que Musk havia aberto apenas alguns meses antes, em 29 de fevereiro.",
            sources: [
              { title: "CNBC: Musk drops state-court suit", url: "https://www.cnbc.com/2024/06/11/elon-musk-drops-suit-against-openai-and-sam-altman.html" },
              { title: "Reuters/Yahoo: dismissal filing gave no reason", url: "https://finance.yahoo.com/news/elon-musk-withdraws-lawsuit-against-203435324.html" }
            ]
          },
          {
            text: "O momento da retirada importava. A ação foi dispensada na véspera de uma audiência em que a OpenAI e os demais réus buscariam derrubar o caso. Isso significa que a corte estadual não chegou a decidir naquele momento se as alegações sobre contrato fundador, missão sem fins lucrativos e uso dos ativos da OpenAI poderiam seguir adiante.",
            sources: [
              { title: "The Guardian: dismissal before scheduled hearing", url: "https://www.theguardian.com/technology/article/2024/jun/11/elon-musk-withdraws-lawsuit-against-sam-altman-openai" },
              { title: "Local News Matters: court would not weigh governance questions", url: "https://localnewsmatters.org/2024/06/12/ai-lawsuit-stunner-musk-decides-to-abandon-case-against-openai-on-eve-of-court-hearing/" }
            ]
          },
          {
            text: "A expressão decisiva foi 'sem prejuízo'. Nesse tipo de dispensa voluntária, o arquivamento encerra aquele processo sem impedir que a disputa volte em nova ação. Foi exatamente por isso que a retirada não deve ser lida como renúncia definitiva de Musk ao conflito: ela fechou o caso estadual específico, mas preservou espaço para outra ofensiva judicial.",
            sources: [
              { title: "CNBC: dismissed without prejudice", url: "https://www.cnbc.com/2024/06/11/elon-musk-drops-suit-against-openai-and-sam-altman.html" },
              { title: "Reuters/anews: could refile at another time", url: "https://www.anews.com.tr/business/2024/06/11/billionaire-entrepreneur-elon-musk-withdraws-lawsuit-against-openai" }
            ]
          },
          {
            text: "Até ser retirada, a ação estadual buscava impedir que a OpenAI tratasse tecnologia como o GPT-4 e outros ativos da organização de forma incompatível com a missão pública que Musk dizia ter financiado. O pedido tinha uma ambição maior do que uma cobrança comum: queria levar o tribunal a interferir na relação entre a promessa de abertura da OpenAI, seu braço comercial e os benefícios econômicos ligados à Microsoft.",
            sources: [
              { title: "Reuters/Cybernews: requested public access and limits on Microsoft benefit", url: "https://cybernews.com/news/elon-musk-drops-lawsuit-against-openai-sam-altman/" },
              { title: "OpenAI: response to Musk allegations", url: "https://openai.com/index/elon-musk-and-openai/" }
            ]
          },
          {
            text: "Na sequência histórica, esse arquivamento separa duas fases. A primeira foi a denúncia estadual inicial, centrada na acusação de traição da missão. A segunda começaria em agosto de 2024, quando Musk levaria uma queixa federal reformulada ao Distrito Norte da Califórnia, com uma bateria maior de teses jurídicas e o caminho que depois receberia a Microsoft como ré.",
            sources: [
              { title: "Reuters/CNBC: federal suit revived in August", url: "https://www.cnbc.com/2024/08/05/elon-musk-revives-lawsuit-against-openai-sam-altman-in-federal-court.html" },
              { title: "Federal Complaint: August 2024 case opening", url: "https://www.courthousenews.com/wp-content/uploads/2024/08/elon-musk-v-sam-altman-complaint.pdf" }
            ]
          }
        ],
        links: [
          { title: "CNBC: Musk drops suit against OpenAI", url: "https://www.cnbc.com/2024/06/11/elon-musk-drops-suit-against-openai-and-sam-altman.html" },
          { title: "Reuters/Yahoo: Musk withdraws lawsuit against OpenAI", url: "https://finance.yahoo.com/news/elon-musk-withdraws-lawsuit-against-203435324.html" },
          { title: "Malay Mail: Elon Musk withdraws lawsuit against OpenAI", url: "https://www.malaymail.com/amp/news/money/2024/06/12/elon-musk-withdraws-lawsuit-against-openai/139309" },
          { title: "Al Jazeera: Elon Musk drops lawsuit accusing OpenAI", url: "https://www.aljazeera.com/economy/2024/6/12/elon-musk-drops-lawsuit-accusing-openai-of-betraying-mission" }
        ]
      },
      {
        date: "2024-02-29",
        title: "Musk processa OpenAI, Altman e Brockman",
        importance: "A divergência sobre lucro e missão vira uma disputa judicial formal.",
        summary: "Musk processou Altman, Brockman e a OpenAI alegando que 'roubaram uma instituição de caridade' ao migrar para uma estrutura com fins lucrativos.",
        details: "Musk processou Altman, Brockman e a OpenAI, alegando que 'roubaram uma instituição de caridade' e se enriqueceram injustamente ao migrar para uma estrutura com fins lucrativos. Em resposta, a OpenAI divulgou publicamente um conjunto de e-mails entre a empresa e Musk desde 2015, sugerindo que Musk queria controle da OpenAI e, ao não consegui-lo, saiu da empresa em 2018. A OpenAI argumentou que Musk foi quem primeiro pressionou pela criação de um braço com fins lucrativos — e que saiu quando não obteve o controle que queria.",
        extended: [
          {
            text: "Em 29 de fevereiro de 2024, Musk abriu na Superior Court da Califórnia em São Francisco sua primeira ação contra Sam Altman, Greg Brockman e entidades da OpenAI. A petição transformou anos de atrito público sobre abertura, lucro e parceria com a Microsoft em disputa judicial formal, com pedido de julgamento por júri.",
            sources: [
              { title: "State complaint: filing and defendants", url: "https://www.courthousenews.com/wp-content/uploads/2024/02/musk-v-altman-openai-complaint-sf.pdf?ftag=MSFd61514f" },
              { title: "AP: Musk sues OpenAI and Altman", url: "https://apnews.com/article/425186c7640aa3d0956e99314a9240e2" }
            ]
          },
          {
            text: "A tese de Musk girava em torno de um suposto acordo fundador. Segundo a queixa, ele apoiou a OpenAI porque Altman, Brockman e a organização teriam prometido uma entidade sem fins lucrativos, orientada ao benefício da humanidade e à abertura da pesquisa. A petição diz que Musk contribuiu com dezenas de milhões de dólares, aconselhamento e poder de recrutamento confiando nessa premissa.",
            sources: [
              { title: "State complaint: Founding Agreement allegations", url: "https://www.courthousenews.com/wp-content/uploads/2024/02/musk-v-altman-openai-complaint-sf.pdf?ftag=MSFd61514f" }
            ]
          },
          {
            text: "A primeira ação estadual veio com cinco frentes jurídicas: quebra de contrato, promessa que gerou confiança, quebra de dever fiduciário, práticas comerciais desleais sob a lei californiana e prestação de contas. Isso mostra o enquadramento inicial da briga: antes de RICO, antitruste e Microsoft como ré aparecerem no caso federal, Musk tentou construir a disputa como violação das promessas que justificaram suas contribuições à OpenAI.",
            sources: [
              { title: "State complaint: five causes of action", url: "https://www.courthousenews.com/wp-content/uploads/2024/02/musk-v-altman-openai-complaint-sf.pdf?ftag=MSFd61514f" },
              { title: "CNBC: complaint analysis after filing", url: "https://www.cnbc.com/2024/03/05/read-the-complaint-in-elon-musk-v-sam-altman-greg-brockman-openai.html" }
            ]
          },
          {
            text: "Os pedidos deixavam claro que Musk queria mais do que indenização. A queixa buscava obrigar a OpenAI a voltar a disponibilizar pesquisa e tecnologia ao público, impedir que ativos e tecnologias fossem usados para beneficiar financeiramente Microsoft e outros em desacordo com a missão alegada, exigir prestação de contas e pedir restituições ligadas ao suposto descumprimento.",
            sources: [
              { title: "State complaint: prayer for relief", url: "https://www.courthousenews.com/wp-content/uploads/2024/02/musk-v-altman-openai-complaint-sf.pdf?ftag=MSFd61514f" },
              { title: "AP: requested nonprofit and public-benefit enforcement", url: "https://apnews.com/article/425186c7640aa3d0956e99314a9240e2" }
            ]
          },
          {
            text: "A OpenAI respondeu publicamente em 5 de março de 2024 com uma narrativa oposta. Disse que permanecia comprometida com a missão, que todos viram cedo a necessidade de muito mais capital para desenvolver AGI e que Musk participou de discussões sobre uma estrutura com fins lucrativos. A empresa divulgou e-mails para sustentar que Musk queria controle majoritário, controle inicial do conselho e até cogitou unir a OpenAI à Tesla.",
            sources: [
              { title: "OpenAI: Elon Musk and OpenAI", url: "https://openai.com/index/elon-musk-and-openai/" },
              { title: "OpenAI: public email response in March 2024", url: "https://openai.com/es-ES/index/openai-elon-musk/" }
            ]
          },
          {
            text: "Esse é o ponto em que a história passa a ter duas versões jurídicas concorrentes. Para Musk, a OpenAI teria virado contra a promessa que justificou sua fundação. Para a OpenAI, o próprio Musk sabia do problema de capital, discutiu a conversão lucrativa e rompeu com a organização quando não obteve o controle que queria. O processo estadual seria retirado em junho, mas esse conflito narrativo permaneceria no caso federal posterior.",
            sources: [
              { title: "State complaint: Musk's founding narrative", url: "https://www.courthousenews.com/wp-content/uploads/2024/02/musk-v-altman-openai-complaint-sf.pdf?ftag=MSFd61514f" },
              { title: "OpenAI: competing account and emails", url: "https://openai.com/index/elon-musk-and-openai/" },
              { title: "AP: state suit later withdrawn", url: "https://apnews.com/article/e3932deb15957c915cd694d63583a043" }
            ]
          }
        ],
        links: [
          { title: "State Complaint: Musk v. Altman", url: "https://www.courthousenews.com/wp-content/uploads/2024/02/musk-v-altman-openai-complaint-sf.pdf?ftag=MSFd61514f" },
          { title: "OpenAI: Elon Musk and OpenAI", url: "https://openai.com/index/elon-musk-and-openai/" },
          { title: "AP: Musk sues OpenAI and Sam Altman", url: "https://apnews.com/article/425186c7640aa3d0956e99314a9240e2" }
        ]
      },
      {
        date: "2025-10-28",
        title: "OpenAI reestrutura: de lucro limitado para PBC",
        importance: "A estrutura corporativa vira o centro material da discussão sobre controle, capital e missão.",
        summary: "OpenAI anunciou nova estrutura: a parte sem fins lucrativos vira OpenAI Foundation (26%) e o braço lucrativo vira OpenAI Group PBC — sem limite de lucro. Microsoft ficou com 27%.",
        details: "Em outubro de 2025, a OpenAI reformou sua estrutura. A parte sem fins lucrativos se tornou a OpenAI Foundation (com 26% do braço lucrativo), e a parte com fins lucrativos se tornou uma corporação de benefício público (PBC) chamada OpenAI Group PBC. A diferença crítica: o limite de lucro de 100x foi completamente removido — investidores agora podem ter retornos ilimitados. Microsoft ficou com 27%, e os 47% restantes foram distribuídos entre outros investidores. Críticos apontaram que esse foi o ponto de ruptura definitivo: a missão deixou de ser um freio real ao lucro. Foi exatamente essa mudança que Musk citou em seu processo.",
        extended: [
          {
            text: "Em 28 de outubro de 2025, a OpenAI anunciou que concluiu uma recapitalização e reorganizou o braço comercial como OpenAI Group PBC, uma corporação de benefício público. Esse foi o fechamento de uma transição que vinha sendo debatida havia meses: sair da arquitetura de 'lucro limitado' criada em 2019 e adotar uma empresa com ações tradicionais, ainda ligada formalmente à missão da fundação.",
            sources: [
              { title: "OpenAI: nossa estrutura atualizada", url: "https://openai.com/pt-BR/our-structure/" },
              { title: "AP: OpenAI reorganizes its structure", url: "https://apnews.com/article/openai-chatgpt-nonprofit-microsoft-c661df3242766d6b0ddbab401ad1fd84" },
              { title: "OpenAI: OpenAI LP capped-profit model", url: "https://openai.com/index/openai-lp/" }
            ]
          },
          {
            text: "A comparação com 2019 é o ponto central. Quando lançou a OpenAI LP, a empresa dizia que investidores e funcionários poderiam receber retornos limitados, que o primeiro ciclo de investidores tinha teto de 100 vezes o investimento e que o excedente ficaria com a entidade sem fins lucrativos. Na estrutura anunciada em 2025, a própria OpenAI passou a dizer que todos os acionistas do OpenAI Group possuem o mesmo tipo de ação tradicional, com participação proporcional no aumento de valor da empresa.",
            sources: [
              { title: "OpenAI: OpenAI LP announcement", url: "https://openai.com/index/openai-lp/" },
              { title: "OpenAI: acionistas após a recapitalização", url: "https://openai.com/pt-BR/our-structure/" }
            ]
          },
          {
            text: "A OpenAI apresentou a mudança como uma forma de levantar mais capital e alinhar crescimento de longo prazo com a missão. Ao fechar a recapitalização, a OpenAI Foundation ficou com 26% do OpenAI Group, avaliados pela empresa em cerca de US$ 130 bilhões, além de um warrant que pode entregar ações adicionais se a valorização atingir determinado marco. A fundação também afirmou manter direitos especiais de voto e governança para nomear e substituir os diretores do OpenAI Group.",
            sources: [
              { title: "OpenAI: Foundation stake and governance rights", url: "https://openai.com/pt-BR/our-structure/" },
              { title: "California AG MOU: nonprofit control representations", url: "https://oag.ca.gov/system/files/attachments/press-docs/Final%20Executed%20MOU%20Between%20OpenAI%20and%20California%20AG%20re%20Notice%20of%20Conditions%20of%20Non-Objection%20%2810.27.2025%29%20%28Signed%20by%20OpenAI%29%20%28Signed%20by%20CA%20DOJ%29.pdf" }
            ]
          },
          {
            text: "A Microsoft saiu da reorganização como acionista explícita do novo desenho. A OpenAI informou que a parceira ficou com aproximadamente 27% do OpenAI Group PBC, em um investimento avaliado em cerca de US$ 135 bilhões, enquanto os 47% restantes ficaram com funcionários atuais e antigos e outros investidores. O acordo também preservou elementos importantes da parceria, como direitos de propriedade intelectual e exclusividade de API no Azure até a verificação de AGI, com mudanças em outras cláusulas.",
            sources: [
              { title: "OpenAI: next chapter of Microsoft partnership", url: "https://openai.com/index/next-chapter-of-microsoft-openai-partnership/" },
              { title: "OpenAI: shareholder split after recapitalization", url: "https://openai.com/pt-BR/our-structure/" }
            ]
          },
          {
            text: "Os procuradores-gerais da Califórnia e de Delaware não trataram a reorganização como simples formalidade. Os dois gabinetes passaram mais de um ano examinando a operação e disseram que não se oporiam ao plano após compromissos sobre controle da entidade sem fins lucrativos, segurança e preservação da missão. Por isso, dentro da briga com Musk, este evento vira uma peça decisiva: a OpenAI diz que a missão continuou no comando; os críticos enxergam aqui a passagem para uma estrutura muito mais confortável para capital privado e valorização acionária.",
            sources: [
              { title: "California AG: statement on recapitalization plan", url: "https://oag.ca.gov/news/press-releases/attorney-general-bonta-issues-statement-openai%E2%80%99s-recapitalization-plan" },
              { title: "Delaware AG: review of recapitalization", url: "https://news.delaware.gov/2025/10/28/ag-jennings-completes-review-of-openai-recapitalization/" },
              { title: "AP: regulators and nonprofit control", url: "https://apnews.com/article/openai-chatgpt-nonprofit-microsoft-c661df3242766d6b0ddbab401ad1fd84" }
            ]
          }
        ],
        links: [
          { title: "OpenAI: Evolving our structure", url: "https://openai.com/index/evolving-our-structure/" },
          { title: "Built In: OpenAI new corporate structure", url: "https://builtin.com/articles/openai-new-corporate-structure" },
          { title: "Data Center Dynamics: OpenAI nonprofit stake", url: "https://www.datacenterdynamics.com/en/news/openai-nonprofit-to-take-100bn-stake-in-public-benefit-corporation-as-part-of-restructure/" }
        ]
      },
      {
        date: "2023-07-12",
        title: "Musk funda a xAI",
        importance: "A história passa a envolver também concorrência direta entre empresas de IA.",
        summary: "Musk fundou a startup concorrente xAI. A Microsoft expandiu o investimento na OpenAI para US$ 10 bilhões, em troca de direitos de PI e participação nos lucros.",
        details: "Musk fundou a startup de IA xAI, entrando diretamente em competição com a OpenAI. No mesmo período, a Microsoft expandiu massivamente seu investimento na OpenAI para US$ 10 bilhões, em troca de direitos de propriedade intelectual e participação nos lucros futuros. Musk disse que ficou definitivamente irado em 2023 com esse acordo. Para a defesa da OpenAI no julgamento de 2026, o timing era revelador: Musk só entrou com o processo um ano depois de fundar seu próprio concorrente direto.",
        extended: [
          {
            text: "Em 12 de julho de 2023, Musk anunciou a formação da xAI. A nova empresa se apresentou com uma missão ampla de buscar entendimento da realidade e da natureza do universo, mas o contexto competitivo era direto: Musk estava voltando ao centro da corrida por modelos de IA depois de ter saído da OpenAI anos antes.",
            sources: [
              { title: "CNBC: xAI launch announcement", url: "https://www.cnbc.com/2023/07/12/elon-musk-launches-his-new-company-xai.html" },
              { title: "TechCrunch: xAI announcement and goal", url: "https://techcrunch.com/2023/07/12/elon-musk-wants-to-build-ai-to-understand-the-true-nature-of-the-universe/" }
            ]
          },
          {
            text: "O primeiro sinal público era que xAI não nascia como projeto lateral pequeno. A equipe anunciada reunia pesquisadores com passagens por OpenAI, DeepMind, Google Research, Microsoft Research, Tesla e outras instituições relevantes. Poucos meses depois, ao apresentar o Grok, a própria xAI descreveu que treinou um protótipo após o anúncio da empresa e que Grok-1 foi desenvolvido ao longo de quatro meses, deixando evidente que a startup pretendia entrar rapidamente na disputa por modelos de fronteira.",
            sources: [
              { title: "CNBC: xAI founding team background", url: "https://www.cnbc.com/2023/07/12/elon-musk-launches-his-new-company-xai.html" },
              { title: "xAI: Announcing Grok", url: "https://x.ai/news/grok" }
            ]
          },
          {
            text: "A cronologia com a Microsoft precisa ficar separada. Em 23 de janeiro de 2023, meses antes do anúncio da xAI, a Microsoft havia anunciado a terceira fase da parceria com a OpenAI por meio de um investimento multianual e multibilionário. Na disputa judicial posterior, Musk trataria a escala desse aporte como um marco de ruptura; no julgamento de 2026, ele disse que o investimento de US$ 10 bilhões foi o momento em que concluiu que a confiança beneficente havia sido violada.",
            sources: [
              { title: "Microsoft: partnership extended in January 2023", url: "https://blogs.microsoft.com/blog/2023/01/23/microsoftandopenaiextendpartnership/" },
              { title: "KUNC/NPR: Musk testimony on 2023 Microsoft investment", url: "https://www.kunc.org/npr-news/2026-04-29/elon-musk-accuses-openais-leaders-of-looting-the-non-profit-in-court-testimony" }
            ]
          },
          {
            text: "Para a história do litígio, a criação da xAI muda o lugar de Musk. Ele não era mais apenas excofundador, exdoador e crítico da OpenAI; passou a operar uma concorrente que desenvolveria seu próprio assistente e modelos. Esse fato virou arma retórica e processual da defesa: OpenAI sustentaria que a ação de Musk servia também para retardar um rival enquanto sua própria empresa avançava.",
            sources: [
              { title: "Reuters/Investing: 2026 trial opening and xAI context", url: "https://www.investing.com/news/stock-market-news/openai-trial-pitting-elon-musk-against-sam-altman-kicks-off-4640752" },
              { title: "GeekWire: pretrial fight over xAI dual role", url: "https://www.geekwire.com/2026/pre-trial-fight-in-openai-case-focuses-on-elon-musks-dual-role-as-microsoft-partner-and-plaintiff/" }
            ]
          },
          {
            text: "Isso não resolve sozinho se a OpenAI preservou ou rompeu sua missão original, mas muda a leitura do conflito. A partir de 2023, a disputa entre Musk e a OpenAI passa a misturar três camadas: uma briga sobre promessa fundadora, uma disputa sobre capital e controle da OpenAI com a Microsoft, e uma competição comercial direta entre empresas que querem construir sistemas de IA cada vez mais poderosos.",
            sources: [
              { title: "Microsoft: OpenAI partnership expansion", url: "https://blogs.microsoft.com/blog/2023/01/23/microsoftandopenaiextendpartnership/" },
              { title: "xAI: Grok as first public product path", url: "https://x.ai/news/grok" },
              { title: "Reuters/Investing: trial framing in 2026", url: "https://www.investing.com/news/stock-market-news/openai-trial-pitting-elon-musk-against-sam-altman-kicks-off-4640752" }
            ]
          }
        ],
        links: [
          { title: "CNBC: Elon Musk launches xAI", url: "https://www.cnbc.com/2023/07/12/elon-musk-launches-his-new-company-xai.html" },
          { title: "Microsoft: Microsoft and OpenAI extend partnership", url: "https://blogs.microsoft.com/blog/2023/01/23/microsoftandopenaiextendpartnership/" },
          { title: "Yahoo Finance: 2023 investment dispute background", url: "https://finance.yahoo.com/news/musk-openai-jury-trial-begin-231611771.html" }
        ]
      },
      {
        date: "2020-09-24",
        title: "Musk critica exclusividade do GPT-3 com Microsoft",
        importance: "Esse é um dos primeiros sinais públicos de ruptura sobre abertura e financiamento.",
        summary: "A Microsoft obteve licença exclusiva do GPT-3. Musk postou que parecia 'o oposto de aberto' e que a OpenAI estava 'essencialmente capturada pela Microsoft'.",
        details: "Quando a Microsoft obteve uma licença exclusiva do modelo GPT-3, Musk postou no X (então Twitter) que isso parecia 'o oposto de aberto' e que a OpenAI estava 'essencialmente capturada pela Microsoft'. O comentário foi um dos primeiros sinais públicos de que Musk e a OpenAI estavam em rota de colisão. A OpenAI argumentou que a exclusividade era necessária para viabilizar o modelo de 'lucro limitado' criado em 2019.",
        extended: [
          {
            text: "A sequência começou em 22 de setembro de 2020, quando a OpenAI anunciou que licenciaria a tecnologia do GPT-3 para a Microsoft usar em produtos e serviços próprios. A OpenAI ressaltou que o acordo não encerraria o acesso ao GPT-3 pela API e que desenvolvedores atuais e futuros continuariam a construir aplicações pela plataforma.",
            sources: [
              { title: "OpenAI: GPT-3 licensed to Microsoft", url: "https://openai.com/index/openai-licenses-gpt-3-technology-to-microsoft/" }
            ]
          },
          {
            text: "Dois dias depois, em 24 de setembro de 2020, Musk criticou publicamente o movimento. Em resposta a notícias sobre a exclusividade da licença, ele escreveu que aquilo parecia o oposto de aberto e afirmou que a OpenAI estaria essencialmente capturada pela Microsoft. Por isso, a data deste tópico acompanha a crítica pública de Musk, não o anúncio original do acordo.",
            sources: [
              { title: "GeekWire: Musk's 2020 GPT-3 criticism", url: "https://www.geekwire.com/2026/the-microsoft-openai-files-internal-documents-reveal-the-realities-of-ais-defining-alliance/" },
              { title: "TechTimes: Musk response to the license", url: "https://www.techtimes.com/articles/252826/20200924/elon-musk-criticizes-microsofts-acquisition-openai-behind-much-touted-human-like-text-generator-executive-license-defeats-ai-democracy.htm" }
            ]
          },
          {
            text: "Esse episódio é importante porque antecipa o vocabulário central da briga futura. A OpenAI havia nascido com o nome 'Open' e com uma missão pública; Musk passou a usar a relação com Microsoft como evidência de fechamento e captura comercial. A própria OpenAI, por outro lado, enquadrou o licenciamento como parte de uma parceria plurianual já anunciada e de um caminho comercial que manteria a API disponível.",
            sources: [
              { title: "OpenAI: API access unchanged by license", url: "https://openai.com/index/openai-licenses-gpt-3-technology-to-microsoft/" },
              { title: "GeekWire: opposite-of-open framing in later case record", url: "https://www.geekwire.com/2026/the-microsoft-openai-files-internal-documents-reveal-the-realities-of-ais-defining-alliance/" }
            ]
          },
          {
            text: "A diferença técnica e comercial também importa. GPT-3 era o modelo de 175 bilhões de parâmetros por trás da API da OpenAI naquele momento. Licenciar a tecnologia para a Microsoft não significava retirar o modelo da API, mas significava dar à parceira um caminho próprio para usar a tecnologia em seus produtos. Para quem discutia se a OpenAI continuava suficientemente aberta, essa distinção não eliminava a tensão.",
            sources: [
              { title: "OpenAI: GPT-3 and API context", url: "https://openai.com/index/openai-licenses-gpt-3-technology-to-microsoft/" }
            ]
          },
          {
            text: "Na cronologia do litígio, esse tweet de 2020 ganhou peso porque mostrava que Musk já demonstrava desconforto com a direção comercial da OpenAI anos antes de processá-la em 2024. Em 2026, cobertura do julgamento voltou a esse comentário ao reconstruir quando Musk passou a perceber a Microsoft como parte central do problema que ele dizia enxergar na OpenAI.",
            sources: [
              { title: "Le Monde: 2020 tweet revisited at trial", url: "https://www.lemonde.fr/en/economy/article/2026/04/29/at-openai-trial-musk-portrays-himself-as-a-benefactor-of-humanity_6752958_19.html" },
              { title: "GeekWire: alliance history and 2020 criticism", url: "https://www.geekwire.com/2026/the-microsoft-openai-files-internal-documents-reveal-the-realities-of-ais-defining-alliance/" }
            ]
          }
        ],
        links: [
          { title: "OpenAI: GPT-3 technology licensed to Microsoft", url: "https://openai.com/index/openai-licenses-gpt-3-technology-to-microsoft/" },
          { title: "GeekWire: Microsoft-OpenAI files", url: "https://www.geekwire.com/2026/the-microsoft-openai-files-internal-documents-reveal-the-realities-of-ais-defining-alliance/" },
          { title: "MIT Technology Review: GPT-3 license in the chronology", url: "https://www.technologyreview.com/2026/05/18/1137488/elon-musk-suit-openai-verdict/" }
        ]
      },
      {
        date: "2019-03-11",
        title: "OpenAI cria subsidiária com lucro limitado",
        importance: "A OpenAI LP cria a ponte entre a origem sem fins lucrativos e a escala comercial futura.",
        summary: "OpenAI criou a OpenAI LP: um modelo híbrido para captar capital com retornos limitados e manter a entidade sem fins lucrativos no controle formal.",
        details: "Em março de 2019, a OpenAI criou a OpenAI LP, descrita como uma empresa de 'lucro limitado' dentro da estrutura governada pela entidade sem fins lucrativos. A proposta era captar bilhões para computação e talentos sem tratar o retorno financeiro como objetivo máximo: investidores e funcionários poderiam receber retorno limitado, enquanto o excedente econômico ficaria com a OpenAI Nonprofit. O primeiro limite anunciado para investidores foi de até 100x o investimento. Meses depois, em julho de 2019, a Microsoft anunciaria um investimento de US$ 1 bilhão e uma parceria de infraestrutura com a OpenAI.",
        extended: [
          {
            text: "Em 11 de março de 2019, a OpenAI anunciou a OpenAI LP. A justificativa pública era que sistemas de IA mais ambiciosos exigiriam muito mais computação, contratação e infraestrutura do que a organização havia planejado no início. A OpenAI disse que precisaria investir bilhões de dólares nos anos seguintes e que não via uma estrutura jurídica pronta que equilibrasse captação de capital e missão.",
            sources: [
              { title: "OpenAI: OpenAI LP announcement", url: "https://openai.com/index/openai-lp/" }
            ]
          },
          {
            text: "A solução escolhida foi uma estrutura híbrida: a OpenAI LP teria elementos de empresa com fins lucrativos, mas seria apresentada como 'capped-profit'. Isso permitia oferecer participação econômica a investidores e funcionários, sem prometer que todo valor criado seria destinado a eles. A própria OpenAI escreveu que retornos acima do limite negociado pertenciam à entidade sem fins lucrativos original.",
            sources: [
              { title: "OpenAI: capped-profit rationale", url: "https://openai.com/index/openai-lp/" }
            ]
          },
          {
            text: "No anúncio, a OpenAI afirmou que a OpenAI LP continuaria controlada pelo conselho da OpenAI Nonprofit e que sua obrigação fiduciária primária seria avançar os objetivos do OpenAI Charter. Também disse que investidores e funcionários assinariam documentos reconhecendo que a obrigação com a Carta viria antes do interesse financeiro, inclusive se isso custasse parte ou toda a participação econômica deles.",
            sources: [
              { title: "OpenAI: mission-first governance of OpenAI LP", url: "https://openai.com/index/openai-lp/" }
            ]
          },
          {
            text: "O detalhe do limite importa para entender o termo 'lucro limitado'. Para a primeira rodada de investidores, a OpenAI anunciou um teto de 100 vezes o capital investido e disse esperar múltiplos menores em rodadas futuras conforme a organização avançasse. Esse desenho não eliminava a busca por capital privado; ele tentava encaixá-la dentro de uma promessa de controle sem fins lucrativos.",
            sources: [
              { title: "OpenAI: first-round return cap", url: "https://openai.com/index/openai-lp/" }
            ]
          },
          {
            text: "A parceria com a Microsoft veio depois desse marco. Em 22 de julho de 2019, a OpenAI anunciou que a Microsoft investiria US$ 1 bilhão, que as duas trabalhariam em tecnologias de supercomputação no Azure e que a Microsoft passaria a ser a provedora de nuvem exclusiva da OpenAI. Na cronologia da disputa, a OpenAI LP abre a porta estrutural para escalar; o acordo com Microsoft mostra como essa escala começou a ser financiada e operacionalizada.",
            sources: [
              { title: "OpenAI: Microsoft invests and partners with OpenAI", url: "https://openai.com/index/microsoft-invests-in-and-partners-with-openai/" },
              { title: "OpenAI: OpenAI LP announcement", url: "https://openai.com/index/openai-lp/" }
            ]
          },
          {
            text: "Esse ponto também é usado pela OpenAI para contestar a narrativa posterior de Musk. Segundo a empresa, Musk recebeu uma cópia antecipada do anúncio da OpenAI LP e pediu que o texto deixasse explícito que ele não tinha interesse financeiro no braço com fins lucrativos. A mesma publicação afirma que ele já havia defendido uma estrutura com fins lucrativos em 2017, embora esse enquadramento seja parte da disputa pública entre as partes.",
            sources: [
              { title: "OpenAI: Elon Musk wanted an OpenAI for-profit", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" }
            ]
          }
        ],
        links: [
          { title: "OpenAI: OpenAI LP announcement", url: "https://openai.com/index/openai-lp/" },
          { title: "OpenAI: Microsoft invests and partners with OpenAI", url: "https://openai.com/index/microsoft-invests-in-and-partners-with-openai/" },
          { title: "OpenAI: Our structure", url: "https://openai.com/our-structure/" },
          { title: "OpenAI: Elon Musk wanted an OpenAI for-profit", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" }
        ]
      },
      {
        date: "2018-02-20",
        title: "Musk sai do conselho da OpenAI",
        importance: "A saída de Musk mistura desacordo de missão com disputa por governança e controle.",
        summary: "A OpenAI anunciou que Musk deixaria o conselho para evitar conflito com a IA da Tesla; anos depois, a saída virou parte central da disputa sobre controle e financiamento.",
        details: "Em 20 de fevereiro de 2018, a OpenAI anunciou que Elon Musk deixaria seu conselho, continuaria a doar e aconselhar a organização e evitaria um possível conflito à medida que a Tesla se concentrava mais em IA. Na reconstrução posterior da briga, a separação aparece ligada também às discussões sobre como financiar uma OpenAI muito mais cara de escalar: a OpenAI afirma que recusou dar a Musk controle unilateral de uma estrutura com fins lucrativos e rejeitou a ideia de ligar a organização à Tesla. Por isso, a saída de 2018 é ao mesmo tempo um marco público de governança e um ponto disputado sobre o caminho comercial que viria depois.",
        extended: [
          {
            text: "O registro público do dia é direto. Em 20 de fevereiro de 2018, ao anunciar novos apoiadores e a ampliação de sua base de financiamento, a OpenAI informou que Elon Musk sairia do conselho, mas continuaria a doar e aconselhar a organização. A justificativa publicada foi preventiva: como a Tesla estava ficando mais focada em IA, a saída eliminaria um possível conflito futuro para Musk.",
            sources: [
              { title: "OpenAI: OpenAI supporters", url: "https://openai.com/index/openai-supporters/" }
            ]
          },
          {
            text: "A composição do conselho mudou naquele mesmo anúncio. A OpenAI disse que o board passaria a ser formado por Greg Brockman, Ilya Sutskever, Holden Karnofsky e Sam Altman, com intenção de adicionar outro diretor depois. Isso marca o momento em que Musk deixa a governança formal da organização que havia ajudado a lançar como co-chair.",
            sources: [
              { title: "OpenAI: board after Musk departure", url: "https://openai.com/index/openai-supporters/" },
              { title: "OpenAI: Introducing OpenAI", url: "https://openai.com/index/introducing-openai/" }
            ]
          },
          {
            text: "A leitura do evento ficou mais complexa quando a disputa virou pública. Em sua cronologia posterior, a OpenAI afirma que, em 2017, Musk discutiu uma transição para uma estrutura com fins lucrativos, buscou maioria econômica, controle inicial do conselho e o cargo de CEO dessa nova estrutura, e que a equipe rejeitou uma configuração que poderia concentrar controle sobre AGI em uma pessoa.",
            sources: [
              { title: "OpenAI: Elon Musk wanted an OpenAI for-profit", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" }
            ]
          },
          {
            text: "Depois que essas negociações fracassaram, a OpenAI diz que Musk propôs absorver a organização pela Tesla e tratava a Tesla como a única rota plausível para competir com o Google em IA. Essa é a versão da OpenAI para o contexto imediatamente anterior à saída; ela importa porque coloca o rompimento de 2018 dentro de uma disputa sobre capital, missão e quem teria poder sobre a próxima fase da organização.",
            sources: [
              { title: "OpenAI: January 2018 Tesla proposal", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" },
              { title: "OpenAI: OpenAI and Elon Musk", url: "https://openai.com/index/openai-elon-musk/" }
            ]
          },
          {
            text: "A própria OpenAI também relata que, na despedida de fevereiro de 2018, Musk disse que seguiria pesquisa avançada de IA na Tesla e que a OpenAI deveria buscar o caminho que visse para levantar bilhões por ano. Em uma peça judicial de 2025, os réus descrevem a retirada como uma separação em que Musk focaria na rota de IA que considerava viável e encorajaria a OpenAI a perseguir financiamento em escala muito maior.",
            sources: [
              { title: "OpenAI: February 2018 goodbye all-hands", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" },
              { title: "OpenAI defendants: counterclaims and defenses", url: "https://cdn.openai.com/pdf/0ada8797-a5ae-4577-857e-94598d5234d5/2025-04-09-openai-defendants-counterclaims-answer-and-defenses.pdf" }
            ]
          },
          {
            text: "Na história da briga, esse é o ponto em que os papéis se separam. Musk deixa de estar dentro do conselho da OpenAI antes da OpenAI LP de 2019, antes da parceria bilionária com Microsoft e antes do licenciamento do GPT-3. Quando ele passa a acusar a OpenAI de ter abandonado sua missão, a resposta da empresa insiste que ele conhecia a necessidade de mais capital e já havia defendido caminhos com fins lucrativos antes de sair.",
            sources: [
              { title: "OpenAI: OpenAI LP and Musk not formally involved", url: "https://openai.com/index/openai-lp/" },
              { title: "OpenAI: The truth Elon left out", url: "https://openai.com/index/the-truth-elon-left-out/" }
            ]
          }
        ],
        links: [
          { title: "OpenAI: OpenAI supporters", url: "https://openai.com/index/openai-supporters/" },
          { title: "OpenAI: Elon Musk wanted an OpenAI for-profit", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" },
          { title: "OpenAI: OpenAI and Elon Musk", url: "https://openai.com/index/openai-elon-musk/" },
          { title: "OpenAI: OpenAI LP announcement", url: "https://openai.com/index/openai-lp/" }
        ]
      },
      {
        date: "2015-12-11",
        title: "Fundação da OpenAI como organização sem fins lucrativos",
        importance: "Essa promessa fundadora vira a referência usada para julgar todos os eventos seguintes.",
        summary: "Musk cofunda a OpenAI com Sam Altman e Greg Brockman como organização sem fins lucrativos, com objetivo de desenvolver IA 'para o benefício da humanidade'.",
        details: "Em 11 de dezembro de 2015, a OpenAI se apresentou como uma empresa de pesquisa em IA sem fins lucrativos. O anúncio dizia que seu objetivo era avançar a inteligência digital da forma mais provável de beneficiar a humanidade como um todo, sem a obrigação de gerar retorno financeiro. Sam Altman e Elon Musk apareciam como co-chairs; Ilya Sutskever como diretor de pesquisa; Greg Brockman como CTO. A defesa de uma instituição orientada a benefício amplo, colaboração e publicação aberta é o ponto de partida usado depois para discutir se a OpenAI preservou ou transformou demais sua missão.",
        extended: [
          {
            text: "A história começa publicamente em 11 de dezembro de 2015. No anúncio de lançamento, a OpenAI se definiu como uma empresa de pesquisa em inteligência artificial sem fins lucrativos e disse que queria avançar a inteligência digital da maneira mais provável de beneficiar a humanidade como um todo. O texto ligava essa escolha estrutural à ausência de obrigação de gerar retorno financeiro.",
            sources: [
              { title: "OpenAI: Introducing OpenAI", url: "https://openai.com/index/introducing-openai/" }
            ]
          },
          {
            text: "O anúncio também explicava o risco que a organização dizia enxergar. Sistemas de IA poderiam trazer benefícios enormes, mas também causar dano se fossem construídos ou usados incorretamente. Por isso, a OpenAI defendia que deveria existir uma instituição de pesquisa de ponta capaz de priorizar um bom resultado para todos acima do interesse próprio.",
            sources: [
              { title: "OpenAI: launch rationale for broad benefit", url: "https://openai.com/index/introducing-openai/" }
            ]
          },
          {
            text: "A palavra 'Open' não era só branding naquele texto inicial. A OpenAI escreveu que, como organização sem fins lucrativos, pretendia criar valor para todos em vez de acionistas, encorajar pesquisadores a publicar papers, posts e código, compartilhar patentes se existissem e colaborar livremente com outras instituições. Esse conjunto de promessas é o pano de fundo de várias críticas posteriores quando a empresa passa a operar com modelos mais fechados e parceiros comerciais.",
            sources: [
              { title: "OpenAI: publishing, patents and collaboration at launch", url: "https://openai.com/index/introducing-openai/" }
            ]
          },
          {
            text: "A equipe fundadora já incluía nomes que continuam centrais na história da organização. O anúncio listava Ilya Sutskever como diretor de pesquisa, Greg Brockman como CTO e dizia que Sam Altman e Elon Musk eram co-chairs. Também citava outros pesquisadores fundadores e uma base de apoiadores que incluía Altman, Brockman, Musk, Reid Hoffman, Jessica Livingston, Peter Thiel, AWS, Infosys e YC Research.",
            sources: [
              { title: "OpenAI: founding team and supporters", url: "https://openai.com/index/introducing-openai/" }
            ]
          },
          {
            text: "No lançamento, esses apoiadores foram descritos como comprometendo US$ 1 bilhão no total, embora a OpenAI dissesse que esperava gastar apenas uma pequena fração nos primeiros anos. Esse detalhe ajuda a entender a tensão que aparece depois: a ambição inicial já era grande, mas a organização ainda não havia apresentado a estrutura comercial criada em 2019 para captar capital em escala muito maior.",
            sources: [
              { title: "OpenAI: founding funding commitment", url: "https://openai.com/index/introducing-openai/" },
              { title: "OpenAI: OpenAI LP announcement", url: "https://openai.com/index/openai-lp/" }
            ]
          },
          {
            text: "A formulação da missão seria refinada depois na OpenAI Charter, que afirma que a AGI deve beneficiar toda a humanidade, que seus benefícios não devem concentrar poder indevidamente e que a organização espera precisar de recursos substanciais sem abandonar essa orientação. Na cronologia da disputa com Musk, 2015 funciona como a promessa de origem; os eventos seguintes discutem como essa promessa foi interpretada ao mudar a estrutura da OpenAI.",
            sources: [
              { title: "OpenAI: OpenAI Charter", url: "https://openai.com/charter/" },
              { title: "OpenAI: Introducing OpenAI", url: "https://openai.com/index/introducing-openai/" }
            ]
          },
          {
            text: "Há ainda uma nuance que ficou pública só mais tarde. Em sua cronologia de 2024, a OpenAI afirma que, antes do anúncio público, Musk já havia questionado se uma estrutura apenas sem fins lucrativos era a melhor opção e sugerido uma corporação padrão com uma organização sem fins lucrativos paralela. Isso não muda o marco de dezembro de 2015, mas mostra por que a fundação virou terreno de disputa quando as partes passaram a contar versões diferentes sobre a missão original.",
            sources: [
              { title: "OpenAI: Elon Musk wanted an OpenAI for-profit", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" }
            ]
          }
        ],
        links: [
          { title: "OpenAI: Introducing OpenAI", url: "https://openai.com/index/introducing-openai/" },
          { title: "OpenAI: OpenAI Charter", url: "https://openai.com/charter/" },
          { title: "OpenAI: OpenAI LP announcement", url: "https://openai.com/index/openai-lp/" },
          { title: "OpenAI: Elon Musk wanted an OpenAI for-profit", url: "https://openai.com/index/elon-musk-wanted-an-openai-for-profit/" }
        ]
      }
    ]
  }
];

function renderHistory() {
  const container = document.getElementById("historyView");
  if (!container) return;

  if (!historyState.activeStoryId) {
    renderStoriesList(container);
  } else {
    renderStoryDetail(container);
  }
}

function renderStoriesList(container) {
  const sorted = [...storiesData].sort((a, b) => b.lastUpdated.localeCompare(a.lastUpdated));

  container.innerHTML = `
    <div class="history-header">
      <p class="section-kicker">Histórias</p>
      <h2>Narrativas da IA ao longo do tempo</h2>
      <p class="history-desc">Contexto aprofundado sobre os grandes eventos e disputas que moldam a indústria da IA.</p>
    </div>
    <div class="stories-grid">
      ${sorted.map((story) => `
        <button class="story-card" type="button" data-story-id="${escapeHtml(story.id)}">
          <div class="story-card-meta">
            <time>${formatDate(story.lastUpdated)}</time>
            <span class="story-event-count">${story.events.length} eventos</span>
          </div>
          <h3>${escapeHtml(story.title)}</h3>
          <p class="story-card-subtitle">${escapeHtml(story.subtitle)}</p>
          <p class="story-summary">${escapeHtml(story.summary)}</p>
          <div class="story-tags">
            ${story.tags.map((tag) => `<span class="story-tag">${escapeHtml(tag)}</span>`).join("")}
          </div>
        </button>
      `).join("")}
    </div>
  `;

  container.querySelectorAll("[data-story-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      historyState.activeStoryId = btn.dataset.storyId;
      historyState.expandedEventIds.clear();
      historyState.expandedExtendedEventIds.clear();
      renderHistory();
    });
  });
}

function renderStoryDetail(container) {
  const story = storiesData.find((s) => s.id === historyState.activeStoryId);
  if (!story) {
    historyState.activeStoryId = null;
    renderHistory();
    return;
  }

  container.innerHTML = `
    <div class="story-detail">
      <button class="history-back" type="button" data-back>&#8592; Todas as histórias</button>
      <div class="story-detail-header">
        <div class="story-detail-meta">
          <time>Atualizado em ${formatDate(story.lastUpdated)}</time>
          ${story.tags.map((tag) => `<span class="story-tag">${escapeHtml(tag)}</span>`).join("")}
        </div>
        <h2>${escapeHtml(story.title)}</h2>
        <p class="story-detail-subtitle">${escapeHtml(story.subtitle)}</p>
        <p class="story-detail-summary">${escapeHtml(story.summary)}</p>
      </div>
      <div class="story-events-header">
        <div>
          <p class="section-kicker">Eventos</p>
          <h3>Resumo cronológico</h3>
        </div>
        <label class="history-order-control">
          <span>Ordem da data</span>
          <select data-history-event-order>
            <option value="desc"${historyState.eventDateOrder === "desc" ? " selected" : ""}>Mais recentes</option>
            <option value="asc"${historyState.eventDateOrder === "asc" ? " selected" : ""}>Mais antigas</option>
          </select>
        </label>
      </div>
      <div class="events-list">
        ${sortedStoryEvents(story).map(({ event, eventId }) => {
    const isExpanded = historyState.expandedEventIds.has(eventId);
    const isExtendedExpanded = historyState.expandedExtendedEventIds.has(eventId);
    const itemClass = isExpanded ? "event-item expanded" : "event-item";
    let extendedHtml = "";
    if (event.extended?.length) {
      const openAttr = isExtendedExpanded ? " open" : "";
      extendedHtml = `
                  <details class="event-extended" data-event-extended="${escapeHtml(eventId)}"${openAttr}>
                    <summary class="event-extended-toggle">
                      <span class="event-details-label">Vers&atilde;o Estendida</span>
                      <span class="event-extended-action">Abrir leitura completa</span>
                    </summary>
                    <div class="event-extended-narrative">
                      ${renderHistoryExtendedParagraphs(event.extended)}
                    </div>
                  </details>
      `;
    }
    return `
            <div class="${itemClass}" data-event-id="${escapeHtml(eventId)}">
              <button
                class="event-header"
                type="button"
                data-event-toggle="${escapeHtml(eventId)}"
                aria-controls="${escapeHtml(eventId)}-details"
                aria-expanded="${isExpanded}">
                <div class="event-header-left">
                  <div class="event-topic-meta">
                    <span class="event-topic-label">T&oacute;pico</span>
                    <time class="event-date">${formatDate(event.date)}</time>
                  </div>
                  <strong class="event-title">${escapeHtml(event.title)}</strong>
                  <span class="event-summary">${escapeHtml(event.summary)}</span>
                </div>
                <span class="event-toggle-meta">
                  <span class="event-toggle-label">${isExpanded ? "Fechar resumo" : "Abrir resumo"}</span>
                  <span class="event-chevron">&#9660;</span>
                </span>
              </button>
              <article class="event-details" id="${escapeHtml(eventId)}-details">
                <section class="event-summary-panel">
                  <p class="event-details-label">Vers&atilde;o Resumida</p>
                  <div class="event-narrative">
                    ${renderHistoryParagraphs(event.details)}
                  </div>
                  ${event.importance ? `
                    <section class="event-importance">
                      <h4>Por que importa</h4>
                      <p>${escapeHtml(event.importance)}</p>
                    </section>
                  ` : ""}
                  ${event.links?.length ? `
                    <div class="event-links">
                      <span class="event-links-label">Fontes do resumo</span>
                      <ul>
                        ${event.links.map((link) => `
                          <li><a href="${escapeAttribute(link.url)}" target="_blank" rel="noreferrer">${escapeHtml(link.title)}</a></li>
                        `).join("")}
                      </ul>
                    </div>
                  ` : ""}
                </section>
                ${extendedHtml}
              </article>
            </div>
          `;
  }).join("")}
      </div>
    </div>
  `;

  container.querySelector("[data-back]").addEventListener("click", () => {
    historyState.activeStoryId = null;
    historyState.expandedEventIds.clear();
    historyState.expandedExtendedEventIds.clear();
    renderHistory();
  });

  container.querySelector("[data-history-event-order]").addEventListener("change", (event) => {
    historyState.eventDateOrder = event.target.value === "asc" ? "asc" : "desc";
    saveViewPreferences();
    renderHistory();
  });

  container.querySelectorAll("[data-event-toggle]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const eventId = btn.dataset.eventToggle;
      const eventItem = btn.closest(".event-item");
      const label = btn.querySelector(".event-toggle-label");
      if (historyState.expandedEventIds.has(eventId)) {
        historyState.expandedEventIds.delete(eventId);
        eventItem.classList.remove("expanded");
        btn.setAttribute("aria-expanded", "false");
        label.textContent = "Abrir resumo";
      } else {
        historyState.expandedEventIds.add(eventId);
        eventItem.classList.add("expanded");
        btn.setAttribute("aria-expanded", "true");
        label.textContent = "Fechar resumo";
      }
    });
  });

  container.querySelectorAll("[data-event-extended]").forEach((details) => {
    details.addEventListener("toggle", () => {
      const eventId = details.dataset.eventExtended;
      if (details.open) {
        historyState.expandedExtendedEventIds.add(eventId);
      } else {
        historyState.expandedExtendedEventIds.delete(eventId);
      }
    });
  });
}

function sortedStoryEvents(story) {
  const direction = historyState.eventDateOrder === "asc" ? 1 : -1;
  return story.events
    .map((event, index) => ({
      event,
      eventId: `${story.id}-${index}`
    }))
    .sort((a, b) => direction * a.event.date.localeCompare(b.event.date));
}

function renderHistoryParagraphs(details) {
  const paragraphs = Array.isArray(details) ? details : [details];
  return paragraphs
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join("");
}

function renderHistoryExtendedParagraphs(paragraphs) {
  return paragraphs
    .filter((paragraph) => paragraph?.text)
    .map((paragraph) => `
      <article class="event-extended-paragraph">
        <p>${escapeHtml(paragraph.text)}</p>
        ${paragraph.sources?.length ? `
          <div class="event-citations">
            ${paragraph.sources.map((source) => `
              <a href="${escapeAttribute(source.url)}" target="_blank" rel="noreferrer">${escapeHtml(source.title)}</a>
            `).join("")}
          </div>
        ` : ""}
      </article>
    `)
    .join("");
}

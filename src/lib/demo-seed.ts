import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { hashSync } from "bcryptjs";

const DB_PATH = path.join(process.cwd(), "src", "data", "ecoterre.db");

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[randomInt(0, arr.length - 1)];
}

function pickN<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
    .slice(0, 80);
}

function randomDate(daysBack: number): string {
  const now = new Date();
  const msBack = randomInt(0, daysBack * 24 * 60 * 60 * 1000);
  return new Date(now.getTime() - msBack).toISOString();
}

function calcReadingTime(text: string): number {
  const words = text.replace(/<[^>]*>/g, "").split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

function arSummary(titleAr: string, topic: string): string {
  const templates = [
    `تقرير شامل حول ${topic}. ${titleAr} - تحليل معمق مع أحدث المعطيات والأرقام.`,
    `مقال حول ${topic} في تونس. اكتشف التفاصيل الكاملة حول ${titleAr.toLowerCase()}.`,
    `${titleAr}. متابعة لأهم التطورات في مجال ${topic} مع تحليلات الخبراء.`,
    `ملف خاص عن ${topic}. ${titleAr} - كل ما تحتاج معرفته حول هذا الموضوع الحيوي.`,
    `تحقيق صحفي حول ${topic}. ${titleAr} مع شهادات وآراء المختصين.`,
  ];
  return pick(templates);
}

const tableOrder = [
  "article_tags",
  "article_categories",
  "comments",
  "views_log",
  "translations_cache",
  "podcasts",
  "reports",
  "articles",
  "tags",
  "categories",
  "newsletters",
  "contacts",
  "media",
  "settings",
  "users",
];

interface CatDef {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
  description_fr: string;
  description_ar: string;
  icon: string;
  sort_order: number;
}

const categories: CatDef[] = [
  {
    id: "cat_news",
    slug: "actualites",
    name_fr: "Actualités",
    name_ar: "أخبار",
    description_fr: "Actualités générales et informations de dernière minute",
    description_ar: "أخبار عامة وآخر المستجدات",
    icon: "newspaper",
    sort_order: 1,
  },
  {
    id: "cat_economy",
    slug: "economie",
    name_fr: "Économie",
    name_ar: "اقتصاد",
    description_fr: "Actualités économiques, finances et développement",
    description_ar: "أخبار اقتصادية ومالية وتنموية",
    icon: "chart-line",
    sort_order: 2,
  },
  {
    id: "cat_environment",
    slug: "environnement",
    name_fr: "Environnement",
    name_ar: "بيئة",
    description_fr: "Environnement, écologie et développement durable",
    description_ar: "بيئة وإيكولوجيا وتنمية مستدامة",
    icon: "leaf",
    sort_order: 3,
  },
  {
    id: "cat_health",
    slug: "sante",
    name_fr: "Santé",
    name_ar: "صحة",
    description_fr: "Santé publique, bien-être et médecine",
    description_ar: "صحة عامة ورفاه وطب",
    icon: "heart-pulse",
    sort_order: 4,
  },
  {
    id: "cat_reports",
    slug: "rapports",
    name_fr: "Rapports",
    name_ar: "تقارير",
    description_fr: "Rapports, études et analyses approfondies",
    description_ar: "تقارير ودراسات وتحليلات معمقة",
    icon: "file-text",
    sort_order: 5,
  },
  {
    id: "cat_podcast",
    slug: "podcast",
    name_fr: "Podcast",
    name_ar: "بودكاست",
    description_fr: "Émissions audio et podcasts",
    description_ar: "برامج صوتية وبودكاست",
    icon: "podcast",
    sort_order: 6,
  },
  {
    id: "cat_agriculture",
    slug: "agriculture",
    name_fr: "Agriculture",
    name_ar: "فلاحة",
    description_fr: "Agriculture, agroalimentaire et développement rural",
    description_ar: "فلاحة وصناعات غذائية وتنمية ريفية",
    icon: "wheat",
    sort_order: 7,
  },
  {
    id: "cat_energy",
    slug: "energie",
    name_fr: "Énergie",
    name_ar: "طاقة",
    description_fr: "Énergies, hydrocarbures et transition énergétique",
    description_ar: "طاقات ومحروقات وانتقال طاقي",
    icon: "bolt",
    sort_order: 8,
  },
  {
    id: "cat_transport",
    slug: "transport",
    name_fr: "Transport",
    name_ar: "نقل",
    description_fr: "Transport, mobilité et infrastructures",
    description_ar: "نقل وتنقل وبنية تحتية",
    icon: "truck",
    sort_order: 9,
  },
  {
    id: "cat_technology",
    slug: "technologie",
    name_fr: "Technologie",
    name_ar: "تكنولوجيا",
    description_fr: "Technologies, innovation et numérique",
    description_ar: "تكنولوجيات وابتكار ورقمي",
    icon: "cpu",
    sort_order: 10,
  },
  {
    id: "cat_education",
    slug: "education",
    name_fr: "Éducation",
    name_ar: "تعليم",
    description_fr: "Éducation, formation et recherche",
    description_ar: "تعليم وتكوين وبحث علمي",
    icon: "graduation-cap",
    sort_order: 11,
  },
  {
    id: "cat_culture",
    slug: "culture",
    name_fr: "Culture",
    name_ar: "ثقافة",
    description_fr: "Culture, arts et patrimoine",
    description_ar: "ثقافة وفنون وتراث",
    icon: "palette",
    sort_order: 12,
  },
  {
    id: "cat_sport",
    slug: "sport",
    name_fr: "Sport",
    name_ar: "رياضة",
    description_fr: "Sport, événements sportifs et loisirs",
    description_ar: "رياضة وأحداث رياضية وترفيه",
    icon: "trophy",
    sort_order: 13,
  },
  {
    id: "cat_international",
    slug: "international",
    name_fr: "International",
    name_ar: "دولي",
    description_fr: "Actualités internationales et diplomatie",
    description_ar: "أخبار دولية ودبلوماسية",
    icon: "globe",
    sort_order: 14,
  },
  {
    id: "cat_politique",
    slug: "politique",
    name_fr: "Politique",
    name_ar: "سياسة",
    description_fr: "Politique, gouvernance et institutions",
    description_ar: "سياسة وحوكمة ومؤسسات",
    icon: "landmark",
    sort_order: 15,
  },
  {
    id: "cat_societe",
    slug: "societe",
    name_fr: "Société",
    name_ar: "مجتمع",
    description_fr: "Société, faits divers et vie citoyenne",
    description_ar: "مجتمع وأحداث وحياة مدنية",
    icon: "users",
    sort_order: 16,
  },
  {
    id: "cat_climat",
    slug: "climat",
    name_fr: "Climat",
    name_ar: "مناخ",
    description_fr: "Climat, météorologie et changements climatiques",
    description_ar: "مناخ وأرصاد جوية وتغيرات مناخية",
    icon: "cloud-sun",
    sort_order: 17,
  },
  {
    id: "cat_biodiversite",
    slug: "biodiversite",
    name_fr: "Biodiversité",
    name_ar: "تنوع بيولوجي",
    description_fr: "Biodiversité, écosystèmes et protection de la nature",
    description_ar: "تنوع بيولوجي ونظم بيئية وحماية الطبيعة",
    icon: "tree-deciduous",
    sort_order: 18,
  },
  {
    id: "cat_finance",
    slug: "finance",
    name_fr: "Finance",
    name_ar: "مالية",
    description_fr: "Finance, banques et marchés",
    description_ar: "مالية وبنوك وأسواق",
    icon: "banknote",
    sort_order: 19,
  },
  {
    id: "cat_innovation",
    slug: "innovation",
    name_fr: "Innovation",
    name_ar: "ابتكار",
    description_fr: "Innovation, recherche et développement",
    description_ar: "ابتكار وبحث وتطوير",
    icon: "lightbulb",
    sort_order: 20,
  },
];

interface TagDef {
  id: string;
  slug: string;
  name_fr: string;
  name_ar: string;
}

const tags: TagDef[] = [
  { id: "tag_tunisie", slug: "tunisie", name_fr: "Tunisie", name_ar: "تونس" },
  { id: "tag_dev_durable", slug: "developpement-durable", name_fr: "Développement durable", name_ar: "تنمية مستدامة" },
  { id: "tag_climat", slug: "climat", name_fr: "Climat", name_ar: "مناخ" },
  { id: "tag_investissement", slug: "investissement", name_fr: "Investissement", name_ar: "استثمار" },
  { id: "tag_agriculture", slug: "agriculture", name_fr: "Agriculture", name_ar: "فلاحة" },
  { id: "tag_solaire", slug: "energie-solaire", name_fr: "Énergie solaire", name_ar: "طاقة شمسية" },
  { id: "tag_recyclage", slug: "recyclage", name_fr: "Recyclage", name_ar: "إعادة تدوير" },
  { id: "tag_emploi", slug: "emploi", name_fr: "Emploi", name_ar: "تشغيل" },
  { id: "tag_tourisme", slug: "tourisme", name_fr: "Tourisme", name_ar: "سياحة" },
  { id: "tag_export", slug: "exportation", name_fr: "Exportation", name_ar: "تصدير" },
  { id: "tag_eau", slug: "eau", name_fr: "Eau", name_ar: "ماء" },
  { id: "tag_forets", slug: "forets", name_fr: "Forêts", name_ar: "غابات" },
  { id: "tag_pollution", slug: "pollution", name_fr: "Pollution", name_ar: "تلوث" },
  { id: "tag_eolien", slug: "energie-eolienne", name_fr: "Énergie éolienne", name_ar: "طاقة رياح" },
  { id: "tag_transport_durable", slug: "transport-durable", name_fr: "Transport durable", name_ar: "نقل مستدام" },
  { id: "tag_smart_city", slug: "smart-city", name_fr: "Smart city", name_ar: "مدينة ذكية" },
  { id: "tag_eco_circulaire", slug: "economie-circulaire", name_fr: "Économie circulaire", name_ar: "اقتصاد دائري" },
  { id: "tag_biodiversite", slug: "biodiversite", name_fr: "Biodiversité", name_ar: "تنوع بيولوجي" },
  { id: "tag_transition", slug: "transition-energetique", name_fr: "Transition énergétique", name_ar: "انتقال طاقي" },
  { id: "tag_cop", slug: "cop", name_fr: "COP", name_ar: "كوب" },
  { id: "tag_mediterranee", slug: "mediterranee", name_fr: "Méditerranée", name_ar: "متوسط" },
  { id: "tag_startups", slug: "startups", name_fr: "Startups", name_ar: "شركات ناشئة" },
  { id: "tag_fintech", slug: "fintech", name_fr: "FinTech", name_ar: "تكنولوجيا مالية" },
  { id: "tag_agrotech", slug: "agrotech", name_fr: "AgroTech", name_ar: "تكنولوجيا زراعية" },
  { id: "tag_sante_publique", slug: "sante-publique", name_fr: "Santé publique", name_ar: "صحة عامة" },
];

interface UserDef {
  id: string;
  email: string;
  name: string;
  role: string;
  bio: string;
}

const users: UserDef[] = [
  {
    id: "user_admin_001",
    email: "admin@ecoterre.com",
    name: "Ghalia Brahmi",
    role: "admin",
    bio: "Fondatrice et rédactrice en chef d'Ecoterre. Passionnée par le journalisme environnemental et le développement durable en Tunisie.",
  },
  {
    id: "user_author_001",
    email: "auteur1@ecoterre.com",
    name: "Nasri Naziha",
    role: "author",
    bio: "Journaliste spécialisée en économie et environnement. Diplômée de l'IPSI, elle couvre les questions de développement durable depuis 10 ans.",
  },
  {
    id: "user_author_002",
    email: "auteur2@ecoterre.com",
    name: "Sami Trabelsi",
    role: "author",
    bio: "Journaliste d'investigation. Ses enquêtes sur la pollution industrielle et la gestion des ressources naturelles ont été primées à plusieurs reprises.",
  },
  {
    id: "user_editor_001",
    email: "editor1@ecoterre.com",
    name: "Monia Chebbi",
    role: "editor",
    bio: "Éditrice et relectrice. Spécialiste du contenu bilingue français-arabe avec 15 ans d'expérience en presse écrite.",
  },
  {
    id: "user_editor_002",
    email: "editor2@ecoterre.com",
    name: "Fares Jebali",
    role: "editor",
    bio: "Éditeur web et responsable des réseaux sociaux. Expert en stratégie de contenu digital et référencement.",
  },
  {
    id: "user_author_003",
    email: "auteur3@ecoterre.com",
    name: "Amel Gharbi",
    role: "author",
    bio: "Journaliste scientifique. Collabore avec des instituts de recherche tunisiens pour vulgariser les études environnementales.",
  },
  {
    id: "user_subscriber_001",
    email: "abonné1@example.com",
    name: "Karim Dridi",
    role: "subscriber",
    bio: "Ingénieur agronome et lecteur assidu d'Ecoterre.",
  },
  {
    id: "user_subscriber_002",
    email: "abonné2@example.com",
    name: "Salma Kallel",
    role: "subscriber",
    bio: "Enseignante en sciences de la vie et de la terre, utilise les articles d'Ecoterre dans ses cours.",
  },
];

const articleTopics: {
  topic: string;
  topicAr: string;
  catSlugs: string[];
  tagSlugs: string[];
  titlesFr: string[];
  titlesAr: string[];
}[] = [
  {
    topic: "énergies renouvelables",
    topicAr: "الطاقات المتجددة",
    catSlugs: ["energie", "environnement", "actualites"],
    tagSlugs: ["energie-solaire", "energie-eolienne", "transition-energetique", "tunisie"],
    titlesFr: [
      "La Tunisie accélère sa transition vers les énergies renouvelables",
      "Nouveau parc solaire de 500 MW à Tataouine : les travaux débutent",
      "L'éolien tunisien : un potentiel encore sous-exploité",
      "Les énergies propres représentent désormais 12% du mix électrique tunisien",
      "Toits solaires : le programme de subvention étendu à tout le territoire",
      "Hydrogène vert : la Tunisie ambitionne de devenir un hub régional",
      "Centrale solaire de Tozeur : un projet pilote prometteur",
      "Partenariat tuniso-allemand pour le développement de l'éolien offshore",
      "Autoconsommation électrique : le cadre réglementaire enfin adopté",
      "Formation aux métiers des énergies renouvelables : 2000 jeunes concernés",
    ],
    titlesAr: [
      "تونس تسرّع انتقالها نحو الطاقات المتجددة",
      "محطة شمسية جديدة بقدرة 500 ميغاواط في تطاوين: انطلاق الأشغال",
      "طاقة الرياح التونسية: إمكانات غير مستغلة بعد",
      "الطاقات النظيفة تمثل الآن 12% من المزيج الكهربائي التونسي",
      "أسطح شمسية: توسيع برنامج الدعم ليشمل كامل التراب الوطني",
      "الهيدروجين الأخضر: تونس تطمح لأن تصبح محوراً إقليمياً",
      "محطة توزر الشمسية: مشروع نموذجي واعد",
      "شراكة تونسية ألمانية لتطوير طاقة الرياح البحرية",
      "الاستهلاك الذاتي للكهرباء: اعتماد الإطار التنظيمي أخيراً",
      "تكوين في مهن الطاقات المتجددة: 2000 شاب معني",
    ],
  },
  {
    topic: "économie et investissement",
    topicAr: "الاقتصاد والاستثمار",
    catSlugs: ["economie", "finance", "actualites"],
    tagSlugs: ["investissement", "emploi", "exportation", "tunisie"],
    titlesFr: [
      "Investissements étrangers en Tunisie : hausse de 15% en 2026",
      "Le taux de croissance du PIB tunisien révisé à la hausse",
      "Les exportations tunisiennes d'huile d'olive atteignent un record",
      "Zone franche de Zarzis : 50 nouvelles entreprises en 2026",
      "Le dinar tunisien se stabilise face à l'euro",
      "Startups tunisiennes : levée de fonds record de 120 millions de dinars",
      "Partenariat public-privé : 10 nouveaux projets d'infrastructure lancés",
      "Le taux de chômage en baisse à 14,2% au deuxième trimestre",
      "Industrie automobile : la Tunisie attire les équipementiers européens",
      "Budget 2027 : priorités à l'éducation et à la santé",
    ],
    titlesAr: [
      "الاستثمارات الأجنبية في تونس: ارتفاع بنسبة 15% في 2026",
      "مراجعة نسبة نمو الناتج المحلي الإجمالي التونسي نحو الارتفاع",
      "صادرات زيت الزيتون التونسية تسجل رقماً قياسياً",
      "المنطقة الحرة بجرجيس: 50 مؤسسة جديدة في 2026",
      "استقرار الدينار التونسي مقابل اليورو",
      "شركات ناشئة تونسية: جمع تمويلات قياسية بـ120 مليون دينار",
      "شراكة بين القطاعين العام والخاص: إطلاق 10 مشاريع بنية تحتية جديدة",
      "انخفاض نسبة البطالة إلى 14.2% في الربع الثاني",
      "صناعة السيارات: تونس تجذب موردي المعدات الأوروبيين",
      "ميزانية 2027: أولويات للتعليم والصحة",
    ],
  },
  {
    topic: "environnement et écologie",
    topicAr: "البيئة والإيكولوجيا",
    catSlugs: ["environnement", "biodiversite", "climat"],
    tagSlugs: ["pollution", "biodiversite", "recyclage", "eau", "forets", "developpement-durable"],
    titlesFr: [
      "Pollution plastique en Méditerranée : la Tunisie renforce ses mesures",
      "Reforestation : 2 millions d'arbres plantés dans le Nord-Ouest",
      "Les réserves naturelles tunisiennes étendues de 15%",
      "Sécheresse : les barrages tunisiens à 45% de leur capacité",
      "Protection du littoral : un plan national de 200 MD dévoilé",
      "Recyclage des déchets : le taux atteint 18% à Tunis",
      "Nouvelles espèces marines découvertes au large de Kerkennah",
      "Qualité de l'air à Tunis : des améliorations mais encore des efforts",
      "Parc national de Boukornine : nouvelle aire protégée inaugurée",
      "Les oasis tunisiennes menacées par le changement climatique",
    ],
    titlesAr: [
      "التلوث البلاستيكي بالمتوسط: تونس تعزز إجراءاتها",
      "تشجير: غراسة مليوني شجرة في الشمال الغربي",
      "توسيع المحميات الطبيعية التونسية بنسبة 15%",
      "جفاف: السدود التونسية في حدود 45% من طاقتها",
      "حماية السواحل: الكشف عن خطة وطنية بـ200 مليون دينار",
      "إعادة تدوير النفايات: بلوغ نسبة 18% في تونس العاصمة",
      "اكتشاف أنواع بحرية جديدة قبالة سواحل قرقنة",
      "جودة الهواء بتونس: تحسن لكن جهوداً لا تزال مطلوبة",
      "منتزه بوقرنين الوطني: تدشين منطقة محمية جديدة",
      "الواحات التونسية مهددة بالتغير المناخي",
    ],
  },
  {
    topic: "agriculture et sécurité alimentaire",
    topicAr: "الفلاحة والأمن الغذائي",
    catSlugs: ["agriculture", "economie"],
    tagSlugs: ["agriculture", "agrotech", "eau", "exportation"],
    titlesFr: [
      "Récolte céréalière 2026 : une année exceptionnelle pour la Tunisie",
      "Huile d'olive tunisienne : nouveau label de qualité lancé",
      "Agriculture biologique en Tunisie : les surfaces certifiées doublent",
      "Irrigation intelligente : des capteurs connectés pour économiser l'eau",
      "Filière dattes : les exportations vers l'Asie en forte croissance",
      "AgroTech tunisienne : une startup révolutionne le suivi des cultures",
      "Production laitière : modernisation des exploitations familiales",
      "Pêche durable : nouveau quota pour préserver les stocks de thon rouge",
      "Les coopératives agricoles féminines se multiplient dans le Sahel",
      "Sécurité alimentaire : la Tunisie réduit sa dépendance aux importations",
    ],
    titlesAr: [
      "محصول الحبوب 2026: سنة استثنائية لتونس",
      "زيت الزيتون التونسي: إطلاق علامة جودة جديدة",
      "الفلاحة البيولوجية في تونس: مضاعفة المساحات المعتمدة",
      "ري ذكي: مجسات متصلة لتوفير المياه",
      "قطاع التمور: نمو قوي للصادرات نحو آسيا",
      "تكنولوجيا زراعية تونسية: شركة ناشئة تحدث ثورة في متابعة المحاصيل",
      "إنتاج الحليب: تحديث المستغلات العائلية",
      "صيد مستدام: حصة جديدة للحفاظ على مخزون التونة الحمراء",
      "تزايد التعاونيات الفلاحية النسائية في الساحل",
      "الأمن الغذائي: تونس تقلل اعتمادها على الواردات",
    ],
  },
  {
    topic: "santé publique",
    topicAr: "الصحة العامة",
    catSlugs: ["sante", "societe"],
    tagSlugs: ["sante-publique", "tunisie"],
    titlesFr: [
      "Couverture sociale : extension de l'AMG à 500 000 nouveaux bénéficiaires",
      "Télémédecine en Tunisie : 50 centres connectés en zones rurales",
      "Vaccination : la Tunisie atteint 95% de couverture infantile",
      "Maladies chroniques : nouveau plan national de prévention 2026-2030",
      "Hôpital universitaire de Sfax : inauguration du nouveau pôle cardiologie",
      "Santé mentale : des consultations gratuites dans les centres de santé de base",
      "Tabagisme en Tunisie : la prévalence baisse pour la première fois",
      "Production locale de médicaments : 3 nouvelles usines agréées",
      "Cancers : un centre de radiothérapie ouvre à Gafsa",
      "Formation des infirmiers : nouvelle réforme des études paramédicales",
    ],
    titlesAr: [
      "تغطية اجتماعية: توسيع AMG لـ500 ألف منتفع جديد",
      "الطب عن بعد في تونس: 50 مركزاً متصلاً في المناطق الريفية",
      "تلقيح: تونس تحقق 95% تغطية للأطفال",
      "أمراض مزمنة: خطة وطنية جديدة للوقاية 2026-2030",
      "المستشفى الجامعي بصفاقس: تدشين القطب الجديد لأمراض القلب",
      "صحة نفسية: استشارات مجانية بمراكز الصحة الأساسية",
      "التدخين في تونس: انخفاض معدل الانتشار لأول مرة",
      "إنتاج محلي للأدوية: اعتماد 3 مصانع جديدة",
      "السرطان: افتتاح مركز للعلاج الإشعاعي بقفصة",
      "تكوين الممرضين: إصلاح جديد للدراسات شبه الطبية",
    ],
  },
  {
    topic: "transport et mobilité",
    topicAr: "النقل والتنقل",
    catSlugs: ["transport", "environnement"],
    tagSlugs: ["transport-durable", "smart-city", "tunisie"],
    titlesFr: [
      "Métro de Tunis : extension de la ligne 6 vers El Menzah",
      "Véhicules électriques : 200 bornes de recharge installées en 2026",
      "Train rapide Tunis-Sousse : les études de faisabilité achevées",
      "Transport rural : nouveau réseau de bus dans le gouvernorat de Kairouan",
      "Port de Radès : modernisation des infrastructures portuaires",
      "Pistes cyclables à Tunis : 30 km supplémentaires inaugurés",
      "Aéroport Tunis-Carthage : le terminal 2 rénové rouvre ses portes",
      "Sécurité routière : baisse de 12% des accidents mortels",
      "Navette maritime Tunis-La Goulette : service étendu en soirée",
      "Logistique verte : la poste tunisienne adopte des véhicules électriques",
    ],
    titlesAr: [
      "مترو تونس: توسيع الخط 6 نحو المنزه",
      "سيارات كهربائية: تركيب 200 محطة شحن في 2026",
      "القطار السريع تونس-سوسة: إتمام دراسات الجدوى",
      "نقل ريفي: شبكة حافلات جديدة في ولاية القيروان",
      "ميناء رادس: تحديث البنية التحتية المينائية",
      "مسالك دراجات بتونس: تدشين 30 كلم إضافية",
      "مطار تونس-قرطاج: إعادة فتح المطار رقم 2 بعد التجديد",
      "سلامة مرورية: انخفاض بـ12% في حوادث القتل",
      "نقل بحري تونس-حلق الوادي: تمديد الخدمة مساءً",
      "خدمات لوجستية خضراء: البريد التونسي يعتمد سيارات كهربائية",
    ],
  },
  {
    topic: "technologie et innovation",
    topicAr: "التكنولوجيا والابتكار",
    catSlugs: ["technologie", "innovation"],
    tagSlugs: ["startups", "fintech", "smart-city", "tunisie"],
    titlesFr: [
      "Intelligence artificielle : la Tunisie lance sa stratégie nationale IA 2030",
      "Paiement mobile : 3 millions de Tunisiens utilisent désormais le m-paiement",
      "Cyberparc de Sousse : 15 startups technologiques primées",
      "E-gouvernement : 80% des services administratifs désormais en ligne",
      "Fibre optique : 500 000 foyers raccordés d'ici fin 2026",
      "La FinTech tunisienne séduit les investisseurs du Golfe",
      "Hackathon national pour des solutions climatiques innovantes",
      "5G en Tunisie : les tests pilotes commencent à Tunis",
      "Blockchain : première application dans le cadastre tunisien",
      "Éducation numérique : 1000 écoles connectées en haut débit",
    ],
    titlesAr: [
      "ذكاء اصطناعي: تونس تطلق استراتيجيتها الوطنية IA 2030",
      "دفع جوّال: 3 ملايين تونسي يستخدمون الآن الدفع عبر الهاتف",
      "قطب تكنولوجي بسوسة: تتويج 15 شركة ناشئة",
      "حكومة إلكترونية: 80% من الخدمات الإدارية متاحة على الخط",
      "ألياف بصرية: ربط 500 ألف منزل مع نهاية 2026",
      "التكنولوجيا المالية التونسية تجذب مستثمري الخليج",
      "هاكاثون وطني لإيجاد حلول مناخية مبتكرة",
      "الجيل الخامس في تونس: بدء الاختبارات النموذجية في تونس العاصمة",
      "البلوكتشين: أول تطبيق في السجل العقاري التونسي",
      "تعليم رقمي: ربط 1000 مدرسة بالتدفق العالي",
    ],
  },
  {
    topic: "climat et environnement",
    topicAr: "المناخ والبيئة",
    catSlugs: ["climat", "environnement"],
    tagSlugs: ["climat", "cop", "transition-energetique", "mediterranee"],
    titlesFr: [
      "COP31 : la Tunisie plaide pour un fonds d'adaptation pour l'Afrique",
      "Vague de chaleur exceptionnelle : la Tunisie bat des records de température",
      "Inondations à Nabeul : le changement climatique en cause",
      "Le niveau de la mer monte : les îles Kerkennah en première ligne",
      "Bilan carbone de la Tunisie : une baisse de 8% des émissions en 2026",
      "Adaptation climatique : l'agriculture tunisienne se prépare",
      "Stress hydrique : la Tunisie classée 33e pays le plus menacé",
      "Énergies fossiles : vers une sortie programmée du charbon en 2035",
      "Les jeunes Tunisiens se mobilisent pour le climat",
      "Assurance climatique : nouveau mécanisme pour les agriculteurs",
    ],
    titlesAr: [
      "كوب 31: تونس تدعو لصندوق تكيف لأفريقيا",
      "موجة حر استثنائية: تونس تحطم أرقاماً قياسية لدرجات الحرارة",
      "فيضانات في نابل: التغير المناخي هو السبب",
      "ارتفاع مستوى سطح البحر: جزر قرقنة في خط المواجهة",
      "الحصيلة الكربونية لتونس: انخفاض بـ8% في الانبعاثات سنة 2026",
      "تكيف مناخي: الفلاحة التونسية تستعد",
      "الإجهاد المائي: تونس مصنفة في المرتبة 33 لأكثر الدول تهديداً",
      "طاقات أحفورية: نحو خروج مبرمج من الفحم سنة 2035",
      "الشباب التونسي يتعبأ من أجل المناخ",
      "تأمين مناخي: آلية جديدة للفلاحين",
    ],
  },
  {
    topic: "société et culture",
    topicAr: "المجتمع والثقافة",
    catSlugs: ["societe", "culture", "education"],
    tagSlugs: ["tunisie", "emploi", "developpement-durable"],
    titlesFr: [
      "Égalité hommes-femmes : la Tunisie progresse dans le classement mondial",
      "Festival de Carthage 2026 : une édition sous le signe de l'écologie",
      "Artisanat tunisien : 500 jeunes formés aux métiers traditionnels",
      "Éducation environnementale : nouveau programme dans les écoles primaires",
      "Médias et environnement : les journalistes tunisiens se spécialisent",
      "Patrimoine mondial : Sbeitla candidate à l'UNESCO",
      "Économie sociale et solidaire : un secteur en pleine expansion",
      "Volontariat écologique : 10 000 jeunes mobilisés cet été",
      "Cinéma tunisien : un documentaire sur les oasis primé à Cannes",
      "Littoral tunisien : campagne nationale de nettoyage des plages",
    ],
    titlesAr: [
      "مساواة بين الجنسين: تونس تتقدم في التصنيف العالمي",
      "مهرجان قرطاج 2026: دورة تحت شعار البيئة",
      "صناعة تقليدية تونسية: تكوين 500 شاب في الحرف التقليدية",
      "تربية بيئية: برنامج جديد في المدارس الابتدائية",
      "إعلام وبيئة: الصحفيون التونسيون يتخصصون",
      "تراث عالمي: سبيطلة مرشحة لليونسكو",
      "اقتصاد اجتماعي وتضامني: قطاع في توسع كامل",
      "تطوع بيئي: 10 آلاف شاب معبأ هذا الصيف",
      "سينما تونسية: وثائقي حول الواحات يتوج في كان",
      "سواحل تونسية: حملة وطنية لتنظيف الشواطئ",
    ],
  },
  {
    topic: "international et diplomatie",
    topicAr: "دولي ودبلوماسية",
    catSlugs: ["international", "politique"],
    tagSlugs: ["tunisie", "investissement", "mediterranee"],
    titlesFr: [
      "Sommet UE-Tunisie : signature d'un accord de partenariat économique",
      "La Tunisie élue au Conseil des droits de l'homme de l'ONU",
      "Coopération tuniso-africaine : 5 nouveaux accords signés",
      "La Banque Mondiale débloque 500 millions de dollars pour la Tunisie",
      "Tunisie-Japon : renforcement de la coopération scientifique",
      "Diaspora tunisienne : 10% du PIB grâce aux transferts de fonds",
      "Gouvernance mondiale : la Tunisie plaide pour une réforme du FMI",
      "Accord de libre-échange continental : la Tunisie ratifie le traité",
      "Méditerranée : initiative tunisienne pour une charte environnementale",
      "Tourisme : la Tunisie accueille 10 millions de visiteurs en 2026",
    ],
    titlesAr: [
      "قمة الاتحاد الأوروبي-تونس: توقيع اتفاقية شراكة اقتصادية",
      "انتخاب تونس في مجلس حقوق الإنسان بالأمم المتحدة",
      "تعاون تونسي-أفريقي: توقيع 5 اتفاقيات جديدة",
      "البنك الدولي يفرج عن 500 مليون دولار لتونس",
      "تونس-اليابان: تعزيز التعاون العلمي",
      "الجالية التونسية بالخارج: 10% من الناتج المحلي عبر التحويلات",
      "حوكمة عالمية: تونس تطالب بإصلاح صندوق النقد الدولي",
      "اتفاقية تبادل حر قارية: تونس تصادق على المعاهدة",
      "المتوسط: مبادرة تونسية لميثاق بيئي",
      "سياحة: تونس تستقبل 10 ملايين زائر سنة 2026",
    ],
  },
];

const paragraphsEco: string[][] = [
  [
    "Selon les dernières données publiées par l'Institut National de la Statistique, les indicateurs économiques montrent une tendance positive pour l'année 2026. Les réformes structurelles engagées depuis deux ans commencent à porter leurs fruits, avec une amélioration notable du climat des affaires.",
    "Les investisseurs étrangers manifestent un intérêt croissant pour le marché tunisien. La stabilité du cadre réglementaire et la qualité de la main-d'œuvre tunisienne sont régulièrement citées comme des atouts majeurs par les opérateurs économiques internationaux.",
    "Le secteur privé tunisien continue de se diversifier. Au-delà des industries traditionnelles comme le textile et l'agroalimentaire, de nouveaux secteurs émergent : technologies de l'information, énergies renouvelables et industries créatives.",
  ],
  [
    "La Banque Centrale de Tunisie maintient une politique monétaire prudente, avec un taux directeur stable. Cette approche vise à contenir l'inflation tout en soutenant la reprise économique. Les réserves en devises ont atteint un niveau confortable de 120 jours d'importation.",
    "Le tourisme, secteur clé de l'économie tunisienne, connaît une saison exceptionnelle. Les recettes touristiques ont augmenté de 25% par rapport à l'année précédente, grâce à la diversification des marchés émetteurs et à la montée en gamme de l'offre hôtelière.",
    "La balance commerciale tunisienne s'améliore progressivement. Les exportations de produits manufacturés, notamment les composants automobiles et électroniques, progressent de 12% tandis que les importations énergétiques diminuent grâce au développement des énergies renouvelables.",
  ],
  [
    "Le Fonds Monétaire International a salué les progrès accomplis par la Tunisie dans la mise en œuvre de son programme de réformes. La croissance inclusive et la création d'emplois, particulièrement pour les jeunes diplômés, restent les priorités du gouvernement.",
    "Les petites et moyennes entreprises tunisiennes bénéficient d'un nouveau programme de soutien doté de 200 millions de dinars. Ce dispositif comprend des prêts à taux bonifiés, un accompagnement technique et un accès facilité aux marchés internationaux.",
    "L'investissement public dans les infrastructures atteint un niveau record en 2026. Routes, ports, aéroports et réseaux numériques : l'État mise sur la modernisation des équipements pour stimuler la compétitivité du pays à long terme.",
  ],
];

const paragraphsEnv: string[][] = [
  [
    "L'écosystème méditerranéen fait face à des défis sans précédent. La hausse des températures, l'acidification des océans et la pollution plastique menacent la biodiversité marine. Les scientifiques appellent à des mesures urgentes pour protéger cette mer semi-fermée particulièrement vulnérable.",
    "En Tunisie, la protection de l'environnement est devenue une priorité nationale. Le ministère de l'Environnement a lancé une série d'initiatives ambitieuses visant à réduire l'empreinte écologique du pays tout en créant des opportunités économiques dans l'économie verte.",
    "La gestion des déchets constitue un enjeu majeur. Avec une production de plus de 2,5 millions de tonnes de déchets par an, la Tunisie investit dans des centres de tri modernes et des unités de valorisation énergétique pour réduire l'enfouissement.",
  ],
  [
    "Les zones humides tunisiennes, d'importance internationale, font l'objet d'un plan de sauvegarde renforcé. Classées sites Ramsar, ces écosystèmes abritent des centaines d'espèces d'oiseaux migrateurs et jouent un rôle crucial dans la régulation du cycle de l'eau.",
    "La qualité de l'air dans les grandes villes tunisiennes s'améliore grâce à la modernisation du parc automobile et au développement des transports en commun. Des stations de mesure installées à Tunis, Sfax et Sousse permettent un suivi en temps réel des niveaux de pollution.",
    "L'éducation environnementale se déploie dans les écoles tunisiennes. Des clubs verts, des jardins pédagogiques et des programmes de sensibilisation forment une nouvelle génération de citoyens conscients des enjeux écologiques de leur pays.",
  ],
  [
    "La désertification touche près de 75% du territoire tunisien. Pour contrer ce phénomène, un vaste programme de reboisement et de fixation des dunes a été lancé dans les régions du centre et du sud, mobilisant les communautés locales et les experts internationaux.",
    "Les aires marines protégées tunisiennes s'étendent désormais sur plus de 500 km². Ces zones de non-pêche permettent la reconstitution des stocks halieutiques et la préservation des herbiers de posidonie, véritables poumons de la Méditerranée.",
    "Le recyclage des eaux usées traitées progresse significativement. Déjà utilisé pour l'irrigation de certains périmètres agricoles et l'arrosage des golfs, ce dispositif sera étendu à de nouvelles zones pour réduire la pression sur les ressources en eau conventionnelles.",
  ],
];

const paragraphsSante: string[][] = [
  [
    "Le système de santé tunisien poursuit sa modernisation. De nouveaux établissements hospitaliers sont en construction dans plusieurs gouvernorats de l'intérieur, répondant à l'objectif d'équité territoriale dans l'accès aux soins.",
    "La prévention devient le pilier de la politique sanitaire tunisienne. Campagnes de dépistage, programmes de vaccination et actions de sensibilisation se multiplient pour réduire l'incidence des maladies chroniques comme le diabète et l'hypertension.",
    "La formation du personnel médical s'intensifie. Les facultés de médecine tunisiennes accueillent des promotions plus nombreuses et de nouvelles spécialités sont créées pour répondre aux besoins émergents de la population.",
  ],
  [
    "La télémédecine révolutionne l'accès aux soins dans les zones rurales. Des consultations à distance permettent aux patients des régions enclavées de bénéficier de l'expertise de spécialistes sans avoir à se déplacer vers les grands centres urbains.",
    "La production pharmaceutique locale couvre désormais 55% des besoins du marché tunisien. Cette autonomie croissante réduit la facture des importations et garantit un approvisionnement plus stable en médicaments essentiels.",
    "La santé mentale sort progressivement du tabou en Tunisie. De nouveaux centres d'écoute et de prise en charge psychologique ouvrent leurs portes, et la formation de psychologues cliniciens s'accélère pour répondre à une demande en forte hausse.",
  ],
];

const paragraphsAgri: string[][] = [
  [
    "L'agriculture tunisienne connaît une transformation profonde. La mécanisation, l'irrigation de précision et les semences améliorées permettent d'augmenter les rendements tout en réduisant la consommation d'eau, ressource de plus en plus rare.",
    "La filière oléicole tunisienne confirme son excellence. Deuxième producteur mondial d'huile d'olive, la Tunisie mise sur la qualité et la traçabilité pour conquérir de nouveaux marchés, notamment en Asie et en Amérique du Nord.",
    "L'agriculture biologique tunisienne poursuit son essor. Avec plus de 350 000 hectares certifiés, le pays se positionne comme un fournisseur de référence pour le marché européen des produits bio.",
  ],
  [
    "La recherche agronomique tunisienne développe des variétés adaptées au changement climatique. Blé résistant à la sécheresse, oliviers tolérant la salinité : ces innovations sont essentielles pour la sécurité alimentaire du pays.",
    "Les jeunes agriculteurs tunisiens adoptent les technologies numériques. Applications mobiles de suivi des cultures, capteurs connectés et drones agricoles : l'AgroTech transforme les pratiques culturales traditionnelles.",
    "La pêche tunisienne se modernise. Criées rénovées, chaîne du froid améliorée et certification MSC : la filière halieutique tunisienne mise sur la durabilité et la valeur ajoutée.",
  ],
];

const paragraphsTech: string[][] = [
  [
    "L'écosystème startup tunisien confirme son dynamisme. Les jeunes pousses tunisiennes ont levé plus de 120 millions de dinars en 2026, un record qui témoigne de la confiance des investisseurs dans le potentiel d'innovation du pays.",
    "La digitalisation de l'administration tunisienne franchit une nouvelle étape. La plateforme e-bawaba permet désormais aux citoyens d'effectuer la plupart de leurs démarches administratives en ligne, réduisant les délais et la bureaucratie.",
    "Le secteur des technologies de l'information emploie désormais plus de 100 000 personnes en Tunisie. Ingénieurs, développeurs et data scientists tunisiens sont de plus en plus recherchés par les entreprises internationales.",
  ],
  [
    "L'intelligence artificielle s'invite dans l'économie tunisienne. Des applications concrètes émergent dans la santé, l'agriculture et la finance, portées par des centres de recherche et des startups locales.",
    "La cybersécurité devient une priorité nationale. Face à la multiplication des menaces numériques, la Tunisie se dote d'une agence nationale dédiée et investit dans la formation d'experts en sécurité informatique.",
    "Le programme Smart Tunisia connecte les zones rurales. Plus de 500 villages bénéficient désormais d'un accès internet haut débit, ouvrant de nouvelles perspectives pour l'éducation, la télémédecine et l'entrepreneuriat rural.",
  ],
];

const allParagraphs = [
  ...paragraphsEco,
  ...paragraphsEnv,
  ...paragraphsSante,
  ...paragraphsAgri,
  ...paragraphsTech,
];

const introPhrases = [
  "Dans un contexte de mutations profondes du paysage socio-économique tunisien,",
  "Face aux défis environnementaux croissants auxquels fait face la région,",
  "Dans le cadre de la stratégie nationale de développement durable,",
  "À l'occasion de la publication du dernier rapport sectoriel,",
  "Lors d'une conférence de presse tenue ce matin à Tunis,",
  "Selon une étude récemment publiée par des experts tunisiens,",
  "Dans une interview exclusive accordée à Ecoterre,",
  "Suite à l'annonce faite par les autorités compétentes,",
];

const outroPhrases = [
  "Les perspectives pour les mois à venir restent encourageantes selon les analystes, qui appellent toutefois à maintenir le cap des réformes.",
  "Les acteurs du secteur saluent cette initiative tout en rappelant la nécessité d'une mise en œuvre rapide et efficace des mesures annoncées.",
  "Ce développement confirme la résilience et le potentiel de l'économie tunisienne, malgré un environnement international incertain.",
  "Les observateurs internationaux suivent avec attention ces évolutions, qui pourraient inspirer d'autres pays de la région confrontés aux mêmes défis.",
  "La société civile tunisienne se mobilise pour accompagner ces changements et veiller à ce que les bénéfices profitent à l'ensemble de la population.",
  "Cette nouvelle dynamique témoigne de la capacité d'innovation et d'adaptation des acteurs tunisiens face aux défis du XXIᵉ siècle.",
];

function generateContent(index: number): {
  contentFr: string;
  contentAr: string;
  excerptFr: string;
  excerptAr: string;
} {
  const paraCount = randomInt(3, 6);
  const selectedParagraphs: string[][] = [];
  for (let i = 0; i < paraCount; i++) {
    selectedParagraphs.push(pick(allParagraphs));
  }

  let contentFr = `<h2>${pick(["Contexte et enjeux", "Analyse de la situation", "Les faits marquants", "Un tournant décisif", "État des lieux", "Perspectives d'avenir"])}</h2>`;
  contentFr += `<p>${pick(introPhrases)} ${selectedParagraphs[0][0]}</p>`;

  for (let i = 1; i < selectedParagraphs.length; i++) {
    const sub = pick([
      "Les chiffres clés",
      "Impacts et conséquences",
      "Les acteurs impliqués",
      "Défis et opportunités",
      "Le point de vue des experts",
      "Ce qu'il faut retenir",
      "Prochaines étapes",
      "Réactions et témoignages",
    ]);
    contentFr += `<h3>${sub}</h3>`;
    contentFr += `<p>${selectedParagraphs[i][0]}</p>`;
    if (selectedParagraphs[i].length > 1) {
      contentFr += `<p>${selectedParagraphs[i][1]}</p>`;
    }
    if (selectedParagraphs[i].length > 2 && Math.random() > 0.5) {
      contentFr += `<p>${selectedParagraphs[i][2]}</p>`;
    }
  }

  contentFr += `<blockquote>« ${pick(outroPhrases)} »</blockquote>`;

  const excerptFr = selectedParagraphs[0][0].slice(0, 150).trim() + "...";

  const arTemplates = [
    `<h2>المحتوى بالعربية - ملخص</h2><p>يتناول هذا المقال موضوعاً حيوياً يهم الشأن التونسي في ظل التحولات الراهنة. يقدم التحليل المفصل معطيات دقيقة وأرقاماً حديثة حول التطورات الأخيرة.</p><p>ويستعرض التقرير آراء الخبراء والمختصين الذين يؤكدون أهمية الإجراءات المتخذة وضرورة مواصلة الجهود لتحقيق الأهداف المسطرة.</p><p>كما يسلط الضوء على المبادرات الناجحة والتجارب الرائدة التي يمكن تعميمها على المستوى الوطني.</p>`,
    `<h2>ملخص التقرير</h2><p>يستعرض هذا المقال أهم المستجدات والتطورات في المجال، مع تحليل معمق للمعطيات المتاحة. ويشير التقرير إلى التقدم الملحوظ المحرز في الفترة الأخيرة.</p><p>ويؤكد المصدرون على ضرورة تضافر الجهود بين جميع الأطراف المعنية لمواصلة هذا الزخم الإيجابي. كما يبرز التقرير أهمية الاستثمار في الموارد البشرية والتكنولوجيا.</p><p>ويخلص التحليل إلى مجموعة من التوصيات العملية التي من شأنها تعزيز المكتسبات وتجاوز التحديات المطروحة.</p>`,
    `<h2>تقرير شامل</h2><p>في إطار متابعة آخر التطورات، يقدم هذا المقال نظرة شاملة حول الوضع الراهن والتحديات المستقبلية. يستند التحليل إلى مصادر موثوقة وبيانات حديثة.</p><p>ويبرز التقرير دور الفاعلين المحليين والدوليين في دعم المسار التنموي، مع التركيز على أهمية الشفافية والحوكمة الرشيدة.</p><p>كما يتضمن شهادات حية لمهنيين وخبراء يقدمون رؤيتهم حول آفاق القطاع والفرص المتاحة.</p>`,
  ];

  const contentAr = pick(arTemplates);
  const excerptAr = contentAr
    .replace(/<[^>]*>/g, "")
    .slice(0, 120)
    .trim() + "...";

  return { contentFr, contentAr, excerptFr, excerptAr };
}

function generateArticleData(index: number, catMap: Map<string, string>, tagMap: Map<string, string>, authors: string[]) {
  const topicData = articleTopics[index % articleTopics.length];
  const title = topicData.titlesFr[index % topicData.titlesFr.length];
  const titleAr = topicData.titlesAr[index % topicData.titlesAr.length];
  const slug = slugify(title) + "-" + (index + 1);
  const { contentFr, contentAr, excerptFr, excerptAr } = generateContent(index);

  const numCats = randomInt(1, 3);
  const catSlugs = pickN(topicData.catSlugs, numCats);
  const categoryIds = catSlugs.map((s) => catMap.get(s)!).filter(Boolean);

  const numTags = randomInt(2, 5);
  const tagSlugs = pickN(topicData.tagSlugs, numTags);
  const tagIds = tagSlugs.map((s) => tagMap.get(s)!).filter(Boolean);

  const status = Math.random() < 0.9 ? "published" : "draft";
  const publishedAt = status === "published" ? randomDate(180) : null;
  const readingTime = calcReadingTime(contentFr);
  const views = randomInt(10, 5000);
  const isFeatured = index < 6 ? 1 : 0;
  const coverImage = `https://picsum.photos/seed/${slug}/800/400`;
  const authorId = pick(authors);

  return {
    id: `art_demo_${String(index + 1).padStart(3, "0")}`,
    slug,
    titleFr: title,
    titleAr,
    contentFr,
    contentAr,
    excerptFr,
    excerptAr,
    coverImage,
    authorId,
    status,
    views,
    readingTime,
    isFeatured,
    publishedAt,
    categoryIds,
    tagIds,
  };
}

const commentTemplates = [
  { name: "Mohamed Ali", email: "mohamed.ali@email.tn", texts: [
    "Article très intéressant ! Merci pour cette analyse détaillée.",
    "Enfin des informations claires sur ce sujet. Continuez votre excellent travail.",
    "Je partage entièrement cette analyse. La situation est préoccupante mais des solutions existent.",
    "Bravo pour la qualité de vos articles. Je lis Ecoterre quotidiennement.",
    "Un article qui tombe à point nommé. Je travaille dans ce secteur et je confirme ces tendances.",
  ]},
  { name: "Fatma Ben Ahmed", email: "fatma.benahmed@email.tn", texts: [
    "Excellente synthèse. J'aimerais en savoir plus sur les implications pour les PME tunisiennes.",
    "Très bon article. Pourriez-vous faire un suivi dans quelques mois ?",
    "Merci pour ce travail de journalisme de qualité. C'est rare de nos jours.",
    "Je suis enseignante et j'utilise vos articles dans mes cours. Continuez !",
    "Analyse pertinente. Le sujet mérite d'être approfondi, notamment sur le volet social.",
  ]},
  { name: "Hichem Jebali", email: "hichem.jebali@email.tn", texts: [
    "Je ne suis pas tout à fait d'accord avec certaines conclusions. Les réalités du terrain sont plus nuancées.",
    "Article intéressant mais il manque des données comparatives avec les pays voisins.",
    "Bonne analyse, cependant le rôle de la société civile n'est pas assez souligné.",
    "Intéressant. Qu'en est-il de l'impact sur les régions de l'intérieur ?",
    "Je trouve l'analyse un peu optimiste. La mise en œuvre sera plus complexe.",
  ]},
  { name: "Nadia Khelifi", email: "nadia.khelifi@email.tn", texts: [
    "Merci pour ces informations précieuses. C'est encourageant de voir des progrès.",
    "Très bon article. Je le partage avec mes collègues.",
    "En tant que professionnelle du secteur, je salue la justesse de cette analyse.",
    "Article clair et bien documenté. Une référence sur le sujet.",
    "Enfin un média qui traite ces sujets avec sérieux. Félicitations à l'équipe.",
  ]},
  { name: "Tarek Guizani", email: "tarek.guizani@email.tn", texts: [
    "Question : quand est-ce que ces mesures seront effectivement appliquées sur le terrain ?",
    "Pensez-vous que l'objectif soit réaliste compte tenu des contraintes budgétaires ?",
    "Quel est le rôle des collectivités locales dans cette stratégie ?",
    "Avez-vous des informations sur les régions du sud qui ne sont pas mentionnées ?",
    "Y a-t-il des exemples de réussite dans d'autres pays qui pourraient nous inspirer ?",
  ]},
];

const newsletterEmails = [
  "sami.benali@email.tn",
  "nour.jebali@email.tn",
  "ines.gharbi@email.tn",
  "karim.zouari@email.tn",
  "salma.dridi@email.tn",
  "amine.bouazizi@email.tn",
  "henda.marzouki@email.tn",
  "sofia.hamza@email.tn",
  "ramzi.benamor@email.tn",
  "mariem.chahed@email.tn",
  "fathi.oueslati@email.tn",
  "amina.miled@email.tn",
  "wassim.baatout@email.tn",
  "nadia.guelmami@email.tn",
  "habib.mahfoudh@email.tn",
];

const contactMessages = [
  { name: "Salah Ferchichi", email: "salah.ferchichi@email.tn", subject: "Proposition de partenariat", message: "Bonjour, je représente une ONG environnementale basée à Sfax. Nous souhaiterions proposer un partenariat avec votre média pour couvrir nos actions de reboisement dans la région. Seriez-vous disponibles pour en discuter ? Cordialement.", isRead: 1 },
  { name: "Amina Zarrouk", email: "amina.zarrouk@email.tn", subject: "Erreur dans un article", message: "Bonjour, j'ai relevé une erreur dans votre article du 5 juillet concernant les statistiques de production d'énergie solaire. Le chiffre de 500 MW concerne le projet de Tataouine et non celui de Tozeur comme indiqué. Merci de corriger.", isRead: 0 },
  { name: "Dr. Mohamed Ghariani", email: "m.ghariani@institut.tn", subject: "Demande d'interview", message: "Bonjour l'équipe Ecoterre, je suis chercheur à l'INSTM et je travaille sur l'impact des changements climatiques sur la pêche en Méditerranée. Je serais ravi de contribuer à votre média via une interview ou une tribune. Bien à vous.", isRead: 1 },
  { name: "Leila Mansour", email: "leila.mansour@email.tn", subject: "Félicitations", message: "Bonjour, juste un petit message pour vous féliciter pour la qualité de votre travail. Votre couverture des questions environnementales est remarquable et essentielle pour la sensibilisation du public tunisien. Continuez !", isRead: 1 },
  { name: "Ridha Nouira", email: "ridha.nouira@email.tn", subject: "Publicité", message: "Bonjour, je souhaiterais connaître vos tarifs publicitaires pour une campagne de promotion d'un produit écologique tunisien. Notre startup développe des emballages biodégradables et nous aimerions toucher votre audience. Merci.", isRead: 0 },
  { name: "Salma Baccouche", email: "salma.baccouche@univ.tn", subject: "Demande de stage", message: "Bonjour, je suis étudiante en master de journalisme à l'IPSI et je recherche un stage de 3 mois. Votre média m'intéresse particulièrement pour son approche du journalisme environnemental. Seriez-vous ouverts à accueillir une stagiaire ?", isRead: 1 },
  { name: "Karim Haj Ali", email: "karim.hajali@email.tn", subject: "Signalement pollution", message: "Bonjour, je souhaite signaler une pollution inquiétante dans l'oued Medjerda près de Jendouba. Des rejets suspects sont visibles depuis plusieurs jours. Peut-être pourriez-vous enquêter sur ce sujet ? Merci pour votre attention.", isRead: 0 },
  { name: "Olfa Cheikhrouhou", email: "olfa.cheikh@email.tn", subject: "Contribution article", message: "Bonjour, je suis spécialiste en agriculture durable et je souhaiterais proposer un article sur les techniques d'agroforesterie adaptées au climat tunisien. Je peux vous envoyer un brouillon si vous êtes intéressés. Cordialement.", isRead: 1 },
  { name: "Youssef Hammami", email: "youssef.hammami@email.tn", subject: "Problème d'abonnement", message: "Bonjour, je n'arrive pas à me désabonner de votre newsletter. J'ai essayé plusieurs fois mais je continue à recevoir vos emails. Pouvez-vous m'aider ? Merci d'avance.", isRead: 0 },
  { name: "Ines Ben Youssef", email: "ines.by@email.tn", subject: "Invitation événement", message: "Bonjour, j'organise une conférence sur la transition écologique en Tunisie le mois prochain à la Cité des Sciences. Nous serions honorés de compter un représentant d'Ecoterre parmi nos intervenants. Seriez-vous intéressés ?", isRead: 1 },
];

const podcastContentFr = [
  `<h2>Épisode sur les enjeux du développement durable en Tunisie</h2>
<p><strong>[Début de l'interview]</strong></p>
<p><strong>Journaliste :</strong> Bonjour et bienvenue dans ce nouvel épisode d'Ecoterre Podcast. Aujourd'hui, nous recevons un expert de renom pour discuter des enjeux cruciaux du développement durable en Tunisie. Merci d'être avec nous.</p>
<p><strong>Invité :</strong> Merci de m'accueillir. C'est un plaisir de pouvoir partager ces réflexions avec votre audience.</p>
<p><strong>Journaliste :</strong> La Tunisie a fait des progrès significatifs ces dernières années en matière de développement durable. Comment évaluez-vous la situation actuelle ?</p>
<p><strong>Invité :</strong> Effectivement, nous observons des avancées notables, notamment dans le domaine des énergies renouvelables et de la gestion des ressources hydriques. Cependant, beaucoup reste à faire, particulièrement en matière d'économie circulaire et de sensibilisation du grand public.</p>
<p><strong>Journaliste :</strong> Quels sont selon vous les principaux défis à relever ?</p>
<p><strong>Invité :</strong> Le premier défi est la coordination entre les différents acteurs. L'État, le secteur privé, la société civile doivent travailler main dans la main. Le deuxième concerne le financement de la transition écologique, qui nécessite des investissements conséquents. Enfin, l'éducation et la formation sont essentielles pour créer une véritable culture du développement durable.</p>
<p><strong>Journaliste :</strong> Pouvez-vous nous donner des exemples concrets de réussites tunisiennes ?</p>
<p><strong>Invité :</strong> Bien sûr. Le programme de promotion de l'énergie solaire pour les ménages est un succès, avec plus de 50 000 installations depuis son lancement. La stratégie nationale de gestion des déchets a permis de réduire de 20% l'enfouissement. Et certaines municipalités, comme Sousse et Sfax, se distinguent par leurs initiatives innovantes en matière de transport durable.</p>
<p><strong>Journaliste :</strong> Un dernier mot pour nos auditeurs ?</p>
<p><strong>Invité :</strong> Le développement durable n'est pas une option, c'est une nécessité. Chaque Tunisien peut contribuer à sa manière. L'important est d'agir maintenant.</p>
<p><strong>Journaliste :</strong> Merci beaucoup pour cet échange passionnant.</p>
<p><em>[Fin de l'épisode]</em></p>`,

  `<h2>Grand entretien : l'avenir de l'agriculture tunisienne face au climat</h2>
<p><strong>[Introduction musicale]</strong></p>
<p><strong>Présentateur :</strong> Chers auditeurs, bonjour. Bienvenue dans Ecoterre Podcast. L'agriculture tunisienne est à la croisée des chemins entre tradition et modernité, entre résilience et vulnérabilité face aux changements climatiques. Nous en parlons aujourd'hui avec un spécialiste du secteur.</p>
<p><strong>Invité :</strong> Bonjour, merci pour cette invitation. Le sujet est effectivement crucial pour l'avenir de notre pays.</p>
<p><strong>Présentateur :</strong> Comment le secteur agricole tunisien s'adapte-t-il concrètement au changement climatique ?</p>
<p><strong>Invité :</strong> L'adaptation passe par plusieurs leviers. D'abord, le choix des cultures : nous développons des variétés plus résistantes à la sécheresse. Ensuite, les techniques d'irrigation évoluent vers des systèmes plus économes en eau. Enfin, l'agriculture de conservation et l'agroforesterie gagnent du terrain.</p>
<p><strong>Présentateur :</strong> Les agriculteurs sont-ils réceptifs à ces changements ?</p>
<p><strong>Invité :</strong> C'est variable. Les jeunes agriculteurs sont généralement plus ouverts aux innovations. Les plus âgés ont besoin d'être accompagnés et rassurés. C'est tout l'enjeu de la vulgarisation agricole et de la formation continue.</p>
<p><strong>Présentateur :</strong> Quel rôle joue la recherche scientifique ?</p>
<p><strong>Invité :</strong> Un rôle fondamental. Nos instituts de recherche agronomique travaillent sur des solutions adaptées au contexte tunisien. Nous avons par exemple développé des variétés de blé qui consomment 30% d'eau en moins, ou des porte-greffes d'oliviers résistants à la salinité.</p>
<p><strong>Présentateur :</strong> Merci pour cet éclairage. Nous reviendrons sur ces questions dans un prochain épisode.</p>`,
];

const podcastContentAr = [
  `<h2>ملخص البودكاست</h2><p>حلقة جديدة من بودكاست إيكوتير تتناول قضايا التنمية المستدامة في تونس. يستضيف البرنامج خبراء ومختصين لمناقشة التحديات والفرص في مجال التحول البيئي والاقتصادي.</p><p>يتناول الحوار مواضيع متنوعة تشمل الطاقات المتجددة، إدارة الموارد المائية، والاقتصاد الدائري، مع تسليط الضوء على التجارب التونسية الناجحة والإجراءات المستقبلية.</p>`,
  `<h2>ملخص الحلقة</h2><p>حوار معمق مع خبير في القطاع الفلاحي حول تكيف الزراعة التونسية مع التغيرات المناخية. تناقش الحلقة الابتكارات التقنية والممارسات الزراعية المستدامة التي يتم تطويرها لدعم الفلاحين التونسيين.</p><p>يستعرض البودكاست أيضاً دور البحث العلمي وأهمية التكوين المستمر في تحديث القطاع الفلاحي وضمان الأمن الغذائي للأجيال القادمة.</p>`,
];

const reportContentFr = [
  `<h2>Rapport annuel sur l'état de l'environnement en Tunisie</h2>
<h3>Résumé exécutif</h3>
<p>Le présent rapport dresse un état des lieux complet de la situation environnementale en Tunisie pour l'année 2026. Il s'appuie sur les données collectées par les différents organismes publics, les instituts de recherche et les organisations internationales partenaires.</p>
<h3>1. Qualité de l'air</h3>
<p>Les mesures effectuées dans les principales agglomérations tunisiennes montrent une tendance à l'amélioration de la qualité de l'air, bien que des dépassements ponctuels des normes restent observés, notamment à Tunis et Sfax durant la saison estivale. La concentration moyenne annuelle de particules fines PM2.5 s'établit à 28 μg/m³, en diminution de 12% par rapport à 2024.</p>
<h3>2. Ressources en eau</h3>
<p>La pluviométrie de l'année 2025-2026 a été légèrement supérieure à la moyenne, permettant un taux de remplissage des barrages de 58% en moyenne annuelle. Les nappes phréatiques restent toutefois sous pression, avec un déficit estimé à 250 millions de m³. La stratégie nationale de gestion intégrée des ressources en eau a permis d'améliorer l'efficience de l'irrigation de 15%.</p>
<h3>3. Biodiversité</h3>
<p>La Tunisie compte 17 parcs nationaux, 27 réserves naturelles et 4 réserves de biosphère. Les programmes de conservation ont permis la réintroduction réussie de l'oryx algazelle dans le parc national de Jbil et la stabilisation des populations de gazelles de Cuvier. Les aires marines protégées couvrent désormais 3,5% des eaux territoriales tunisiennes.</p>
<h3>4. Recommandations</h3>
<p>Le rapport formule 25 recommandations, dont le renforcement du réseau de surveillance de la qualité de l'air, l'accélération du Programme National d'Assainissement, et l'augmentation à 5% de la part des aires marines protégées d'ici 2028.</p>`,

  `<h2>Étude d'impact socio-économique de la transition énergétique</h2>
<h3>Introduction</h3>
<p>Cette étude, réalisée par un consortium d'instituts de recherche tunisiens et européens, évalue les impacts socio-économiques du déploiement des énergies renouvelables en Tunisie à l'horizon 2035.</p>
<h3>Méthodologie</h3>
<p>L'étude mobilise des modèles macroéconomiques, des analyses de filières et des enquêtes de terrain auprès de 500 entreprises et 2000 ménages dans six gouvernorats. Les scénarios étudiés comprennent un scénario de référence (prolongement des tendances) et un scénario ambitieux (objectif de 50% d'énergies renouvelables).</p>
<h3>Principaux résultats</h3>
<p>Dans le scénario ambitieux, la transition énergétique générerait 45 000 emplois directs et indirects d'ici 2030, principalement dans le solaire photovoltaïque (18 000), l'éolien (12 000) et l'efficacité énergétique (15 000). Le PIB supplémentaire cumulé serait de 12 milliards de dinars sur la période 2026-2035.</p>
<p>Les ménages bénéficieraient d'une réduction moyenne de 25% de leur facture énergétique grâce aux programmes d'efficacité énergétique et à l'autoconsommation solaire. Les émissions de CO₂ du secteur électrique diminueraient de 60% par rapport au niveau de référence.</p>
<h3>Recommandations</h3>
<p>L'étude recommande la mise en place d'un fonds de transition juste pour accompagner les secteurs affectés, le renforcement de la formation professionnelle dans les métiers verts, et l'instauration d'un cadre réglementaire stable pour attirer les investissements privés.</p>`,
];

const reportContentAr = [
  `<h2>ملخص التقرير</h2><p>تقرير سنوي شامل حول الوضع البيئي في تونس لسنة 2026. يغطي التقرير جودة الهواء والموارد المائية والتنوع البيولوجي وإدارة النفايات والطاقات المتجددة، مع تقديم توصيات عملية لتحسين الأداء البيئي للبلاد.</p><p>تشير النتائج إلى تحسن في عدة مؤشرات بيئية مع الإقرار بوجود تحديات كبيرة تتطلب جهوداً متواصلة واستثمارات إضافية.</p>`,
  `<h2>ملخص الدراسة</h2><p>دراسة معمقة لتقييم الآثار الاجتماعية والاقتصادية للانتقال الطاقي في تونس في أفق 2035. تحلل الدراسة فرص العمل والنمو الاقتصادي والحد من الانبعاثات المرتبطة بتطوير الطاقات المتجددة.</p><p>تقدم الدراسة توصيات لتعظيم المكاسب الاجتماعية والاقتصادية للانتقال الطاقي وضمان توزيع عادل لمنافعه على جميع فئات المجتمع.</p>`,
];

const podcastTitlesFr = [
  "Podcast Ecoterre : L'avenir énergétique de la Tunisie",
  "Entretien exclusif : La Tunisie face au défi climatique",
  "Les voix de l'écologie en Tunisie - Épisode spécial",
  "Podcast : Innovation et développement durable au Maghreb",
  "Grand entretien : Construire la Tunisie verte de demain",
  "Dialogue : Jeunesse tunisienne et engagement écologique",
  "Podcast : L'économie circulaire, une chance pour la Tunisie",
  "Entretien : Biodiversité méditerranéenne, le cas tunisien",
];

const podcastTitlesAr = [
  "بودكاست إيكوتير: مستقبل الطاقة في تونس",
  "لقاء حصري: تونس في مواجهة التحدي المناخي",
  "أصوات الإيكولوجيا في تونس - حلقة خاصة",
  "بودكاست: الابتكار والتنمية المستدامة في المغرب العربي",
  "حوار كبير: بناء تونس الخضراء للغد",
  "حوار: الشباب التونسي والالتزام البيئي",
  "بودكاست: الاقتصاد الدائري، فرصة لتونس",
  "لقاء: التنوع البيولوجي المتوسطي، الحالة التونسية",
];

const reportTitlesFr = [
  "Rapport 2026 : État de l'environnement en Tunisie",
  "Étude : Impact de la transition énergétique sur l'emploi",
  "Rapport : Gestion des ressources hydriques en Tunisie",
  "Analyse : Le secteur agricole tunisien face au climat",
  "Rapport spécial : Biodiversité et aires protégées",
  "Étude prospective : La Tunisie à l'horizon 2050",
];

const reportTitlesAr = [
  "تقرير 2026: حالة البيئة في تونس",
  "دراسة: أثر الانتقال الطاقي على التشغيل",
  "تقرير: إدارة الموارد المائية في تونس",
  "تحليل: القطاع الفلاحي التونسي في مواجهة المناخ",
  "تقرير خاص: التنوع البيولوجي والمناطق المحمية",
  "دراسة استشرافية: تونس في أفق 2050",
];

const reportExcerpts = [
  "Rapport annuel complet sur l'état de l'environnement en Tunisie : air, eau, biodiversité, déchets et énergie.",
  "Étude approfondie des impacts socio-économiques de la transition énergétique tunisienne à l'horizon 2035.",
  "Analyse détaillée de la gestion des ressources hydriques et des stratégies d'adaptation à la raréfaction de l'eau.",
  "Évaluation des vulnérabilités du secteur agricole tunisien face aux changements climatiques et propositions d'adaptation.",
  "État des lieux de la biodiversité tunisienne et bilan des programmes de conservation des aires protégées.",
  "Étude prospective sur les scénarios de développement durable pour la Tunisie à l'horizon 2050.",
];

function seed() {
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
  }

  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("busy_timeout = 5000");

  console.log("  Creating database schema...");
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'author',
      avatar TEXT,
      bio TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_fr TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      description_fr TEXT DEFAULT '',
      description_ar TEXT DEFAULT '',
      icon TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS articles (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      content_fr TEXT NOT NULL,
      content_ar TEXT NOT NULL,
      excerpt_fr TEXT DEFAULT '',
      excerpt_ar TEXT DEFAULT '',
      cover_image TEXT,
      audio_url TEXT,
      pdf_url TEXT,
      author_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      views INTEGER NOT NULL DEFAULT 0,
      reading_time INTEGER NOT NULL DEFAULT 0,
      is_featured INTEGER NOT NULL DEFAULT 0,
      published_at TEXT,
      scheduled_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS article_categories (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, category_id)
    );

    CREATE TABLE IF NOT EXISTS tags (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      name_fr TEXT NOT NULL,
      name_ar TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS article_tags (
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
      PRIMARY KEY (article_id, tag_id)
    );

    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      author_name TEXT NOT NULL,
      author_email TEXT NOT NULL,
      content TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS newsletters (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      subscribed INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT DEFAULT '',
      message TEXT NOT NULL,
      is_read INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS media (
      id TEXT PRIMARY KEY,
      filename TEXT NOT NULL,
      original_name TEXT NOT NULL,
      mime_type TEXT NOT NULL,
      size INTEGER NOT NULL,
      url TEXT NOT NULL,
      alt_text TEXT DEFAULT '',
      uploaded_by TEXT REFERENCES users(id),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS translations_cache (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      target_lang TEXT NOT NULL,
      content TEXT NOT NULL,
      title TEXT NOT NULL,
      excerpt TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(article_id, target_lang)
    );

    CREATE TABLE IF NOT EXISTS podcasts (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      description_fr TEXT DEFAULT '',
      description_ar TEXT DEFAULT '',
      audio_url TEXT,
      cover_image TEXT,
      author_id TEXT REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      duration INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS reports (
      id TEXT PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      title_fr TEXT NOT NULL,
      title_ar TEXT NOT NULL,
      content_fr TEXT NOT NULL,
      content_ar TEXT NOT NULL,
      excerpt_fr TEXT DEFAULT '',
      excerpt_ar TEXT DEFAULT '',
      cover_image TEXT,
      pdf_url TEXT,
      author_id TEXT NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'draft',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS views_log (
      id TEXT PRIMARY KEY,
      article_id TEXT NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
      ip_address TEXT,
      user_agent TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
    CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
    CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
    CREATE INDEX IF NOT EXISTS idx_articles_author_id ON articles(author_id);
    CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
    CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
    CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
    CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
    CREATE INDEX IF NOT EXISTS idx_article_categories_category ON article_categories(category_id);
    CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
    CREATE INDEX IF NOT EXISTS idx_contacts_is_read ON contacts(is_read);
    CREATE INDEX IF NOT EXISTS idx_media_uploaded_by ON media(uploaded_by);
    CREATE INDEX IF NOT EXISTS idx_newsletters_email ON newsletters(email);
    CREATE INDEX IF NOT EXISTS idx_views_log_article ON views_log(article_id);
  `);

  const now = new Date().toISOString();
  const hashedPassword = hashSync("ecoterre2026", 10);

  const totalArticles = 120;
  const podcastCount = 8;
  const reportCount = 6;
  const regularArticleCount = totalArticles - podcastCount - reportCount;

  const catMap = new Map<string, string>();
  const tagMap = new Map<string, string>();
  const authorIds = ["user_author_001", "user_author_002", "user_author_003", "user_admin_001", "user_editor_001"];

  const insertAll = db.transaction(() => {
    console.log("[1/10] Seeding users...");
    const insertUser = db.prepare(
      `INSERT INTO users (id, email, password, name, role, bio, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const u of users) {
      const createdAt = u.id === "user_admin_001" || u.id === "user_author_001" || u.id === "user_author_002"
        ? "2026-01-01T00:00:00.000Z"
        : randomDate(90);
      insertUser.run(u.id, u.email, hashedPassword, u.name, u.role, u.bio, createdAt, createdAt);
    }
    console.log(`       ${users.length} users inserted`);

    console.log("[2/10] Seeding categories...");
    const insertCategory = db.prepare(
      `INSERT INTO categories (id, slug, name_fr, name_ar, description_fr, description_ar, icon, sort_order, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    for (const c of categories) {
      catMap.set(c.slug, c.id);
      insertCategory.run(c.id, c.slug, c.name_fr, c.name_ar, c.description_fr, c.description_ar, c.icon, c.sort_order, now);
    }
    console.log(`       ${categories.length} categories inserted`);

    console.log("[3/10] Seeding tags...");
    const insertTag = db.prepare(
      `INSERT INTO tags (id, slug, name_fr, name_ar, created_at) VALUES (?, ?, ?, ?, ?)`
    );
    const allTags = [...tags];
    for (const t of allTags) {
      tagMap.set(t.slug, t.id);
      insertTag.run(t.id, t.slug, t.name_fr, t.name_ar, now);
    }
    console.log(`       ${allTags.length} tags inserted`);

    console.log("[4/10] Generating 120 articles...");
    const insertArticle = db.prepare(
      `INSERT INTO articles (id, slug, title_fr, title_ar, content_fr, content_ar, excerpt_fr, excerpt_ar, cover_image, audio_url, pdf_url, author_id, status, views, reading_time, is_featured, published_at, scheduled_at, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const insertArticleCat = db.prepare(
      `INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)`
    );
    const insertArticleTag = db.prepare(
      `INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)`
    );

    const publishedArticleIds: string[] = [];
    let articleCounter = 0;

    for (let i = 0; i < regularArticleCount; i++) {
      const a = generateArticleData(articleCounter, catMap, tagMap, authorIds);
      const createdAt = a.publishedAt ?? randomDate(180);
      const updatedAt = createdAt;

      insertArticle.run(
        a.id, a.slug, a.titleFr, a.titleAr, a.contentFr, a.contentAr,
        a.excerptFr, a.excerptAr, a.coverImage, null, null,
        a.authorId, a.status, a.views, a.readingTime, a.isFeatured,
        a.publishedAt, null, createdAt, updatedAt
      );

      for (const cid of a.categoryIds) {
        insertArticleCat.run(a.id, cid);
      }
      for (const tid of a.tagIds) {
        insertArticleTag.run(a.id, tid);
      }

      if (a.status === "published") {
        publishedArticleIds.push(a.id);
      }
      articleCounter++;
    }

    console.log("[5/10] Seeding 8 podcasts...");
    const podcastCatId = catMap.get("podcast")!;
    for (let i = 0; i < podcastCount; i++) {
      const slug = slugify(podcastTitlesFr[i]) + "-podcast-" + (i + 1);
      const titleFr = podcastTitlesFr[i];
      const titleAr = podcastTitlesAr[i];
      const contentFr = podcastContentFr[i % podcastContentFr.length];
      const contentAr = podcastContentAr[i % podcastContentAr.length];
      const excerptFr = contentFr.replace(/<[^>]*>/g, "").slice(0, 150).trim() + "...";
      const excerptAr = contentAr.replace(/<[^>]*>/g, "").slice(0, 100).trim() + "...";
      const coverImage = `https://picsum.photos/seed/podcast-${i + 1}/800/400`;
      const audioUrl = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${i + 1}.mp3`;
      const authorId = pick(authorIds);
      const duration = randomInt(900, 3600);
      const publishedAt = randomDate(180);
      const createdAt = publishedAt;
      const views = randomInt(100, 8000);

      const podId = `art_demo_podcast_${String(i + 1).padStart(2, "0")}`;

      insertArticle.run(
        podId, slug, titleFr, titleAr, contentFr, contentAr,
        excerptFr, excerptAr, coverImage, audioUrl, null,
        authorId, "published", views, Math.round(duration / 60),
        0, publishedAt, null, createdAt, createdAt
      );
      insertArticleCat.run(podId, podcastCatId);

      const tagSlugs = ["tunisie", "developpement-durable", "climat", "transition-energetique", "mediterranee"];
      const pickedTags = pickN(tagSlugs, randomInt(2, 4));
      for (const ts of pickedTags) {
        const tid = tagMap.get(ts);
        if (tid) insertArticleTag.run(podId, tid);
      }

      publishedArticleIds.push(podId);

      const insertPodcast = db.prepare(
        `INSERT INTO podcasts (id, slug, title_fr, title_ar, description_fr, description_ar, audio_url, cover_image, author_id, status, duration, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      insertPodcast.run(
        `pod_${String(i + 1).padStart(2, "0")}`,
        slug,
        titleFr,
        titleAr,
        excerptFr,
        excerptAr,
        audioUrl,
        coverImage,
        authorId,
        "published",
        duration,
        createdAt,
        createdAt
      );

      articleCounter++;
    }
    console.log(`       ${podcastCount} podcasts inserted`);

    console.log("[6/10] Seeding 6 reports...");
    const reportCatId = catMap.get("rapports")!;
    for (let i = 0; i < reportCount; i++) {
      const slug = slugify(reportTitlesFr[i]) + "-report-" + (i + 1);
      const titleFr = reportTitlesFr[i];
      const titleAr = reportTitlesAr[i];
      const contentFr = reportContentFr[i % reportContentFr.length];
      const contentAr = reportContentAr[i % reportContentAr.length];
      const excerptFr = reportExcerpts[i];
      const excerptAr = reportExcerpts[i].slice(0, 120).trim() + "...";
      const coverImage = `https://picsum.photos/seed/report-${i + 1}/800/400`;
      const pdfUrl = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
      const authorId = pick(authorIds);
      const publishedAt = randomDate(180);
      const createdAt = publishedAt;
      const views = randomInt(200, 6000);

      const repId = `art_demo_report_${String(i + 1).padStart(2, "0")}`;

      insertArticle.run(
        repId, slug, titleFr, titleAr, contentFr, contentAr,
        excerptFr, excerptAr, coverImage, null, pdfUrl,
        authorId, "published", views, calcReadingTime(contentFr),
        1, publishedAt, null, createdAt, createdAt
      );
      insertArticleCat.run(repId, reportCatId);

      const tagSlugs = ["tunisie", "developpement-durable", "climat", "investissement", "biodiversite"];
      const pickedTags = pickN(tagSlugs, randomInt(2, 4));
      for (const ts of pickedTags) {
        const tid = tagMap.get(ts);
        if (tid) insertArticleTag.run(repId, tid);
      }

      publishedArticleIds.push(repId);

      const insertReport = db.prepare(
        `INSERT INTO reports (id, slug, title_fr, title_ar, content_fr, content_ar, excerpt_fr, excerpt_ar, cover_image, pdf_url, author_id, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );
      insertReport.run(
        `rep_${String(i + 1).padStart(2, "0")}`,
        slug,
        titleFr,
        titleAr,
        contentFr,
        contentAr,
        excerptFr,
        excerptAr,
        coverImage,
        pdfUrl,
        authorId,
        "published",
        createdAt,
        createdAt
      );

      articleCounter++;
    }
    console.log(`       ${reportCount} reports inserted`);

    console.log("\n  Article generation summary:");
    console.log(`       Regular articles: ${regularArticleCount}`);
    console.log(`       Podcasts:         ${podcastCount}`);
    console.log(`       Reports:          ${reportCount}`);
    console.log(`       Total articles:   ${totalArticles}`);

    console.log("\n[7/10] Seeding 50 comments...");
    const insertComment = db.prepare(
      `INSERT INTO comments (id, article_id, author_name, author_email, content, status, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (let i = 0; i < 50; i++) {
      const cmt = pick(commentTemplates);
      const articleId = pick(publishedArticleIds);
      const text = cmt.texts[i % cmt.texts.length];
      const status = Math.random() < 0.8 ? "approved" : "pending";
      const createdAt = randomDate(90);
      insertComment.run(
        `cmt_${String(i + 1).padStart(3, "0")}`,
        articleId,
        cmt.name,
        cmt.email,
        text,
        status,
        createdAt
      );
    }
    console.log(`       50 comments inserted`);

    console.log("[8/10] Seeding newsletter subscribers...");
    const insertNewsletter = db.prepare(
      `INSERT INTO newsletters (id, email, subscribed, created_at) VALUES (?, ?, 1, ?)`
    );
    for (let i = 0; i < newsletterEmails.length; i++) {
      insertNewsletter.run(
        `nl_${String(i + 1).padStart(3, "0")}`,
        newsletterEmails[i],
        randomDate(120)
      );
    }
    console.log(`       ${newsletterEmails.length} subscribers inserted`);

    console.log("[9/10] Seeding contact messages...");
    const insertContact = db.prepare(
      `INSERT INTO contacts (id, name, email, subject, message, is_read, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    );
    for (let i = 0; i < contactMessages.length; i++) {
      const msg = contactMessages[i];
      insertContact.run(
        `contact_${String(i + 1).padStart(3, "0")}`,
        msg.name,
        msg.email,
        msg.subject,
        msg.message,
        msg.isRead,
        randomDate(60)
      );
    }
    console.log(`       ${contactMessages.length} messages inserted`);

    console.log("[10/10] Seeding settings and media...");
    const insertSetting = db.prepare(
      `INSERT INTO settings (key, value, updated_at) VALUES (?, ?, ?)`
    );
    insertSetting.run("site_name", "Ecoterre", now);
    insertSetting.run("site_description", "Portail d'actualités sur l'environnement et le développement durable en Tunisie", now);
    insertSetting.run("site_email", "contact@ecoterre.com", now);
    insertSetting.run("site_phone", "+216 71 000 000", now);
    insertSetting.run("site_address", "Avenue de l'Environnement, Tunis, Tunisie", now);
    insertSetting.run("social_facebook", "https://facebook.com/ecoterre.tn", now);
    insertSetting.run("social_twitter", "https://twitter.com/ecoterre_tn", now);
    insertSetting.run("social_linkedin", "https://linkedin.com/company/ecoterre", now);
    insertSetting.run("social_instagram", "https://instagram.com/ecoterre.tn", now);
    insertSetting.run("social_youtube", "https://youtube.com/@ecoterre.tn", now);
    console.log(`       10 settings inserted`);

    const insertMedia = db.prepare(
      `INSERT INTO media (id, filename, original_name, mime_type, size, url, alt_text, uploaded_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );
    const mediaEntries = [
      { filename: "solar-energy.jpg", original: "panneaux-solaires-tunisie.jpg", url: "https://picsum.photos/seed/solar/800/400", alt: "Panneaux solaires en Tunisie", uploadedBy: "user_admin_001" },
      { filename: "gabes-gulf.jpg", original: "golfe-gabes.jpg", url: "https://picsum.photos/seed/gabes/800/400", alt: "Golfe de Gabès", uploadedBy: "user_author_002" },
      { filename: "economy-growth.jpg", original: "croissance-economique.jpg", url: "https://picsum.photos/seed/economy/800/400", alt: "Croissance économique", uploadedBy: "user_author_001" },
      { filename: "forest-tunisia.jpg", original: "foret-tunisie.jpg", url: "https://picsum.photos/seed/forest/800/400", alt: "Forêt tunisienne", uploadedBy: "user_admin_001" },
      { filename: "olive-harvest.jpg", original: "recolte-olives.jpg", url: "https://picsum.photos/seed/olives/800/400", alt: "Récolte d'olives en Tunisie", uploadedBy: "user_author_003" },
      { filename: "sousse-beach.jpg", original: "plage-sousse.jpg", url: "https://picsum.photos/seed/sousse/800/400", alt: "Plage de Sousse", uploadedBy: "user_admin_001" },
      { filename: "tunis-medina.jpg", original: "medina-tunis.jpg", url: "https://picsum.photos/seed/medina/800/400", alt: "Médina de Tunis", uploadedBy: "user_editor_001" },
      { filename: "desert-tunisia.jpg", original: "desert-tunisien.jpg", url: "https://picsum.photos/seed/desert/800/400", alt: "Désert tunisien", uploadedBy: "user_author_002" },
      { filename: "kairouan-mosque.jpg", original: "mosquee-kairouan.jpg", url: "https://picsum.photos/seed/kairouan/800/400", alt: "Grande Mosquée de Kairouan", uploadedBy: "user_admin_001" },
      { filename: "wind-farm.jpg", original: "parc-eolien.jpg", url: "https://picsum.photos/seed/windfarm/800/400", alt: "Parc éolien tunisien", uploadedBy: "user_author_001" },
    ];

    for (let i = 0; i < mediaEntries.length; i++) {
      const m = mediaEntries[i];
      insertMedia.run(
        `media_${String(i + 1).padStart(3, "0")}`,
        m.filename,
        m.original,
        "image/jpeg",
        randomInt(50000, 500000),
        m.url,
        m.alt,
        m.uploadedBy,
        randomDate(180)
      );
    }
    console.log(`       ${mediaEntries.length} media entries inserted`);
  });

  insertAll();

  const counts = {
    users: (db.prepare("SELECT COUNT(*) as c FROM users").get() as { c: number }).c,
    categories: (db.prepare("SELECT COUNT(*) as c FROM categories").get() as { c: number }).c,
    tags: (db.prepare("SELECT COUNT(*) as c FROM tags").get() as { c: number }).c,
    articles: (db.prepare("SELECT COUNT(*) as c FROM articles").get() as { c: number }).c,
    published: (db.prepare("SELECT COUNT(*) as c FROM articles WHERE status = 'published'").get() as { c: number }).c,
    drafts: (db.prepare("SELECT COUNT(*) as c FROM articles WHERE status = 'draft'").get() as { c: number }).c,
    comments: (db.prepare("SELECT COUNT(*) as c FROM comments").get() as { c: number }).c,
    approved: (db.prepare("SELECT COUNT(*) as c FROM comments WHERE status = 'approved'").get() as { c: number }).c,
    pendingComment: (db.prepare("SELECT COUNT(*) as c FROM comments WHERE status = 'pending'").get() as { c: number }).c,
    newsletters: (db.prepare("SELECT COUNT(*) as c FROM newsletters").get() as { c: number }).c,
    contacts: (db.prepare("SELECT COUNT(*) as c FROM contacts").get() as { c: number }).c,
    media: (db.prepare("SELECT COUNT(*) as c FROM media").get() as { c: number }).c,
    settings: (db.prepare("SELECT COUNT(*) as c FROM settings").get() as { c: number }).c,
    podcasts: (db.prepare("SELECT COUNT(*) as c FROM podcasts").get() as { c: number }).c,
    reports: (db.prepare("SELECT COUNT(*) as c FROM reports").get() as { c: number }).c,
  };

  const totalViews = (db.prepare("SELECT COALESCE(SUM(views), 0) as c FROM articles").get() as { c: number }).c;

  console.log("\n========================================");
  console.log("    Ecoterre Demo Database - Summary");
  console.log("========================================");
  console.log(`  Users:               ${counts.users}`);
  console.log(`  Categories:          ${counts.categories}`);
  console.log(`  Tags:                ${counts.tags}`);
  console.log(`  Articles:            ${counts.articles} (${counts.published} published, ${counts.drafts} drafts)`);
  console.log(`  Podcasts:            ${counts.podcasts}`);
  console.log(`  Reports:             ${counts.reports}`);
  console.log(`  Comments:            ${counts.comments} (${counts.approved} approved, ${counts.pendingComment} pending)`);
  console.log(`  Newsletter subs:     ${counts.newsletters}`);
  console.log(`  Contact messages:    ${counts.contacts}`);
  console.log(`  Media:               ${counts.media}`);
  console.log(`  Settings:            ${counts.settings}`);
  console.log(`  Total views:         ${totalViews.toLocaleString()}`);
  console.log("========================================");
  console.log("\n  Demo accounts (password: ecoterre2026):");
  console.log("    admin@ecoterre.com   (admin)");
  console.log("    auteur1@ecoterre.com (author)");
  console.log("    auteur2@ecoterre.com (author)");
  console.log("    auteur3@ecoterre.com (author)");
  console.log("    editor1@ecoterre.com (editor)");
  console.log("    editor2@ecoterre.com (editor)");
  console.log("\n  Database seeded successfully!\n");

  db.close();
}

seed();

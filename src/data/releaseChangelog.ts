import type { AppLanguage } from '../services/launcherSettings';
import type { DesktopReleaseHistoryEntry } from '../services/desktopUpdater';

export type ChangelogCategory = 'feature' | 'improvement' | 'fix';

export interface ReleaseNoteItem {
  category: ChangelogCategory;
  title: string;
  description: string;
}

export interface ReleaseChangelogEntry {
  version: string;
  releaseTitle: string;
  summary: string;
  publishedAt?: string | null;
  htmlUrl?: string | null;
  source?: 'github' | 'local';
  items: ReleaseNoteItem[];
}

const LOCAL_CHANGELOG: Record<string, Record<AppLanguage, ReleaseChangelogEntry>> = {
  '1.0.3': {
    en: {
      version: '1.0.3',
      releaseTitle: 'Hardware Monitor, Gaming Telemetry & PresentMon Manager',
      summary:
        'Adds universal Hardware Monitor, Gaming Performance & Bottleneck Analyzer, Intel PresentMon Auto-Manager, Top Bar reorganization, and Custom Theme Builder.',
      publishedAt: '2026-11-24T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Hardware Monitor & Gaming Performance Center',
          description:
            'Real-time CPU, GPU (NVIDIA/AMD/Intel), RAM, Storage, and Network telemetry with live FPS, 1% Low, frame-time pacing, bottleneck diagnostics, and PC Cleaner.',
        },
        {
          category: 'feature',
          title: 'Automatic Intel PresentMon Installation & Update Manager',
          description:
            'Automatically detects, verifies (SHA-256 + Intel Authenticode), installs, updates, and repairs PresentMon from official GitHub releases with user consent.',
        },
        {
          category: 'feature',
          title: 'Custom Default Theme Builder & Streamlined Top Navigation',
          description:
            'Customize accent colors, surfaces, button geometry, and glass blur; quick-access Downloads, Hardware Monitor, and Settings moved cleanly to the top utility bar.',
        },
        {
          category: 'improvement',
          title: 'Update History & Live Notification Center',
          description:
            'Browse full version history and changelogs alongside live catalog notifications across Important Release tabs and Upcoming/Popular News tabs.',
        },
      ],
    },
    fr: {
      version: '1.0.3',
      releaseTitle: 'Moniteur Matériel, Télémétrie Gaming & PresentMon Auto',
      summary:
        'Ajoute le Moniteur Matériel universel, l’analyseur de performance et goulots d’étranglement, le gestionnaire PresentMon, le créateur de thème et les notifications.',
      publishedAt: '2026-11-24T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Moniteur Matériel & Centre de Performance Gaming',
          description:
            'Suivi en temps réel CPU, GPU (NVIDIA/AMD/Intel), RAM, stockage, réseau, FPS en direct (1% Low / frame-time), diagnostic de goulots et nettoyeur PC.',
        },
        {
          category: 'feature',
          title: 'Gestionnaire automatique Intel PresentMon',
          description:
            'Détecte, vérifie (SHA-256 + signature Intel), installe, met à jour et répare PresentMon depuis GitHub officiel avec consentement utilisateur.',
        },
        {
          category: 'feature',
          title: 'Créateur de thème personnalisé & barre supérieure épurée',
          description:
            'Personnalisation des couleurs, surfaces et boutons ; accès rapide Téléchargements, Moniteur Matériel et Paramètres intégré à la barre supérieure.',
        },
        {
          category: 'improvement',
          title: 'Historique des versions & Centre de notifications',
          description:
            'Consultez toutes les versions précédentes et recevez les nouveautés du catalogue en direct (onglets importants et actualités).',
        },
      ],
    },
    es: {
      version: '1.0.3',
      releaseTitle: 'Monitor de Hardware, Rendimiento Gaming y PresentMon',
      summary:
        'Incluye Monitor de Hardware universal, analizador de rendimiento y cuellos de botella, gestor automático de PresentMon, creador de temas y centro de notificaciones.',
      publishedAt: '2026-11-24T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Monitor de Hardware y Centro de Rendimiento Gaming',
          description:
            'Lectura en tiempo real de CPU, GPU (NVIDIA/AMD/Intel), RAM, almacenamiento, red, FPS en vivo (1% Low / frame-time), análisis de cuello de botella y limpiador PC.',
        },
        {
          category: 'feature',
          title: 'Gestor automático de Intel PresentMon',
          description:
            'Detecta, verifica (SHA-256 + firma Intel), instala, actualiza y repara PresentMon desde GitHub oficial con aprobación del usuario.',
        },
        {
          category: 'feature',
          title: 'Creador de temas y barra superior optimizada',
          description:
            'Personaliza acentos, superficies y botones; acceso rápido a Descargas, Monitor de Hardware y Ajustes junto al botón de pantalla completa.',
        },
        {
          category: 'improvement',
          title: 'Historial de actualizaciones y Centro de Notificaciones',
          description:
            'Consulta versiones anteriores y sus cambios junto a alertas en vivo del catálogo para pestañas clave y noticias.',
        },
      ],
    },
    ar: {
      version: '1.0.3',
      releaseTitle: 'مراقب العتاد وأداء الألعاب ومدير PresentMon التلقائي',
      summary:
        'يضيف هذا الإصدار مراقب العتاد الشامل، ومحلل اختناق الأداء في الألعاب، ومدير PresentMon التلقائي، ومنشئ المظهر المخصص، وسجل التحديثات ومركز الإشعارات.',
      publishedAt: '2026-11-24T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'مراقب العتاد ومركز أداء الألعاب الشامل',
          description:
            'قراءة حية للمعالج وكرت الشاشة (NVIDIA/AMD/Intel) والذاكرة والأقراص والشبكة مع قياس الإطارات FPS واستقرار الإطار وتحليل الاختناق ومنظف النظام.',
        },
        {
          category: 'feature',
          title: 'التثبيت والتحديث التلقائي لأداة Intel PresentMon',
          description:
            'كشف وتنزيل والتحقق (SHA-256 + توقيع Intel) وتحديث وإصلاح PresentMon تلقائياً من GitHub الرسمي بموافقة المستخدم.',
        },
        {
          category: 'feature',
          title: 'منشئ المظهر المخصص وتنظيم الشريط العلوي',
          description:
            'تخصيص الألوان والأزرار والأسطح مع نقل التنزيلات ومراقب العتاد والإعدادات للشريط العلوي لتوسيع شريط التنقل الرئيسي.',
        },
        {
          category: 'improvement',
          title: 'سجل التحديثات ومركز الإشعارات المباشرة',
          description:
            'استعراض كافة الإصدارات السابقة وتغييراتها مع تنبيهات حية من تبويبات الألعاب المهمة وتبويبات الأخبار والقادم.',
        },
      ],
    },
  },
  '1.0.2': {
    en: {
      version: '1.0.2',
      releaseTitle: 'Automated qBittorrent Setup, Welcome Wizard & Sync Fixes',
      summary:
        'Introduced one-click automated qBittorrent detection & installation, guided first-launch onboarding, and live Download Activity telemetry.',
      publishedAt: '2026-10-18T14:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Automatic qBittorrent Detection & Setup Manager',
          description:
            'Detects Windows Registry & install paths, verifies digital signatures from official GitHub releases, configures Web UI, and installs silently with consent.',
        },
        {
          category: 'feature',
          title: 'First-Launch Guided Welcome Setup',
          description:
            'Step-by-step onboarding covering SecretArea introduction, Theme & Language preferences, and automated qBittorrent Web UI verification.',
        },
        {
          category: 'improvement',
          title: 'Download Speed Activity Graph & 9-Field Telemetry',
          description:
            'Added animated DL/UL speed graph, Seeds/Peers/Ratio counters, and ETA formatting inside the Downloads tab.',
        },
        {
          category: 'fix',
          title: 'qBittorrent 5.x Hash Tracking & SafeStorage',
          description:
            'Resolved /api/v2/torrents/info tracking edge cases and encrypted stored credentials with Electron safeStorage.',
        },
      ],
    },
    fr: {
      version: '1.0.2',
      releaseTitle: 'Installation auto qBittorrent, Assistant d’accueil & Sync',
      summary:
        'Introduction de la détection et installation automatique de qBittorrent, de l’assistant de premier lancement et du suivi DL/UL avancé.',
      publishedAt: '2026-10-18T14:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Gestionnaire automatique qBittorrent',
          description:
            'Détection du registre Windows, vérification de signature depuis GitHub officiel, installation silencieuse et configuration Web UI.',
        },
        {
          category: 'feature',
          title: 'Assistant de bienvenue au premier lancement',
          description:
            'Configuration guidée des thèmes, de la langue et de la connexion qBittorrent dès la première ouverture.',
        },
        {
          category: 'improvement',
          title: 'Graphique de vitesse & télémétrie complète',
          description:
            'Ajout du graphique DL/UL en direct, compteurs Seeds/Peers/Ratio et temps restant estimé.',
        },
        {
          category: 'fix',
          title: 'Synchronisation qBittorrent 5.x & safeStorage',
          description:
            'Correction du suivi par hash via /api/v2/torrents/info et chiffrement local des identifiants.',
        },
      ],
    },
    es: {
      version: '1.0.2',
      releaseTitle: 'Instalación automática qBittorrent y Bienvenida guiada',
      summary:
        'Incorpora detección e instalación automática de qBittorrent, asistente de primer inicio y telemetría de velocidad en tiempo real.',
      publishedAt: '2026-10-18T14:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Instalador automático de qBittorrent',
          description:
            'Detecta versiones en Windows, verifica firma oficial de GitHub, configura Web UI e instala silenciosamente.',
        },
        {
          category: 'feature',
          title: 'Asistente de bienvenida inicial',
          description:
            'Guía paso a paso de SecretArea, selección de idioma/tema y prueba en vivo de qBittorrent.',
        },
        {
          category: 'improvement',
          title: 'Gráfico de velocidad de descarga',
          description:
            'Gráfico animado de bajada/subida, semillas, pares, ratio y ETA en el gestor de descargas.',
        },
        {
          category: 'fix',
          title: 'Corrección de sincronización qBittorrent 5.x',
          description:
            'Seguimiento exacto por hash mediante /api/v2/torrents/info y credenciales cifradas.',
        },
      ],
    },
    ar: {
      version: '1.0.2',
      releaseTitle: 'التثبيت التلقائي لـ qBittorrent ومعالج الترحيب الأولي',
      summary:
        'إضافة الكشف والتثبيت التلقائي لـ qBittorrent وإعداد الترحيب الأولي ومخطط سرعة التنزيل الحي.',
      publishedAt: '2026-10-18T14:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'نظام التثبيت والتحديث التلقائي لـ qBittorrent',
          description:
            'كشف التثبيت في ويندوز والتحقق من التوقيع الرقمي الرسمي من GitHub وتهيئة Web UI تلقائياً.',
        },
        {
          category: 'feature',
          title: 'معالج الترحيب وإعداد المظهر الأولي',
          description:
            'جولة ترحيبية تشرح خطوات التخصيص والربط التلقائي مع مدير التحميل عند التشغيل الأول.',
        },
        {
          category: 'improvement',
          title: 'مخطط سرعة التنزيل والرفع المباشر',
          description:
            'إضافة مخطط سرعة متحرك مع عرض البذور والأقران والنسبة والوقت المتبقي.',
        },
        {
          category: 'fix',
          title: 'إصلاح مزامنة qBittorrent 5.x',
          description:
            'تتبع دقيق عبر /api/v2/torrents/info مع تشفير بيانات الدخول محلياً.',
        },
      ],
    },
  },
  '1.0.1': {
    en: {
      version: '1.0.1',
      releaseTitle: 'PS5 & Xbox Console Themes, Soundscapes & Smart Search',
      summary:
        'Expanded launcher theming with PS5 Cosmic Horizon and Xbox Nexus modes, synthesized UI audio, and fuzzy smart search.',
      publishedAt: '2026-09-12T10:30:00Z',
      items: [
        {
          category: 'feature',
          title: 'PS5 & Xbox Console Themes + Ambient Soundscapes',
          description:
            'Added dedicated PlayStation 5 sapphire and Xbox emerald themes with synthesized ambient music and interactive UI sound effects.',
        },
        {
          category: 'improvement',
          title: 'Smart Catalog Search & Can Run It Evaluation',
          description:
            'Introduced alias-aware fuzzy game search (e.g. GTA, RDR2, BG3) and automatic PC hardware requirement comparison.',
        },
        {
          category: 'fix',
          title: 'Offline IndexedDB Cache & RTL Alignment',
          description:
            'Improved offline sheet caching sanitization and refined Arabic RTL mirror and sidebar spacing.',
        },
      ],
    },
    fr: {
      version: '1.0.1',
      releaseTitle: 'Thèmes PS5 & Xbox, Paysages sonores & Recherche intelligente',
      summary:
        'Ajout des thèmes console PS5 et Xbox avec audio d’ambiance synthétisé, recherche tolérante et compatibilité PC.',
      publishedAt: '2026-09-12T10:30:00Z',
      items: [
        {
          category: 'feature',
          title: 'Thèmes console PS5 & Xbox avec effets audio',
          description:
            'Modes visuels PS5 saphir et Xbox émeraude accompagnés de musiques ambiantes et sons de navigation.',
        },
        {
          category: 'improvement',
          title: 'Recherche intelligente & compatibilité PC',
          description:
            'Recherche par alias et fautes de frappe avec comparaison automatique des configurations minimales.',
        },
        {
          category: 'fix',
          title: 'Cache hors-ligne IndexedDB & mise en page RTL',
          description:
            'Fiabilisation du cache hors-ligne et amélioration de l’alignement RTL en arabe.',
        },
      ],
    },
    es: {
      version: '1.0.1',
      releaseTitle: 'Temas PS5 y Xbox, Audio de Consola y Búsqueda Inteligente',
      summary:
        'Nuevos modos visuales PS5 y Xbox con paisajes sonoros, búsqueda inteligente por alias y comprobación Can Run It.',
      publishedAt: '2026-09-12T10:30:00Z',
      items: [
        {
          category: 'feature',
          title: 'Temas de consola PS5 y Xbox con audio',
          description:
            'Interfaces dedicadas PS5 y Xbox con música ambiental sintetizada y sonidos de navegación.',
        },
        {
          category: 'improvement',
          title: 'Búsqueda inteligente y Can Run It',
          description:
            'Soporte de alias frecuentes y comparación automática de requisitos contra el hardware del equipo.',
        },
        {
          category: 'fix',
          title: 'Caché IndexedDB y ajustes RTL',
          description:
            'Mayor estabilidad offline y correcciones de alineación RTL en árabe.',
        },
      ],
    },
    ar: {
      version: '1.0.1',
      releaseTitle: 'سمات PS5 و Xbox والمؤثرات الصوتية والبحث الذكي',
      summary:
        'إضافة سمات منصات PS5 و Xbox مع موسيقى محيطية ومؤثرات صوتية للواجهة وبحث ذكي ومقارنة مواصفات التشغيل.',
      publishedAt: '2026-09-12T10:30:00Z',
      items: [
        {
          category: 'feature',
          title: 'سمات PS5 و Xbox مع الصوت المحيطي',
          description:
            'توفير تصاميم مستوحاة من أجهزة الألعاب مع أزرار صوتية وموسيقى خلفية مخصصة.',
        },
        {
          category: 'improvement',
          title: 'البحث الذكي وفحص تشغيل الألعاب',
          description:
            'بحث يدعم الاختصارات والأخطاء الإملائية مع مقارنة المتطلبات بمواصفات الجهاز تلقائياً.',
        },
        {
          category: 'fix',
          title: 'تحسين التخزين المؤقت بدون إنترنت واتجاه RTL',
          description:
            'تنظيف وتخزين الكتالوج عبر IndexedDB وتحسين تناسق اللغة العربية.',
        },
      ],
    },
  },
  '1.0.0': {
    en: {
      version: '1.0.0',
      releaseTitle: 'Initial SecretArea Desktop Release',
      summary:
        'First public desktop release of SecretArea featuring live catalog sync, multi-mirror downloads, trailers, and community requests.',
      publishedAt: '2026-08-01T10:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Unified Game & Repack Catalog',
          description:
            'Live synchronization across catalog tabs for Games, Hypervisor, SteamTools, PS5, Tools, Savegames, Upcoming releases, and Studios.',
        },
        {
          category: 'feature',
          title: 'Desktop Download Manager & Mirror Aggregation',
          description:
            'Built-in Electron download queue supporting direct links, MediaFire, Mega archives, Magnet links, and Windows tray minimization.',
        },
        {
          category: 'feature',
          title: 'Multi-Language Support & Auto-Updater',
          description:
            'Full localization across English, French, Spanish, and Arabic (RTL) alongside GitHub Releases auto-update integration.',
        },
      ],
    },
    fr: {
      version: '1.0.0',
      releaseTitle: 'Première version officielle SecretArea Desktop',
      summary:
        'Première version bureau avec synchronisation du catalogue en direct, téléchargements multi-miroirs, bandes-annonces et demandes.',
      publishedAt: '2026-08-01T10:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Catalogue unifié jeux & repacks',
          description:
            'Synchronisation en direct des onglets Jeux, Hypervisor, SteamTools, PS5, Outils, Sauvegardes, À venir et Studios.',
        },
        {
          category: 'feature',
          title: 'Gestionnaire de téléchargement multi-miroirs',
          description:
            'File d’attente Electron pour liens directs, MediaFire, Mega, magnets et réduction dans la zone de notification.',
        },
        {
          category: 'feature',
          title: 'Multilingue & mises à jour automatiques',
          description:
            'Prise en charge complète anglais, français, espagnol et arabe (RTL) avec mises à jour GitHub Releases.',
        },
      ],
    },
    es: {
      version: '1.0.0',
      releaseTitle: 'Lanzamiento inicial de SecretArea Desktop',
      summary:
        'Primera versión de escritorio con sincronización de catálogo en vivo, descargas multimirror, tráileres y sección de solicitudes.',
      publishedAt: '2026-08-01T10:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Catálogo unificado de juegos y repacks',
          description:
            'Conexión en vivo del catálogo para Juegos, Hypervisor, SteamTools, PS5, Herramientas, Partidas, Próximos y Estudios.',
        },
        {
          category: 'feature',
          title: 'Gestor de descargas y múltiples servidores',
          description:
            'Cola nativa en Electron compatible con enlaces directos, MediaFire, Mega, Magnet y bandeja del sistema.',
        },
        {
          category: 'feature',
          title: 'Multilenguaje y actualizador automático',
          description:
            'Traducción completa en inglés, francés, español y árabe (RTL) junto a actualizaciones vía GitHub Releases.',
        },
      ],
    },
    ar: {
      version: '1.0.0',
      releaseTitle: 'الإصدار الأول من SecretArea Desktop',
      summary:
        'الإطلاقة الأولى لتطبيق سطح المكتب مع مزامنة الكتالوج المباشرة، وتنزيلات متعددة الروابط، وطلبات الألعاب.',
      publishedAt: '2026-08-01T10:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'كتالوج موحد للألعاب والأدوات',
          description:
            'مزامنة حية لتبويبات الألعاب وHypervisor وSteamTools وPS5 والأدوات والتخزينات والألعاب القادمة والاستوديوهات.',
        },
        {
          category: 'feature',
          title: 'مدير تنزيل مدمج متعدد المصادر',
          description:
            'دعم الروابط المباشرة وMediaFire وMega وروابط Magnet مع إمكانية التصغير لشريط النظام.',
        },
        {
          category: 'feature',
          title: 'دعم 4 لغات وتحديث تلقائي',
          description:
            'واجهة مترجمة للإنجليزية والفرنسية والإسبانية والعربية (RTL) مع نظام تحديث تلقائي عبر GitHub.',
        },
      ],
    },
  },
};

export function compareReleaseVersions(a: string, b: string): number {
  const pa = a
    .replace(/^v/i, '')
    .trim()
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const pb = b
    .replace(/^v/i, '')
    .trim()
    .split('.')
    .map((n) => parseInt(n, 10) || 0);
  const len = Math.max(pa.length, pb.length, 3);
  for (let i = 0; i < len; i++) {
    const va = pa[i] || 0;
    const vb = pb[i] || 0;
    if (va > vb) return 1;
    if (va < vb) return -1;
  }
  return 0;
}

function inferCategoryFromText(text: string): ChangelogCategory {
  const lower = text.toLowerCase();
  if (
    lower.includes('fix') ||
    lower.includes('bug') ||
    lower.includes('resolve') ||
    lower.includes('patch') ||
    lower.includes('إصلاح')
  ) {
    return 'fix';
  }
  if (
    lower.includes('improv') ||
    lower.includes('updat') ||
    lower.includes('enhanc') ||
    lower.includes('optim') ||
    lower.includes('تحسين')
  ) {
    return 'improvement';
  }
  return 'feature';
}

export function parseGithubReleaseNotes(
  version: string,
  language: AppLanguage,
  releaseName?: string | null,
  rawNotes?: string | null,
  publishedAt?: string | null,
  htmlUrl?: string | null
): ReleaseChangelogEntry {
  const cleanVer = version.replace(/^v/i, '').trim() || '1.0.3';
  const localVersionEntry = LOCAL_CHANGELOG[cleanVer]?.[language] || LOCAL_CHANGELOG[cleanVer]?.en;

  if (!rawNotes || !rawNotes.trim()) {
    if (localVersionEntry) {
      return {
        ...localVersionEntry,
        publishedAt: publishedAt || localVersionEntry.publishedAt || null,
        htmlUrl: htmlUrl || null,
        source: htmlUrl ? 'github' : 'local',
      };
    }
    return createGenericVersionEntry(cleanVer, language, releaseName, publishedAt, htmlUrl);
  }

  const lines = rawNotes
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const items: ReleaseNoteItem[] = [];
  let activeCategory: ChangelogCategory = 'feature';

  for (const line of lines) {
    if (/^#{1,4}\s+/.test(line)) {
      activeCategory = inferCategoryFromText(line);
      continue;
    }

    const bulletMatch = line.match(/^(?:[-*•+]|\d+\.)\s+(.+)$/);
    const cleanText = (bulletMatch ? bulletMatch[1] : line)
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .trim();

    if (!cleanText || cleanText.length < 4) continue;
    if (/^full changelog:/i.test(cleanText)) continue;

    const colonIdx = cleanText.indexOf(':');
    const title =
      colonIdx > 2 && colonIdx < 48
        ? cleanText.slice(0, colonIdx).trim()
        : cleanText.slice(0, 68).trim();
    const description =
      colonIdx > 2 && colonIdx < 48
        ? cleanText.slice(colonIdx + 1).trim()
        : '';

    items.push({
      category: inferCategoryFromText(`${activeCategory} ${cleanText}`),
      title,
      description: description || cleanText,
    });

    if (items.length >= 12) break;
  }

  if (items.length === 0) {
    return (
      (localVersionEntry && {
        ...localVersionEntry,
        publishedAt: publishedAt || localVersionEntry.publishedAt || null,
        htmlUrl: htmlUrl || null,
        source: htmlUrl ? 'github' : 'local',
      }) || createGenericVersionEntry(cleanVer, language, releaseName, publishedAt, htmlUrl)
    );
  }

  const fallbackSummary =
    localVersionEntry?.summary ||
    (language === 'fr'
      ? `Nouveautés et améliorations incluses dans SecretArea v${cleanVer}.`
      : language === 'es'
      ? `Novedades y mejoras incluidas en SecretArea v${cleanVer}.`
      : language === 'ar'
      ? `أبرز الإضافات والتحسينات الجديدة في SecretArea v${cleanVer}.`
      : `Highlights, new features, and fixes included in SecretArea v${cleanVer}.`);

  return {
    version: cleanVer,
    releaseTitle: releaseName?.trim() || localVersionEntry?.releaseTitle || `SecretArea v${cleanVer}`,
    summary: fallbackSummary,
    publishedAt: publishedAt || localVersionEntry?.publishedAt || null,
    htmlUrl: htmlUrl || null,
    source: htmlUrl ? 'github' : 'local',
    items,
  };
}

export function buildMergedReleaseHistory({
  language,
  remoteReleases = [],
}: {
  language: AppLanguage;
  remoteReleases?: DesktopReleaseHistoryEntry[];
}): ReleaseChangelogEntry[] {
  const byVersion = new Map<string, ReleaseChangelogEntry>();

  // Seed with documented local release archive first
  for (const ver of Object.keys(LOCAL_CHANGELOG)) {
    const entry = LOCAL_CHANGELOG[ver]?.[language] || LOCAL_CHANGELOG[ver]?.en;
    if (entry) {
      byVersion.set(ver, {
        ...entry,
        source: 'local',
      });
    }
  }

  // Merge/override with live GitHub Releases entries when available
  for (const rel of remoteReleases) {
    const cleanVer = String(rel.version || '').replace(/^v/i, '').trim();
    if (!cleanVer) continue;
    const parsed = parseGithubReleaseNotes(
      cleanVer,
      language,
      rel.releaseName,
      rel.notes,
      rel.publishedAt,
      rel.htmlUrl
    );
    byVersion.set(cleanVer, {
      ...parsed,
      source: rel.source === 'github' ? 'github' : parsed.source || 'local',
    });
  }

  return Array.from(byVersion.values()).sort((a, b) =>
    compareReleaseVersions(b.version, a.version)
  );
}

export async function fetchPublicReleaseHistory(): Promise<DesktopReleaseHistoryEntry[]> {
  try {
    const res = await fetch(
      'https://api.github.com/repos/secretarea1337/secretarea-desktop/releases?per_page=25',
      {
        headers: {
          Accept: 'application/vnd.github+json',
        },
      }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(data)) return [];
    return data
      .filter((rel) => rel && !rel.draft)
      .map((rel) => {
        const rawTag = String(rel.tag_name || rel.name || '').trim();
        const version = rawTag.replace(/^v/i, '').trim();
        const rawBody = typeof rel.body === 'string' ? rel.body.trim() : '';
        return {
          version,
          tagName: rawTag || (version ? `v${version}` : ''),
          releaseName:
            typeof rel.name === 'string' && rel.name.trim()
              ? rel.name.trim()
              : `SecretArea v${version}`,
          notes: rawBody,
          publishedAt: typeof rel.published_at === 'string' ? rel.published_at : null,
          htmlUrl:
            typeof rel.html_url === 'string' && /^https:\/\/github\.com\//i.test(rel.html_url)
              ? rel.html_url
              : null,
          prerelease: Boolean(rel.prerelease),
          source: 'github' as const,
        };
      })
      .filter((entry) => Boolean(entry.version));
  } catch {
    return [];
  }
}

function createGenericVersionEntry(
  version: string,
  language: AppLanguage,
  releaseName?: string | null,
  publishedAt?: string | null,
  htmlUrl?: string | null
): ReleaseChangelogEntry {
  const base = LOCAL_CHANGELOG['1.0.3'][language] || LOCAL_CHANGELOG['1.0.3'].en;
  return {
    version,
    releaseTitle: releaseName?.trim() || `SecretArea v${version}`,
    summary: base.summary,
    publishedAt: publishedAt || null,
    htmlUrl: htmlUrl || null,
    source: htmlUrl ? 'github' : 'local',
    items: base.items,
  };
}

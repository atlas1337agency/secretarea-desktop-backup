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
  '1.0.7': {
    en: {
      version: '1.0.7',
      releaseTitle: 'UI Modernization, Clickable Studios & Smart Update Timeline',
      summary:
        'Streamlines Home Hero & Latest Release sizes, adds clickable Developer Studios on Games & Tools, redesigns the Library toolbar, automates Notification Center sync, and upgrades Update History.',
      publishedAt: null,
      items: [
        {
          category: 'feature',
          title: 'Clickable Developer Studios on Games & Tools',
          description:
            'Resolves studio references across Games, Hypervisor, SteamTools, and Tools cards and detail pages—click any studio name to jump directly to its full studio page.',
        },
        {
          category: 'improvement',
          title: 'Clean Home Hero Card & Inline Latest Release Sizes',
          description:
            'Removed the size footer strip and image zoom on the Home hero card, placing compact repack and original sizes inline inside Latest Release.',
        },
        {
          category: 'improvement',
          title: 'Single-Line Library Filter & Auto-Syncing Notifications',
          description:
            'Redesigned Library controls around a modern single-line Can Run It dropdown + search bar, and simplified Notification Center to Important Tabs and Just News with automatic background syncing.',
        },
        {
          category: 'feature',
          title: 'Smart Update History & Dev/Installed Detection',
          description:
            'Automatically detects Installed vs. In-Development vs. Published updates, refreshes live from GitHub Releases, and highlights New, Changed, and Fixed counts per build.',
        },
        {
          category: 'feature',
          title: 'Custom Animated Desktop Cursor & Click Sound Effects',
          description:
            'Replaced the default pointer with a responsive vector cursor featuring ripple & radial click bursts, hover rings, animated spinner/hourglass states, and tactile click audio.',
        },
        {
          category: 'feature',
          title: 'Navbar Popular Repacks Spin Wheel',
          description:
            'Added a continuously animated Spin Wheel button in the Navbar that picks a random game from Most Popular Games (PopularRepacks) with peg-tick physics, Can Run It filters, and quick launch.',
        },
      ],
    },
    fr: {
      version: '1.0.7',
      releaseTitle: 'Modernisation UI, Studios cliquables & Historique intelligent',
      summary:
        'Épure la carte Hero et les tailles dans Dernière Sortie, ajoute les studios cliquables sur Jeux & Outils, modernise la barre Bibliothèque et automatise Notifications & Historique.',
      publishedAt: null,
      items: [
        {
          category: 'feature',
          title: 'Studios développeurs cliquables sur Jeux & Outils',
          description:
            'Résout les liens de studios sur les cartes et fiches Jeux, Hypervisor, SteamTools et Outils pour ouvrir directement la page du studio.',
        },
        {
          category: 'improvement',
          title: 'Carte Hero épurée & tailles intégrées dans Dernière Sortie',
          description:
            'Suppression du bandeau de taille et du zoom sur l’image Hero, avec affichage compact des tailles directement dans Dernière Sortie.',
        },
        {
          category: 'improvement',
          title: 'Barre Bibliothèque sur une ligne & Notifications auto',
          description:
            'Contrôle moderne Can Run It sur une seule ligne avec la recherche, et Centre de notifications simplifié (Onglets importants / Actualités) synchronisé en arrière-plan.',
        },
        {
          category: 'feature',
          title: 'Historique intelligent & détection Dev / Installée',
          description:
            'Détecte automatiquement les versions installées, en développement ou publiées sur GitHub avec le détail Nouveautés, Modifiés et Corrigés.',
        },
        {
          category: 'feature',
          title: 'Curseur animé personnalisé & effets sonores de clic',
          description:
            'Curseur vectoriel fluide avec ondes de clic, anneaux de survol, états animés et retour sonore tactile dans tous les thèmes.',
        },
        {
          category: 'feature',
          title: 'Roue des Repacks Populaires dans la barre de navigation',
          description:
            'Bouton Roue animé en continu tirant au sort un jeu parmi Most Popular Games (PopularRepacks) avec physique réaliste, sons de crans et filtres Can Run It.',
        },
      ],
    },
    es: {
      version: '1.0.7',
      releaseTitle: 'Rediseño UI, Estudios clicables e Historial inteligente',
      summary:
        'Limpia la tarjeta Hero y mueve tamaños a Último Lanzamiento, añade estudios clicables en Juegos y Herramientas, moderniza Biblioteca y automatiza Notificaciones e Historial.',
      publishedAt: null,
      items: [
        {
          category: 'feature',
          title: 'Estudios desarrolladores clicables en Juegos y Herramientas',
          description:
            'Resuelve los estudios asociados en tarjetas y detalles de Juegos, Hypervisor, SteamTools y Herramientas para abrir su ficha con un clic.',
        },
        {
          category: 'improvement',
          title: 'Tarjeta Hero limpia y tamaños en Último Lanzamiento',
          description:
            'Se eliminó la franja inferior y el zoom de la portada Hero, mostrando los tamaños compacto y original en la cabecera de Último Lanzamiento.',
        },
        {
          category: 'improvement',
          title: 'Barra de Biblioteca en una línea y Notificaciones automáticas',
          description:
            'Selector moderno de Can Run It en una sola línea junto al buscador, y Centro de Notificaciones simplificado a Pestañas clave y Noticias con sincronización automática.',
        },
        {
          category: 'feature',
          title: 'Historial inteligente y detección de Modo Dev / Instalado',
          description:
            'Detecta automáticamente si cada versión está instalada, en desarrollo o publicada en GitHub, detallando Nuevas, Cambios y Correcciones.',
        },
        {
          category: 'feature',
          title: 'Cursor animado personalizado y sonidos de clic',
          description:
            'Nuevo cursor vectorial de escritorio con ondas de clic, anillo de enfoque, estados animados y audio táctil en todos los temas.',
        },
        {
          category: 'feature',
          title: 'Ruleta de Repacks Populares en la barra superior',
          description:
            'Botón animado de forma continua que gira la ruleta para elegir un juego aleatorio de Most Popular Games (PopularRepacks) con efectos sonoros y filtros Can Run It.',
        },
      ],
    },
    ar: {
      version: '1.0.7',
      releaseTitle: 'تحديث الواجهة، استوديوهات قابلة للنقر وسجل تحديثات ذكي',
      summary:
        'تبسيط بطاقة الواجهة الرئيسية، وإضافة روابط استوديوهات التطوير في الألعاب والأدوات، وتصميم عصري لصفحة المكتبة، ومزامنة تلقائية للإشعارات وسجل التحديثات.',
      publishedAt: null,
      items: [
        {
          category: 'feature',
          title: 'أسماء استوديوهات التطوير القابلة للنقر في الألعاب والأدوات',
          description:
            'ربط الألعاب وHypervisor وSteamTools والأدوات باستوديوهات التطوير تلقائياً مع إمكانية النقر لفتح صفحة الاستوديو مباشرة.',
        },
        {
          category: 'improvement',
          title: 'تنظيف بطاقة الواجهة الرئيسية وعرض الأحجام في أحدث إصدار',
          description:
            'إزالة شريط الأحجام وتكبير الصورة من البطاقة الرئيسية وعرض الأحجام بشكل أنيق داخل سطر أحدث إصدار.',
        },
        {
          category: 'improvement',
          title: 'شريط مكتبة بسطر واحد وإشعارات متزامنة تلقائياً',
          description:
            'تصميم عصري لزر Can Run It بجانب البحث في سطر واحد دائماً، وتبسيط مركز الإشعارات للتبويبات المهمة والأخبار فقط مع مزامنة خلفية تلقائية.',
        },
        {
          category: 'feature',
          title: 'سجل تحديثات ذكي مع كشف وضع التطوير والإصدار المثبت',
          description:
            'يميز تلقائياً بين النسخة المثبتة، وقيد التطوير، والتحديثات المنشورة على GitHub مع عدادات الجديد والتحسينات والإصلاحات.',
        },
        {
          category: 'feature',
          title: 'مؤشر سطح مكتب مخصص متحرك مع مؤثرات صوتية للنقر',
          description:
            'مؤشر مرسوم متجاوب مع تموجات وانبثاقات النقر، وحلقة تمرير متقطعة، وحالات تحميل متحركة، وصوت نقر فوري في كل السمات.',
        },
        {
          category: 'feature',
          title: 'عجلة الحظ للألعاب الشائعة في شريط التنقل',
          description:
            'زر عجلة متحرك باستمرار في شريط التنقل يختار لعبة عشوائية من قائمة الألعاب الأكثر شعبية (PopularRepacks) مع مؤثرات صوتية وفلاتر التوافق.',
        },
      ],
    },
  },
  '1.0.6': {
    en: {
      version: '1.0.6',
      releaseTitle: 'Desktop Telemetry Fixes, Console Theme Polish & Sync Stability',
      summary:
        'Hardens hardware adapter detection, fixes laptop display/GPU telemetry edge cases, refines PS5 & Xbox UI styling, and improves live catalog diff reliability.',
      publishedAt: '2026-11-24T20:00:00Z',
      items: [
        {
          category: 'fix',
          title: 'GPU & Laptop Display Adapter Telemetry Stability',
          description:
            'Resolved intermittent adapter readouts across NVIDIA, AMD, Intel, and hybrid laptop GPUs inside Hardware Monitor and PresentMon sessions.',
        },
        {
          category: 'improvement',
          title: 'PS5 & Xbox Console Theme Contrast & Spacing',
          description:
            'Refined frosted overlays, button focus rings, and light/dark mode contrast across library cards and detail views.',
        },
        {
          category: 'fix',
          title: 'Catalog Live Diff & Notification Deduplication',
          description:
            'Prevented duplicate live feed entries when switching sections or re-syncing Google Sheets snapshots offline.',
        },
      ],
    },
    fr: {
      version: '1.0.6',
      releaseTitle: 'Correctifs Télémétrie, Thèmes Console & Stabilité Sync',
      summary:
        'Renforce la détection GPU/écran portable, affine les thèmes PS5 & Xbox et fiabilise la détection différentielle du catalogue.',
      publishedAt: '2026-11-24T20:00:00Z',
      items: [
        {
          category: 'fix',
          title: 'Stabilité des adaptateurs GPU & écrans portables',
          description:
            'Correction des lectures intermittentes sur GPU NVIDIA, AMD, Intel et configurations hybrides dans le Moniteur Matériel.',
        },
        {
          category: 'improvement',
          title: 'Contraste & finitions des thèmes PS5 et Xbox',
          description:
            'Amélioration des surfaces translucides, contours de focus et contraste clair/sombre sur les cartes et fiches.',
        },
        {
          category: 'fix',
          title: 'Déduplication des notifications du catalogue',
          description:
            'Suppression des doublons lors des synchronisations répétées ou reconnexions après mode hors-ligne.',
        },
      ],
    },
    es: {
      version: '1.0.6',
      releaseTitle: 'Correcciones de Telemetría, Temas de Consola y Sincronización',
      summary:
        'Estabiliza la lectura de adaptadores GPU y portátiles, mejora el contraste de los temas PS5 y Xbox y corrige duplicados en notificaciones.',
      publishedAt: '2026-11-24T20:00:00Z',
      items: [
        {
          category: 'fix',
          title: 'Estabilidad en adaptadores GPU y pantallas portátiles',
          description:
            'Resueltas lecturas intermitentes en tarjetas NVIDIA, AMD, Intel y gráficas híbridas dentro del Monitor de Hardware.',
        },
        {
          category: 'improvement',
          title: 'Refinamiento de temas PS5, Xbox y modo claro/oscuro',
          description:
            'Mejor contraste en superposiciones, estados de enfoque y legibilidad de tarjetas y modales.',
        },
        {
          category: 'fix',
          title: 'Deduplicación en alertas del catálogo en vivo',
          description:
            'Evita entradas repetidas al resincronizar cambios desde Google Sheets o volver de modo sin conexión.',
        },
      ],
    },
    ar: {
      version: '1.0.6',
      releaseTitle: 'إصلاحات قراءة العتاد، وتحسين سمات المنصات واستقرار المزامنة',
      summary:
        'معالجة استقرار قراءة كروت الشاشة والشاشات المحمولة، وتحسين تباين سمات PS5 و Xbox، ومنع تكرار تنبيهات الكتالوج.',
      publishedAt: '2026-11-24T20:00:00Z',
      items: [
        {
          category: 'fix',
          title: 'استقرار قراءة كروت الشاشة الهجينة وشاشات اللابتوب',
          description:
            'إصلاح تقطع القراءات عبر محولات NVIDIA و AMD و Intel داخل مراقب العتاد وجلسات PresentMon.',
        },
        {
          category: 'improvement',
          title: 'تحسين تباين وتفاصيل سمات PS5 و Xbox',
          description:
            'تحسين وضوح النصوص والحدود في الوضعين الفاتح والداكن وداخل البطاقات والنوافذ.',
        },
        {
          category: 'fix',
          title: 'منع تكرار إشعارات تحديث الكتالوج',
          description:
            'حل مشكلة تكرار الأحداث عند إعادة المزامنة أو العودة من وضع عدم الاتصال.',
        },
      ],
    },
  },
  '1.0.5': {
    en: {
      version: '1.0.5',
      releaseTitle: 'Developer Studios Hub, Hypervisor Guide & Extras Center',
      summary:
        'Added the Studios directory with full game/tool portfolios, interactive Hypervisor installation guide, Section Source Badges, and Extras hub.',
      publishedAt: '2026-11-20T16:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Developer Studios Directory & Studio Detail Pages',
          description:
            'Browse game and software studios with logos, descriptions, and linked Games, Hypervisor, SteamTools, and Tools catalogs.',
        },
        {
          category: 'feature',
          title: 'Interactive Hypervisor Guide & Extras View',
          description:
            'Step-by-step Hypervisor setup walkthrough plus dedicated Extras hub for Savegames, Popular Repacks, and Upcoming queues.',
        },
        {
          category: 'improvement',
          title: 'Section Source Badges & Request Tracking',
          description:
            'Added clear source badges across multi-section cards and improved community request submission feedback.',
        },
      ],
    },
    fr: {
      version: '1.0.5',
      releaseTitle: 'Annuaire des Studios, Guide Hypervisor & Espace Extras',
      summary:
        'Ajoute l’annuaire des studios avec leurs catalogues complets, le guide Hypervisor interactif, les badges de section et l’espace Extras.',
      publishedAt: '2026-11-20T16:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Répertoire des Studios & pages dédiées',
          description:
            'Explorez chaque studio avec son logo, sa présentation et ses titres liés (Jeux, Hypervisor, SteamTools, Outils).',
        },
        {
          category: 'feature',
          title: 'Guide Hypervisor interactif & vue Extras',
          description:
            'Assistant détaillé pour Hypervisor et onglet Extras regroupant sauvegardes, repacks populaires et sorties à venir.',
        },
        {
          category: 'improvement',
          title: 'Badges de section & suivi des demandes',
          description:
            'Identification rapide de la provenance de chaque carte et meilleure validation des demandes communautaires.',
        },
      ],
    },
    es: {
      version: '1.0.5',
      releaseTitle: 'Directorio de Estudios, Guía Hypervisor y Centro de Extras',
      summary:
        'Incorpora el directorio completo de estudios, guía paso a paso de Hypervisor, insignias de sección y centro de Extras.',
      publishedAt: '2026-11-20T16:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Directorio y páginas de Estudios',
          description:
            'Explora estudios con logotipos, descripción y sus catálogos vinculados de Juegos, Hypervisor, SteamTools y Herramientas.',
        },
        {
          category: 'feature',
          title: 'Guía Hypervisor y vista de Extras',
          description:
            'Tutorial guiado para Hypervisor y sección Extras para partidas guardadas, repacks populares y próximos lanzamientos.',
        },
        {
          category: 'improvement',
          title: 'Insignias de origen y mejoras en Solicitudes',
          description:
            'Identificación clara de sección en tarjetas mixtas y mejor respuesta al enviar peticiones.',
        },
      ],
    },
    ar: {
      version: '1.0.5',
      releaseTitle: 'دليل الاستوديوهات، دليل Hypervisor ومركز الإضافات',
      summary:
        'إضافة صفحة استوديوهات التطوير مع كافة أعمالها، ودليل التثبيت التفاعلي لـ Hypervisor، وشارات الأقسام وصفحة الإضافات.',
      publishedAt: '2026-11-20T16:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'دليل استوديوهات التطوير وصفحاتها التفصيلية',
          description:
            'تصفح الاستوديوهات وشعاراتها ووصفها مع جميع الألعاب والأدوات المرتبطة بها في كل قسم.',
        },
        {
          category: 'feature',
          title: 'دليل Hypervisor التفاعلي ومركز Extras',
          description:
            'شرح خطوة بخطوة لتشغيل Hypervisor مع قسم خاص للتخزينات والألعاب القادمة والأكثر شعبية.',
        },
        {
          category: 'improvement',
          title: 'شارات مصدر الأقسام وتحسين الطلبات',
          description:
            'تمييز مصدر كل بطاقة بوضوح وتحسين تجربة إرسال طلبات الألعاب والأدوات.',
        },
      ],
    },
  },
  '1.0.4': {
    en: {
      version: '1.0.4',
      releaseTitle: 'Game Deals Hub, Live Player Counts & Price Alerts',
      summary:
        'Launched the multi-store Game Deals tracker with Steam live player counts, Free Games radar, currency switcher, game comparison, and price drop alerts.',
      publishedAt: '2026-11-10T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Multi-Store Game Deals, Free Offers & Live Players',
          description:
            'Aggregates live discounts from CheapShark, IsThereAnyDeal, and Steam alongside free-to-keep giveaways and real-time Steam concurrent player charts.',
        },
        {
          category: 'feature',
          title: 'Price Alerts, Game Compare & Multi-Currency FX',
          description:
            'Track target price thresholds, compare editions side-by-side, and convert prices seamlessly across USD, EUR, GBP, MAD, SAR, and more.',
        },
        {
          category: 'fix',
          title: 'Electron Network Bridge & Rate-Limit Caching',
          description:
            'Added resilient Electron IPC proxying and response caching to keep store lookups fast and avoid rate-limit failures.',
        },
      ],
    },
    fr: {
      version: '1.0.4',
      releaseTitle: 'Bons Plans Jeux, Joueurs en direct & Alertes Prix',
      summary:
        'Lancement du hub Bons Plans multi-boutiques avec joueurs Steam en direct, jeux gratuits, conversion de devises, comparateur et alertes de prix.',
      publishedAt: '2026-11-10T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Offres multi-boutiques, Jeux gratuits & Joueurs Steam',
          description:
            'Agrège CheapShark, IsThereAnyDeal et Steam avec suivi des jeux offerts et graphiques de joueurs actifs en temps réel.',
        },
        {
          category: 'feature',
          title: 'Alertes prix, Comparateur & Conversion de devises',
          description:
            'Définissez des seuils de prix, comparez plusieurs jeux et basculez entre USD, EUR, GBP, MAD, SAR et autres devises.',
        },
        {
          category: 'fix',
          title: 'Pont réseau Electron & mise en cache API',
          description:
            'Proxy IPC fiable et cache intelligent pour accélérer les requêtes et éviter les limitations API.',
        },
      ],
    },
    es: {
      version: '1.0.4',
      releaseTitle: 'Centro de Ofertas, Jugadores en vivo y Alertas de Precio',
      summary:
        'Estrena el rastreador de ofertas multi-tienda con jugadores activos de Steam, juegos gratis, conversor de divisas, comparador y alertas.',
      publishedAt: '2026-11-10T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'Ofertas multi-tienda, Juegos gratis y Jugadores en vivo',
          description:
            'Reúne descuentos de CheapShark, IsThereAnyDeal y Steam junto a juegos gratuitos y estadísticas en vivo de jugadores.',
        },
        {
          category: 'feature',
          title: 'Alertas de precio, Comparador y Multidivisa',
          description:
            'Configura precios objetivo, compara títulos lado a lado y cambia entre USD, EUR, GBP, MAD, SAR y más monedas.',
        },
        {
          category: 'fix',
          title: 'Puente de red Electron y caché anti-límites',
          description:
            'Proxy IPC dedicado y almacenamiento temporal para evitar bloqueos por límite de peticiones.',
        },
      ],
    },
    ar: {
      version: '1.0.4',
      releaseTitle: 'مركز عروض الألعاب، اللاعبون المباشرون وتنبيهات الأسعار',
      summary:
        'إطلاق قسم عروض الألعاب والألعاب المجانية مع إحصائيات لاعبي Steam المباشرة، ومحول العملات، ومقارنة الألعاب وتنبيهات انخفاض السعر.',
      publishedAt: '2026-11-10T12:00:00Z',
      items: [
        {
          category: 'feature',
          title: 'عروض المتاجر، الألعاب المجانية وإحصائيات اللاعبين',
          description:
            'تجميع التخفيضات من CheapShark و IsThereAnyDeal و Steam مع رصد الألعاب المجانية وعدد اللاعبين المباشر.',
        },
        {
          category: 'feature',
          title: 'تنبيهات الأسعار، مقارنة الألعاب وتبديل العملات',
          description:
            'متابعة الأسعار المستهدفة ومقارنة الألعاب وتحويل الأسعار بين الدولار واليورو والدرهم والريال وغيرها.',
        },
        {
          category: 'fix',
          title: 'جسر الشبكة في Electron والتخزين المؤقت للطلبات',
          description:
            'تحسين سرعة جلب بيانات المتاجر عبر Electron وتفادي أخطاء تجاوز حد الطلبات.',
        },
      ],
    },
  },
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

export interface ReleaseStatusClassification {
  isInstalled: boolean;
  isInDevelopment: boolean;
  isUpdateAvailable: boolean;
  isLatestPublished: boolean;
  isPrevious: boolean;
}

export function getReleaseCategoryCounts(items: ReleaseNoteItem[]): {
  feature: number;
  improvement: number;
  fix: number;
} {
  let feature = 0;
  let improvement = 0;
  let fix = 0;
  for (const item of items) {
    if (item.category === 'fix') fix += 1;
    else if (item.category === 'improvement') improvement += 1;
    else feature += 1;
  }
  return { feature, improvement, fix };
}

export function classifyReleaseStatus({
  release,
  currentVersion,
  latestPublishedVersion,
  isDevMode = false,
}: {
  release: ReleaseChangelogEntry;
  currentVersion: string;
  latestPublishedVersion: string | null;
  isDevMode?: boolean;
}): ReleaseStatusClassification {
  const cmpCurrent = compareReleaseVersions(release.version, currentVersion);
  const isPublished = release.source === 'github';
  const isInstalled = cmpCurrent === 0;
  const isInDevelopment =
    (cmpCurrent > 0 && !isPublished) || (isInstalled && isDevMode && !isPublished);
  const isUpdateAvailable = cmpCurrent > 0 && isPublished;
  const isLatestPublished =
    latestPublishedVersion !== null &&
    compareReleaseVersions(release.version, latestPublishedVersion) === 0;
  const isPrevious = cmpCurrent < 0;

  return {
    isInstalled,
    isInDevelopment,
    isUpdateAvailable,
    isLatestPublished,
    isPrevious,
  };
}

export function buildMergedReleaseHistory({
  language,
  remoteReleases = [],
  currentVersion,
}: {
  language: AppLanguage;
  remoteReleases?: DesktopReleaseHistoryEntry[];
  currentVersion?: string;
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
    const hasGithubNotes = Boolean(rel.notes && rel.notes.trim().length > 0);
    const localExisting = LOCAL_CHANGELOG[cleanVer]?.[language] || LOCAL_CHANGELOG[cleanVer]?.en;
    const parsed = parseGithubReleaseNotes(
      cleanVer,
      language,
      rel.releaseName,
      rel.notes,
      rel.publishedAt,
      rel.htmlUrl
    );
    const useLocalLocalizedNotes = !hasGithubNotes && Boolean(localExisting);
    byVersion.set(cleanVer, {
      ...(useLocalLocalizedNotes && localExisting ? localExisting : parsed),
      publishedAt: rel.publishedAt || localExisting?.publishedAt || parsed.publishedAt || null,
      htmlUrl: rel.htmlUrl || parsed.htmlUrl || null,
      source: rel.source === 'github' ? 'github' : parsed.source || 'local',
    });
  }

  // Ensure the active running version is always represented even if package.json was bumped ahead of LOCAL_CHANGELOG
  const cleanCurrent = (currentVersion || '').replace(/^v/i, '').trim();
  if (cleanCurrent && !byVersion.has(cleanCurrent)) {
    byVersion.set(
      cleanCurrent,
      createGenericVersionEntry(cleanCurrent, language, `SecretArea v${cleanCurrent}`, null, null)
    );
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

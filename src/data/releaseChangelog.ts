import type { AppLanguage } from '../services/launcherSettings';

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
  items: ReleaseNoteItem[];
}

const LOCAL_CHANGELOG: Record<string, Record<AppLanguage, ReleaseChangelogEntry>> = {
  '1.0.3': {
    en: {
      version: '1.0.3',
      releaseTitle: 'Custom Theme Builder & Guided Setup Update',
      summary:
        'This update introduces a live Custom Theme Builder, visitor-guided first-launch onboarding, and improved qBittorrent 5.x integration.',
      items: [
        {
          category: 'feature',
          title: 'Custom Default Theme Builder',
          description:
            'Customize accent colors, canvas surface mode (Midnight, Obsidian, Abyss, Daylight), button shapes, card corners, and glass blur in Settings & Welcome Setup.',
        },
        {
          category: 'feature',
          title: 'In-Updater Release Highlights',
          description:
            'View categorized new features, improvements, and bug fixes directly inside the Software Update notification before installing a new version.',
        },
        {
          category: 'improvement',
          title: 'Responsive Welcome & Download Telemetry',
          description:
            'Upgraded layout across mobile/desktop viewports, live qBittorrent 9-field telemetry, speed activity chart, and one-click auto-installation.',
        },
        {
          category: 'fix',
          title: 'qBittorrent 5.x Sync & Verification Fixes',
          description:
            'Accurate torrent hash synchronization via /api/v2/torrents/info, real Web UI status verification, and encrypted safeStorage credentials.',
        },
      ],
    },
    fr: {
      version: '1.0.3',
      releaseTitle: 'Créateur de thème personnalisé & mises à jour détaillées',
      summary:
        'Cette version ajoute un éditeur de thème complet en direct, un assistant d’accueil explicatif et une synchronisation qBittorrent 5.x optimisée.',
      items: [
        {
          category: 'feature',
          title: 'Créateur de thème par défaut',
          description:
            'Personnalisez la couleur d’accentuation, la surface (Midnight, Obsidian, Abyss, Daylight), la forme des boutons, le rayon des cartes et le flou vitré.',
        },
        {
          category: 'feature',
          title: 'Nouveautés dans le module de mise à jour',
          description:
            'Consultez la liste des nouveautés et correctifs directement dans la fenêtre de mise à jour avant d’installer une nouvelle version.',
        },
        {
          category: 'improvement',
          title: 'Interface réactive et graphique de vitesse',
          description:
            'Affichage adaptable petit/grand écran, statistiques qBittorrent complètes, graphique DL/UL et installation automatique.',
        },
        {
          category: 'fix',
          title: 'Synchronisation qBittorrent 5.x corrigée',
          description:
            'Suivi réel par hash via /api/v2/torrents/info, vérification de connexion en direct et chiffrement safeStorage.',
        },
      ],
    },
    es: {
      version: '1.0.3',
      releaseTitle: 'Creador de tema personalizado y notas de actualización',
      summary:
        'Esta versión añade un creador de temas personalizado en vivo, una bienvenida guiada paso a paso y mejoras clave en qBittorrent 5.x.',
      items: [
        {
          category: 'feature',
          title: 'Creador de tema predeterminado',
          description:
            'Personaliza colores de acento, superficie (Midnight, Obsidian, Abyss, Daylight), estilo de botones, bordes de tarjetas y desenfoque.',
        },
        {
          category: 'feature',
          title: 'Novedades en el actualizador',
          description:
            'Consulta las novedades, mejoras y correcciones directamente en el aviso de nueva versión antes de actualizar.',
        },
        {
          category: 'improvement',
          title: 'Diseño adaptable y telemetría en vivo',
          description:
            'Interfaz optimizada para cualquier pantalla, gráfico animado de velocidad DL/UL, semillas/pares, ratio y configuración guiada.',
        },
        {
          category: 'fix',
          title: 'Sincronización real con qBittorrent 5.x',
          description:
            'Seguimiento exacto mediante /api/v2/torrents/info, verificación de conexión y credenciales cifradas con safeStorage.',
        },
      ],
    },
    ar: {
      version: '1.0.3',
      releaseTitle: 'منشئ المظهر المخصص وعرض ما الجديد عند التحديث',
      summary:
        'يضيف هذا التحديث منشئ مظهر مخصص متكامل، وشرحاً واضحاً لكل خطوة في إعداد الترحيب، مع تحسينات شاملة لـ qBittorrent 5.x.',
      items: [
        {
          category: 'feature',
          title: 'منشئ المظهر الافتراضي المخصص',
          description:
            'خصّص لون التمييز ونمط الخلفية وشكل الأزرار واستدارة البطاقات وتأثير الزجاج من الإعدادات أو الإعداد الأولي.',
        },
        {
          category: 'feature',
          title: 'عرض ما الجديد داخل نافذة التحديث',
          description:
            'عند توفر إصدار أحدث يمكنك الاطلاع على قائمة الإضافات والتحسينات والإصلاحات مباشرة داخل نافذة تحديث التطبيق.',
        },
        {
          category: 'improvement',
          title: 'تصميم متجاوب ومخطط سرعة التحميل',
          description:
            'دعم متجاوب لجميع الشاشات مع بيانات التورنت الـ9 الكاملة ومخطط سرعة التحميل والرفع والتثبيت التلقائي لـ qBittorrent.',
        },
        {
          category: 'fix',
          title: 'إصلاح مزامنة qBittorrent 5.x',
          description:
            'مزامنة دقيقة للنسبة والحالة والسرعة عبر /api/v2/torrents/info مع تشفير بيانات الدخول عبر safeStorage.',
        },
      ],
    },
  },
};

function inferCategoryFromText(text: string): ChangelogCategory {
  const lower = text.toLowerCase();
  if (lower.includes('fix') || lower.includes('bug') || lower.includes('resolve') || lower.includes('patch') || lower.includes('إصلاح')) {
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
  rawNotes?: string | null
): ReleaseChangelogEntry {
  const cleanVer = version.replace(/^v/i, '').trim() || '1.0.3';
  const localVersionEntry = LOCAL_CHANGELOG[cleanVer]?.[language] || LOCAL_CHANGELOG[cleanVer]?.en;

  if (!rawNotes || !rawNotes.trim()) {
    if (localVersionEntry) return localVersionEntry;
    return createGenericVersionEntry(cleanVer, language, releaseName);
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

    if (items.length >= 6) break;
  }

  if (items.length === 0) {
    return localVersionEntry || createGenericVersionEntry(cleanVer, language, releaseName);
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
    items,
  };
}

function createGenericVersionEntry(
  version: string,
  language: AppLanguage,
  releaseName?: string | null
): ReleaseChangelogEntry {
  const base = LOCAL_CHANGELOG['1.0.3'][language] || LOCAL_CHANGELOG['1.0.3'].en;
  return {
    version,
    releaseTitle: releaseName?.trim() || `SecretArea v${version}`,
    summary: base.summary,
    items: base.items,
  };
}

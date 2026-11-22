import type { AppLanguage } from '../services/launcherSettings';

export interface LanguageOption {
  code: AppLanguage;
  shortLabel: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
}

export const LANGUAGE_OPTIONS: LanguageOption[] = [
  {
    code: 'en',
    shortLabel: 'EN',
    name: 'English',
    nativeName: 'English',
    direction: 'ltr',
  },
  {
    code: 'fr',
    shortLabel: 'FR',
    name: 'French',
    nativeName: 'Français',
    direction: 'ltr',
  },
  {
    code: 'es',
    shortLabel: 'ES',
    name: 'Spanish',
    nativeName: 'Español',
    direction: 'ltr',
  },
  {
    code: 'ar',
    shortLabel: 'AR',
    name: 'Arabic',
    nativeName: 'العربية',
    direction: 'rtl',
  },
];

export interface LauncherTranslations {
  locale: string;
  nav: {
    home: string;
    library: string;
    extras: string;
    requests: string;
    settings: string;
    switchLight: string;
    switchDark: string;
    lightLabel: string;
    darkLabel: string;
    selectLanguage: string;
    openMenu: string;
    closeMenu: string;
    languageLabel: string;
    themeLabel: string;
  };
  topbar: {
    webVersion: string;
    updatesTitle: string;
    enterFullscreen: string;
    exitFullscreen: string;
    muteSounds: string;
    enableSounds: string;
    muteXboxSounds: string;
    enableXboxSounds: string;
    offlineMode: string;
    onlineMode: string;
  };
  settings: {
    pageTitle: string;
    pageSubtitle: string;
    resetDefaults: string;
    resetToast: string;
    languageSectionTitle: string;
    languageSectionDesc: string;
    rtlBadge: string;
    ltrBadge: string;
    startingSectionTitle: string;
    startWithComputerTitle: string;
    startWithComputerDesc: string;
    desktopSupportedBadge: string;
    webNotice: string;
    trayActiveHint: string;
    canRunItTitle: string;
    canRunItDesc: string;
    windowSectionTitle: string;
    compactNavbarTitle: string;
    compactNavbarDesc: string;
    lightModeTitle: string;
    lightModeDesc: string;
    darkModeBadge: string;
    lightModeBadge: string;
    alwaysPs5Title: string;
    alwaysPs5Desc: string;
    alwaysXboxTitle: string;
    alwaysXboxDesc: string;
    audioSectionTitle: string;
    audioSectionDesc: string;
    ambientMusicTitle: string;
    ambientMusicDesc: string;
    uiSoundsTitle: string;
    uiSoundsDesc: string;
    volumeTitle: string;
    volumeDesc: string;
    consoleThemeAudioHint: string;
    activeLabel: string;
    inactiveLabel: string;
  };
  store: {
    featuredSpotlight: string;
    latestRelease: string;
    download: string;
    watchTrailer: string;
    viewDetails: string;
    exploreCatalog: string;
    repackVsOriginal: string;
    upcomingGames: string;
    recentGames: string;
    canRunTitle: string;
    canRunSubtitle: string;
    scopeAll: string;
    scopeGames: string;
    scopeHypervisor: string;
    scopeSteamTools: string;
    scopePs5: string;
    scopeTools: string;
    canRunBtn: string;
    cannotRunBtn: string;
    scanPc: string;
    gpuLabel: string;
    cpuLabel: string;
    ramLabel: string;
    freeDriveLabel: string;
    canRunEmptyFail: string;
    canRunEmptyPass: string;
    canRunCardPass: string;
    mostPopularGames: string;
    showAll: string;
    hideHv: string;
    hideGames: string;
    newestFirst: string;
    nameAz: string;
    pageOf: string;
    previous: string;
    next: string;
    seeMoreNext: string;
    gameSingular: string;
    gamePlural: string;
    backToPage1: string;
    topStudios: string;
    viewAllStudios: string;
    bestTwoPlayers: string;
    noCatalogLoaded: string;
  };
  library: {
    sectionLabel: string;
    genresIn: string;
    allGenres: string;
    reset: string;
    allCountLabel: string;
    hide: string;
    show: string;
    noMatchingTitles: string;
    sortBy: string;
    sortSmart: string;
    sortLatest: string;
    sortAz: string;
    sortZa: string;
    sortFavorites: string;
    sortSizeAsc: string;
    sortSizeDesc: string;
    sortMirrors: string;
    canRunAll: string;
    canRunPass: string;
    canRunFail: string;
    clear: string;
    searchPlaceholder: string;
    emptyTitle: string;
    emptySubtitle: string;
    previous: string;
    next: string;
    next50: string;
    backToPage1: string;
    pageOf: string;
    newToLibrary: string;
    pinned: string;
    free: string;
    canRunCard: string;
  };
  extras: {
    upcomingList: string;
    trailers: string;
    bestSeries: string;
    topOpenWorld: string;
    videosLabel: string;
    titleSingular: string;
    titlePlural: string;
    platforms: string;
    watchTrailer: string;
    noTrailer: string;
    back: string;
    seriesPosters: string;
    gamesInSeries: string;
    bestBadge: string;
  };
  requests: {
    pageTitle: string;
    formTitle: string;
    formSubtitle: string;
    titleLabel: string;
    titlePlaceholder: string;
    categoryLabel: string;
    coverUrlLabel: string;
    detailsLabel: string;
    detailsPlaceholder: string;
    sending: string;
    submitRequest: string;
    recentRequests: string;
    noRequestsYet: string;
    syncedNotice: string;
    localNotice: string;
    communitySupportTitle: string;
    joinCommunityTitle: string;
    joinCommunityDesc: string;
    telegramLabel: string;
    telegramSub: string;
    discordLabel: string;
    discordSub: string;
    joinBtn: string;
    supportBadge: string;
    supportHeadline: string;
    supportDesc: string;
    anonMonero: string;
    openInBrowser: string;
  };
  studios: {
    backToHome: string;
    topStudios: string;
    searchPlaceholder: string;
    noMatch: string;
    gameSingular: string;
    gamePlural: string;
    aboutStudio: string;
    noOverview: string;
    all: string;
    back: string;
    totalTitleSingular: string;
    totalTitlePlural: string;
    noItemsInCategory: string;
    previous: string;
    next: string;
    next20Games: string;
    pageOf: string;
  };
  detail: {
    back: string;
    home: string;
    releaseDetails: string;
    gameId: string;
    version: string;
    originalSize: string;
    downloadSize: string;
    repackSize: string;
    downloadChannels: string;
    channelSingular: string;
    channelPlural: string;
    license: string;
    pinned: string;
    standard: string;
    free: string;
    dateAdded: string;
    repacker: string;
    languages: string;
    genres: string;
    watchTrailer: string;
    trailerGallery: string;
    switchToTrailer: string;
    openTrailer: string;
    description: string;
    noDescription: string;
    requirementsAndCanRun: string;
    requirementsOnly: string;
    tools: string;
    steps: string;
    completed: string;
    linkedEntries: string;
    hvWarningTitle: string;
    hvWarningBody: string;
    noChannels: string;
    recommendedTag: string;
    recommendedForYou: string;
    canRunItTitle: string;
    thisPcAuto: string;
    customPc: string;
    detectedPc: string;
    thisPcVsMinimum: string;
    scan: string;
    myPc: string;
    close: string;
    yourPcCanRun: string;
    runsWell: string;
    cantRun: string;
    checkSpecs: string;
    weakPrefix: string;
    estimated: string;
    needsPrefix: string;
    pcSpecsHeading: string;
    resetAuto: string;
    gpuInput: string;
    cpuInput: string;
    ramInput: string;
    spaceInput: string;
    cancel: string;
    compareSpecs: string;
    osLabel: string;
    ramLabel: string;
    cpuLabel: string;
    gpuLabel: string;
    noReqsListed: string;
    positive: string;
    negative: string;
  };
}

const EN: LauncherTranslations = {
  locale: 'en-US',
  nav: {
    home: 'Home',
    library: 'Library',
    extras: 'Extras',
    requests: 'Requests',
    settings: 'Settings',
    switchLight: 'Switch to Light mode',
    switchDark: 'Switch to Dark mode',
    lightLabel: 'Light',
    darkLabel: 'Dark',
    selectLanguage: 'Select language',
    openMenu: 'Open navigation menu',
    closeMenu: 'Close navigation menu',
    languageLabel: 'Language',
    themeLabel: 'Appearance',
  },
  topbar: {
    webVersion: 'SecretArea web version',
    updatesTitle: 'About SecretArea & Check for Updates',
    enterFullscreen: 'Enter Fullscreen',
    exitFullscreen: 'Exit Fullscreen',
    muteSounds: 'Now Playing: PS5 Cosmic Horizon — Click to Mute',
    enableSounds: 'Enable PS5 Music & UI Sounds',
    muteXboxSounds: 'Now Playing: Xbox Nexus — Click to Mute',
    enableXboxSounds: 'Enable Xbox Music & UI Sounds',
    offlineMode: 'Offline Mode',
    onlineMode: 'Online Mode',
  },
  settings: {
    pageTitle: 'Settings',
    pageSubtitle: 'Customize launcher language, startup behavior, window theme, and soundscape.',
    resetDefaults: 'Reset Defaults',
    resetToast: 'Settings restored to defaults',
    languageSectionTitle: 'Language',
    languageSectionDesc: 'Choose the display language and text direction used across SecretArea.',
    rtlBadge: 'RTL',
    ltrBadge: 'LTR',
    startingSectionTitle: 'Starting and closing',
    startWithComputerTitle: 'Start with your computer',
    startWithComputerDesc: 'Opens SecretArea in the tray when you sign in to this computer.',
    desktopSupportedBadge: 'Windows Tray Sync',
    webNotice: 'Tray auto-start activates automatically in the SecretArea.exe desktop app.',
    trayActiveHint: 'Closing the window minimizes SecretArea to the system tray while auto-start is active.',
    canRunItTitle: 'Can Run It hardware check',
    canRunItDesc: 'Compare games and tools against your PC hardware requirements across Home, Library, and Game pages.',
    windowSectionTitle: 'Window',
    compactNavbarTitle: 'Compact Navbar',
    compactNavbarDesc: 'Show the navbar as icons, even in a wide window.',
    lightModeTitle: 'Light / Dark mode',
    lightModeDesc: 'Switch between crisp Light mode and Steam-inspired Dark mode. Enabling PS5 or Xbox theme switches back to Dark mode.',
    darkModeBadge: 'Dark Mode',
    lightModeBadge: 'Light Mode',
    alwaysPs5Title: 'Always run app with PS5 theme',
    alwaysPs5Desc: 'Keep the PlayStation 5 sapphire theme and ambient soundscape active across the launcher.',
    alwaysXboxTitle: 'Always run app with Xbox theme',
    alwaysXboxDesc: 'Apply the emerald Xbox dashboard theme, wireframe orb backdrop, and Xbox UI sound effects.',
    audioSectionTitle: 'Audio & Soundscape',
    audioSectionDesc: 'Toggle PS5 and Xbox ambient music vs. UI click sounds separately and control playback volume.',
    ambientMusicTitle: 'Ambient background music (PS5 / Xbox)',
    ambientMusicDesc: 'Play evolving cosmic PS5 or emerald Xbox Nexus ambient music while a console theme is active.',
    uiSoundsTitle: 'UI click & hover sounds',
    uiSoundsDesc: 'Play subtle console focus ticks, confirmation chimes, and back tones when navigating buttons and cards.',
    volumeTitle: 'Master volume',
    volumeDesc: 'Adjust output volume for both console ambient music and UI sound effects.',
    consoleThemeAudioHint: 'Select the PS5 or Xbox theme in Window above to hear the active console soundscape.',
    activeLabel: 'On',
    inactiveLabel: 'Off',
  },
  store: {
    featuredSpotlight: 'Featured Spotlight',
    latestRelease: 'Latest Release',
    download: 'Download',
    watchTrailer: 'Watch Trailer',
    viewDetails: 'Details',
    exploreCatalog: 'Explore Catalog',
    repackVsOriginal: 'Repack Size vs Original',
    upcomingGames: 'Upcoming Games',
    recentGames: 'Recent Games',
    canRunTitle: 'Can Run It — Recommended For Your PC',
    canRunSubtitle: "Automatically compares Games, Hypervisor, SteamTools, PS5 & Tools against your PC's Requirements",
    scopeAll: 'All',
    scopeGames: 'Games',
    scopeHypervisor: 'Hypervisor',
    scopeSteamTools: 'SteamTools',
    scopePs5: 'PS5',
    scopeTools: 'Tools',
    canRunBtn: 'Can Run',
    cannotRunBtn: "Can't Run",
    scanPc: 'Scan PC',
    gpuLabel: 'GPU',
    cpuLabel: 'CPU',
    ramLabel: 'RAM',
    freeDriveLabel: 'Free',
    canRunEmptyFail: 'Great news — your PC meets the requirements for all scanned items in this category!',
    canRunEmptyPass: 'No matching items found for the selected filter.',
    canRunCardPass: 'Can Run',
    mostPopularGames: 'Most Popular Games',
    showAll: 'Show All',
    hideHv: 'Hide HV',
    hideGames: 'Hide Games',
    newestFirst: 'Newest First',
    nameAz: 'A – Z',
    pageOf: 'Page',
    previous: 'Previous',
    next: 'Next',
    seeMoreNext: 'See More · Next',
    gameSingular: 'Game',
    gamePlural: 'Games',
    backToPage1: 'Back to Page 1',
    topStudios: 'Top Studios',
    viewAllStudios: 'View All Studios',
    bestTwoPlayers: 'Best games For Two Players',
    noCatalogLoaded: 'No catalog items loaded.',
  },
  library: {
    sectionLabel: 'Section',
    genresIn: 'Genres in',
    allGenres: 'All Genres',
    reset: 'Reset',
    allCountLabel: 'ALL',
    hide: 'Hide',
    show: 'Show',
    noMatchingTitles: 'No matching titles found.',
    sortBy: 'Sort By',
    sortSmart: 'Smart Sort (Best & New)',
    sortLatest: 'Newest First',
    sortAz: 'Name: A → Z',
    sortZa: 'Name: Z → A',
    sortFavorites: 'Favorites First',
    sortSizeAsc: 'Size: Smallest First',
    sortSizeDesc: 'Size: Largest First',
    sortMirrors: 'Most Download Channels',
    canRunAll: 'Can Run It: All',
    canRunPass: '✓ Can Run on This PC',
    canRunFail: "✕ Can't Run (Weak PC)",
    clear: 'Clear',
    searchPlaceholder: 'Smart search',
    emptyTitle: 'No items match your current filters',
    emptySubtitle: 'Try clearing the search query, genre filter, or switching sections.',
    previous: 'Previous',
    next: 'Next',
    next50: 'Next 50 Items',
    backToPage1: 'Back to Page 1',
    pageOf: 'Page',
    newToLibrary: 'NEW TO LIBRARY',
    pinned: 'Pinned',
    free: 'Free',
    canRunCard: '✓ Can Run on This PC',
  },
  extras: {
    upcomingList: 'Upcoming List',
    trailers: 'Trailers',
    bestSeries: 'Best Series',
    topOpenWorld: 'Top Open World Games',
    videosLabel: 'Videos',
    titleSingular: 'Title',
    titlePlural: 'Titles',
    platforms: 'Platforms',
    watchTrailer: 'Watch Trailer',
    noTrailer: 'No trailer video URL available.',
    back: 'Back',
    seriesPosters: 'Series Posters',
    gamesInSeries: 'Games in Series',
    bestBadge: 'Best',
  },
  requests: {
    pageTitle: 'Game & Tool Requests',
    formTitle: 'Submit a Catalog Request',
    formSubtitle: 'Request missing repacks, latest patches, DLC bundles, or report dead mirrors.',
    titleLabel: 'Title',
    titlePlaceholder: 'e.g., Ghost of Yotei or Forza Horizon 6 v461.691',
    categoryLabel: 'Category',
    coverUrlLabel: 'Cover URL (Optional)',
    detailsLabel: 'Details / Notes',
    detailsPlaceholder: 'Include preferred repacker, specific version or DLCs needed...',
    sending: 'Sending...',
    submitRequest: 'Submit Request',
    recentRequests: 'Recent Requests',
    noRequestsYet: 'No requests submitted yet.',
    syncedNotice: 'Request submitted successfully and saved to Google Sheet (requests)!',
    localNotice: 'Request saved to your queue. It appears in Recent Requests.',
    communitySupportTitle: 'Community & Support Us',
    joinCommunityTitle: 'Join Our Community',
    joinCommunityDesc: 'Get instant release alerts, request updates, troubleshooting support, and direct contact with SecretArea on Telegram and Discord.',
    telegramLabel: 'Telegram Community',
    telegramSub: 'Updates, new drops & quick chat',
    discordLabel: 'Discord Community',
    discordSub: 'Live support, requests & community',
    joinBtn: 'Join',
    supportBadge: 'Support SecretArea',
    supportHeadline: 'Support our mission & help us grow',
    supportDesc: 'Every contribution keeps the SecretArea launcher, catalog updates, and community requests running smoothly and completely free for everyone.',
    anonMonero: 'Anonymous · Crypto & Monero (XMR)',
    openInBrowser: 'Open in browser',
  },
  studios: {
    backToHome: 'Back to Home',
    topStudios: 'Top Studios',
    searchPlaceholder: 'Search studios...',
    noMatch: 'No studios match your search.',
    gameSingular: 'Game',
    gamePlural: 'Games',
    aboutStudio: 'About This Studio',
    noOverview: 'No studio overview available in catalog.',
    all: 'All',
    back: 'Back',
    totalTitleSingular: 'Total Title',
    totalTitlePlural: 'Total Titles',
    noItemsInCategory: 'No titles listed under this category.',
    previous: 'Previous',
    next: 'Next',
    next20Games: 'Next 20 Games',
    pageOf: 'Page',
  },
  detail: {
    back: 'Back',
    home: 'Home',
    releaseDetails: 'Release Details',
    gameId: 'Game ID',
    version: 'Version',
    originalSize: 'Original Size',
    downloadSize: 'Download Size',
    repackSize: 'Repack Size',
    downloadChannels: 'Download Channels',
    channelSingular: 'Channel',
    channelPlural: 'Channels',
    license: 'License',
    pinned: 'Pinned',
    standard: 'Standard',
    free: 'Free',
    dateAdded: 'Date Added',
    repacker: 'Repacker',
    languages: 'Languages',
    genres: 'Genres',
    watchTrailer: 'Watch Trailer',
    trailerGallery: 'Trailer & Gallery',
    switchToTrailer: 'Switch to Trailer',
    openTrailer: 'Open Trailer',
    description: 'Description',
    noDescription: 'No description provided in catalog.',
    requirementsAndCanRun: 'Requirements & Can Run It',
    requirementsOnly: 'System Requirements',
    tools: 'Tools',
    steps: 'Steps',
    completed: 'completed',
    linkedEntries: 'Linked Catalog Entries',
    hvWarningTitle: 'What is a Hypervisor Bypass?',
    hvWarningBody: 'Please read this article before proceeding with downloading and installation:',
    noChannels: 'No download channels attached to this entry.',
    recommendedTag: 'Recommended',
    recommendedForYou: 'Recommended For You',
    canRunItTitle: 'Can Run It?',
    thisPcAuto: 'This PC (Auto)',
    customPc: 'Custom PC',
    detectedPc: 'Detected PC',
    thisPcVsMinimum: 'This PC vs minimum',
    scan: 'Scan',
    myPc: 'My PC',
    close: 'Close',
    yourPcCanRun: 'Your PC · Can Run It',
    runsWell: 'Runs well',
    cantRun: "Can't run",
    checkSpecs: 'Check specs',
    weakPrefix: 'Weak',
    estimated: 'estimated',
    needsPrefix: 'needs',
    pcSpecsHeading: 'Your PC Specifications',
    resetAuto: 'Reset to Auto-Detected',
    gpuInput: 'Graphics (GPU)',
    cpuInput: 'Processor (CPU)',
    ramInput: 'RAM (GB)',
    spaceInput: 'Free Disk Space (GB, optional)',
    cancel: 'Cancel',
    compareSpecs: 'Compare Specs',
    osLabel: 'OS',
    ramLabel: 'Memory / RAM',
    cpuLabel: 'Processor / CPU',
    gpuLabel: 'Graphics / GPU',
    noReqsListed: 'No specific hardware requirements listed.',
    positive: 'Positive',
    negative: 'Negative',
  },
};

const FR: LauncherTranslations = {
  locale: 'fr-FR',
  nav: {
    home: 'Accueil',
    library: 'Bibliothèque',
    extras: 'Extras',
    requests: 'Demandes',
    settings: 'Paramètres',
    switchLight: 'Passer en mode clair',
    switchDark: 'Passer en mode sombre',
    lightLabel: 'Clair',
    darkLabel: 'Sombre',
    selectLanguage: 'Choisir la langue',
    openMenu: 'Ouvrir le menu de navigation',
    closeMenu: 'Fermer le menu de navigation',
    languageLabel: 'Langue',
    themeLabel: 'Apparence',
  },
  topbar: {
    webVersion: 'SecretArea version web',
    updatesTitle: 'À propos de SecretArea & Mises à jour',
    enterFullscreen: 'Plein écran',
    exitFullscreen: 'Quitter le plein écran',
    muteSounds: 'Lecture : PS5 Cosmic Horizon — Cliquer pour couper le son',
    enableSounds: 'Activer la musique et les sons PS5',
    muteXboxSounds: 'Lecture : Xbox Nexus — Cliquer pour couper le son',
    enableXboxSounds: 'Activer la musique et les sons Xbox',
    offlineMode: 'Mode hors ligne',
    onlineMode: 'Mode en ligne',
  },
  settings: {
    pageTitle: 'Paramètres',
    pageSubtitle: 'Personnalisez la langue, le démarrage, l’apparence de la fenêtre et l’ambiance sonore.',
    resetDefaults: 'Réinitialiser',
    resetToast: 'Paramètres réinitialisés par défaut',
    languageSectionTitle: 'Langue',
    languageSectionDesc: 'Choisissez la langue d’affichage et le sens du texte dans SecretArea.',
    rtlBadge: 'Droite → Gauche',
    ltrBadge: 'Gauche → Droite',
    startingSectionTitle: 'Démarrage et fermeture',
    startWithComputerTitle: 'Démarrer avec votre ordinateur',
    startWithComputerDesc: 'Ouvre SecretArea dans la zone de notification lors de votre connexion à cet ordinateur.',
    desktopSupportedBadge: 'Zone de notification Windows',
    webNotice: 'Le démarrage automatique dans la barre d’état s’active automatiquement dans SecretArea.exe.',
    trayActiveHint: 'Fermer la fenêtre réduit SecretArea dans la zone de notification tant que cette option est active.',
    canRunItTitle: 'Vérification matérielle « Can Run It »',
    canRunItDesc: 'Compare automatiquement les jeux et outils avec la configuration de votre PC sur l’accueil, la bibliothèque et les fiches.',
    windowSectionTitle: 'Fenêtre',
    compactNavbarTitle: 'Barre de navigation compacte',
    compactNavbarDesc: 'Afficher la barre de navigation sous forme d’icônes, même dans une large fenêtre.',
    lightModeTitle: 'Mode Clair / Sombre',
    lightModeDesc: 'Basculez entre le mode Clair lumineux et le mode Sombre. Activer un thème PS5 ou Xbox repasse en mode Sombre.',
    darkModeBadge: 'Mode Sombre',
    lightModeBadge: 'Mode Clair',
    alwaysPs5Title: 'Toujours lancer l’application avec le thème PS5',
    alwaysPs5Desc: 'Garder le thème saphir PlayStation 5 et la musique d’ambiance actifs dans tout le lanceur.',
    alwaysXboxTitle: 'Toujours lancer l’application avec le thème Xbox',
    alwaysXboxDesc: 'Appliquer le thème émeraude Xbox, l’orbe filaire et les effets sonores Xbox.',
    audioSectionTitle: 'Audio et ambiance sonore',
    audioSectionDesc: 'Activez ou coupez séparément la musique d’ambiance PS5/Xbox et les sons d’interface, et réglez le volume.',
    ambientMusicTitle: 'Musique d’ambiance (PS5 / Xbox)',
    ambientMusicDesc: 'Joue la musique spatiale PS5 ou l’ambiance émeraude Xbox Nexus lorsqu’un thème console est actif.',
    uiSoundsTitle: 'Sons de clic et survol de l’interface',
    uiSoundsDesc: 'Joue les clics, survols et tonalités de retour style console lors de la navigation.',
    volumeTitle: 'Volume principal',
    volumeDesc: 'Ajuste le niveau sonore global de la musique d’ambiance et des effets sonores de l’interface.',
    consoleThemeAudioHint: 'Activez le thème PS5 ou Xbox dans la section Fenêtre ci-dessus pour écouter l’ambiance sonore.',
    activeLabel: 'Activé',
    inactiveLabel: 'Désactivé',
  },
  store: {
    featuredSpotlight: 'À la une',
    latestRelease: 'Dernière sortie',
    download: 'Télécharger',
    watchTrailer: 'Voir la bande-annonce',
    viewDetails: 'Détails',
    exploreCatalog: 'Explorer le catalogue',
    repackVsOriginal: 'Taille Repack vs Original',
    upcomingGames: 'Jeux à venir',
    recentGames: 'Jeux récents',
    canRunTitle: 'Peut-il tourner ? — Recommandé pour votre PC',
    canRunSubtitle: 'Compare automatiquement Jeux, Hypervisor, SteamTools, PS5 et Outils avec la configuration requise',
    scopeAll: 'Tout',
    scopeGames: 'Jeux',
    scopeHypervisor: 'Hypervisor',
    scopeSteamTools: 'SteamTools',
    scopePs5: 'PS5',
    scopeTools: 'Outils',
    canRunBtn: 'Compatible',
    cannotRunBtn: 'Incompatible',
    scanPc: 'Analyser le PC',
    gpuLabel: 'GPU',
    cpuLabel: 'CPU',
    ramLabel: 'RAM',
    freeDriveLabel: 'Libre',
    canRunEmptyFail: 'Bonne nouvelle — votre PC répond aux exigences de tous les titres de cette catégorie !',
    canRunEmptyPass: 'Aucun élément correspondant pour le filtre sélectionné.',
    canRunCardPass: 'Compatible',
    mostPopularGames: 'Jeux les plus populaires',
    showAll: 'Tout afficher',
    hideHv: 'Masquer HV',
    hideGames: 'Masquer Jeux',
    newestFirst: 'Plus récents',
    nameAz: 'A – Z',
    pageOf: 'Page',
    previous: 'Précédent',
    next: 'Suivant',
    seeMoreNext: 'Voir plus ·',
    gameSingular: 'Jeu',
    gamePlural: 'Jeux',
    backToPage1: 'Retour page 1',
    topStudios: 'Meilleurs studios',
    viewAllStudios: 'Voir tous les studios',
    bestTwoPlayers: 'Meilleurs jeux à deux joueurs',
    noCatalogLoaded: 'Aucun élément de catalogue chargé.',
  },
  library: {
    sectionLabel: 'Section',
    genresIn: 'Genres dans',
    allGenres: 'Tous les genres',
    reset: 'Réinitialiser',
    allCountLabel: 'TOUT',
    hide: 'Masquer',
    show: 'Afficher',
    noMatchingTitles: 'Aucun titre correspondant.',
    sortBy: 'Trier par',
    sortSmart: 'Tri intelligent (Top & Récents)',
    sortLatest: 'Plus récents',
    sortAz: 'Nom : A → Z',
    sortZa: 'Nom : Z → A',
    sortFavorites: 'Favoris d’abord',
    sortSizeAsc: 'Taille : croissante',
    sortSizeDesc: 'Taille : décroissante',
    sortMirrors: 'Plus de liens de téléchargement',
    canRunAll: 'Compatibilité PC : Tout',
    canRunPass: '✓ Compatible avec ce PC',
    canRunFail: '✕ Incompatible (PC faible)',
    clear: 'Effacer',
    searchPlaceholder: 'Recherche intelligente',
    emptyTitle: 'Aucun élément ne correspond à vos filtres',
    emptySubtitle: 'Essayez d’effacer la recherche, le filtre de genre ou de changer de section.',
    previous: 'Précédent',
    next: 'Suivant',
    next50: '50 suivants',
    backToPage1: 'Retour page 1',
    pageOf: 'Page',
    newToLibrary: 'NOUVEAU',
    pinned: 'Épinglé',
    free: 'Gratuit',
    canRunCard: '✓ Compatible PC',
  },
  extras: {
    upcomingList: 'Liste à venir',
    trailers: 'Bandes-annonces',
    bestSeries: 'Meilleures séries',
    topOpenWorld: 'Top jeux Open World',
    videosLabel: 'Vidéos',
    titleSingular: 'Titre',
    titlePlural: 'Titres',
    platforms: 'Plateformes',
    watchTrailer: 'Voir la bande-annonce',
    noTrailer: 'Aucune URL de bande-annonce disponible.',
    back: 'Retour',
    seriesPosters: 'Affiches de la série',
    gamesInSeries: 'Jeux de la série',
    bestBadge: 'Meilleur',
  },
  requests: {
    pageTitle: 'Demandes de jeux et d’outils',
    formTitle: 'Soumettre une demande',
    formSubtitle: 'Demandez des repacks manquants, des mises à jour, des DLC ou signalez un lien mort.',
    titleLabel: 'Titre',
    titlePlaceholder: 'ex. Ghost of Yotei ou Forza Horizon 6',
    categoryLabel: 'Catégorie',
    coverUrlLabel: 'URL de jaquette (Optionnel)',
    detailsLabel: 'Détails / Notes',
    detailsPlaceholder: 'Précisez le repacker, la version ou les DLC souhaités...',
    sending: 'Envoi...',
    submitRequest: 'Envoyer la demande',
    recentRequests: 'Demandes récentes',
    noRequestsYet: 'Aucune demande envoyée pour le moment.',
    syncedNotice: 'Demande envoyée et enregistrée dans Google Sheet !',
    localNotice: 'Demande ajoutée à votre file locale.',
    communitySupportTitle: 'Communauté & Nous soutenir',
    joinCommunityTitle: 'Rejoindre la communauté',
    joinCommunityDesc: 'Recevez les alertes de sorties, les réponses aux demandes et le support sur Telegram et Discord.',
    telegramLabel: 'Communauté Telegram',
    telegramSub: 'Mises à jour, sorties et chat rapide',
    discordLabel: 'Communauté Discord',
    discordSub: 'Support en direct et communauté',
    joinBtn: 'Rejoindre',
    supportBadge: 'Soutenir SecretArea',
    supportHeadline: 'Soutenez notre mission et aidez-nous à grandir',
    supportDesc: 'Chaque contribution maintient le lanceur SecretArea, les mises à jour et les demandes 100 % gratuits pour tous.',
    anonMonero: 'Anonyme · Crypto & Monero (XMR)',
    openInBrowser: 'Ouvrir dans le navigateur',
  },
  studios: {
    backToHome: 'Retour à l’accueil',
    topStudios: 'Meilleurs studios',
    searchPlaceholder: 'Rechercher un studio...',
    noMatch: 'Aucun studio trouvé.',
    gameSingular: 'Jeu',
    gamePlural: 'Jeux',
    aboutStudio: 'À propos de ce studio',
    noOverview: 'Aucune description disponible.',
    all: 'Tout',
    back: 'Retour',
    totalTitleSingular: 'Titre au total',
    totalTitlePlural: 'Titres au total',
    noItemsInCategory: 'Aucun titre dans cette catégorie.',
    previous: 'Précédent',
    next: 'Suivant',
    next20Games: '20 jeux suivants',
    pageOf: 'Page',
  },
  detail: {
    back: 'Retour',
    home: 'Accueil',
    releaseDetails: 'Détails de la sortie',
    gameId: 'ID du jeu',
    version: 'Version',
    originalSize: 'Taille originale',
    downloadSize: 'Taille du téléchargement',
    repackSize: 'Taille du Repack',
    downloadChannels: 'Liens de téléchargement',
    channelSingular: 'Source',
    channelPlural: 'Sources',
    license: 'Licence',
    pinned: 'Épinglé',
    standard: 'Standard',
    free: 'Gratuit',
    dateAdded: 'Date d’ajout',
    repacker: 'Repacker',
    languages: 'Langues',
    genres: 'Genres',
    watchTrailer: 'Bande-annonce',
    trailerGallery: 'Bande-annonce & Galerie',
    switchToTrailer: 'Passer à la bande-annonce',
    openTrailer: 'Ouvrir la bande-annonce',
    description: 'Description',
    noDescription: 'Aucune description disponible.',
    requirementsAndCanRun: 'Configuration requise & Compatibilité',
    requirementsOnly: 'Configuration requise',
    tools: 'Outils',
    steps: 'Étapes d’installation',
    completed: 'terminées',
    linkedEntries: 'Entrées liées',
    hvWarningTitle: 'Qu’est-ce qu’un contournement Hypervisor ?',
    hvWarningBody: 'Veuillez lire cet article avant de télécharger et d’installer :',
    noChannels: 'Aucun lien de téléchargement disponible.',
    recommendedTag: 'Recommandé',
    recommendedForYou: 'Recommandé pour vous',
    canRunItTitle: 'Peut-il tourner ?',
    thisPcAuto: 'Ce PC (Auto)',
    customPc: 'PC personnalisé',
    detectedPc: 'PC détecté',
    thisPcVsMinimum: 'Ce PC vs minimum',
    scan: 'Scanner',
    myPc: 'Mon PC',
    close: 'Fermer',
    yourPcCanRun: 'Votre PC · Compatibilité',
    runsWell: 'Tourne bien',
    cantRun: 'Incompatible',
    checkSpecs: 'Vérifier specs',
    weakPrefix: 'Faible',
    estimated: 'estimé',
    needsPrefix: 'requis',
    pcSpecsHeading: 'Spécifications de votre PC',
    resetAuto: 'Réinitialiser (Auto)',
    gpuInput: 'Carte graphique (GPU)',
    cpuInput: 'Processeur (CPU)',
    ramInput: 'Mémoire RAM (Go)',
    spaceInput: 'Espace disque libre (Go, optionnel)',
    cancel: 'Annuler',
    compareSpecs: 'Comparer',
    osLabel: 'Système (OS)',
    ramLabel: 'Mémoire / RAM',
    cpuLabel: 'Processeur / CPU',
    gpuLabel: 'Carte graphique / GPU',
    noReqsListed: 'Aucune configuration matérielle spécifiée.',
    positive: 'Positif',
    negative: 'Négatif',
  },
};

const ES: LauncherTranslations = {
  locale: 'es-ES',
  nav: {
    home: 'Inicio',
    library: 'Biblioteca',
    extras: 'Extras',
    requests: 'Solicitudes',
    settings: 'Ajustes',
    switchLight: 'Cambiar a modo claro',
    switchDark: 'Cambiar a modo oscuro',
    lightLabel: 'Claro',
    darkLabel: 'Oscuro',
    selectLanguage: 'Seleccionar idioma',
    openMenu: 'Abrir menú de navegación',
    closeMenu: 'Cerrar menú de navegación',
    languageLabel: 'Idioma',
    themeLabel: 'Apariencia',
  },
  topbar: {
    webVersion: 'SecretArea versión web',
    updatesTitle: 'Acerca de SecretArea y Buscar actualizaciones',
    enterFullscreen: 'Pantalla completa',
    exitFullscreen: 'Salir de pantalla completa',
    muteSounds: 'Reproduciendo: PS5 Cosmic Horizon — Clic para silenciar',
    enableSounds: 'Activar música y sonidos PS5',
    muteXboxSounds: 'Reproduciendo: Xbox Nexus — Clic para silenciar',
    enableXboxSounds: 'Activar música y sonidos Xbox',
    offlineMode: 'Modo sin conexión',
    onlineMode: 'Modo en línea',
  },
  settings: {
    pageTitle: 'Ajustes',
    pageSubtitle: 'Personaliza el idioma, el inicio, la apariencia de la ventana y el paisaje sonoro.',
    resetDefaults: 'Restablecer',
    resetToast: 'Ajustes restablecidos a los valores predeterminados',
    languageSectionTitle: 'Idioma',
    languageSectionDesc: 'Elige el idioma de la interfaz y la dirección del texto en SecretArea.',
    rtlBadge: 'Derecha → Izquierda',
    ltrBadge: 'Izquierda → Derecha',
    startingSectionTitle: 'Inicio y cierre',
    startWithComputerTitle: 'Iniciar con tu computadora',
    startWithComputerDesc: 'Abre SecretArea en la bandeja del sistema al iniciar sesión en este equipo.',
    desktopSupportedBadge: 'Bandeja de Windows',
    webNotice: 'El inicio automático en bandeja se activa en la aplicación de escritorio SecretArea.exe.',
    trayActiveHint: 'Al cerrar la ventana, SecretArea permanecerá en la bandeja del sistema mientras esta opción esté activa.',
    canRunItTitle: 'Comprobación de hardware «Can Run It»',
    canRunItDesc: 'Compara juegos y herramientas con los requisitos de tu PC en Inicio, Biblioteca y fichas de juegos.',
    windowSectionTitle: 'Ventana',
    compactNavbarTitle: 'Barra de navegación compacta',
    compactNavbarDesc: 'Muestra la barra de navegación como iconos, incluso en una ventana ancha.',
    lightModeTitle: 'Modo Claro / Oscuro',
    lightModeDesc: 'Alterna entre el modo Claro y el modo Oscuro. Al activar el tema PS5 o Xbox vuelve al modo Oscuro.',
    darkModeBadge: 'Modo Oscuro',
    lightModeBadge: 'Modo Claro',
    alwaysPs5Title: 'Ejecutar siempre con tema PS5',
    alwaysPs5Desc: 'Mantén activo el tema zafiro de PlayStation 5 y su ambiente sonoro en todo el lanzador.',
    alwaysXboxTitle: 'Ejecutar siempre con tema Xbox',
    alwaysXboxDesc: 'Aplica el tema esmeralda de Xbox, el fondo de malla geométrica con orbe verde y sonidos de Xbox.',
    audioSectionTitle: 'Audio y sonido',
    audioSectionDesc: 'Activa o silencia por separado la música ambiental de PS5/Xbox y los clics de interfaz, y ajusta el volumen.',
    ambientMusicTitle: 'Música ambiental de fondo (PS5 / Xbox)',
    ambientMusicDesc: 'Reproduce la música ambiental espacial de PS5 o esmeralda de Xbox Nexus cuando hay un tema de consola activo.',
    uiSoundsTitle: 'Sonidos de clic y enfoque en la interfaz',
    uiSoundsDesc: 'Reproduce tonos suaves de enfoque, confirmación y retroceso al navegar por botones y tarjetas.',
    volumeTitle: 'Volumen principal',
    volumeDesc: 'Ajusta el nivel de salida tanto para la música ambiental como para los efectos de sonido de la interfaz.',
    consoleThemeAudioHint: 'Selecciona el tema PS5 o Xbox en Ventana arriba para escuchar el paisaje sonoro de consola.',
    activeLabel: 'Activado',
    inactiveLabel: 'Desactivado',
  },
  store: {
    featuredSpotlight: 'Destacado',
    latestRelease: 'Último lanzamiento',
    download: 'Descargar',
    watchTrailer: 'Ver tráiler',
    viewDetails: 'Detalles',
    exploreCatalog: 'Explorar catálogo',
    repackVsOriginal: 'Tamaño Repack vs Original',
    upcomingGames: 'Próximos juegos',
    recentGames: 'Juegos recientes',
    canRunTitle: '¿Puede correrlo? — Recomendado para tu PC',
    canRunSubtitle: 'Compara automáticamente Juegos, Hypervisor, SteamTools, PS5 y Herramientas con los requisitos de tu PC',
    scopeAll: 'Todo',
    scopeGames: 'Juegos',
    scopeHypervisor: 'Hypervisor',
    scopeSteamTools: 'SteamTools',
    scopePs5: 'PS5',
    scopeTools: 'Herramientas',
    canRunBtn: 'Compatible',
    cannotRunBtn: 'No compatible',
    scanPc: 'Escanear PC',
    gpuLabel: 'GPU',
    cpuLabel: 'CPU',
    ramLabel: 'RAM',
    freeDriveLabel: 'Libre',
    canRunEmptyFail: '¡Buenas noticias — tu PC cumple con los requisitos de todos los elementos de esta categoría!',
    canRunEmptyPass: 'No se encontraron elementos para el filtro seleccionado.',
    canRunCardPass: 'Compatible',
    mostPopularGames: 'Juegos más populares',
    showAll: 'Mostrar todo',
    hideHv: 'Ocultar HV',
    hideGames: 'Ocultar Juegos',
    newestFirst: 'Más recientes',
    nameAz: 'A – Z',
    pageOf: 'Página',
    previous: 'Anterior',
    next: 'Siguiente',
    seeMoreNext: 'Ver más · Siguientes',
    gameSingular: 'Juego',
    gamePlural: 'Juegos',
    backToPage1: 'Volver a pág. 1',
    topStudios: 'Mejores estudios',
    viewAllStudios: 'Ver todos los estudios',
    bestTwoPlayers: 'Mejores juegos para dos jugadores',
    noCatalogLoaded: 'No hay elementos cargados.',
  },
  library: {
    sectionLabel: 'Sección',
    genresIn: 'Géneros en',
    allGenres: 'Todos los géneros',
    reset: 'Restablecer',
    allCountLabel: 'TODO',
    hide: 'Ocultar',
    show: 'Mostrar',
    noMatchingTitles: 'No se encontraron títulos.',
    sortBy: 'Ordenar por',
    sortSmart: 'Orden inteligente (Top y Nuevos)',
    sortLatest: 'Más recientes',
    sortAz: 'Nombre: A → Z',
    sortZa: 'Nombre: Z → A',
    sortFavorites: 'Favoritos primero',
    sortSizeAsc: 'Tamaño: menor a mayor',
    sortSizeDesc: 'Tamaño: mayor a menor',
    sortMirrors: 'Más canales de descarga',
    canRunAll: 'Compatibilidad PC: Todo',
    canRunPass: '✓ Funciona en este PC',
    canRunFail: '✕ No funciona (PC débil)',
    clear: 'Limpiar',
    searchPlaceholder: 'Búsqueda inteligente',
    emptyTitle: 'Ningún elemento coincide con tus filtros',
    emptySubtitle: 'Prueba limpiar la búsqueda, el filtro de género o cambiar de sección.',
    previous: 'Anterior',
    next: 'Siguiente',
    next50: 'Siguientes 50',
    backToPage1: 'Volver a pág. 1',
    pageOf: 'Página',
    newToLibrary: 'NUEVO',
    pinned: 'Fijado',
    free: 'Gratis',
    canRunCard: '✓ Funciona en este PC',
  },
  extras: {
    upcomingList: 'Lista próxima',
    trailers: 'Tráileres',
    bestSeries: 'Mejores sagas',
    topOpenWorld: 'Top juegos Open World',
    videosLabel: 'Videos',
    titleSingular: 'Título',
    titlePlural: 'Títulos',
    platforms: 'Plataformas',
    watchTrailer: 'Ver tráiler',
    noTrailer: 'No hay URL de tráiler disponible.',
    back: 'Volver',
    seriesPosters: 'Pósteres de la saga',
    gamesInSeries: 'Juegos en la saga',
    bestBadge: 'Mejor',
  },
  requests: {
    pageTitle: 'Solicitudes de juegos y herramientas',
    formTitle: 'Enviar una solicitud al catálogo',
    formSubtitle: 'Solicita repacks faltantes, parches recientes, DLCs o reporta enlaces caídos.',
    titleLabel: 'Título',
    titlePlaceholder: 'ej., Ghost of Yotei o Forza Horizon 6',
    categoryLabel: 'Categoría',
    coverUrlLabel: 'URL de portada (Opcional)',
    detailsLabel: 'Detalles / Notas',
    detailsPlaceholder: 'Incluye repacker preferido, versión específica o DLCs...',
    sending: 'Enviando...',
    submitRequest: 'Enviar solicitud',
    recentRequests: 'Solicitudes recientes',
    noRequestsYet: 'Aún no hay solicitudes enviadas.',
    syncedNotice: '¡Solicitud enviada y guardada en Google Sheet!',
    localNotice: 'Solicitud guardada en tu cola local.',
    communitySupportTitle: 'Comunidad y Apóyanos',
    joinCommunityTitle: 'Únete a nuestra comunidad',
    joinCommunityDesc: 'Recibe alertas de lanzamientos, respuestas a solicitudes y soporte directo en Telegram y Discord.',
    telegramLabel: 'Comunidad Telegram',
    telegramSub: 'Novedades, estrenos y chat rápido',
    discordLabel: 'Comunidad Discord',
    discordSub: 'Soporte en vivo y comunidad',
    joinBtn: 'Unirse',
    supportBadge: 'Apoyar SecretArea',
    supportHeadline: 'Apoya nuestra misión y ayúdanos a crecer',
    supportDesc: 'Cada contribución mantiene el lanzador SecretArea, el catálogo y las solicitudes gratuitos para todos.',
    anonMonero: 'Anónimo · Cripto y Monero (XMR)',
    openInBrowser: 'Abrir en el navegador',
  },
  studios: {
    backToHome: 'Volver al inicio',
    topStudios: 'Mejores estudios',
    searchPlaceholder: 'Buscar estudios...',
    noMatch: 'Ningún estudio coincide con la búsqueda.',
    gameSingular: 'Juego',
    gamePlural: 'Juegos',
    aboutStudio: 'Sobre este estudio',
    noOverview: 'Sin descripción disponible en el catálogo.',
    all: 'Todo',
    back: 'Volver',
    totalTitleSingular: 'Título en total',
    totalTitlePlural: 'Títulos en total',
    noItemsInCategory: 'No hay títulos en esta categoría.',
    previous: 'Anterior',
    next: 'Siguiente',
    next20Games: 'Siguientes 20 juegos',
    pageOf: 'Página',
  },
  detail: {
    back: 'Volver',
    home: 'Inicio',
    releaseDetails: 'Detalles del lanzamiento',
    gameId: 'ID del juego',
    version: 'Versión',
    originalSize: 'Tamaño original',
    downloadSize: 'Tamaño descarga',
    repackSize: 'Tamaño Repack',
    downloadChannels: 'Canales de descarga',
    channelSingular: 'Canal',
    channelPlural: 'Canales',
    license: 'Licencia',
    pinned: 'Fijado',
    standard: 'Estándar',
    free: 'Gratis',
    dateAdded: 'Fecha añadido',
    repacker: 'Repacker',
    languages: 'Idiomas',
    genres: 'Géneros',
    watchTrailer: 'Ver tráiler',
    trailerGallery: 'Tráiler y Galería',
    switchToTrailer: 'Ir al tráiler',
    openTrailer: 'Abrir tráiler',
    description: 'Descripción',
    noDescription: 'No hay descripción disponible.',
    requirementsAndCanRun: 'Requisitos y Compatibilidad',
    requirementsOnly: 'Requisitos del sistema',
    tools: 'Herramientas',
    steps: 'Pasos de instalación',
    completed: 'completados',
    linkedEntries: 'Entradas vinculadas',
    hvWarningTitle: '¿Qué es un bypass Hypervisor?',
    hvWarningBody: 'Lee este artículo antes de descargar e instalar:',
    noChannels: 'No hay enlaces de descarga disponibles.',
    recommendedTag: 'Recomendado',
    recommendedForYou: 'Recomendado para ti',
    canRunItTitle: '¿Puede correrlo?',
    thisPcAuto: 'Este PC (Auto)',
    customPc: 'PC personalizado',
    detectedPc: 'PC detectado',
    thisPcVsMinimum: 'Este PC vs mínimo',
    scan: 'Escanear',
    myPc: 'Mi PC',
    close: 'Cerrar',
    yourPcCanRun: 'Tu PC · Compatibilidad',
    runsWell: 'Funciona bien',
    cantRun: 'No funciona',
    checkSpecs: 'Ver requisitos',
    weakPrefix: 'Débil',
    estimated: 'estimado',
    needsPrefix: 'requiere',
    pcSpecsHeading: 'Especificaciones de tu PC',
    resetAuto: 'Restablecer autodetección',
    gpuInput: 'Gráficos (GPU)',
    cpuInput: 'Procesador (CPU)',
    ramInput: 'RAM (GB)',
    spaceInput: 'Espacio libre en disco (GB, opcional)',
    cancel: 'Cancelar',
    compareSpecs: 'Comparar',
    osLabel: 'Sistema operativo',
    ramLabel: 'Memoria / RAM',
    cpuLabel: 'Procesador / CPU',
    gpuLabel: 'Gráficos / GPU',
    noReqsListed: 'No se especifican requisitos de hardware.',
    positive: 'Positivo',
    negative: 'Negativo',
  },
};

const AR: LauncherTranslations = {
  locale: 'ar-EG-u-nu-latn',
  nav: {
    home: 'الرئيسية',
    library: 'المكتبة',
    extras: 'إضافات',
    requests: 'الطلبات',
    settings: 'الإعدادات',
    switchLight: 'التبديل إلى الوضع الفاتح',
    switchDark: 'التبديل إلى الوضع الداكن',
    lightLabel: 'فاتح',
    darkLabel: 'داكن',
    selectLanguage: 'اختر اللغة',
    openMenu: 'فتح قائمة التنقل',
    closeMenu: 'إغلاق قائمة التنقل',
    languageLabel: 'اللغة',
    themeLabel: 'المظهر',
  },
  topbar: {
    webVersion: 'نسخة الويب SecretArea',
    updatesTitle: 'حول SecretArea والتحقق من التحديثات',
    enterFullscreen: 'ملء الشاشة',
    exitFullscreen: 'إنهاء ملء الشاشة',
    muteSounds: 'قيد التشغيل: موسيقى PS5 — انقر لكتم الصوت',
    enableSounds: 'تفعيل موسيقى وأصوات PS5',
    muteXboxSounds: 'قيد التشغيل: أصوات Xbox — انقر لكتم الصوت',
    enableXboxSounds: 'تفعيل موسيقى وأصوات Xbox',
    offlineMode: 'وضع عدم الاتصال',
    onlineMode: 'متصل بالإنترنت',
  },
  settings: {
    pageTitle: 'الإعدادات',
    pageSubtitle: 'تخصيص لغة المشغّل، البدء والإغلاق، مظهر النافذة، والمؤثرات الصوتية.',
    resetDefaults: 'استعادة الافتراضي',
    resetToast: 'تمت استعادة الإعدادات الافتراضية',
    languageSectionTitle: 'اللغة',
    languageSectionDesc: 'اختر لغة واجهة المشغّل واتجاه العرض في SecretArea.',
    rtlBadge: 'يمين ← يسار',
    ltrBadge: 'يسار → يمين',
    startingSectionTitle: 'البدء والإغلاق',
    startWithComputerTitle: 'التشغيل مع جهاز الكمبيوتر',
    startWithComputerDesc: 'يفتح SecretArea في شريط المهام (Tray) عند تسجيل الدخول إلى هذا الكمبيوتر.',
    desktopSupportedBadge: 'تشغيل تلقائي في Tray',
    webNotice: 'يتفعّل التشغيل التلقائي في شريط النظام تلقائياً داخل تطبيق سطح المكتب SecretArea.exe.',
    trayActiveHint: 'عند تفعيل هذا الخيار، يؤدي إغلاق النافذة إلى تصغير SecretArea إلى شريط النظام.',
    canRunItTitle: 'فحص التوافق مع الجهاز (Can Run It)',
    canRunItDesc: 'مقارنة الألعاب والأدوات تلقائياً مع مواصفات جهازك في الصفحة الرئيسية والمكتبة وصفحات الألعاب.',
    windowSectionTitle: 'النافذة',
    compactNavbarTitle: 'شريط تنقّل مدمج',
    compactNavbarDesc: 'إظهار شريط التنقّل كأيقونات فقط، حتى في النافذة العريضة.',
    lightModeTitle: 'الوضع الفاتح / الداكن',
    lightModeDesc: 'التبديل بين الوضع الفاتح والوضع الداكن. تفعيل مظهر PS5 أو Xbox يعيد التبديل إلى الوضع الداكن.',
    darkModeBadge: 'الوضع الداكن',
    lightModeBadge: 'الوضع الفاتح',
    alwaysPs5Title: 'تشغيل التطبيق دائماً بمظهر PS5',
    alwaysPs5Desc: 'تشغيل مظهر PlayStation 5 الياقوتي والموسيقى المحيطة في كامل المشغّل.',
    alwaysXboxTitle: 'تشغيل التطبيق دائماً بمظهر Xbox',
    alwaysXboxDesc: 'تطبيق مظهر Xbox الأخضر الزمردي وخلفية الشبكة والكرة المضيئة مع مؤثرات Xbox الصوتية.',
    audioSectionTitle: 'الصوت والمشهد الصوتي',
    audioSectionDesc: 'التحكم المنفصل في الموسيقى المحيطة لـ PS5 و Xbox مقابل أصوات النقر في الواجهة مع شريط مستوى الصوت.',
    ambientMusicTitle: 'الموسيقى المحيطة بالخلفية (PS5 / Xbox)',
    ambientMusicDesc: 'تشغيل الموسيقى المحيطة الهادئة لـ PS5 أو Xbox Nexus عند تفعيل أحد مظاهر الكونسول.',
    uiSoundsTitle: 'أصوات النقر والتمرير في الواجهة',
    uiSoundsDesc: 'تشغيل نقرات التركيز ونغمات التأكيد والرجوع عند التنقل بين الأزرار والبطاقات.',
    volumeTitle: 'مستوى الصوت الرئيسي',
    volumeDesc: 'ضبط مستوى الصوت العام لكل من الموسيقى المحيطة ومؤثرات الواجهة الصوتية.',
    consoleThemeAudioHint: 'اختر مظهر PS5 أو Xbox في قسم النافذة أعلاه لسماع المشهد الصوتي النشط.',
    activeLabel: 'مفعّل',
    inactiveLabel: 'متوقف',
  },
  store: {
    featuredSpotlight: 'اختيار مميز',
    latestRelease: 'أحدث إصدار',
    download: 'تحميل',
    watchTrailer: 'مشاهدة العرض',
    viewDetails: 'التفاصيل',
    exploreCatalog: 'تصفح الكتالوج',
    repackVsOriginal: 'حجم الريباك مقابل الأصلي',
    upcomingGames: 'الألعاب القادمة',
    recentGames: 'أحدث الألعاب',
    canRunTitle: 'هل يعمل على جهازك؟ — موصى به لجهازك',
    canRunSubtitle: 'يقارن تلقائياً الألعاب و Hypervisor و SteamTools و PS5 والأدوات مع متطلبات التشغيل',
    scopeAll: 'الكل',
    scopeGames: 'الألعاب',
    scopeHypervisor: 'Hypervisor',
    scopeSteamTools: 'SteamTools',
    scopePs5: 'PS5',
    scopeTools: 'الأدوات',
    canRunBtn: 'يعمل بكفاءة',
    cannotRunBtn: 'لا يعمل',
    scanPc: 'فحص الجهاز',
    gpuLabel: 'كرت الشاشة',
    cpuLabel: 'المعالج',
    ramLabel: 'الذاكرة',
    freeDriveLabel: 'المساحة الحرة',
    canRunEmptyFail: 'خبر سار — جهازك يلبّي متطلبات جميع العناصر في هذا القسم!',
    canRunEmptyPass: 'لا توجد عناصر مطابقة للتصفية الحالية.',
    canRunCardPass: 'يعمل',
    mostPopularGames: 'الألعاب الأكثر شعبية',
    showAll: 'عرض الكل',
    hideHv: 'إخفاء HV',
    hideGames: 'إخفاء الألعاب',
    newestFirst: 'الأحدث أولاً',
    nameAz: 'أ – ي',
    pageOf: 'صفحة',
    previous: 'السابق',
    next: 'التالي',
    seeMoreNext: 'عرض المزيد · التالي',
    gameSingular: 'لعبة',
    gamePlural: 'ألعاب',
    backToPage1: 'العودة للصفحة 1',
    topStudios: 'أفضل الاستوديوهات',
    viewAllStudios: 'عرض كل الاستوديوهات',
    bestTwoPlayers: 'أفضل ألعاب للاعبين اثنين',
    noCatalogLoaded: 'لا توجد عناصر محمّلة.',
  },
  library: {
    sectionLabel: 'القسم',
    genresIn: 'التصنيفات في',
    allGenres: 'جميع التصنيفات',
    reset: 'إعادة ضبط',
    allCountLabel: 'الكل',
    hide: 'إخفاء',
    show: 'إظهار',
    noMatchingTitles: 'لا توجد عناوين مطابقة.',
    sortBy: 'ترتيب حسب',
    sortSmart: 'ترتيب ذكي (الأفضل والجديد)',
    sortLatest: 'الأحدث أولاً',
    sortAz: 'الاسم: أ ← ي',
    sortZa: 'الاسم: ي ← أ',
    sortFavorites: 'المفضلة أولاً',
    sortSizeAsc: 'الحجم: الأصغر أولاً',
    sortSizeDesc: 'الحجم: الأكبر أولاً',
    sortMirrors: 'أكثر روابط تحميل',
    canRunAll: 'التوافق مع الجهاز: الكل',
    canRunPass: '✓ يعمل على هذا الجهاز',
    canRunFail: '✕ لا يعمل (مواصفات أضعف)',
    clear: 'مسح',
    searchPlaceholder: 'بحث ذكي في',
    emptyTitle: 'لا توجد عناصر تطابق عوامل التصفية الحالية',
    emptySubtitle: 'جرّب مسح البحث أو تغيير التصنيف أو الانتقال إلى قسم آخر.',
    previous: 'السابق',
    next: 'التالي',
    next50: 'الـ 50 عنصر التالي',
    backToPage1: 'العودة للصفحة 1',
    pageOf: 'صفحة',
    newToLibrary: 'جديد في المكتبة',
    pinned: 'مثبت',
    free: 'مجاني',
    canRunCard: '✓ يعمل على جهازك',
  },
  extras: {
    upcomingList: 'قائمة الإصدارات القادمة',
    trailers: 'العروض الدعائية',
    bestSeries: 'أفضل السلاسل',
    topOpenWorld: 'أفضل ألعاب العالم المفتوح',
    videosLabel: 'فيديوهات',
    titleSingular: 'عنوان',
    titlePlural: 'عناوين',
    platforms: 'المنصات',
    watchTrailer: 'مشاهدة العرض',
    noTrailer: 'لا يوجد رابط فيديو متاح.',
    back: 'رجوع',
    seriesPosters: 'ملصقات السلسلة',
    gamesInSeries: 'الألعاب في السلسلة',
    bestBadge: 'الأفضل',
  },
  requests: {
    pageTitle: 'طلبات الألعاب والأدوات',
    formTitle: 'إرسال طلب جديد',
    formSubtitle: 'اطلب الألعاب المفقودة أو التحديثات والإضافات أو أبلغ عن رابط معطّل.',
    titleLabel: 'العنوان',
    titlePlaceholder: 'مثال: Ghost of Yotei أو Forza Horizon 6',
    categoryLabel: 'الفئة',
    coverUrlLabel: 'رابط صورة الغلاف (اختياري)',
    detailsLabel: 'التفاصيل والملاحظات',
    detailsPlaceholder: 'اذكر الريباك المفضّل أو رقم الإصدار أو الإضافات المطلوبة...',
    sending: 'جارٍ الإرسال...',
    submitRequest: 'إرسال الطلب',
    recentRequests: 'الطلبات الأخيرة',
    noRequestsYet: 'لم يتم إرسال أي طلبات بعد.',
    syncedNotice: 'تم إرسال الطلب وحفظه بنجاح!',
    localNotice: 'تم حفظ الطلب في قائمتك المحلية.',
    communitySupportTitle: 'المجتمع ودعم المشروع',
    joinCommunityTitle: 'انضم إلى مجتمعنا',
    joinCommunityDesc: 'احصل على تنبيهات الإصدارات الجديدة وتحديثات الطلبات والدعم المباشر عبر تيليجرام وديسكورد.',
    telegramLabel: 'مجتمع تيليجرام',
    telegramSub: 'تحديثات وإصدارات جديدة ودردشة سريعة',
    discordLabel: 'مجتمع ديسكورد',
    discordSub: 'دعم مباشر وطلبات ومجتمع اللاعبين',
    joinBtn: 'انضم',
    supportBadge: 'ادعم SecretArea',
    supportHeadline: 'ادعم رسالتنا وساعدنا على الاستمرار',
    supportDesc: 'كل مساهمة تساعد في إبقاء مشغّل SecretArea وتحديثات الكتالوج والطلبات مجانية تماماً للجميع.',
    anonMonero: 'مجهول · عملات رقمية و Monero (XMR)',
    openInBrowser: 'فتح في المتصفح',
  },
  studios: {
    backToHome: 'العودة للرئيسية',
    topStudios: 'أفضل الاستوديوهات',
    searchPlaceholder: 'ابحث عن استوديو...',
    noMatch: 'لا توجد استوديوهات مطابقة لبحثك.',
    gameSingular: 'لعبة',
    gamePlural: 'ألعاب',
    aboutStudio: 'حول هذا الاستوديو',
    noOverview: 'لا يوجد وصف متاح لهذا الاستوديو.',
    all: 'الكل',
    back: 'رجوع',
    totalTitleSingular: 'عنوان إجمالي',
    totalTitlePlural: 'عناوين إجمالية',
    noItemsInCategory: 'لا توجد عناوين في هذه الفئة.',
    previous: 'السابق',
    next: 'التالي',
    next20Games: 'الـ 20 لعبة التالية',
    pageOf: 'صفحة',
  },
  detail: {
    back: 'رجوع',
    home: 'الرئيسية',
    releaseDetails: 'تفاصيل الإصدار',
    gameId: 'معرّف اللعبة',
    version: 'الإصدار',
    originalSize: 'الحجم الأصلي',
    downloadSize: 'حجم التحميل',
    repackSize: 'حجم الريباك',
    downloadChannels: 'روابط التحميل',
    channelSingular: 'قناة',
    channelPlural: 'قنوات',
    license: 'الترخيص',
    pinned: 'مثبت',
    standard: 'قياسي',
    free: 'مجاني',
    dateAdded: 'تاريخ الإضافة',
    repacker: 'الناشر',
    languages: 'اللغات',
    genres: 'التصنيفات',
    watchTrailer: 'مشاهدة العرض',
    trailerGallery: 'العرض والمعرض',
    switchToTrailer: 'الانتقال إلى العرض',
    openTrailer: 'فتح العرض',
    description: 'الوصف',
    noDescription: 'لا يوجد وصف متاح في الكتالوج.',
    requirementsAndCanRun: 'متطلبات التشغيل وفحص التوافق',
    requirementsOnly: 'متطلبات التشغيل',
    tools: 'الأدوات',
    steps: 'خطوات التثبيت',
    completed: 'مكتمل',
    linkedEntries: 'إدخالات مرتبطة',
    hvWarningTitle: 'ما هو Hypervisor Bypass؟',
    hvWarningBody: 'يرجى قراءة هذا الدليل قبل التحميل والتثبيت:',
    noChannels: 'لا توجد روابط تحميل مرفقة بهذا العنصر.',
    recommendedTag: 'موصى به',
    recommendedForYou: 'موصى به لك',
    canRunItTitle: 'هل يعمل على جهازك؟',
    thisPcAuto: 'هذا الجهاز (تلقائي)',
    customPc: 'جهاز مخصص',
    detectedPc: 'المواصفات المكتشفة',
    thisPcVsMinimum: 'جهازك مقابل الحد الأدنى',
    scan: 'فحص',
    myPc: 'جهازي',
    close: 'إغلاق',
    yourPcCanRun: 'جهازك · التوافق',
    runsWell: 'يعمل بكفاءة',
    cantRun: 'لا يعمل',
    checkSpecs: 'فحص المواصفات',
    weakPrefix: 'نقطة ضعف',
    estimated: 'تقديري',
    needsPrefix: 'يتطلب',
    pcSpecsHeading: 'مواصفات جهازك',
    resetAuto: 'استعادة الكشف التلقائي',
    gpuInput: 'كرت الشاشة (GPU)',
    cpuInput: 'المعالج (CPU)',
    ramInput: 'الذاكرة العشوائية (GB)',
    spaceInput: 'المساحة الحرة (GB، اختياري)',
    cancel: 'إلغاء',
    compareSpecs: 'مقارنة المواصفات',
    osLabel: 'نظام التشغيل',
    ramLabel: 'الذاكرة / RAM',
    cpuLabel: 'المعالج / CPU',
    gpuLabel: 'كرت الشاشة / GPU',
    noReqsListed: 'لم يتم إدراج متطلبات تشغيل محددة.',
    positive: 'إيجابي',
    negative: 'سلبي',
  },
};

const TRANSLATIONS: Record<AppLanguage, LauncherTranslations> = {
  en: EN,
  fr: FR,
  es: ES,
  ar: AR,
};

export function getTranslations(language: AppLanguage = 'en'): LauncherTranslations {
  return TRANSLATIONS[language] || EN;
}

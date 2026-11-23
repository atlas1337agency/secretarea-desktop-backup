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
    downloads: string;
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
    downloadSectionTitle: string;
    downloadFolderTitle: string;
    downloadFolderDesc: string;
    chooseFolderBtn: string;
    openFolderBtn: string;
    torrentSectionTitle: string;
    torrentSectionDesc: string;
    torrentEnableTitle: string;
    torrentEnableDesc: string;
    torrentAutoDetectBtn: string;
    torrentDetectingBtn: string;
    torrentTestBtn: string;
    torrentTestingBtn: string;
    torrentSaveBtn: string;
    torrentSavingBtn: string;
    torrentStatusConnected: string;
    torrentStatusDisconnected: string;
    torrentStatusTesting: string;
    torrentNotInstalledTitle: string;
    torrentNotInstalledDesc: string;
    torrentDownloadBtn: string;
    torrentHostLabel: string;
    torrentPortLabel: string;
    torrentUsernameLabel: string;
    torrentPasswordLabel: string;
    torrentPasswordSavedPlaceholder: string;
    torrentApiKeyLabel: string;
    torrentApiKeyPlaceholder: string;
    torrentApiKeySavedPlaceholder: string;
    torrentLoopbackNotice: string;
    torrentLoopbackError: string;
    torrentGuideTitle: string;
    torrentGuideStep1: string;
    torrentGuideStep2: string;
    torrentGuideStep3: string;
    torrentGuideStep4: string;
    torrentGuideStep5: string;
    torrentWebNotice: string;
    torrentTestingWebPreviewMsg: string;
    torrentTestingWebPreviewHint: string;
    modeDesktopBadge: string;
    modeWebPreviewBadge: string;
    torrentSavedToast: string;
    torrentManageSetupBtn: string;
    replaySetupBtn: string;
  };
  downloads: {
    pageTitle: string;
    pageSubtitle: string;
    quickAddPlaceholder: string;
    quickAddBtn: string;
    addTorrentFileBtn: string;
    quickAddInvalid: string;
    folderLabel: string;
    chooseFolder: string;
    openFolder: string;
    clearFinished: string;
    tabAll: string;
    tabActive: string;
    tabPaused: string;
    tabCompleted: string;
    tabFailed: string;
    searchPlaceholder: string;
    metricActive: string;
    metricSpeed: string;
    metricCompleted: string;
    metricFreeDisk: string;
    statusQueued: string;
    statusResolving: string;
    statusDownloading: string;
    statusPaused: string;
    statusCompleted: string;
    statusFailed: string;
    statusCancelled: string;
    sourceDirect: string;
    sourceMediafire: string;
    sourceMega: string;
    sourceQbittorrent: string;
    sourceBrowser: string;
    actionPause: string;
    actionResume: string;
    actionCancel: string;
    actionDelete: string;
    actionRetry: string;
    actionOpenFile: string;
    actionOpenFolder: string;
    actionRemove: string;
    actionOpenExternal: string;
    peersLabel: string;
    seedsLabel: string;
    unknownSize: string;
    etaCalculating: string;
    torrentConnected: string;
    torrentDisconnected: string;
    torrentWebPreviewStatus: string;
    configureTorrentBtn: string;
    speedGraphTitle: string;
    periodLabel: string;
    period1m: string;
    period5m: string;
    period30m: string;
    period1h: string;
    totalUploadLabel: string;
    totalDownloadLabel: string;
    sizeLabel: string;
    progressLabel: string;
    statusLabel: string;
    downSpeedLabel: string;
    upSpeedLabel: string;
    etaLabel: string;
    ratioLabel: string;
    showGraphBtn: string;
    hideGraphBtn: string;
    emptyTitle: string;
    emptySubtitle: string;
    webNoticeTitle: string;
    webNoticeBody: string;
    startedToast: string;
    failedToast: string;
    detailActiveTitle: string;
    detailManageBtn: string;
    detailOpenExternal: string;
    detailStartInApp: string;
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
  qbitSetup: {
    modalTitle: string;
    modalSubtitle: string;
    stepChecking: string;
    stepDetecting: string;
    stepDownloading: string;
    stepVerifying: string;
    stepInstalling: string;
    stepConfiguring: string;
    stepCompleted: string;
    installedLabel: string;
    notInstalledValue: string;
    latestLabel: string;
    processLabel: string;
    processRunning: string;
    processStopped: string;
    statusUpToDate: string;
    statusNewerInstalled: string;
    statusUpdateAvailable: string;
    statusNotInstalled: string;
    statusRunningBlocked: string;
    statusLookupFailed: string;
    consentNote: string;
    installBtn: string;
    updateBtn: string;
    recheckBtn: string;
    retryBtn: string;
    skipBtn: string;
    closeBtn: string;
    officialDownloadBtn: string;
    launchQbitBtn: string;
    shaVerifiedLabel: string;
    sigVerifiedLabel: string;
    unsignedVerifiedNote: string;
    webUiSectionTitle: string;
    webUiDetectedEnabled: string;
    webUiNotEnabledHint: string;
    webUiLoopbackWarning: string;
    webUiGuide1: string;
    webUiGuide2: string;
    webUiGuide3: string;
    webUiGuide4: string;
    webUiGuide5: string;
    generatePasswordBtn: string;
    saveAndVerifyBtn: string;
    verifyingBtn: string;
    webUiConnectedMsg: string;
    openSettingsBtn: string;
    webPreviewNotice: string;
  };
  onboarding: {
    stepWelcome: string;
    stepAppearance: string;
    stepQbitCheck: string;
    stepQbitIntegration: string;
    stepReady: string;
    firstTimeNotice: string;
    welcomeEyebrow: string;
    welcomeTitle: string;
    welcomeSubtitle: string;
    welcomeFeature1Title: string;
    welcomeFeature1Desc: string;
    welcomeFeature2Title: string;
    welcomeFeature2Desc: string;
    welcomeFeature3Title: string;
    welcomeFeature3Desc: string;
    getStartedBtn: string;
    skipAllBtn: string;
    appearanceTitle: string;
    appearanceSubtitle: string;
    themePickerLabel: string;
    languagePickerLabel: string;
    themeDarkName: string;
    themeDarkDesc: string;
    themeLightName: string;
    themeLightDesc: string;
    themePs5Name: string;
    themePs5Desc: string;
    themeXboxName: string;
    themeXboxDesc: string;
    settingsEditableNote: string;
    backBtn: string;
    continueBtn: string;
    qbitCheckTitle: string;
    qbitCheckSubtitle: string;
    scanningText: string;
    alreadyInstalledTitle: string;
    alreadyInstalledDesc: string;
    goIntegrationBtn: string;
    updateFirstBtn: string;
    notInstalledTitle: string;
    notInstalledDesc: string;
    installAndNextBtn: string;
    installCompleteAdvanceMsg: string;
    skipTorrentBtn: string;
    integrationTitle: string;
    integrationSubtitle: string;
    hostLoopbackHint: string;
    finishSetupBtn: string;
    skipIntegrationBtn: string;
    finalizingPhase1: string;
    finalizingPhase2: string;
    finalizingPhase3: string;
    congratsEyebrow: string;
    congratsTitle: string;
    congratsSubtitle: string;
    summaryThemeLabel: string;
    summaryLanguageLabel: string;
    summaryTorrentLabel: string;
    summaryTorrentConnected: string;
    summaryTorrentInstalled: string;
    summaryTorrentSkipped: string;
    changeLaterHint: string;
    enterAppBtn: string;
    openSettingsPageBtn: string;
  };
}

const EN: LauncherTranslations = {
  locale: 'en-US',
  nav: {
    home: 'Home',
    library: 'Library',
    downloads: 'Downloads',
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
    downloadSectionTitle: 'Downloads & Storage',
    downloadFolderTitle: 'Default Download Folder',
    downloadFolderDesc: 'Choose where direct links, MediaFire files, Mega archives, and browser downloads are saved.',
    chooseFolderBtn: 'Choose Folder',
    openFolderBtn: 'Open Folder',
    torrentSectionTitle: 'qBittorrent Integration (Web UI API v2)',
    torrentSectionDesc: 'Optional: Connect SecretArea to local qBittorrent Web UI (API v2 / 5.0+) to send magnets & .torrent files and track live download/upload speeds, ETA, and pause/resume/delete.',
    torrentEnableTitle: 'Enable qBittorrent Web UI Sync',
    torrentEnableDesc: 'Syncs magnet & .torrent downloads with local qBittorrent via encrypted safeStorage credentials. Direct, MediaFire, and Mega downloads always work without qBittorrent.',
    torrentAutoDetectBtn: 'Auto Detect',
    torrentDetectingBtn: 'Scanning...',
    torrentTestBtn: 'Test Connection',
    torrentTestingBtn: 'Testing...',
    torrentSaveBtn: 'Save Configuration',
    torrentSavingBtn: 'Saving...',
    torrentStatusConnected: 'Connected',
    torrentStatusDisconnected: 'Disconnected',
    torrentStatusTesting: 'Testing...',
    torrentNotInstalledTitle: 'qBittorrent was not detected on this PC (Optional)',
    torrentNotInstalledDesc: 'SecretArea direct downloads, MediaFire, Mega, and the in-app browser work independently without qBittorrent. Install qBittorrent only if you want built-in magnet & .torrent tracking.',
    torrentDownloadBtn: 'Get qBittorrent (Official)',
    torrentHostLabel: 'Host (Loopback Only)',
    torrentPortLabel: 'Port',
    torrentUsernameLabel: 'Username',
    torrentPasswordLabel: 'Password',
    torrentPasswordSavedPlaceholder: 'Encrypted via safeStorage (leave blank to keep)',
    torrentApiKeyLabel: 'API Key (Optional · qBittorrent 5.2+)',
    torrentApiKeyPlaceholder: 'qbt_... (optional)',
    torrentApiKeySavedPlaceholder: 'API Key saved securely (leave blank to keep)',
    torrentLoopbackNotice: 'Local-only security: Web UI connections are restricted to loopback hosts (127.0.0.1 / localhost / ::1) and never exposed to external networks.',
    torrentLoopbackError: 'Host must be a local loopback address (127.0.0.1, localhost, or ::1).',
    torrentGuideTitle: 'How to enable qBittorrent Web UI (Manual Setup)',
    torrentGuideStep1: '1. Open qBittorrent on Windows and go to Tools → Options → Web UI.',
    torrentGuideStep2: '2. Check "Web User Interface (Remote control)", keep IP address set to 127.0.0.1 (or *), and set Port to 8080.',
    torrentGuideStep3: '3. Under Authentication, set a Username & Password (or generate a qbt_ API key in qBittorrent 5.2.0+).',
    torrentGuideStep4: '4. Click Apply & OK in qBittorrent, then enter the same credentials above and click Save Configuration.',
    torrentGuideStep5: '5. Click Auto Detect & Test Connection above to verify live qBittorrent Web UI API v2 communication.',
    torrentWebNotice: 'Web Preview Mode: Browsers cannot connect to local 127.0.0.1 qBittorrent Web UI or access Electron safeStorage. Use the SecretArea.exe Desktop App for live connection testing and torrent sync.',
    torrentTestingWebPreviewMsg: 'Disconnected — Web Preview cannot connect to local qBittorrent Web UI.',
    torrentTestingWebPreviewHint: 'Browser security blocks localhost Web UI requests and encrypted safeStorage. Open SecretArea.exe Desktop App to test and sync your local qBittorrent instance.',
    modeDesktopBadge: 'Desktop App',
    modeWebPreviewBadge: 'Web Preview',
    torrentSavedToast: 'qBittorrent settings saved',
    torrentManageSetupBtn: 'Auto Install / Update qBittorrent',
    replaySetupBtn: 'Welcome Setup',
  },
  downloads: {
    pageTitle: 'Download Manager',
    pageSubtitle: 'Track direct links, MediaFire, Mega, in-app browser captures, and qBittorrent transfers.',
    quickAddPlaceholder: 'Paste a Direct URL, MediaFire, Mega, or Magnet link...',
    quickAddBtn: 'Add Download',
    addTorrentFileBtn: 'Add .torrent',
    quickAddInvalid: 'Enter a valid http://, https://, or magnet:? link.',
    folderLabel: 'Save to',
    chooseFolder: 'Choose Folder',
    openFolder: 'Open Folder',
    clearFinished: 'Clear Finished',
    tabAll: 'All',
    tabActive: 'Active',
    tabPaused: 'Paused',
    tabCompleted: 'Completed',
    tabFailed: 'Failed',
    searchPlaceholder: 'Filter downloads...',
    metricActive: 'Active',
    metricSpeed: 'Total Speed',
    metricCompleted: 'Completed',
    metricFreeDisk: 'Free Disk Space',
    statusQueued: 'Queued',
    statusResolving: 'Resolving link...',
    statusDownloading: 'Downloading',
    statusPaused: 'Paused',
    statusCompleted: 'Completed',
    statusFailed: 'Failed',
    statusCancelled: 'Cancelled',
    sourceDirect: 'Direct Link',
    sourceMediafire: 'MediaFire',
    sourceMega: 'Mega',
    sourceQbittorrent: 'qBittorrent',
    sourceBrowser: 'In-App Browser',
    actionPause: 'Pause',
    actionResume: 'Resume',
    actionCancel: 'Cancel',
    actionDelete: 'Delete',
    actionRetry: 'Retry',
    actionOpenFile: 'Open File',
    actionOpenFolder: 'Open Folder',
    actionRemove: 'Remove',
    actionOpenExternal: 'Open Externally',
    peersLabel: 'Peers',
    seedsLabel: 'Seeds',
    unknownSize: 'Unknown size',
    etaCalculating: 'Calculating...',
    torrentConnected: 'qBittorrent Connected',
    torrentDisconnected: 'qBittorrent Disconnected',
    torrentWebPreviewStatus: 'Web Preview — Live qBittorrent sync runs in SecretArea.exe Desktop App',
    configureTorrentBtn: 'Configure qBittorrent',
    speedGraphTitle: 'Speed Activity',
    periodLabel: 'Period:',
    period1m: '1 Minute',
    period5m: '5 Minutes',
    period30m: '30 Minutes',
    period1h: '1 Hour',
    totalUploadLabel: 'Total Upload',
    totalDownloadLabel: 'Total Download',
    sizeLabel: 'Size',
    progressLabel: 'Progress',
    statusLabel: 'Status',
    downSpeedLabel: 'Down Speed',
    upSpeedLabel: 'Up Speed',
    etaLabel: 'ETA',
    ratioLabel: 'Ratio',
    showGraphBtn: 'Show Speed Graph',
    hideGraphBtn: 'Hide Speed Graph',
    emptyTitle: 'No downloads in this view',
    emptySubtitle: 'Paste any direct, MediaFire, Mega, or magnet link above, upload a .torrent file, or click a channel inside any Game or Tool page.',
    webNoticeTitle: 'Web Preview Mode',
    webNoticeBody: 'Live pause/resume, speed/ETA tracking, in-app browser capture, and qBittorrent Web UI sync run inside the SecretArea.exe desktop app.',
    startedToast: 'Download added to queue',
    failedToast: 'Could not start download',
    detailActiveTitle: 'Downloads for This Release',
    detailManageBtn: 'Open Download Manager',
    detailOpenExternal: 'Open in External Browser',
    detailStartInApp: 'Download in SecretArea',
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
  qbitSetup: {
    modalTitle: 'qBittorrent Dependency Setup',
    modalSubtitle: 'Manage automatic Windows installation, official updates, and local Web UI verification.',
    stepChecking: 'Checking dependencies...',
    stepDetecting: 'Detecting qBittorrent...',
    stepDownloading: 'Downloading qBittorrent...',
    stepVerifying: 'Verifying installer...',
    stepInstalling: 'Installing qBittorrent...',
    stepConfiguring: 'Configuring integration...',
    stepCompleted: 'Setup completed.',
    installedLabel: 'Installed',
    notInstalledValue: 'Not installed',
    latestLabel: 'Latest Official',
    processLabel: 'Process',
    processRunning: 'Running',
    processStopped: 'Not running',
    statusUpToDate: 'Your qBittorrent installation is already up to date. No reinstall required.',
    statusNewerInstalled: 'A newer version of qBittorrent is already installed. SecretArea will never downgrade it.',
    statusUpdateAvailable: 'A newer official stable qBittorrent update is ready to install.',
    statusNotInstalled: 'qBittorrent was not detected on this PC. SecretArea can download the official x64 installer, verify its checksum & signature, and install it silently.',
    statusRunningBlocked: 'qBittorrent is currently running. Please close qBittorrent cleanly so active torrents are not interrupted, then click Check Again.',
    statusLookupFailed: 'Unable to retrieve the latest official release right now.',
    consentNote: 'By clicking Install/Update, SecretArea downloads the official 64-bit qBittorrent installer directly from GitHub/qbittorrent.org and verifies SHA-256 integrity before launching setup (Windows may ask for UAC confirmation).',
    installBtn: 'Download & Install qBittorrent',
    updateBtn: 'Update qBittorrent Now',
    recheckBtn: 'Check Again',
    retryBtn: 'Retry',
    skipBtn: 'Not Now',
    closeBtn: 'Done',
    officialDownloadBtn: 'Official Download Page',
    launchQbitBtn: 'Open qBittorrent',
    shaVerifiedLabel: 'SHA-256 Checksum Verified',
    sigVerifiedLabel: 'Publisher Signature Verified',
    unsignedVerifiedNote: 'FOSS Installer (Unsigned) · Official SHA-256 Match Verified',
    webUiSectionTitle: 'qBittorrent Web UI Setup (127.0.0.1 Only)',
    webUiDetectedEnabled: 'Web UI is enabled in qBittorrent config.',
    webUiNotEnabledHint: 'Web UI is not enabled yet. Follow these steps inside qBittorrent, then click Save & Verify Connection:',
    webUiLoopbackWarning: 'Web UI IP is not restricted to 127.0.0.1. Set IP address to 127.0.0.1 in qBittorrent for local-only security.',
    webUiGuide1: '1. Open qBittorrent → Tools → Options → Web UI.',
    webUiGuide2: '2. Check "Web User Interface (Remote control)".',
    webUiGuide3: '3. Set IP address to 127.0.0.1 and Port to 8080.',
    webUiGuide4: '4. Set a Username and Password (use Generate Password below or enter your own), then click Apply / OK.',
    webUiGuide5: '5. Enter those exact credentials below and click Save & Verify Connection.',
    generatePasswordBtn: 'Generate Strong Password',
    saveAndVerifyBtn: 'Save & Verify Connection',
    verifyingBtn: 'Verifying...',
    webUiConnectedMsg: 'Connected & verified! SecretArea is ready for magnet links and .torrent downloads.',
    openSettingsBtn: 'Open Settings',
    webPreviewNotice: 'Automatic installation runs inside SecretArea.exe Desktop App on Windows. In Web Preview, use the official link below.',
  },
  onboarding: {
    stepWelcome: 'Welcome',
    stepAppearance: 'Theme & Language',
    stepQbitCheck: 'qBittorrent Check',
    stepQbitIntegration: 'Integration',
    stepReady: 'Ready',
    firstTimeNotice: 'One-time first-launch setup',
    welcomeEyebrow: 'SecretArea Desktop',
    welcomeTitle: 'Welcome to SecretArea',
    welcomeSubtitle: 'Let us personalize your launcher theme, language, and qBittorrent download engine in less than a minute before you enter the desktop workspace.',
    welcomeFeature1Title: '01. Theme & Language',
    welcomeFeature1Desc: 'Pick Dark, Light, PlayStation 5, or Xbox Nexus along with your preferred language.',
    welcomeFeature2Title: '02. qBittorrent Detection',
    welcomeFeature2Desc: 'Automatically checks if qBittorrent is installed on your PC or installs the verified official build.',
    welcomeFeature3Title: '03. Seamless Sync',
    welcomeFeature3Desc: 'Connect local 127.0.0.1 Web UI credentials securely using Windows DPAPI / safeStorage.',
    getStartedBtn: 'Get Started',
    skipAllBtn: 'Skip to App',
    appearanceTitle: 'Personalize Theme & Language',
    appearanceSubtitle: 'Every choice updates live right here. You can switch themes or languages anytime in Settings.',
    themePickerLabel: 'Launcher Theme',
    languagePickerLabel: 'Interface Language',
    themeDarkName: 'Dark Slate',
    themeDarkDesc: 'High-contrast obsidian desktop launcher',
    themeLightName: 'Light Mode',
    themeLightDesc: 'Clean daylight workspace with crisp borders',
    themePs5Name: 'PlayStation 5',
    themePs5Desc: 'Sapphire aurora & console ambient sound',
    themeXboxName: 'Xbox Nexus',
    themeXboxDesc: 'Emerald wireframe & classic console glow',
    settingsEditableNote: 'You can adjust sound, navbar layout, and themes later from Settings.',
    backBtn: 'Back',
    continueBtn: 'Continue',
    qbitCheckTitle: 'qBittorrent Engine Check',
    qbitCheckSubtitle: 'SecretArea checks your PC first so existing qBittorrent setups are preserved cleanly.',
    scanningText: 'Checking your computer for an existing qBittorrent installation...',
    alreadyInstalledTitle: 'qBittorrent is already installed on this PC',
    alreadyInstalledDesc: 'Great! Since qBittorrent was already installed before SecretArea, continue to the next step to add your qBittorrent Integration settings.',
    goIntegrationBtn: 'Configure qBittorrent Integration',
    updateFirstBtn: 'Update qBittorrent First',
    notInstalledTitle: 'qBittorrent is not installed yet',
    notInstalledDesc: 'Install the official verified 64-bit qBittorrent client automatically, then continue straight to Integration settings.',
    installAndNextBtn: 'Install qBittorrent & Continue',
    installCompleteAdvanceMsg: 'qBittorrent installed and verified! Moving to Integration settings...',
    skipTorrentBtn: 'Skip Torrent Setup (Direct Downloads Only)',
    integrationTitle: 'qBittorrent Integration Settings',
    integrationSubtitle: 'Add your local qBittorrent Web UI credentials so SecretArea tracks speed, seeds, peers, ETA, and progress.',
    hostLoopbackHint: 'Locked to 127.0.0.1 (local loopback only) and stored securely with Electron safeStorage.',
    finishSetupBtn: 'Finish Setup',
    skipIntegrationBtn: 'Skip & Configure Later in Settings',
    finalizingPhase1: 'Saving theme & language preferences...',
    finalizingPhase2: 'Syncing download & torrent workspace...',
    finalizingPhase3: 'Everything is ready!',
    congratsEyebrow: 'Setup Complete',
    congratsTitle: 'Congratulations! SecretArea Desktop is ready.',
    congratsSubtitle: 'Your launcher is personalized and configured. Enjoy fast Direct, MediaFire, Mega, and qBittorrent downloads.',
    summaryThemeLabel: 'Active Theme',
    summaryLanguageLabel: 'Language',
    summaryTorrentLabel: 'qBittorrent Status',
    summaryTorrentConnected: 'Connected & Verified',
    summaryTorrentInstalled: 'Installed (Configure in Settings)',
    summaryTorrentSkipped: 'Skipped (Optional)',
    changeLaterHint: 'You can change any theme, language, download folder, or qBittorrent integration setting anytime from the Settings page.',
    enterAppBtn: 'Enter SecretArea Desktop',
    openSettingsPageBtn: 'Review in Settings',
  },
};

const FR: LauncherTranslations = {
  locale: 'fr-FR',
  nav: {
    home: 'Accueil',
    library: 'Bibliothèque',
    downloads: 'Téléchargements',
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
    downloadSectionTitle: 'Téléchargements et stockage',
    downloadFolderTitle: 'Dossier de téléchargement par défaut',
    downloadFolderDesc: 'Choisissez où enregistrer les liens directs, fichiers MediaFire, archives Mega et captures du navigateur intégré.',
    chooseFolderBtn: 'Choisir un dossier',
    openFolderBtn: 'Ouvrir le dossier',
    torrentSectionTitle: 'Intégration qBittorrent (Web UI API v2)',
    torrentSectionDesc: 'Optionnel : connectez SecretArea à qBittorrent Web UI locale (API v2 / 5.0+) pour envoyer des magnets et fichiers .torrent et suivre vitesse DL/UL, ETA et pause/reprise.',
    torrentEnableTitle: 'Activer la synchronisation qBittorrent Web UI',
    torrentEnableDesc: 'Synchronise les téléchargements magnet et .torrent avec qBittorrent local via safeStorage. Les liens directs, MediaFire et Mega fonctionnent sans qBittorrent.',
    torrentAutoDetectBtn: 'Détection auto',
    torrentDetectingBtn: 'Analyse...',
    torrentTestBtn: 'Tester la connexion',
    torrentTestingBtn: 'Test...',
    torrentSaveBtn: 'Enregistrer',
    torrentSavingBtn: 'Enregistrement...',
    torrentStatusConnected: 'Connecté',
    torrentStatusDisconnected: 'Déconnecté',
    torrentStatusTesting: 'Test en cours...',
    torrentNotInstalledTitle: 'qBittorrent non détecté sur ce PC (Optionnel)',
    torrentNotInstalledDesc: 'Les téléchargements directs, MediaFire, Mega et le navigateur intégré fonctionnent sans qBittorrent. Installez-le uniquement pour le suivi magnet/.torrent.',
    torrentDownloadBtn: 'Télécharger qBittorrent',
    torrentHostLabel: 'Hôte (Boucle locale)',
    torrentPortLabel: 'Port',
    torrentUsernameLabel: 'Nom d’utilisateur',
    torrentPasswordLabel: 'Mot de passe',
    torrentPasswordSavedPlaceholder: 'Chiffré via safeStorage (laisser vide pour conserver)',
    torrentApiKeyLabel: 'Clé API (Optionnel · qBittorrent 5.2+)',
    torrentApiKeyPlaceholder: 'qbt_... (optionnel)',
    torrentApiKeySavedPlaceholder: 'Clé API enregistrée (laisser vide pour conserver)',
    torrentLoopbackNotice: 'Sécurité locale : l’accès Web UI est limité aux adresses locales (127.0.0.1 / localhost / ::1) et jamais exposé sur le réseau externe.',
    torrentLoopbackError: 'L’hôte doit être une adresse locale (127.0.0.1, localhost ou ::1).',
    torrentGuideTitle: 'Comment activer qBittorrent Web UI (Configuration manuelle)',
    torrentGuideStep1: '1. Ouvrez qBittorrent sur Windows puis allez dans Outils → Options → Interface Web (Web UI).',
    torrentGuideStep2: '2. Cochez « Interface utilisateur Web (Contrôle à distance) », laissez l’IP sur 127.0.0.1 et le port sur 8080.',
    torrentGuideStep3: '3. Dans Authentification, définissez un nom d’utilisateur et un mot de passe (ou une clé API qbt_ sur v5.2.0+).',
    torrentGuideStep4: '4. Cliquez sur Appliquer et OK dans qBittorrent, puis saisissez vos identifiants ci-dessus et enregistrez.',
    torrentGuideStep5: '5. Cliquez sur « Détection auto » et « Tester la connexion » pour vérifier l’API Web UI v2.',
    torrentWebNotice: 'Mode Aperçu Web : les navigateurs ne peuvent pas contacter qBittorrent Web UI (127.0.0.1) ni utiliser safeStorage. Utilisez SecretArea.exe pour tester et synchroniser.',
    torrentTestingWebPreviewMsg: 'Déconnecté — L’aperçu Web ne peut pas contacter qBittorrent local.',
    torrentTestingWebPreviewHint: 'Le navigateur bloque l’accès local Web UI et safeStorage. Lancez l’application SecretArea.exe pour tester et synchroniser qBittorrent.',
    modeDesktopBadge: 'App Bureau',
    modeWebPreviewBadge: 'Aperçu Web',
    torrentSavedToast: 'Paramètres qBittorrent enregistrés',
    torrentManageSetupBtn: 'Installer / Mettre à jour qBittorrent',
    replaySetupBtn: 'Assistant de bienvenue',
  },
  downloads: {
    pageTitle: 'Gestionnaire de téléchargements',
    pageSubtitle: 'Suivez les liens directs, MediaFire, Mega, captures navigateur et transferts qBittorrent.',
    quickAddPlaceholder: 'Collez un lien direct, MediaFire, Mega ou Magnet...',
    quickAddBtn: 'Ajouter',
    addTorrentFileBtn: 'Ajouter .torrent',
    quickAddInvalid: 'Entrez un lien http://, https:// ou magnet:? valide.',
    folderLabel: 'Enregistrer dans',
    chooseFolder: 'Choisir le dossier',
    openFolder: 'Ouvrir le dossier',
    clearFinished: 'Effacer terminés',
    tabAll: 'Tous',
    tabActive: 'Actifs',
    tabPaused: 'En pause',
    tabCompleted: 'Terminés',
    tabFailed: 'Échoués',
    searchPlaceholder: 'Filtrer les téléchargements...',
    metricActive: 'Actifs',
    metricSpeed: 'Vitesse totale',
    metricCompleted: 'Terminés',
    metricFreeDisk: 'Espace libre',
    statusQueued: 'En file d’attente',
    statusResolving: 'Résolution du lien...',
    statusDownloading: 'Téléchargement',
    statusPaused: 'En pause',
    statusCompleted: 'Terminé',
    statusFailed: 'Échec',
    statusCancelled: 'Annulé',
    sourceDirect: 'Lien direct',
    sourceMediafire: 'MediaFire',
    sourceMega: 'Mega',
    sourceQbittorrent: 'qBittorrent',
    sourceBrowser: 'Navigateur intégré',
    actionPause: 'Pause',
    actionResume: 'Reprendre',
    actionCancel: 'Annuler',
    actionDelete: 'Supprimer',
    actionRetry: 'Réessayer',
    actionOpenFile: 'Ouvrir le fichier',
    actionOpenFolder: 'Ouvrir le dossier',
    actionRemove: 'Retirer',
    actionOpenExternal: 'Ouvrir en externe',
    peersLabel: 'Pairs',
    seedsLabel: 'Sources',
    unknownSize: 'Taille inconnue',
    etaCalculating: 'Calcul...',
    torrentConnected: 'qBittorrent connecté',
    torrentDisconnected: 'qBittorrent déconnecté',
    torrentWebPreviewStatus: 'Aperçu Web — La synchronisation qBittorrent nécessite SecretArea.exe',
    configureTorrentBtn: 'Configurer qBittorrent',
    speedGraphTitle: 'Courbe de vitesse',
    periodLabel: 'Période :',
    period1m: '1 minute',
    period5m: '5 minutes',
    period30m: '30 minutes',
    period1h: '1 heure',
    totalUploadLabel: 'Envoi total',
    totalDownloadLabel: 'Réception totale',
    sizeLabel: 'Taille',
    progressLabel: 'Progression',
    statusLabel: 'Statut',
    downSpeedLabel: 'Vitesse DL',
    upSpeedLabel: 'Vitesse UL',
    etaLabel: 'ETA',
    ratioLabel: 'Ratio',
    showGraphBtn: 'Afficher le graphique',
    hideGraphBtn: 'Masquer le graphique',
    emptyTitle: 'Aucun téléchargement dans cette vue',
    emptySubtitle: 'Collez un lien direct, MediaFire, Mega ou magnet ci-dessus, importez un fichier .torrent, ou cliquez sur une source dans la fiche d’un jeu.',
    webNoticeTitle: 'Mode Aperçu Web',
    webNoticeBody: 'La gestion pause/reprise, vitesse/ETA, capture navigateur et synchronisation qBittorrent Web UI fonctionnent dans SecretArea.exe.',
    startedToast: 'Téléchargement ajouté à la file',
    failedToast: 'Impossible de démarrer le téléchargement',
    detailActiveTitle: 'Téléchargements de cette sortie',
    detailManageBtn: 'Ouvrir le gestionnaire',
    detailOpenExternal: 'Ouvrir dans le navigateur externe',
    detailStartInApp: 'Télécharger dans SecretArea',
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
  qbitSetup: {
    modalTitle: 'Installation automatique de qBittorrent',
    modalSubtitle: 'Détection Windows, mise à jour officielle vérifiée et configuration locale de la Web UI.',
    stepChecking: 'Vérification des dépendances...',
    stepDetecting: 'Détection de qBittorrent...',
    stepDownloading: 'Téléchargement de qBittorrent...',
    stepVerifying: 'Vérification de l’installateur...',
    stepInstalling: 'Installation de qBittorrent...',
    stepConfiguring: 'Configuration de l’intégration...',
    stepCompleted: 'Installation terminée.',
    installedLabel: 'Installé',
    notInstalledValue: 'Non installé',
    latestLabel: 'Dernière version officielle',
    processLabel: 'Processus',
    processRunning: 'En cours d’exécution',
    processStopped: 'Arrêté',
    statusUpToDate: 'Votre version de qBittorrent est déjà à jour. Aucune réinstallation nécessaire.',
    statusNewerInstalled: 'Une version plus récente est déjà installée. SecretArea ne la rétrogradera pas.',
    statusUpdateAvailable: 'Une mise à jour officielle stable de qBittorrent est disponible.',
    statusNotInstalled: 'qBittorrent n’a pas été détecté sur ce PC. SecretArea peut télécharger l’installateur x64 officiel, vérifier son hachage et sa signature, et l’installer.',
    statusRunningBlocked: 'qBittorrent est en cours d’exécution. Fermez-le proprement pour ne pas interrompre vos torrents, puis cliquez sur Revérifier.',
    statusLookupFailed: 'Impossible de récupérer la dernière version officielle pour le moment.',
    consentNote: 'En cliquant sur Installer/Mettre à jour, SecretArea télécharge l’installateur officiel 64 bits depuis GitHub/qbittorrent.org et vérifie le SHA-256 avant exécution.',
    installBtn: 'Télécharger et installer qBittorrent',
    updateBtn: 'Mettre à jour qBittorrent',
    recheckBtn: 'Revérifier',
    retryBtn: 'Réessayer',
    skipBtn: 'Plus tard',
    closeBtn: 'Terminer',
    officialDownloadBtn: 'Page officielle',
    launchQbitBtn: 'Ouvrir qBittorrent',
    shaVerifiedLabel: 'Somme SHA-256 vérifiée',
    sigVerifiedLabel: 'Signature éditeur vérifiée',
    unsignedVerifiedNote: 'Installateur open-source (non signé) · SHA-256 officiel vérifié',
    webUiSectionTitle: 'Configuration Web UI qBittorrent (127.0.0.1 uniquement)',
    webUiDetectedEnabled: 'La Web UI est activée dans la configuration qBittorrent.',
    webUiNotEnabledHint: 'La Web UI n’est pas encore activée. Suivez ces étapes dans qBittorrent, puis vérifiez la connexion :',
    webUiLoopbackWarning: 'L’adresse IP Web UI n’est pas limitée à 127.0.0.1. Réglez l’IP sur 127.0.0.1 dans qBittorrent.',
    webUiGuide1: '1. Ouvrez qBittorrent → Outils → Options → Web UI.',
    webUiGuide2: '2. Cochez « Interface Web (Contrôle à distance) ».',
    webUiGuide3: '3. Réglez l’adresse IP sur 127.0.0.1 et le port sur 8080.',
    webUiGuide4: '4. Définissez un identifiant et un mot de passe, puis cliquez sur Appliquer / OK.',
    webUiGuide5: '5. Saisissez ces mêmes identifiants ci-dessous et cliquez sur Enregistrer et vérifier.',
    generatePasswordBtn: 'Générer un mot de passe fort',
    saveAndVerifyBtn: 'Enregistrer et vérifier',
    verifyingBtn: 'Vérification...',
    webUiConnectedMsg: 'Connecté et vérifié ! SecretArea est prêt pour vos liens magnet et .torrent.',
    openSettingsBtn: 'Ouvrir les paramètres',
    webPreviewNotice: 'L’installation automatique s’exécute dans SecretArea.exe sur Windows. Utilisez le lien officiel ci-dessous en aperçu Web.',
  },
  onboarding: {
    stepWelcome: 'Bienvenue',
    stepAppearance: 'Thème et langue',
    stepQbitCheck: 'Vérification qBittorrent',
    stepQbitIntegration: 'Intégration',
    stepReady: 'Prêt',
    firstTimeNotice: 'Configuration unique au premier lancement',
    welcomeEyebrow: 'SecretArea Desktop',
    welcomeTitle: 'Bienvenue dans SecretArea',
    welcomeSubtitle: 'Personnalisons votre thème, votre langue et votre moteur qBittorrent en moins d’une minute avant d’ouvrir l’application.',
    welcomeFeature1Title: '01. Thème et langue',
    welcomeFeature1Desc: 'Choisissez Sombre, Clair, PlayStation 5 ou Xbox Nexus avec votre langue préférée.',
    welcomeFeature2Title: '02. Détection qBittorrent',
    welcomeFeature2Desc: 'Vérifie si qBittorrent est déjà installé ou installe automatiquement la version officielle.',
    welcomeFeature3Title: '03. Synchronisation locale',
    welcomeFeature3Desc: 'Connectez la Web UI locale 127.0.0.1 de façon chiffrée via safeStorage.',
    getStartedBtn: 'Commencer',
    skipAllBtn: 'Accéder à l’application',
    appearanceTitle: 'Personnaliser le thème et la langue',
    appearanceSubtitle: 'Chaque choix s’applique en direct. Modifiable à tout moment dans les Paramètres.',
    themePickerLabel: 'Thème du lanceur',
    languagePickerLabel: 'Langue de l’interface',
    themeDarkName: 'Mode Sombre',
    themeDarkDesc: 'Interface ardoise sombre à fort contraste',
    themeLightName: 'Mode Clair',
    themeLightDesc: 'Espace clair et net de jour',
    themePs5Name: 'PlayStation 5',
    themePs5Desc: 'Aurore saphir et ambiance sonore console',
    themeXboxName: 'Xbox Nexus',
    themeXboxDesc: 'Maillage émeraude et ambiance Xbox',
    settingsEditableNote: 'Les sons, la barre de navigation et les thèmes restent réglables dans Paramètres.',
    backBtn: 'Retour',
    continueBtn: 'Continuer',
    qbitCheckTitle: 'Vérification de qBittorrent',
    qbitCheckSubtitle: 'SecretArea analyse votre PC afin de préserver toute installation existante.',
    scanningText: 'Recherche d’une installation qBittorrent existante...',
    alreadyInstalledTitle: 'qBittorrent est déjà installé sur ce PC',
    alreadyInstalledDesc: 'Parfait ! Comme qBittorrent était déjà installé, passez à l’étape suivante pour ajouter vos paramètres d’intégration qBittorrent.',
    goIntegrationBtn: 'Configurer l’intégration qBittorrent',
    updateFirstBtn: 'Mettre à jour qBittorrent d’abord',
    notInstalledTitle: 'qBittorrent n’est pas encore installé',
    notInstalledDesc: 'Installez automatiquement la version officielle 64 bits vérifiée, puis passez aux paramètres d’intégration.',
    installAndNextBtn: 'Installer qBittorrent et continuer',
    installCompleteAdvanceMsg: 'qBittorrent installé et vérifié ! Passage à l’intégration...',
    skipTorrentBtn: 'Ignorer (Téléchargements directs uniquement)',
    integrationTitle: 'Paramètres d’intégration qBittorrent',
    integrationSubtitle: 'Ajoutez vos identifiants Web UI locaux pour suivre vitesse, seeds, peers, ETA et progression.',
    hostLoopbackHint: 'Restreint à 127.0.0.1 (boucle locale) et chiffré avec Electron safeStorage.',
    finishSetupBtn: 'Terminer l’installation',
    skipIntegrationBtn: 'Configurer plus tard dans Paramètres',
    finalizingPhase1: 'Application du thème et de la langue...',
    finalizingPhase2: 'Préparation du gestionnaire de téléchargements...',
    finalizingPhase3: 'Tout est prêt !',
    congratsEyebrow: 'Configuration terminée',
    congratsTitle: 'Félicitations ! SecretArea Desktop est prêt.',
    congratsSubtitle: 'Votre espace est configuré. Profitez de vos téléchargements directs, MediaFire, Mega et qBittorrent.',
    summaryThemeLabel: 'Thème actif',
    summaryLanguageLabel: 'Langue',
    summaryTorrentLabel: 'État qBittorrent',
    summaryTorrentConnected: 'Connecté et vérifié',
    summaryTorrentInstalled: 'Installé (à lier dans Paramètres)',
    summaryTorrentSkipped: 'Ignoré (Optionnel)',
    changeLaterHint: 'Vous pouvez modifier le thème, la langue, le dossier ou les paramètres qBittorrent à tout moment dans la page Paramètres.',
    enterAppBtn: 'Entrer dans SecretArea',
    openSettingsPageBtn: 'Ouvrir les Paramètres',
  },
};

const ES: LauncherTranslations = {
  locale: 'es-ES',
  nav: {
    home: 'Inicio',
    library: 'Biblioteca',
    downloads: 'Descargas',
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
    downloadSectionTitle: 'Descargas y almacenamiento',
    downloadFolderTitle: 'Carpeta de descargas predeterminada',
    downloadFolderDesc: 'Elige dónde guardar enlaces directos, archivos MediaFire, archivos Mega y descargas del navegador integrado.',
    chooseFolderBtn: 'Elegir carpeta',
    openFolderBtn: 'Abrir carpeta',
    torrentSectionTitle: 'Integración con qBittorrent (Web UI API v2)',
    torrentSectionDesc: 'Opcional: conecta SecretArea con qBittorrent Web UI local (API v2 / 5.0+) para añadir magnets y archivos .torrent y ver velocidad DL/UL, ETA y pausar/reanudar/eliminar.',
    torrentEnableTitle: 'Activar sincronización con qBittorrent Web UI',
    torrentEnableDesc: 'Sincroniza enlaces magnet y .torrent con qBittorrent local usando safeStorage. Los enlaces directos, MediaFire y Mega funcionan sin qBittorrent.',
    torrentAutoDetectBtn: 'Autodetectar',
    torrentDetectingBtn: 'Buscando...',
    torrentTestBtn: 'Probar conexión',
    torrentTestingBtn: 'Probando...',
    torrentSaveBtn: 'Guardar configuración',
    torrentSavingBtn: 'Guardando...',
    torrentStatusConnected: 'Conectado',
    torrentStatusDisconnected: 'Desconectado',
    torrentStatusTesting: 'Probando...',
    torrentNotInstalledTitle: 'No se detectó qBittorrent en este PC (Opcional)',
    torrentNotInstalledDesc: 'Las descargas directas, MediaFire, Mega y el navegador integrado funcionan sin qBittorrent. Instálalo solo si deseas seguimiento de magnets y .torrent.',
    torrentDownloadBtn: 'Descargar qBittorrent',
    torrentHostLabel: 'Host (Solo local)',
    torrentPortLabel: 'Puerto',
    torrentUsernameLabel: 'Usuario',
    torrentPasswordLabel: 'Contraseña',
    torrentPasswordSavedPlaceholder: 'Cifrada con safeStorage (dejar vacío para mantener)',
    torrentApiKeyLabel: 'API Key (Opcional · qBittorrent 5.2+)',
    torrentApiKeyPlaceholder: 'qbt_... (opcional)',
    torrentApiKeySavedPlaceholder: 'API Key guardada (dejar vacío para mantener)',
    torrentLoopbackNotice: 'Seguridad local: las conexiones Web UI se limitan a direcciones locales (127.0.0.1 / localhost / ::1) y nunca se exponen a redes externas.',
    torrentLoopbackError: 'El host debe ser una dirección local (127.0.0.1, localhost o ::1).',
    torrentGuideTitle: 'Cómo habilitar qBittorrent Web UI (Configuración manual)',
    torrentGuideStep1: '1. Abre qBittorrent en Windows y ve a Herramientas → Opciones → Web UI.',
    torrentGuideStep2: '2. Marca «Interfaz de usuario Web (Control remoto)», mantén la IP en 127.0.0.1 y el puerto en 8080.',
    torrentGuideStep3: '3. En Autenticación, configura Usuario y Contraseña (o una API Key qbt_ en qBittorrent 5.2.0+).',
    torrentGuideStep4: '4. Pulsa Aplicar y Aceptar en qBittorrent, escribe las credenciales arriba y guarda la configuración.',
    torrentGuideStep5: '5. Pulsa «Autodetectar» y «Probar conexión» para verificar la API Web UI v2.',
    torrentWebNotice: 'Modo vista web: el navegador no puede conectarse a qBittorrent local (127.0.0.1) ni usar safeStorage. Usa SecretArea.exe para probar y sincronizar.',
    torrentTestingWebPreviewMsg: 'Desconectado — La vista web no puede conectar con qBittorrent local.',
    torrentTestingWebPreviewHint: 'El navegador bloquea las solicitudes locales Web UI y safeStorage. Abre SecretArea.exe para probar y sincronizar qBittorrent.',
    modeDesktopBadge: 'App de Escritorio',
    modeWebPreviewBadge: 'Vista Web',
    torrentSavedToast: 'Configuración de qBittorrent guardada',
    torrentManageSetupBtn: 'Instalar / Actualizar qBittorrent',
    replaySetupBtn: 'Asistente inicial',
  },
  downloads: {
    pageTitle: 'Gestor de descargas',
    pageSubtitle: 'Controla enlaces directos, MediaFire, Mega, capturas del navegador integrado y transferencias qBittorrent.',
    quickAddPlaceholder: 'Pega un enlace directo, MediaFire, Mega o Magnet...',
    quickAddBtn: 'Añadir descarga',
    addTorrentFileBtn: 'Añadir .torrent',
    quickAddInvalid: 'Introduce una URL válida http://, https:// o magnet:?',
    folderLabel: 'Guardar en',
    chooseFolder: 'Elegir carpeta',
    openFolder: 'Abrir carpeta',
    clearFinished: 'Limpiar terminados',
    tabAll: 'Todos',
    tabActive: 'Activos',
    tabPaused: 'Pausados',
    tabCompleted: 'Completados',
    tabFailed: 'Fallidos',
    searchPlaceholder: 'Filtrar descargas...',
    metricActive: 'Activos',
    metricSpeed: 'Velocidad total',
    metricCompleted: 'Completados',
    metricFreeDisk: 'Espacio libre',
    statusQueued: 'En cola',
    statusResolving: 'Resolviendo enlace...',
    statusDownloading: 'Descargando',
    statusPaused: 'Pausado',
    statusCompleted: 'Completado',
    statusFailed: 'Error',
    statusCancelled: 'Cancelado',
    sourceDirect: 'Enlace directo',
    sourceMediafire: 'MediaFire',
    sourceMega: 'Mega',
    sourceQbittorrent: 'qBittorrent',
    sourceBrowser: 'Navegador integrado',
    actionPause: 'Pausar',
    actionResume: 'Reanudar',
    actionCancel: 'Cancelar',
    actionDelete: 'Eliminar',
    actionRetry: 'Reintentar',
    actionOpenFile: 'Abrir archivo',
    actionOpenFolder: 'Abrir carpeta',
    actionRemove: 'Eliminar',
    actionOpenExternal: 'Abrir externamente',
    peersLabel: 'Pares',
    seedsLabel: 'Semillas',
    unknownSize: 'Tamaño desconocido',
    etaCalculating: 'Calculando...',
    torrentConnected: 'qBittorrent conectado',
    torrentDisconnected: 'qBittorrent desconectado',
    torrentWebPreviewStatus: 'Vista web — La sincronización con qBittorrent requiere SecretArea.exe',
    configureTorrentBtn: 'Configurar qBittorrent',
    speedGraphTitle: 'Gráfico de velocidad',
    periodLabel: 'Período:',
    period1m: '1 minuto',
    period5m: '5 minutos',
    period30m: '30 minutos',
    period1h: '1 hora',
    totalUploadLabel: 'Subida total',
    totalDownloadLabel: 'Descarga total',
    sizeLabel: 'Tamaño',
    progressLabel: 'Progreso',
    statusLabel: 'Estado',
    downSpeedLabel: 'Vel. bajada',
    upSpeedLabel: 'Vel. subida',
    etaLabel: 'ETA',
    ratioLabel: 'Ratio',
    showGraphBtn: 'Mostrar gráfico',
    hideGraphBtn: 'Ocultar gráfico',
    emptyTitle: 'No hay descargas en esta vista',
    emptySubtitle: 'Pega cualquier enlace directo, MediaFire, Mega o magnet arriba, sube un archivo .torrent, o elige un canal desde la ficha de cualquier juego.',
    webNoticeTitle: 'Modo vista web',
    webNoticeBody: 'La pausa/reanudación, velocidad/ETA, captura integrada y sincronización con qBittorrent Web UI requieren la app de escritorio SecretArea.exe.',
    startedToast: 'Descarga añadida a la cola',
    failedToast: 'No se pudo iniciar la descarga',
    detailActiveTitle: 'Descargas de este lanzamiento',
    detailManageBtn: 'Abrir gestor de descargas',
    detailOpenExternal: 'Abrir en navegador externo',
    detailStartInApp: 'Descargar en SecretArea',
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
  qbitSetup: {
    modalTitle: 'Instalación automática de qBittorrent',
    modalSubtitle: 'Detección en Windows, actualización oficial verificada y configuración local de Web UI.',
    stepChecking: 'Comprobando dependencias...',
    stepDetecting: 'Detectando qBittorrent...',
    stepDownloading: 'Descargando qBittorrent...',
    stepVerifying: 'Verificando instalador...',
    stepInstalling: 'Instalando qBittorrent...',
    stepConfiguring: 'Configurando integración...',
    stepCompleted: 'Configuración completada.',
    installedLabel: 'Instalado',
    notInstalledValue: 'No instalado',
    latestLabel: 'Última versión oficial',
    processLabel: 'Proceso',
    processRunning: 'En ejecución',
    processStopped: 'Detenido',
    statusUpToDate: 'Tu versión de qBittorrent ya está actualizada. No es necesario reinstalar.',
    statusNewerInstalled: 'Ya tienes instalada una versión más reciente. SecretArea nunca la degradará.',
    statusUpdateAvailable: 'Hay una nueva actualización estable oficial de qBittorrent lista para instalar.',
    statusNotInstalled: 'No se detectó qBittorrent en este PC. SecretArea puede descargar el instalador oficial de 64 bits, verificar su SHA-256 y firma, e instalarlo.',
    statusRunningBlocked: 'qBittorrent está abierto actualmente. Ciérralo para no interrumpir tus torrents y luego pulsa Comprobar de nuevo.',
    statusLookupFailed: 'No se pudo obtener la última versión oficial en este momento.',
    consentNote: 'Al pulsar Instalar/Actualizar, SecretArea descarga el instalador oficial x64 desde GitHub/qbittorrent.org y verifica su integridad SHA-256 antes de ejecutarlo.',
    installBtn: 'Descargar e instalar qBittorrent',
    updateBtn: 'Actualizar qBittorrent ahora',
    recheckBtn: 'Comprobar de nuevo',
    retryBtn: 'Reintentar',
    skipBtn: 'Ahora no',
    closeBtn: 'Listo',
    officialDownloadBtn: 'Descarga oficial',
    launchQbitBtn: 'Abrir qBittorrent',
    shaVerifiedLabel: 'SHA-256 verificado',
    sigVerifiedLabel: 'Firma del editor verificada',
    unsignedVerifiedNote: 'Instalador FOSS (sin firma) · SHA-256 oficial verificado',
    webUiSectionTitle: 'Configuración de Web UI (solo 127.0.0.1)',
    webUiDetectedEnabled: 'La Web UI está habilitada en la configuración de qBittorrent.',
    webUiNotEnabledHint: 'La Web UI aún no está activa. Sigue estos pasos en qBittorrent y luego verifica la conexión:',
    webUiLoopbackWarning: 'La IP de la Web UI no está limitada a 127.0.0.1. Cambia la IP a 127.0.0.1 en qBittorrent.',
    webUiGuide1: '1. Abre qBittorrent → Herramientas → Opciones → Web UI.',
    webUiGuide2: '2. Marca «Interfaz Web (Control remoto)».',
    webUiGuide3: '3. Establece la dirección IP en 127.0.0.1 y el puerto en 8080.',
    webUiGuide4: '4. Configura un Usuario y Contraseña y pulsa Aplicar / Aceptar.',
    webUiGuide5: '5. Introduce esas credenciales abajo y pulsa Guardar y verificar conexión.',
    generatePasswordBtn: 'Generar contraseña segura',
    saveAndVerifyBtn: 'Guardar y verificar',
    verifyingBtn: 'Verificando...',
    webUiConnectedMsg: '¡Conectado y verificado! SecretArea está listo para enlaces magnet y archivos .torrent.',
    openSettingsBtn: 'Abrir Ajustes',
    webPreviewNotice: 'La instalación automática funciona en SecretArea.exe para Windows. En la vista Web usa el enlace oficial.',
  },
  onboarding: {
    stepWelcome: 'Bienvenida',
    stepAppearance: 'Tema e idioma',
    stepQbitCheck: 'qBittorrent',
    stepQbitIntegration: 'Integración',
    stepReady: 'Listo',
    firstTimeNotice: 'Configuración única tras instalar',
    welcomeEyebrow: 'SecretArea Desktop',
    welcomeTitle: 'Bienvenido a SecretArea',
    welcomeSubtitle: 'Personaliza tu tema, idioma y motor qBittorrent en menos de un minuto antes de entrar en el escritorio.',
    welcomeFeature1Title: '01. Tema e idioma',
    welcomeFeature1Desc: 'Elige entre Modo Oscuro, Claro, PlayStation 5 o Xbox Nexus y tu idioma preferido.',
    welcomeFeature2Title: '02. Detección de qBittorrent',
    welcomeFeature2Desc: 'Comprueba automáticamente si qBittorrent ya está instalado o instala la versión oficial verificada.',
    welcomeFeature3Title: '03. Integración local',
    welcomeFeature3Desc: 'Conecta la Web UI local 127.0.0.1 cifrada de forma segura con safeStorage.',
    getStartedBtn: 'Comenzar',
    skipAllBtn: 'Ir a la aplicación',
    appearanceTitle: 'Personaliza tema e idioma',
    appearanceSubtitle: 'Cada cambio se aplica en vivo. Podrás ajustarlo en cualquier momento desde Ajustes.',
    themePickerLabel: 'Tema del lanzador',
    languagePickerLabel: 'Idioma de la interfaz',
    themeDarkName: 'Modo Oscuro',
    themeDarkDesc: 'Interfaz pizarra oscura de alto contraste',
    themeLightName: 'Modo Claro',
    themeLightDesc: 'Espacio diurno limpio y luminoso',
    themePs5Name: 'PlayStation 5',
    themePs5Desc: 'Aurora zafiro y sonido ambiental de consola',
    themeXboxName: 'Xbox Nexus',
    themeXboxDesc: 'Malla esmeralda y brillo clásico Xbox',
    settingsEditableNote: 'También puedes ajustar sonido, barra y temas más tarde en Ajustes.',
    backBtn: 'Atrás',
    continueBtn: 'Continuar',
    qbitCheckTitle: 'Comprobación de qBittorrent',
    qbitCheckSubtitle: 'SecretArea analiza tu equipo para respetar instalaciones previas de qBittorrent.',
    scanningText: 'Buscando una instalación existente de qBittorrent...',
    alreadyInstalledTitle: 'qBittorrent ya está instalado en este equipo',
    alreadyInstalledDesc: '¡Genial! Como qBittorrent ya estaba instalado antes de SecretArea, continúa al siguiente paso para añadir los ajustes de integración.',
    goIntegrationBtn: 'Configurar integración qBittorrent',
    updateFirstBtn: 'Actualizar qBittorrent primero',
    notInstalledTitle: 'qBittorrent aún no está instalado',
    notInstalledDesc: 'Instala automáticamente la versión oficial de 64 bits verificada y pasa directo a los ajustes de integración.',
    installAndNextBtn: 'Instalar qBittorrent y continuar',
    installCompleteAdvanceMsg: '¡qBittorrent instalado y verificado! Pasando a integración...',
    skipTorrentBtn: 'Omitir por ahora (solo descargas directas)',
    integrationTitle: 'Ajustes de integración qBittorrent',
    integrationSubtitle: 'Añade tus credenciales locales de Web UI para sincronizar velocidad, seeds, peers, ETA y progreso.',
    hostLoopbackHint: 'Bloqueado en 127.0.0.1 (solo local) y guardado cifrado con Electron safeStorage.',
    finishSetupBtn: 'Finalizar configuración',
    skipIntegrationBtn: 'Configurar luego en Ajustes',
    finalizingPhase1: 'Guardando tema e idioma...',
    finalizingPhase2: 'Preparando gestor de descargas...',
    finalizingPhase3: '¡Todo listo!',
    congratsEyebrow: 'Configuración completada',
    congratsTitle: '¡Felicidades! SecretArea Desktop está listo.',
    congratsSubtitle: 'Tu lanzador está configurado. Disfruta de descargas rápidas por Directo, MediaFire, Mega y qBittorrent.',
    summaryThemeLabel: 'Tema activo',
    summaryLanguageLabel: 'Idioma',
    summaryTorrentLabel: 'Estado qBittorrent',
    summaryTorrentConnected: 'Conectado y verificado',
    summaryTorrentInstalled: 'Instalado (Configurar en Ajustes)',
    summaryTorrentSkipped: 'Omitido (Opcional)',
    changeLaterHint: 'Puedes cambiar el tema, idioma, carpeta de descargas o ajustes de qBittorrent cuando quieras desde la página Ajustes.',
    enterAppBtn: 'Entrar en SecretArea',
    openSettingsPageBtn: 'Ver en Ajustes',
  },
};

const AR: LauncherTranslations = {
  locale: 'ar-EG-u-nu-latn',
  nav: {
    home: 'الرئيسية',
    library: 'المكتبة',
    downloads: 'التنزيلات',
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
    downloadSectionTitle: 'التنزيلات والتخزين',
    downloadFolderTitle: 'مجلد التنزيلات الافتراضي',
    downloadFolderDesc: 'اختر المجلد الذي تُحفظ فيه الروابط المباشرة وملفات MediaFire و Mega وتنزيلات المتصفح المدمج.',
    chooseFolderBtn: 'تغيير المجلد',
    openFolderBtn: 'فتح المجلد',
    torrentSectionTitle: 'ربط qBittorrent (Web UI API v2)',
    torrentSectionDesc: 'اختياري: اربط SecretArea بواجهة الويب المحلية لبرنامج qBittorrent (API v2 / 5.0+) لإرسال روابط Magnet وملفات .torrent ومتابعة سرعة التحميل والرفع والوقت المتبقي.',
    torrentEnableTitle: 'تفعيل المزامنة مع qBittorrent Web UI',
    torrentEnableDesc: 'يزامن روابط Magnet وملفات .torrent مع qBittorrent المحلي مع تشفير البيانات عبر safeStorage. الروابط المباشرة و MediaFire و Mega تعمل دائماً دون الحاجة لـ qBittorrent.',
    torrentAutoDetectBtn: 'كشف تلقائي',
    torrentDetectingBtn: 'جارٍ الفحص...',
    torrentTestBtn: 'اختبار الاتصال',
    torrentTestingBtn: 'جارٍ الاختبار...',
    torrentSaveBtn: 'حفظ الإعدادات',
    torrentSavingBtn: 'جارٍ الحفظ...',
    torrentStatusConnected: 'متصل',
    torrentStatusDisconnected: 'غير متصل',
    torrentStatusTesting: 'جارٍ الاختبار...',
    torrentNotInstalledTitle: 'لم يتم العثور على qBittorrent على هذا الجهاز (اختياري)',
    torrentNotInstalledDesc: 'تعمل التنزيلات المباشرة و MediaFire و Mega والمتصفح المدمج بشكل مستقل تماماً. ثبّت qBittorrent فقط إذا أردت متابعة روابط Magnet وملفات .torrent داخل التطبيق.',
    torrentDownloadBtn: 'تنزيل qBittorrent الرسمي',
    torrentHostLabel: 'المضيف (محلي فقط)',
    torrentPortLabel: 'المنفذ (Port)',
    torrentUsernameLabel: 'اسم المستخدم',
    torrentPasswordLabel: 'كلمة المرور',
    torrentPasswordSavedPlaceholder: 'مشفرة عبر safeStorage (اتركها فارغة للإبقاء)',
    torrentApiKeyLabel: 'مفتاح API (اختياري · qBittorrent 5.2+)',
    torrentApiKeyPlaceholder: 'qbt_... (اختياري)',
    torrentApiKeySavedPlaceholder: 'مفتاح API محفوظ بأمان (اتركه فارغاً للإبقاء)',
    torrentLoopbackNotice: 'أمان الشبكة المحلية: يقتصر الاتصال على العنوان المحلي (127.0.0.1 / localhost / ::1) ولا يتم فتح Web UI على الشبكة الخارجية.',
    torrentLoopbackError: 'يجب أن يكون المضيف عنواناً محلياً فقط (127.0.0.1 أو localhost أو ::1).',
    torrentGuideTitle: 'خطوات تفعيل qBittorrent Web UI (إعداد يدوي)',
    torrentGuideStep1: '1. افتح qBittorrent على ويندوز واذهب إلى Tools ← Options ← Web UI.',
    torrentGuideStep2: '2. فعّل خيار «Web User Interface (Remote control)»، واترك IP Address على 127.0.0.1 والمنفذ 8080.',
    torrentGuideStep3: '3. ضمن Authentication أدخل اسم المستخدم وكلمة المرور (أو أنشئ مفتاح API يبدأ بـ qbt_ في qBittorrent 5.2.0+).',
    torrentGuideStep4: '4. اضغط Apply ثم OK في qBittorrent، ثم أدخل نفس البيانات أعلاه واضغط حفظ الإعدادات.',
    torrentGuideStep5: '5. اضغط «كشف تلقائي» ثم «اختبار الاتصال» للتحقق من الاتصال بـ Web UI API v2.',
    torrentWebNotice: 'وضع معاينة الويب: لا يمكن للمتصفح الاتصال بواجهة qBittorrent المحلية (127.0.0.1) أو استخدام safeStorage. استخدم تطبيق سطح المكتب SecretArea.exe لاختبار الاتصال والمزامنة.',
    torrentTestingWebPreviewMsg: 'غير متصل — معاينة الويب لا تستطيع الاتصال بـ qBittorrent المحلي.',
    torrentTestingWebPreviewHint: 'قيود المتصفح تمنع الاتصال بالمنفذ المحلي وتشفير safeStorage. شغّل تطبيق SecretArea.exe لاختبار الاتصال ومزامنة التحميلات.',
    modeDesktopBadge: 'تطبيق سطح المكتب',
    modeWebPreviewBadge: 'معاينة الويب',
    torrentSavedToast: 'تم حفظ إعدادات qBittorrent',
    torrentManageSetupBtn: 'تثبيت / تحديث qBittorrent تلقائياً',
    replaySetupBtn: 'معالج الترحيب',
  },
  downloads: {
    pageTitle: 'مدير التنزيلات',
    pageSubtitle: 'متابعة الروابط المباشرة و MediaFire و Mega وتنزيلات المتصفح المدمج وتحميلات qBittorrent.',
    quickAddPlaceholder: 'الصق رابطاً مباشراً أو MediaFire أو Mega أو Magnet...',
    quickAddBtn: 'إضافة تنزيل',
    addTorrentFileBtn: 'إضافة .torrent',
    quickAddInvalid: 'أدخل رابط http:// أو https:// أو magnet:? صحيحاً.',
    folderLabel: 'الحفظ في',
    chooseFolder: 'تغيير المجلد',
    openFolder: 'فتح المجلد',
    clearFinished: 'مسح المكتملة',
    tabAll: 'الكل',
    tabActive: 'النشطة',
    tabPaused: 'المتوقفة مؤقتاً',
    tabCompleted: 'المكتملة',
    tabFailed: 'الفاشلة',
    searchPlaceholder: 'تصفية التنزيلات...',
    metricActive: 'النشطة',
    metricSpeed: 'السرعة الكلية',
    metricCompleted: 'المكتملة',
    metricFreeDisk: 'المساحة الحرة',
    statusQueued: 'في الانتظار',
    statusResolving: 'جارٍ فحص الرابط...',
    statusDownloading: 'جارٍ التنزيل',
    statusPaused: 'متوقف مؤقتاً',
    statusCompleted: 'مكتمل',
    statusFailed: 'فشل',
    statusCancelled: 'ملغى',
    sourceDirect: 'رابط مباشر',
    sourceMediafire: 'MediaFire',
    sourceMega: 'Mega',
    sourceQbittorrent: 'qBittorrent',
    sourceBrowser: 'المتصفح المدمج',
    actionPause: 'إيقاف مؤقت',
    actionResume: 'استئناف',
    actionCancel: 'إلغاء',
    actionDelete: 'حذف',
    actionRetry: 'إعادة المحاولة',
    actionOpenFile: 'فتح الملف',
    actionOpenFolder: 'فتح المجلد',
    actionRemove: 'إزالة',
    actionOpenExternal: 'فتح في المتصفح',
    peersLabel: 'الأقران',
    seedsLabel: 'البذور',
    unknownSize: 'حجم غير معروف',
    etaCalculating: 'جارٍ الحساب...',
    torrentConnected: 'qBittorrent متصل',
    torrentDisconnected: 'qBittorrent غير متصل',
    torrentWebPreviewStatus: 'معاينة الويب — المزامنة المباشرة لـ qBittorrent تعمل في SecretArea.exe',
    configureTorrentBtn: 'إعداد qBittorrent',
    speedGraphTitle: 'مخطط سرعة التحميل والرفع',
    periodLabel: 'الفترة:',
    period1m: 'دقيقة واحدة',
    period5m: '5 دقائق',
    period30m: '30 دقيقة',
    period1h: 'ساعة واحدة',
    totalUploadLabel: 'إجمالي الرفع',
    totalDownloadLabel: 'إجمالي التحميل',
    sizeLabel: 'الحجم',
    progressLabel: 'التقدم',
    statusLabel: 'الحالة',
    downSpeedLabel: 'سرعة التحميل',
    upSpeedLabel: 'سرعة الرفع',
    etaLabel: 'الوقت المتبقي',
    ratioLabel: 'النسبة (Ratio)',
    showGraphBtn: 'إظهار مخطط السرعة',
    hideGraphBtn: 'إخفاء مخطط السرعة',
    emptyTitle: 'لا توجد تنزيلات في هذا العرض',
    emptySubtitle: 'الصق أي رابط مباشر أو MediaFire أو Mega أو Magnet أعلاه، أو أضف ملف .torrent، أو اختر قناة تحميل من صفحة أي لعبة.',
    webNoticeTitle: 'وضع معاينة الويب',
    webNoticeBody: 'التحكم بالإيقاف/الاستئناف وعرض السرعة والوقت المتبقي ومزامنة qBittorrent Web UI تعمل داخل تطبيق سطح المكتب SecretArea.exe.',
    startedToast: 'تمت إضافة التنزيل إلى القائمة',
    failedToast: 'تعذر بدء التنزيل',
    detailActiveTitle: 'تنزيلات هذا الإصدار',
    detailManageBtn: 'فتح مدير التنزيلات',
    detailOpenExternal: 'فتح في متصفح خارجي',
    detailStartInApp: 'التحميل داخل SecretArea',
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
  qbitSetup: {
    modalTitle: 'التثبيت التلقائي لبرنامج qBittorrent',
    modalSubtitle: 'الكشف التلقائي على ويندوز، التحقق من التوقيع وSHA-256، وإعداد واجهة الويب المحلية.',
    stepChecking: 'جارٍ فحص المتطلبات...',
    stepDetecting: 'جارٍ الكشف عن qBittorrent...',
    stepDownloading: 'جارٍ تنزيل qBittorrent...',
    stepVerifying: 'جارٍ التحقق من ملف التثبيت...',
    stepInstalling: 'جارٍ تثبيت qBittorrent...',
    stepConfiguring: 'جارٍ تهيئة التكامل...',
    stepCompleted: 'اكتمل الإعداد.',
    installedLabel: 'الإصدار المثبت',
    notInstalledValue: 'غير مثبت',
    latestLabel: 'أحدث إصدار رسمي',
    processLabel: 'الحالة',
    processRunning: 'قيد التشغيل',
    processStopped: 'متوقف',
    statusUpToDate: 'برنامج qBittorrent محدّث بالفعل إلى أحدث إصدار. لا حاجة لإعادة التثبيت.',
    statusNewerInstalled: 'الإصدار المثبت لديك أحدث من الإصدار الرسمي الحالي. لن يقوم SecretArea بالرجوع لإصدار أقدم.',
    statusUpdateAvailable: 'يتوفر تحديث رسمي مستقر جديد لبرنامج qBittorrent جاهز للتثبيت.',
    statusNotInstalled: 'لم يتم العثور على qBittorrent على هذا الجهاز. يمكن لـ SecretArea تنزيل المثبت الرسمي 64-بت، التحقق من سلامته، وتثبيته تلقائياً.',
    statusRunningBlocked: 'برنامج qBittorrent يعمل حالياً. يرجى إغلاقه بشكل طبيعي حتى لا تنقطع التحميلات الجارية، ثم اضغط فحص مرة أخرى.',
    statusLookupFailed: 'تعذر الوصول إلى بيانات أحدث إصدار رسمي حالياً.',
    consentNote: 'بالضغط على تثبيت/تحديث، يقوم SecretArea بتنزيل مثبت 64-بت الرسمي مباشرة من GitHub/qbittorrent.org والتحقق من SHA-256 قبل تشغيله.',
    installBtn: 'تنزيل وتثبيت qBittorrent',
    updateBtn: 'تحديث qBittorrent الآن',
    recheckBtn: 'فحص مرة أخرى',
    retryBtn: 'إعادة المحاولة',
    skipBtn: 'ليس الآن',
    closeBtn: 'تم',
    officialDownloadBtn: 'صفحة التنزيل الرسمية',
    launchQbitBtn: 'فتح qBittorrent',
    shaVerifiedLabel: 'تم التحقق من SHA-256',
    sigVerifiedLabel: 'تم التحقق من التوقيع الرقمي',
    unsignedVerifiedNote: 'مثبت مفتوح المصدر · تم التحقق من بصمة SHA-256 الرسمية',
    webUiSectionTitle: 'إعداد واجهة الويب لـ qBittorrent (127.0.0.1 فقط)',
    webUiDetectedEnabled: 'واجهة الويب مفعلة في إعدادات qBittorrent.',
    webUiNotEnabledHint: 'واجهة الويب غير مفعلة بعد. اتبع الخطوات التالية داخل qBittorrent ثم اضغط حفظ والتحقق من الاتصال:',
    webUiLoopbackWarning: 'عنوان IP لواجهة الويب غير مقيد على 127.0.0.1. اضبط IP على 127.0.0.1 لحماية جهازك.',
    webUiGuide1: '1. افتح qBittorrent ← Tools (الأدوات) ← Options (الخيارات) ← Web UI.',
    webUiGuide2: '2. فعّل خيار "Web User Interface (Remote control)".',
    webUiGuide3: '3. اضبط عنوان IP على 127.0.0.1 والمنفذ (Port) على 8080.',
    webUiGuide4: '4. أدخل اسم المستخدم وكلمة المرور (أو أنشئ كلمة مرور قوية أدناه) ثم اضغط Apply / OK.',
    webUiGuide5: '5. أدخل نفس البيانات أدناه واضغط حفظ والتحقق من الاتصال.',
    generatePasswordBtn: 'توليد كلمة مرور قوية',
    saveAndVerifyBtn: 'حفظ والتحقق من الاتصال',
    verifyingBtn: 'جارٍ التحقق...',
    webUiConnectedMsg: 'متصل وموثق! SecretArea جاهز لتحميل روابط Magnet وملفات .torrent.',
    openSettingsBtn: 'فتح الإعدادات',
    webPreviewNotice: 'يعمل التثبيت التلقائي داخل تطبيق سطح المكتب SecretArea.exe على ويندوز فقط.',
  },
  onboarding: {
    stepWelcome: 'الترحيب',
    stepAppearance: 'المظهر واللغة',
    stepQbitCheck: 'فحص qBittorrent',
    stepQbitIntegration: 'ربط التكامل',
    stepReady: 'جاهز',
    firstTimeNotice: 'إعداد لمرة واحدة عند أول تشغيل بعد التثبيت',
    welcomeEyebrow: 'SecretArea لسطح المكتب',
    welcomeTitle: 'مرحباً بك في SecretArea',
    welcomeSubtitle: 'لنقم بتخصيص المظهر، اللغة، ومحرك التحميل qBittorrent في أقل من دقيقة قبل الدخول إلى مساحة العمل.',
    welcomeFeature1Title: '01. المظهر واللغة',
    welcomeFeature1Desc: 'اختر بين الوضع الداكن، الفاتح، PlayStation 5، أو Xbox Nexus مع لغتك المفضلة.',
    welcomeFeature2Title: '02. فحص qBittorrent',
    welcomeFeature2Desc: 'يفحص جهازك تلقائياً لاكتشاف qBittorrent المثبت مسبقاً أو تثبيت أحدث نسخة رسمية موثوقة.',
    welcomeFeature3Title: '03. ربط سريع وآمن',
    welcomeFeature3Desc: 'اربط واجهة الويب المحلية 127.0.0.1 بتشفير آمن عبر Windows safeStorage.',
    getStartedBtn: 'ابدأ الإعداد الآن',
    skipAllBtn: 'الدخول مباشرة',
    appearanceTitle: 'تخصيص المظهر واللغة',
    appearanceSubtitle: 'تُطبق كل اختياراتك مباشرة هنا. ويمكنك تغيير أي شيء لاحقاً من صفحة الإعدادات.',
    themePickerLabel: 'مظهر التطبيق',
    languagePickerLabel: 'لغة الواجهة',
    themeDarkName: 'الوضع الداكن',
    themeDarkDesc: 'مظهر داكن مريح بتباين احترافي',
    themeLightName: 'الوضع الفاتح',
    themeLightDesc: 'تصميم نهاري مشرق وواضح',
    themePs5Name: 'بلايستيشن 5',
    themePs5Desc: 'أضواء ياقوتية زرقاء وأصوات الكونسول',
    themeXboxName: 'إكس بوكس نيكسوس',
    themeXboxDesc: 'شبكة زمردية خضراء وتوهج Xbox الكلاسيكي',
    settingsEditableNote: 'يمكنك تعديل الصوتيات وتخطيط الشريط والمظهر لاحقاً من الإعدادات.',
    backBtn: 'السابق',
    continueBtn: 'متابعة',
    qbitCheckTitle: 'فحص تثبيت qBittorrent',
    qbitCheckSubtitle: 'يتحقق SecretArea من جهازك أولاً للحفاظ على أي تثبيت سابق لبرنامج qBittorrent.',
    scanningText: 'جارٍ فحص الجهاز بحثاً عن تثبيت qBittorrent...',
    alreadyInstalledTitle: 'برنامج qBittorrent مثبت بالفعل على جهازك',
    alreadyInstalledDesc: 'رائع! بما أن qBittorrent كان مثبتاً قبل SecretArea، انتقل إلى الخطوة التالية لإضافة إعدادات التكامل والربط.',
    goIntegrationBtn: 'إضافة إعدادات تكامل qBittorrent',
    updateFirstBtn: 'تحديث qBittorrent أولاً',
    notInstalledTitle: 'برنامج qBittorrent غير مثبت بعد',
    notInstalledDesc: 'قم بتنزيل وتثبيت النسخة الرسمية 64-بت الموثوقة تلقائياً، ثم انتقل مباشرة إلى إعدادات التكامل.',
    installAndNextBtn: 'تثبيت qBittorrent والمتابعة',
    installCompleteAdvanceMsg: 'تم تثبيت qBittorrent والتحقق منه بنجاح! جارٍ الانتقال لإعدادات التكامل...',
    skipTorrentBtn: 'تخطي إعداد التورنت (التنزيل المباشر فقط)',
    integrationTitle: 'إعدادات تكامل qBittorrent',
    integrationSubtitle: 'أضف بيانات واجهة الويب المحلية لمتابعة السرعة، البذور، الأقران، الوقت المتبقي، ونسبة التقدم.',
    hostLoopbackHint: 'مقيد على 127.0.0.1 فقط (اتصال محلي) ومحفوظ بتشفير Electron safeStorage.',
    finishSetupBtn: 'إنهاء الإعداد',
    skipIntegrationBtn: 'تخطي والإعداد لاحقاً من الإعدادات',
    finalizingPhase1: 'جارٍ حفظ تفضيلات المظهر واللغة...',
    finalizingPhase2: 'جارٍ تجهيز مساحة التنزيلات والتكامل...',
    finalizingPhase3: 'تم تجهيز كل شيء بنجاح!',
    congratsEyebrow: 'اكتمل الإعداد',
    congratsTitle: 'تهانينا! تطبيق SecretArea Desktop جاهز الآن.',
    congratsSubtitle: 'تم تخصيص تطبيقك بنجاح. استمتع بتحميلات سريعة عبر Direct وMediaFire وMega وqBittorrent.',
    summaryThemeLabel: 'المظهر النشط',
    summaryLanguageLabel: 'اللغة',
    summaryTorrentLabel: 'حالة qBittorrent',
    summaryTorrentConnected: 'متصل وموثق',
    summaryTorrentInstalled: 'مثبت (يمكنك ربطه من الإعدادات)',
    summaryTorrentSkipped: 'تم التخطي (اختياري)',
    changeLaterHint: 'يمكنك تغيير المظهر، اللغة، مجلد التنزيل، أو إعدادات qBittorrent في أي وقت من صفحة الإعدادات.',
    enterAppBtn: 'الدخول إلى SecretArea',
    openSettingsPageBtn: 'مراجعة في الإعدادات',
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

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyDocumentThemeSettings,
  DEFAULT_LAUNCHER_SETTINGS,
  loadLauncherSettings,
  resolveActiveOsTheme,
  resolveDefaultOsThemeForPlatform,
  resolveEffectiveLightMode,
  restoreDefaultThemeSettings,
  restoreOsDefaultCustomColors,
} from '../src/services/launcherSettings.ts';
import {
  evaluateThemeContrast,
  getAccessibleTextOnAccent,
  getContrastRatio,
  OS_THEME_PRESETS,
} from '../src/services/themeContrast.ts';
import {
  playCursorClickSound,
  playCursorHoverSound,
  setUiCursorVolume,
} from '../src/utils/uiCursorSounds.ts';
import {
  EMPTY_HARDWARE_SNAPSHOT,
  getMetricAvailability,
} from '../src/services/hardwareMonitor.ts';
import { resolveCursorPalette } from '../src/components/CustomCursorOverlay.tsx';

function createMemoryStorage(initial: Record<string, string> = {}) {
  const map = new Map<string, string>(Object.entries(initial));
  return {
    getItem: (key: string) => (map.has(key) ? map.get(key)! : null),
    setItem: (key: string, val: string) => {
      map.set(key, String(val));
    },
  };
}

test('OS default theme auto-detection maps win32, linux, and darwin cleanly without overwriting saved choices', () => {
  assert.equal(resolveDefaultOsThemeForPlatform('win32'), 'windows');
  assert.equal(resolveDefaultOsThemeForPlatform('linux'), 'linux');
  assert.equal(resolveDefaultOsThemeForPlatform('darwin'), 'macos');

  // Fresh startup with no saved settings follows OS dark/light & defaults to auto OS theme
  const freshStorage = createMemoryStorage();
  const freshDark = loadLauncherSettings(freshStorage, 'linux', true);
  assert.equal(freshDark.osThemePreference, 'auto');
  assert.equal(freshDark.appearanceMode, 'system');
  assert.equal(freshDark.lightMode, false);
  assert.equal(resolveActiveOsTheme(freshDark, 'linux'), 'linux');
  assert.equal(resolveActiveOsTheme(freshDark, 'darwin'), 'macos');

  const freshLight = loadLauncherSettings(freshStorage, 'darwin', false);
  assert.equal(freshLight.appearanceMode, 'system');
  assert.equal(freshLight.lightMode, true);
  assert.equal(resolveEffectiveLightMode(freshLight, false), true);

  // Saved console, custom, and explicit OS preferences must NEVER be overwritten on restart
  const savedPs5 = loadLauncherSettings(
    createMemoryStorage({
      secretarea_launcher_settings_v1: JSON.stringify({
        alwaysPs5Theme: true,
        osThemePreference: 'auto',
      }),
    }),
    'darwin',
    false
  );
  assert.equal(savedPs5.alwaysPs5Theme, true);
  assert.equal(resolveEffectiveLightMode(savedPs5, false), false);

  const savedXbox = loadLauncherSettings(
    createMemoryStorage({
      secretarea_launcher_settings_v1: JSON.stringify({
        alwaysXboxTheme: true,
        lightMode: false,
      }),
    }),
    'linux',
    false
  );
  assert.equal(savedXbox.alwaysXboxTheme, true);
  assert.equal(resolveEffectiveLightMode(savedXbox, false), false);

  const savedExplicitMacOnLinux = loadLauncherSettings(
    createMemoryStorage({
      secretarea_launcher_settings_v1: JSON.stringify({
        osThemePreference: 'macos',
        appearanceMode: 'light',
      }),
    }),
    'linux',
    true
  );
  assert.equal(resolveActiveOsTheme(savedExplicitMacOnLinux, 'linux'), 'macos');
  assert.equal(resolveEffectiveLightMode(savedExplicitMacOnLinux, true), true);

  // Legacy saved entry without appearanceMode preserves explicit lightMode instead of flipping to system
  const legacySavedDark = loadLauncherSettings(
    createMemoryStorage({
      secretarea_launcher_settings_v1: JSON.stringify({
        lightMode: false,
      }),
    }),
    'win32',
    false
  );
  assert.equal(legacySavedDark.appearanceMode, 'dark');
  assert.equal(legacySavedDark.lightMode, false);
});

test('WCAG 2.1 contrast helper computes exact contrast ratios and safe foreground colors', () => {
  assert.equal(getContrastRatio('#ffffff', '#000000'), 21);
  assert.equal(getAccessibleTextOnAccent('#fef08a'), '#0f172a');
  assert.equal(getAccessibleTextOnAccent('#0055b3'), '#ffffff');

  const cobaltDark = evaluateThemeContrast(
    OS_THEME_PRESETS.macos.dark.accent,
    OS_THEME_PRESETS.macos.dark.canvas
  );
  assert.ok(cobaltDark.ratioVsSurface >= 3.0);
  assert.ok(cobaltDark.passesAA);

  const linuxDark = evaluateThemeContrast(
    OS_THEME_PRESETS.linux.dark.accent,
    OS_THEME_PRESETS.linux.dark.canvas
  );
  assert.ok(linuxDark.passesAA);
  assert.notEqual(OS_THEME_PRESETS.linux.dark.canvas, OS_THEME_PRESETS.windows.dark.canvas);
  assert.notEqual(OS_THEME_PRESETS.macos.dark.canvas, OS_THEME_PRESETS.windows.dark.canvas);

  const brightYellowOnWhite = evaluateThemeContrast('#facc15', '#ffffff');
  assert.equal(brightYellowOnWhite.passesAA, false);

  const restoredLinuxDark = restoreOsDefaultCustomColors('linux', true);
  assert.equal(restoredLinuxDark.accentColor, OS_THEME_PRESETS.linux.dark.accent);
  assert.equal(restoredLinuxDark.secondaryColor, OS_THEME_PRESETS.linux.dark.secondary);
  assert.equal(restoredLinuxDark.surfaceStyle, 'midnight');

  const restoredMacLight = restoreOsDefaultCustomColors('macos', false);
  assert.equal(restoredMacLight.accentColor, OS_THEME_PRESETS.macos.light.accent);
  assert.equal(restoredMacLight.surfaceStyle, 'daylight');
});

test('applyDocumentThemeSettings toggles OS theme, console, custom, and motion classes cleanly', () => {
  const classes = new Set<string>();
  const styleProps = new Map<string, string>();
  const fakeHtml = {
    classList: {
      toggle: (name: string, force?: boolean) => {
        if (force) classes.add(name);
        else classes.delete(name);
        return force;
      },
    },
    style: {
      colorScheme: '',
      setProperty: (k: string, v: string) => styleProps.set(k, v),
      removeProperty: (k: string) => styleProps.delete(k),
    },
  };

  const origDoc = globalThis.document;
  (globalThis as unknown as { document: { documentElement: typeof fakeHtml } }).document = {
    documentElement: fakeHtml,
  };

  try {
    applyDocumentThemeSettings(
      { ...DEFAULT_LAUNCHER_SETTINGS, osThemePreference: 'auto', animationMode: 'subtle' },
      true,
      'linux'
    );
    assert.equal(classes.has('dark'), true);
    assert.equal(classes.has('theme-os-linux'), true);
    assert.equal(classes.has('theme-os-macos'), false);
    assert.equal(classes.has('theme-os-windows'), false);
    assert.equal(classes.has('sa-motion-subtle'), true);

    applyDocumentThemeSettings(
      { ...DEFAULT_LAUNCHER_SETTINGS, osThemePreference: 'auto', animationMode: 'reduced' },
      false,
      'darwin'
    );
    assert.equal(classes.has('dark'), false);
    assert.equal(classes.has('theme-os-macos'), true);
    assert.equal(classes.has('theme-os-linux'), false);
    assert.equal(classes.has('sa-motion-reduced'), true);

    // PS5 & Xbox console themes override OS classes cleanly
    applyDocumentThemeSettings(
      { ...DEFAULT_LAUNCHER_SETTINGS, alwaysPs5Theme: true },
      false,
      'darwin'
    );
    assert.equal(classes.has('theme-ps5'), true);
    assert.equal(classes.has('theme-os-macos'), false);

    // Custom theme layers cleanly over OS themes AND console themes
    applyDocumentThemeSettings(
      {
        ...DEFAULT_LAUNCHER_SETTINGS,
        customTheme: {
          ...DEFAULT_LAUNCHER_SETTINGS.customTheme,
          enabled: true,
          accentColor: '#facc15',
          secondaryColor: '#f97316',
        },
      },
      true,
      'linux'
    );
    assert.equal(classes.has('theme-custom'), true);
    assert.equal(classes.has('theme-os-linux'), true);
    assert.equal(classes.has('theme-os-macos'), false);
    assert.equal(styleProps.get('--sa-accent-fg'), '#0f172a');
    assert.equal(styleProps.get('--sa-secondary'), '#f97316');

    applyDocumentThemeSettings(
      {
        ...DEFAULT_LAUNCHER_SETTINGS,
        alwaysPs5Theme: true,
        customTheme: {
          ...DEFAULT_LAUNCHER_SETTINGS.customTheme,
          enabled: true,
          accentColor: '#38bdf8',
          secondaryColor: '#a855f7',
        },
      },
      true,
      'darwin'
    );
    assert.equal(classes.has('theme-ps5'), true);
    assert.equal(classes.has('theme-custom'), true);
    assert.equal(classes.has('theme-os-macos'), false);

    const restored = restoreDefaultThemeSettings(
      {
        ...DEFAULT_LAUNCHER_SETTINGS,
        alwaysPs5Theme: true,
        osThemePreference: 'macos',
        animationMode: 'reduced',
      },
      false
    );
    assert.equal(restored.osThemePreference, 'auto');
    assert.equal(restored.appearanceMode, 'system');
    assert.equal(restored.animationMode, 'full');
    assert.equal(restored.alwaysPs5Theme, false);
    assert.equal(restored.lightMode, true);
  } finally {
    (globalThis as unknown as { document: typeof origDoc }).document = origDoc;
  }
});

test('resolveCursorPalette returns theme-matched colors for OS, console, and custom builder themes', () => {
  const win = resolveCursorPalette({ activeTheme: 'default', activeOsTheme: 'windows' });
  const linux = resolveCursorPalette({ activeTheme: 'default', activeOsTheme: 'linux' });
  const mac = resolveCursorPalette({ activeTheme: 'default', activeOsTheme: 'macos' });
  const ps5 = resolveCursorPalette({ activeTheme: 'ps5', activeOsTheme: 'windows' });
  const xbox = resolveCursorPalette({ activeTheme: 'xbox', activeOsTheme: 'windows' });

  assert.equal(win.accent, '#6cb6ff');
  assert.equal(linux.accent, '#88c0d0');
  assert.equal(linux.secondary, '#a3be8c');
  assert.equal(mac.accent, '#3b82f6');
  assert.equal(mac.secondary, '#a855f7');
  assert.equal(ps5.accent, '#6cb6ff');
  assert.equal(xbox.accent, '#60e650');

  const customOverPs5 = resolveCursorPalette({
    activeTheme: 'ps5',
    activeOsTheme: 'linux',
    customAccent: { enabled: true, accentColor: '#f43f5e', secondaryColor: '#f59e0b' },
  });
  assert.equal(customOverPs5.accent, '#f43f5e');
  assert.equal(customOverPs5.ring, '#f43f5e');
  assert.equal(customOverPs5.secondary, '#f59e0b');
});

test('UI click sound synthesizer respects mute/zero volume and never throws outside browser AudioContext', () => {
  setUiCursorVolume(0);
  assert.doesNotThrow(() => {
    playCursorClickSound('primary', 'macos');
    playCursorClickSound('back', 'linux');
    playCursorHoverSound('windows');
  });

  setUiCursorVolume(0.65);
  assert.doesNotThrow(() => {
    playCursorClickSound('primary', 'macos');
    playCursorClickSound('soft', 'linux');
  });
});

test('Hardware snapshot metricAvailability helper returns structured status cleanly', () => {
  const missing = getMetricAvailability(EMPTY_HARDWARE_SNAPSHOT, 'cpuTemp');
  assert.equal(missing, null);

  const sample = {
    ...EMPTY_HARDWARE_SNAPSHOT,
    metricAvailability: {
      presentMonFps: {
        state: 'unsupported' as const,
        reason: 'Windows-only feature',
        source: null,
      },
    },
  };
  const entry = getMetricAvailability(sample, 'presentMonFps');
  assert.equal(entry?.state, 'unsupported');
  assert.equal(entry?.reason, 'Windows-only feature');
});

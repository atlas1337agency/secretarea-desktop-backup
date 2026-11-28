const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '..');

test('package.json preserves Windows NSIS, Linux AppImage/DEB, and defines macOS DMG/ZIP (x64 & arm64) targets', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

  assert.equal(pkg.version, '1.0.12');
  assert.match(pkg.version, /^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/);
  assert.equal(pkg.desktopName, 'secretarea.desktop');
  assert.equal(pkg.scripts['desktop:build'], 'vite build && electron-builder --win nsis');
  assert.equal(pkg.scripts['desktop:build:win'], 'vite build && electron-builder --win nsis --x64 --publish never');
  assert.equal(pkg.scripts['desktop:build:linux'], 'vite build && electron-builder --linux AppImage deb --x64 --publish never');
  assert.equal(
    pkg.scripts['desktop:build:mac'],
    'vite build && electron-builder --mac dmg zip --x64 --arm64 --publish never'
  );
  assert.equal(
    pkg.scripts['desktop:build:mac:x64'],
    'vite build && electron-builder --mac dmg zip --x64 --publish never'
  );
  assert.equal(
    pkg.scripts['desktop:build:mac:arm64'],
    'vite build && electron-builder --mac dmg zip --arm64 --publish never'
  );

  assert.equal(pkg.build.win.artifactName, 'SecretArea.exe');
  assert.deepEqual(pkg.build.win.target, [{ target: 'nsis', arch: ['x64'] }]);

  assert.deepEqual(pkg.build.publish, [
    {
      provider: 'github',
      owner: 'secretarea1337',
      repo: 'secretarea-desktop',
      releaseType: 'release',
    },
  ]);

  assert.deepEqual(pkg.build.linux.target, [
    { target: 'AppImage', arch: ['x64'] },
    { target: 'deb', arch: ['x64'] },
  ]);
  assert.equal(pkg.build.linux.icon, 'packaging/linux/icons');
  assert.equal(pkg.build.linux.syncDesktopName, true);
  assert.equal(pkg.build.linux.category, 'Game');
  assert.equal(pkg.build.appImage.artifactName, 'SecretArea-${version}-linux-x86_64.AppImage');
  assert.equal(pkg.build.deb.artifactName, 'SecretArea-${version}-linux-amd64.deb');
  assert.equal(pkg.build.deb.compression, 'gz');

  // macOS config & entitlements & icon
  assert.equal(pkg.build.appId, 'site.secretarea.desktop');
  assert.equal(pkg.build.mac.icon, 'packaging/mac/icon.icns');
  assert.equal(pkg.build.mac.minimumSystemVersion, '11.0');
  assert.equal(pkg.build.mac.hardenedRuntime, true);
  assert.equal(pkg.build.mac.entitlements, 'packaging/mac/entitlements.mac.plist');
  assert.equal(pkg.build.mac.entitlementsInherit, 'packaging/mac/entitlements.mac.inherit.plist');
  assert.equal(pkg.build.mac.artifactName, 'SecretArea-${version}-mac-${arch}.${ext}');
  assert.deepEqual(pkg.build.mac.target, [
    { target: 'dmg', arch: ['x64', 'arm64'] },
    { target: 'zip', arch: ['x64', 'arm64'] },
  ]);
  assert.equal(Array.isArray(pkg.build.mac.extendInfo.CFBundleURLTypes), true);
  assert.deepEqual(pkg.build.mac.extendInfo.CFBundleURLTypes[0].CFBundleURLSchemes, ['secretarea']);
  assert.equal(pkg.build.dmg.artifactName, 'SecretArea-${version}-mac-${arch}.dmg');

  for (const size of [16, 32, 48, 64, 128, 256, 512]) {
    const iconPath = path.join(ROOT, 'packaging', 'linux', 'icons', `${size}x${size}.png`);
    assert.equal(fs.existsSync(iconPath), true, `Missing Linux icon size ${size}x${size}.png`);
  }

  // Real macOS ICNS binary validation (icns header + PNG chunks up to 1024x1024 ic10)
  const icnsPath = path.join(ROOT, 'packaging', 'mac', 'icon.icns');
  assert.equal(fs.existsSync(icnsPath), true, 'Missing packaging/mac/icon.icns');
  const icnsBuf = fs.readFileSync(icnsPath);
  assert.equal(icnsBuf.slice(0, 4).toString('ascii'), 'icns');
  assert.equal(icnsBuf.readUInt32BE(4), icnsBuf.length);
  const foundTypes = new Set();
  let offset = 8;
  while (offset + 8 <= icnsBuf.length) {
    const type = icnsBuf.slice(offset, offset + 4).toString('ascii');
    const len = icnsBuf.readUInt32BE(offset + 4);
    assert.ok(len >= 8 && offset + len <= icnsBuf.length, `Invalid chunk length for ${type}`);
    foundTypes.add(type);
    offset += len;
  }
  for (const reqType of ['icp4', 'icp5', 'icp6', 'ic07', 'ic08', 'ic09', 'ic10']) {
    assert.equal(foundTypes.has(reqType), true, `Missing ICNS icon chunk ${reqType}`);
  }

  for (const plistFile of ['entitlements.mac.plist', 'entitlements.mac.inherit.plist']) {
    const plistPath = path.join(ROOT, 'packaging', 'mac', plistFile);
    assert.equal(fs.existsSync(plistPath), true, `Missing ${plistFile}`);
    const content = fs.readFileSync(plistPath, 'utf8');
    assert.match(content, /com\.apple\.security\.cs\.allow-jit/);
    if (plistFile === 'entitlements.mac.plist') {
      assert.match(content, /com\.apple\.security\.network\.client/);
    }
  }
});

test('GitHub Actions workflow builds Windows, Linux, and macOS (x64 & arm64) and publishes atomically', () => {
  const yml = fs.readFileSync(path.join(ROOT, '.github/workflows/build-desktop.yml'), 'utf8');

  assert.match(yml, /^  check-version:/m);
  assert.match(yml, /^  build-windows:/m);
  assert.match(yml, /^  build-linux:/m);
  assert.match(yml, /^  build-macos-x64:/m);
  assert.match(yml, /^  build-macos-arm64:/m);
  assert.match(yml, /^  publish-release:/m);

  // Parallel builds wait on check-version only (pinned macOS runner labels)
  assert.match(yml, /build-windows:[\s\S]*?needs:\s*check-version[\s\S]*?runs-on:\s*windows-latest/);
  assert.match(yml, /build-linux:[\s\S]*?needs:\s*check-version[\s\S]*?runs-on:\s*ubuntu-latest/);
  assert.match(yml, /build-macos-x64:[\s\S]*?needs:\s*check-version[\s\S]*?runs-on:\s*macos-15-intel/);
  assert.match(yml, /build-macos-arm64:[\s\S]*?needs:\s*check-version[\s\S]*?runs-on:\s*macos-15(?:\r?\n)/);
  assert.equal(yml.includes('macos-latest'), false, 'Do not use unpinned macos-latest runner');

  // Explicit macOS runner architecture verification (fail immediately if runner arch mismatches)
  assert.match(yml, /Verify Intel x64 runner architecture[\s\S]*?uname -m[\s\S]*?"\$ARCH" != "x86_64"/);
  assert.match(yml, /Verify Apple Silicon arm64 runner architecture[\s\S]*?uname -m[\s\S]*?"\$ARCH" != "arm64"/);

  // Signing & notarization credential handling supports CSC_LINK + APPLE_CERTIFICATE and disables notarize when absent
  assert.match(yml, /CSC_LINK:\s*\$\{\{\s*secrets\.CSC_LINK\s*\}\}/);
  assert.match(yml, /CSC_KEY_PASSWORD:\s*\$\{\{\s*secrets\.CSC_KEY_PASSWORD\s*\}\}/);
  assert.match(yml, /APPLE_ID:\s*\$\{\{\s*secrets\.APPLE_ID\s*\}\}/);
  assert.match(yml, /APPLE_APP_SPECIFIC_PASSWORD:\s*\$\{\{\s*secrets\.APPLE_APP_SPECIFIC_PASSWORD\s*\}\}/);
  assert.match(yml, /APPLE_TEAM_ID:\s*\$\{\{\s*secrets\.APPLE_TEAM_ID\s*\}\}/);
  assert.equal(yml.includes('-c.mac.notarize=false'), true, 'Unsigned/un-notarized builds must explicitly pass -c.mac.notarize=false');

  // Single atomic release job waits on all 4 OS/arch platform builds and holds contents: write
  assert.match(
    yml,
    /publish-release:[\s\S]*?needs:\s*\[check-version,\s*build-windows,\s*build-linux,\s*build-macos-x64,\s*build-macos-arm64\][\s\S]*?permissions:\s*\n\s*contents:\s*write/
  );
  assert.equal((yml.match(/softprops\/action-gh-release@v2/g) || []).length, 1);

  // Required release assets, blockmaps, permanent download aliases, and remote SHA-256 verification before publishing
  for (const expectedAsset of [
    'SecretArea.exe',
    'SecretArea.exe.blockmap',
    'latest.yml',
    'linux-x86_64.AppImage',
    'linux-amd64.deb',
    'latest-linux.yml',
    'artifacts/aliases/SecretArea-linux-x86_64.AppImage',
    'artifacts/aliases/SecretArea-linux-amd64.deb',
    'mac-x64.dmg',
    'mac-x64.zip',
    'mac-x64.zip.blockmap',
    'mac-arm64.dmg',
    'mac-arm64.zip',
    'mac-arm64.zip.blockmap',
    'latest-mac-x64.yml',
    'latest-mac-arm64.yml',
    'latest-mac.yml',
    'artifacts/aliases/SecretArea-macOS-Intel.dmg',
    'artifacts/aliases/SecretArea-macOS-AppleSilicon.dmg',
    'electron-builder install-app-deps',
    'CSC_IDENTITY_AUTO_DISCOVERY',
    'downloadAndHashRemoteAsset',
  ]) {
    assert.equal(yml.includes(expectedAsset), true, `Workflow must handle ${expectedAsset}`);
  }

  assert.equal(yml.includes('npm ci --no-audit --no-fund'), true);
  assert.equal(yml.includes('actions/cache@v4'), true);
});

test('Linux and macOS platform guards prevent Windows-only startup network calls in OSS/PresentMon managers', async () => {
  const { createPresentMonManager } = require(path.join(ROOT, 'electron/hardware/presentMonManager.cjs'));
  const { createOpenSourceToolsManager } = require(path.join(ROOT, 'electron/hardware/openSourceToolsManager.cjs'));

  for (const platformOverride of ['linux', 'darwin']) {
    let presentMonFetched = false;
    const pm = createPresentMonManager({
      platformOverride,
      getMainWindow: () => null,
      getUserDataPath: () => `/tmp/sa-test-pm-${platformOverride}`,
      readSettings: () => ({}),
      writeSettings: () => {},
      fetchReleaseOverride: async () => {
        presentMonFetched = true;
        return null;
      },
    });
    pm.initStartupCheck();
    assert.equal(pm.getState().actionNeeded, 'unsupported_os');
    assert.equal(pm.getState().shouldPrompt, false);
    assert.equal(presentMonFetched, false);
    pm.shutdown();

    let lhmFetched = false;
    const oss = createOpenSourceToolsManager({
      platformOverride,
      getMainWindow: () => null,
      getUserDataPath: () => `/tmp/sa-test-oss-${platformOverride}`,
      readSettings: () => ({}),
      writeSettings: () => {},
      fetchGithubReleaseOverride: async () => {
        lhmFetched = true;
        return null;
      },
    });
    await oss.initStartupCheck();
    assert.equal(oss.getSnapshot().platformSupported, false);
    assert.equal(lhmFetched, false);
    oss.shutdown();
  }
});

test('electron/main.cjs & preload.cjs support macOS Cocoa menu, open-url, arch exposure, and updater fallbacks', () => {
  const mainSrc = fs.readFileSync(path.join(ROOT, 'electron/main.cjs'), 'utf8');
  const preloadSrc = fs.readFileSync(path.join(ROOT, 'electron/preload.cjs'), 'utf8');

  assert.match(mainSrc, /function detectLinuxPackageType\(\)/);
  assert.match(mainSrc, /function detectMacCodeSigningStatus\(\)/);
  assert.match(mainSrc, /function getManualDownloadUrlForCurrentPlatform\(/);
  assert.match(mainSrc, /function isAutoUpdateSupported\(\)/);
  assert.match(mainSrc, /function setupApplicationMenu\(\)/);
  assert.match(mainSrc, /app\.on\('open-url'/);
  assert.match(mainSrc, /getLinuxAutostartDesktopPath/);
  assert.match(mainSrc, /linuxPackageType:\s*detectLinuxPackageType\(\)/);
  assert.match(mainSrc, /autoUpdateSupported:\s*isAutoUpdateSupported\(\)/);
  assert.match(mainSrc, /SecretArea-macOS-AppleSilicon\.dmg/);
  assert.match(mainSrc, /SecretArea-macOS-Intel\.dmg/);
  assert.match(preloadSrc, /arch:\s*process\.arch/);
});

test('macOS platform adaptations cover ping timeout, Apple Silicon hardware, TCC-safe cleaner, and qBittorrent bundle detection', () => {
  const gsmSrc = fs.readFileSync(path.join(ROOT, 'electron/hardware/gamingSessionManager.cjs'), 'utf8');
  assert.match(gsmSrc, /process\.platform === 'darwin'[\s\S]*\['-c', '4', '-W', '1000', pingTarget\]/);

  const dlaSrc = fs.readFileSync(path.join(ROOT, 'electron/hardware/displayLaptopAdapter.cjs'), 'utf8');
  const { classifyCpuFamily } = require(path.join(ROOT, 'electron/hardware/displayLaptopAdapter.cjs'));
  assert.deepEqual(classifyCpuFamily('Apple M3 Max', 'Apple'), {
    vendor: 'Apple',
    series: 'Apple Silicon',
    generation: 'M3 Max',
  });
  assert.match(dlaSrc, /AppleSmartBattery/);
  assert.match(dlaSrc, /Apple Silicon Unified Memory/);

  const cleanerSrc = fs.readFileSync(path.join(ROOT, 'electron/hardware/pcCleaner.cjs'), 'utf8');
  assert.match(cleanerSrc, /process\.platform === 'darwin'/);
  assert.match(cleanerSrc, /DiagnosticReports/);
  assert.match(cleanerSrc, /disabled on macOS so TCC privacy prompt never triggers on ~\/\.Trash/);

  const qbitSetupSrc = fs.readFileSync(path.join(ROOT, 'electron/qbitSetupManager.cjs'), 'utf8');
  const dlMgrSrc = fs.readFileSync(path.join(ROOT, 'electron/downloadManager.cjs'), 'utf8');
  assert.match(qbitSetupSrc, /\/Applications\/qBittorrent\.app/);
  assert.match(qbitSetupSrc, /'Library', 'Preferences', 'qBittorrent', 'qBittorrent\.ini'/);
  assert.match(qbitSetupSrc, /CFBundleShortVersionString/);
  assert.match(dlMgrSrc, /\/Applications\/qBittorrent\.app/);

  const desktopDlSrc = fs.readFileSync(path.join(ROOT, 'src/services/desktopDownload.ts'), 'utf8');
  assert.match(desktopDlSrc, /SecretArea-macOS-AppleSilicon\.dmg/);
  assert.match(desktopDlSrc, /SecretArea-macOS-Intel\.dmg/);
  assert.match(desktopDlSrc, /SecretArea-linux-x86_64\.AppImage/);
  assert.match(desktopDlSrc, /SecretArea-linux-amd64\.deb/);
});

test('installed electron-updater MacUpdater selects exact x64 vs arm64 ZIP (native and Rosetta) from merged latest-mac.yml', async () => {
  const crypto = require('node:crypto');
  const childProcess = require('node:child_process');
  const { MacUpdater } = require('electron-updater/out/MacUpdater');
  const { parseUpdateInfo, findFile } = require('electron-updater/out/providers/Provider');
  const { GitHubProvider } = require('electron-updater/out/providers/GitHubProvider');

  const arm64Sha512 = crypto.createHash('sha512').update('secretarea-arm64-zip-fixture').digest('base64');
  const x64Sha512 = crypto.createHash('sha512').update('secretarea-x64-zip-fixture').digest('base64');

  // Matches exact structure produced by .github/workflows/build-desktop.yml merge step
  const mergedLatestMacYml = [
    'version: 1.0.12',
    'files:',
    '  - url: SecretArea-1.0.12-mac-arm64.zip',
    `    sha512: ${arm64Sha512}`,
    '    size: 120000123',
    '    blockMapSize: 124000',
    '  - url: SecretArea-1.0.12-mac-x64.zip',
    `    sha512: ${x64Sha512}`,
    '    size: 125000456',
    '    blockMapSize: 128000',
    'path: SecretArea-1.0.12-mac-arm64.zip',
    `sha512: ${arm64Sha512}`,
    "minimumSystemVersion: '11.0'",
    "releaseDate: '2026-11-27T05:00:00.000Z'",
    '',
  ].join('\n');

  const parsed = parseUpdateInfo(
    mergedLatestMacYml,
    'latest-mac.yml',
    new URL('https://github.com/secretarea1337/secretarea-desktop/releases/download/v1.0.12/latest-mac.yml')
  );
  parsed.tag = 'v1.0.12';

  const provider = Object.create(GitHubProvider.prototype);
  provider.options = { provider: 'github', owner: 'secretarea1337', repo: 'secretarea-desktop' };
  provider.baseUrl = new URL('https://github.com');

  const resolvedFiles = provider.resolveFiles(parsed);
  assert.equal(resolvedFiles.length, 2);

  // Apple Silicon (arm64) -> must select arm64 ZIP even if entry ordering varies
  const arm64Selection = findFile(MacUpdater.filterFilesForArch(resolvedFiles, true), 'zip', ['pkg', 'dmg']);
  assert.ok(arm64Selection);
  assert.equal(
    arm64Selection.url.href,
    'https://github.com/secretarea1337/secretarea-desktop/releases/download/v1.0.12/SecretArea-1.0.12-mac-arm64.zip'
  );
  assert.equal(arm64Selection.info.sha512, arm64Sha512);

  // Intel x64 -> must select x64 ZIP and MUST ignore arm64 top-level path/sha512 fields
  const x64Selection = findFile(MacUpdater.filterFilesForArch(resolvedFiles, false), 'zip', ['pkg', 'dmg']);
  assert.ok(x64Selection);
  assert.equal(
    x64Selection.url.href,
    'https://github.com/secretarea1337/secretarea-desktop/releases/download/v1.0.12/SecretArea-1.0.12-mac-x64.zip'
  );
  assert.equal(x64Selection.info.sha512, x64Sha512);

  // Reversed entry ordering in files: must still pick the matching arch
  const reversedFiles = [resolvedFiles[1], resolvedFiles[0]];
  assert.equal(
    findFile(MacUpdater.filterFilesForArch(reversedFiles, true), 'zip', ['pkg', 'dmg']).url.pathname.endsWith('SecretArea-1.0.12-mac-arm64.zip'),
    true
  );
  assert.equal(
    findFile(MacUpdater.filterFilesForArch(reversedFiles, false), 'zip', ['pkg', 'dmg']).url.pathname.endsWith('SecretArea-1.0.12-mac-x64.zip'),
    true
  );

  // End-to-end MacUpdater.prototype.doDownloadUpdate simulation for Intel x64 vs Apple Silicon under Rosetta (sysctl.proc_translated: 1)
  const originalExecFileSync = childProcess.execFileSync;
  const origArchDesc = Object.getOwnPropertyDescriptor(process, 'arch');

  const runDoDownloadArchSimulation = async ({ rosetta, unameOut, procArch }) => {
    childProcess.execFileSync = (cmd) => {
      if (cmd === 'sysctl') return rosetta ? 'sysctl.proc_translated: 1\n' : 'sysctl.proc_translated: 0\n';
      if (cmd === 'uname') return unameOut;
      throw new Error(`Unexpected command in test: ${cmd}`);
    };
    Object.defineProperty(process, 'arch', { value: procArch, configurable: true });

    let selectedFileInfo = null;
    const updater = Object.create(MacUpdater.prototype);
    updater._logger = { info: () => {}, warn: () => {}, debug: () => {} };
    updater.debug = () => {};
    updater.executeDownload = async (opts) => {
      selectedFileInfo = opts.fileInfo;
      return ['ok'];
    };

    await updater.doDownloadUpdate({
      updateInfoAndProvider: {
        provider,
        info: parsed,
      },
      disableDifferentialDownload: true,
    });
    return selectedFileInfo;
  };

  try {
    const rosettaChoice = await runDoDownloadArchSimulation({
      rosetta: true,
      unameOut: 'Darwin MacBookPro.local 24.0.0 Darwin Kernel Version 24.0.0: RELEASE_X86_64 x86_64\n',
      procArch: 'x64',
    });
    assert.equal(
      rosettaChoice.url.href,
      'https://github.com/secretarea1337/secretarea-desktop/releases/download/v1.0.12/SecretArea-1.0.12-mac-arm64.zip'
    );
    assert.equal(rosettaChoice.info.sha512, arm64Sha512);

    const intelChoice = await runDoDownloadArchSimulation({
      rosetta: false,
      unameOut: 'Darwin IntelMac.local 24.0.0 Darwin Kernel Version 24.0.0: RELEASE_X86_64 x86_64\n',
      procArch: 'x64',
    });
    assert.equal(
      intelChoice.url.href,
      'https://github.com/secretarea1337/secretarea-desktop/releases/download/v1.0.12/SecretArea-1.0.12-mac-x64.zip'
    );
    assert.equal(intelChoice.info.sha512, x64Sha512);
  } finally {
    childProcess.execFileSync = originalExecFileSync;
    if (origArchDesc) {
      Object.defineProperty(process, 'arch', origArchDesc);
    }
  }
});

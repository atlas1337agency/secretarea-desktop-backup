const fs = require('fs');
const fsp = fs.promises;
const path = require('path');
const { execFile } = require('child_process');

const METRIC_AVAILABILITY_STATES = Object.freeze([
  'available',
  'unsupported',
  'permission_required',
  'temporarily_unavailable',
  'detection_failed',
]);

function runExecSafe(cmd, args, timeoutMs = 2800) {
  return new Promise((resolve) => {
    execFile(
      cmd,
      args,
      { timeout: timeoutMs, windowsHide: true, maxBuffer: 4 * 1024 * 1024 },
      (err, stdout, stderr) => {
        if (err) {
          resolve({
            ok: false,
            code: err.code || null,
            stdout: typeof stdout === 'string' ? stdout.trim() : '',
            stderr: typeof stderr === 'string' ? stderr.trim() : '',
          });
          return;
        }
        resolve({
          ok: true,
          code: null,
          stdout: typeof stdout === 'string' ? stdout.trim() : '',
          stderr: typeof stderr === 'string' ? stderr.trim() : '',
        });
      }
    );
  });
}

function toFiniteNum(v) {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string') {
    const cleaned = v.trim();
    if (!cleaned) return null;
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/**
 * Parses `vm_stat` output on macOS to compute accurate memory usage matching Activity Monitor:
 * used = active + wired + occupied by compressor; available = total - used.
 */
function parseMacVmStatOutput(rawOutput, totalMemBytes) {
  if (typeof rawOutput !== 'string' || !rawOutput.trim()) return null;
  const pageSizeMatch = rawOutput.match(/page size of (\d+) bytes/i);
  const pageSize = pageSizeMatch ? Number(pageSizeMatch[1]) : 4096;
  if (!Number.isFinite(pageSize) || pageSize <= 0) return null;

  const extractPages = (labelPattern) => {
    const m = rawOutput.match(new RegExp(`^\\s*${labelPattern}:\\s*(\\d+)\\.?`, 'im'));
    return m ? Number(m[1]) : 0;
  };

  const freePages = extractPages('Pages free');
  const activePages = extractPages('Pages active');
  const inactivePages = extractPages('Pages inactive');
  const speculativePages = extractPages('Pages speculative');
  const wiredPages = extractPages('Pages wired down');
  const compressedPages = extractPages('Pages occupied by compressor');
  const purgeablePages = extractPages('Pages purgeable');

  const usedBytes = Math.max(0, (activePages + wiredPages + compressedPages) * pageSize);
  const resolvedTotal =
    Number.isFinite(totalMemBytes) && totalMemBytes > 0
      ? totalMemBytes
      : Math.max(
          usedBytes,
          (freePages + activePages + inactivePages + speculativePages + wiredPages + compressedPages) *
            pageSize
        );
  if (!resolvedTotal || resolvedTotal <= 0) return null;

  const clampedUsed = Math.min(resolvedTotal, usedBytes);
  const availableBytes = Math.max(0, resolvedTotal - clampedUsed);
  const usagePercent = Number(((clampedUsed / resolvedTotal) * 100).toFixed(1));

  return {
    pageSize,
    totalBytes: resolvedTotal,
    usedBytes: clampedUsed,
    availableBytes,
    usagePercent,
    appBytes: activePages * pageSize,
    wiredBytes: wiredPages * pageSize,
    compressedBytes: compressedPages * pageSize,
    cachedFilesBytes: Math.max(0, (inactivePages + speculativePages + purgeablePages) * pageSize),
  };
}

/**
 * Parses `sysctl` key-value lines (macOS) safely.
 */
function parseMacSysctlOutput(rawOutput) {
  if (typeof rawOutput !== 'string' || !rawOutput.trim()) {
    return {};
  }
  const map = {};
  for (const line of rawOutput.split(/\r?\n/)) {
    const sepIdx = line.indexOf(':');
    const eqIdx = line.indexOf('=');
    const idx = sepIdx !== -1 && (eqIdx === -1 || sepIdx < eqIdx) ? sepIdx : eqIdx;
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    if (key) map[key] = val;
  }

  const brand = map['machdep.cpu.brand_string'] || null;
  const hwModel = map['hw.model'] || null;
  const physicalCores = toFiniteNum(map['hw.physicalcpu']) ?? toFiniteNum(map['hw.ncpu']);
  const logicalThreads = toFiniteNum(map['hw.logicalcpu']) ?? toFiniteNum(map['hw.ncpu']);
  const memBytes = toFiniteNum(map['hw.memsize']);
  const cpuFreqHz = toFiniteNum(map['hw.cpufrequency']) ?? toFiniteNum(map['hw.cpufrequency_max']);
  const osProductVersion = map['kern.osproductversion'] || null;
  const osVersionBuild = map['kern.osversion'] || null;

  const isAppleSilicon = Boolean(
    (brand && /apple\s+m\d/i.test(brand)) ||
      map['machdep.cpu.brand']?.includes('Apple') ||
      (hwModel && /^mac(bookpro|bookair|mini|studio|\d+)/i.test(hwModel) && !cpuFreqHz)
  );

  return {
    cpuModel: brand,
    hwModel,
    physicalCores,
    logicalThreads,
    memBytes,
    cpuBaseClockGhz: cpuFreqHz && cpuFreqHz > 0 ? Number((cpuFreqHz / 1e9).toFixed(2)) : null,
    osProductVersion,
    osVersionBuild,
    isAppleSilicon,
  };
}

function parseVramMbFromString(raw) {
  if (typeof raw === 'number' && Number.isFinite(raw)) {
    return raw > 0 ? Math.round(raw) : null;
  }
  if (typeof raw !== 'string') return null;
  const gb = raw.match(/([\d.]+)\s*GB/i);
  if (gb) return Math.round(Number(gb[1]) * 1024);
  const mb = raw.match(/([\d.]+)\s*MB/i);
  if (mb) return Math.round(Number(mb[1]));
  return null;
}

function parseRefreshRateFromMacDisplayString(raw) {
  if (typeof raw !== 'string') return null;
  const m = raw.match(/@\s*([\d.]+)\s*Hz/i) || raw.match(/([\d.]+)\s*Hz/i);
  if (!m) return null;
  const hz = Number(m[1]);
  return Number.isFinite(hz) && hz > 0 ? Math.round(hz) : null;
}

function parseResolutionFromMacDisplayString(raw) {
  if (typeof raw !== 'string') return { width: null, height: null };
  const m = raw.match(/(\d{3,5})\s*[x×]\s*(\d{3,5})/i);
  if (!m) return { width: null, height: null };
  const width = Number(m[1]);
  const height = Number(m[2]);
  return {
    width: Number.isFinite(width) ? width : null,
    height: Number.isFinite(height) ? height : null,
  };
}

/**
 * Parses `system_profiler SPDisplaysDataType -json` safely into structured GPU & Display profiles.
 */
function parseMacSystemProfilerDisplaysJson(rawJson, systemTotalMemBytes = null) {
  if (!rawJson) return { gpus: [], displays: [] };
  let parsed = rawJson;
  if (typeof rawJson === 'string') {
    try {
      parsed = JSON.parse(rawJson);
    } catch {
      return { gpus: [], displays: [] };
    }
  }
  const entries = Array.isArray(parsed?.SPDisplaysDataType) ? parsed.SPDisplaysDataType : [];
  const gpus = [];
  const displays = [];

  for (let i = 0; i < entries.length; i++) {
    const item = entries[i] || {};
    const model = item.sppci_model || item._name || null;
    const rawVendor = item.spdisplays_vendor || '';
    const isApple =
      /apple/i.test(String(model || '')) ||
      /apple/i.test(String(rawVendor || '')) ||
      String(item.spdisplays_mtlgpufamilysupport || '').toLowerCase().includes('apple');

    const vendor = isApple
      ? 'Apple'
      : /amd|ati/i.test(rawVendor)
      ? 'AMD'
      : /nvidia/i.test(rawVendor)
      ? 'NVIDIA'
      : /intel/i.test(rawVendor)
      ? 'Intel'
      : rawVendor || null;

    const cores = toFiniteNum(item.sppci_cores);
    const vramStr = item.spdisplays_vram || item.spdisplays_vram_shared || null;
    const parsedVramMb = parseVramMbFromString(vramStr);
    const unifiedVramMb =
      isApple && !parsedVramMb && systemTotalMemBytes
        ? Math.round(systemTotalMemBytes / (1024 * 1024))
        : parsedVramMb;

    gpus.push({
      id: `mac-gpu-${i}`,
      model: model || (isApple ? 'Apple Silicon GPU' : `Mac GPU ${i + 1}`),
      manufacturer: vendor,
      cores,
      metalSupport: item.spdisplays_mtlgpufamilysupport || item.spdisplays_metal || null,
      vramMB: unifiedVramMb,
      isUnifiedMemory: isApple,
      bus: item.sppci_bus || null,
    });

    const ndrvs = Array.isArray(item.spdisplays_ndrvs) ? item.spdisplays_ndrvs : [];
    for (let dIdx = 0; dIdx < ndrvs.length; dIdx++) {
      const disp = ndrvs[dIdx] || {};
      const resStr = disp._spdisplays_pixels || disp.spdisplays_resolution || '';
      const { width, height } = parseResolutionFromMacDisplayString(resStr);
      const refreshRateHz = parseRefreshRateFromMacDisplayString(disp.spdisplays_resolution || '');
      const connRaw = String(disp.spdisplays_connection_type || '');
      const isInternal =
        /internal/i.test(connRaw) ||
        disp.spdisplays_display_type === 'spdisplays_built-in-liquid-retina-xdr' ||
        /built-?in|retina/i.test(String(disp._name || ''));
      displays.push({
        id: `mac-disp-${displays.length}`,
        model: disp._name || (isInternal ? 'Built-in Retina Display' : `External Display ${displays.length + 1}`),
        isPrimary: disp.spdisplays_main === 'spdisplays_yes' || displays.length === 0,
        width,
        height,
        resolutionText: width && height ? `${width} × ${height}` : null,
        refreshRateHz,
        connectionType: isInternal
          ? 'Internal Retina / eDP'
          : connRaw.replace(/^spdisplays_/i, '').replace(/_/g, ' ').trim() || null,
        builtin: isInternal,
      });
    }
  }

  return { gpus, displays };
}

/**
 * Builds structured GpuCapabilitiesProfile features for Apple Silicon / Mac GPUs
 * matching the `GpuTechnologyFeature` interface expected by GpuCapabilitiesPanel.tsx.
 */
function buildAppleGpuProfile({ gpu, metalSupport, gpuCores, osVersion, vramTotalMB }) {
  const model = gpu?.model || 'Apple Silicon GPU';
  const isM3OrNewer = /\bm[3-9]\b/i.test(model);
  const metalLabel = metalSupport || 'Apple Metal 3';
  const ramGb = vramTotalMB ? Math.round(vramTotalMB / 1024) : null;

  const features = [
    {
      id: 'apple-metal',
      name: 'Apple Metal Graphics API',
      vendor: 'Apple',
      status: 'active',
      hardwareSupported: true,
      activeState: true,
      detail: `${metalLabel}${gpuCores ? ` (${gpuCores} GPU cores)` : ''} natively active for macOS WindowServer, 3D rendering, and compute.`,
    },
    {
      id: 'apple-unified-memory',
      name: 'Unified Memory Architecture (UMA)',
      vendor: 'Apple',
      status: 'active',
      hardwareSupported: true,
      activeState: true,
      detail: ramGb
        ? `CPU & GPU share high-bandwidth ${ramGb} GB Unified Memory pool directly without PCIe copy overhead.`
        : 'CPU & GPU share Apple Silicon Unified Memory directly without PCIe copy overhead.',
    },
    {
      id: 'apple-metalfx',
      name: 'MetalFX Spatial & Temporal Upscaling',
      vendor: 'Apple',
      status: 'requires_game_integration',
      hardwareSupported: true,
      activeState: null,
      detail: 'Hardware-accelerated temporal & spatial upscaling supported on Metal 3 titles when enabled in game settings.',
    },
    {
      id: 'apple-hw-raytracing',
      name: 'Hardware Ray Tracing & Mesh Shading',
      vendor: 'Apple',
      status: isM3OrNewer ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: isM3OrNewer,
      activeState: null,
      detail: isM3OrNewer
        ? 'M3/M4+ Dynamic Caching & hardware ray tracing accelerators present; enabled per game.'
        : 'Hardware ray tracing acceleration requires Apple M3 family or newer Silicon.',
    },
  ];

  return {
    gpuId: gpu?.id || 'apple-gpu-0',
    model,
    vendor: 'Apple',
    architecture: gpuCores ? `Apple Silicon (${gpuCores}-Core GPU)` : 'Apple Silicon Unified Memory',
    driverVersion: osVersion ? `macOS ${osVersion}` : 'macOS Native Metal',
    resizableBarActive: null,
    isIntegrated: true,
    features,
  };
}

/**
 * Reads Linux `/sys/class/hwmon` live fans and non-CPU temperatures (motherboard, NVMe, GPU, chipset)
 * for live snapshot `liveSensors`. Read-only; ignores permission errors safely.
 */
async function readLinuxLiveHwmonSensorsAsync() {
  const fans = [];
  const extraTemps = [];
  const seenFanKeys = new Set();
  const seenTempKeys = new Set();

  try {
    const hwmonRoot = '/sys/class/hwmon';
    if (!fs.existsSync(hwmonRoot)) return { fans, extraTemps, source: null };
    const dirs = await fsp.readdir(hwmonRoot);

    for (const dir of dirs) {
      const base = path.join(hwmonRoot, dir);
      let driverName = '';
      try {
        driverName = (await fsp.readFile(path.join(base, 'name'), 'utf8')).trim();
      } catch {
        continue;
      }
      const lowerDriver = driverName.toLowerCase();
      const files = await fsp.readdir(base).catch(() => []);

      for (const file of files) {
        if (/^fan\d+_input$/.test(file)) {
          const prefix = file.replace(/_input$/, '');
          const rpm = toFiniteNum(await fsp.readFile(path.join(base, file), 'utf8').catch(() => null));
          if (rpm === null || rpm < 0 || rpm > 20000) continue;
          const label = (await fsp.readFile(path.join(base, `${prefix}_label`), 'utf8').catch(() => '')).trim();
          const name = label || `${driverName} ${prefix.toUpperCase()}`;
          const key = `${driverName}:${prefix}`.toLowerCase();
          if (seenFanKeys.has(key)) continue;
          seenFanKeys.add(key);
          fans.push({
            id: `linux-fan-${fans.length}`,
            name,
            rpm: Math.round(rpm),
            percent: null,
            source: `Linux hwmon (${driverName})`,
          });
        } else if (/^temp\d+_input$/.test(file)) {
          const prefix = file.replace(/_input$/, '');
          const milli = toFiniteNum(await fsp.readFile(path.join(base, file), 'utf8').catch(() => null));
          if (milli === null) continue;
          const celsius = Number((milli / 1000).toFixed(1));
          if (celsius <= 0 || celsius > 125) continue;
          const label = (await fsp.readFile(path.join(base, `${prefix}_label`), 'utf8').catch(() => '')).trim();
          const lowerLbl = label.toLowerCase();

          // Skip pure CPU core temps here (already surfaced on CPU card) unless it's package/board/drive/gpu
          let category = 'other';
          if (lowerDriver.includes('nvme') || lowerLbl.includes('composite') || lowerLbl.includes('nvme')) {
            category = 'storage';
          } else if (lowerDriver.includes('amdgpu') || lowerDriver.includes('nouveau') || lowerLbl.includes('edge') || lowerLbl.includes('junction')) {
            category = lowerLbl.includes('junction') || lowerLbl.includes('hotspot') ? 'gpu_hotspot' : 'gpu';
          } else if (lowerDriver.includes('pch') || lowerLbl.includes('pch') || lowerLbl.includes('chipset')) {
            category = 'chipset';
          } else if (
            lowerDriver.includes('coretemp') ||
            lowerDriver.includes('k10temp') ||
            lowerDriver.includes('zenpower')
          ) {
            continue;
          } else {
            category = 'motherboard';
          }

          const name = label || `${driverName} ${prefix.toUpperCase()}`;
          const key = `${driverName}:${name}`.toLowerCase();
          if (seenTempKeys.has(key)) continue;
          seenTempKeys.add(key);
          extraTemps.push({
            id: `linux-temp-${extraTemps.length}`,
            name,
            category,
            celsius,
            source: `Linux hwmon (${driverName})`,
          });
        }
      }
    }
  } catch {
    // ignore fs permission failures cleanly
  }

  return {
    fans,
    extraTemps,
    source: fans.length > 0 || extraTemps.length > 0 ? 'Linux sysfs hwmon' : null,
  };
}

/**
 * Inspects Linux RAPL readability including permission_required state cleanly.
 */
async function probeLinuxRaplEnergyAsync() {
  const p = '/sys/class/powercap/intel-rapl/intel-rapl:0/energy_uj';
  try {
    const raw = await fsp.readFile(p, 'utf8');
    const uj = toFiniteNum(raw);
    if (uj !== null && uj >= 0) {
      return { status: 'available', uj, at: Date.now() };
    }
    return { status: 'temporarily_unavailable', uj: null, at: Date.now() };
  } catch (err) {
    if (err && (err.code === 'EACCES' || err.code === 'EPERM')) {
      return { status: 'permission_required', uj: null, at: Date.now() };
    }
    if (err && err.code === 'ENOENT') {
      return { status: 'unsupported', uj: null, at: Date.now() };
    }
    return { status: 'detection_failed', uj: null, at: Date.now() };
  }
}

/**
 * Queries dynamic macOS memory & optional cached system profiler data safely.
 */
async function readMacVmStatAsync(totalMemBytes) {
  const res = await runExecSafe('vm_stat', [], 1800);
  if (!res.ok) return null;
  return parseMacVmStatOutput(res.stdout, totalMemBytes);
}

async function readMacSystemProfilerDisplaysAsync(totalMemBytes) {
  const res = await runExecSafe('system_profiler', ['SPDisplaysDataType', '-json'], 4200);
  if (!res.ok) return { gpus: [], displays: [] };
  return parseMacSystemProfilerDisplaysJson(res.stdout, totalMemBytes);
}

async function readMacSysctlAsync() {
  const keys = [
    'machdep.cpu.brand_string',
    'hw.model',
    'hw.ncpu',
    'hw.physicalcpu',
    'hw.logicalcpu',
    'hw.memsize',
    'hw.cpufrequency',
    'hw.cpufrequency_max',
    'kern.osproductversion',
    'kern.osversion',
  ];
  const res = await runExecSafe('sysctl', keys, 2000);
  if (!res.ok) return {};
  return parseMacSysctlOutput(res.stdout);
}

/**
 * Builds structured availability metadata (`available | unsupported | permission_required | temporarily_unavailable | detection_failed`)
 * for each telemetry subsystem so UI renders honest status states rather than misleading blanks.
 */
function buildMetricAvailability({
  platform,
  cpuUsage,
  cpuTempC,
  cpuPowerWatts,
  linuxRaplStatus,
  gpus,
  liveSensors,
  ramUsagePercent,
  storage,
  network,
  capabilities,
}) {
  const isWin = platform === 'win32';
  const isLinux = platform === 'linux';
  const isMac = platform === 'darwin';

  const hasGpuUtil = Array.isArray(gpus) && gpus.some((g) => toFiniteNum(g?.utilizationPercent) !== null);
  const hasGpuTemp = Array.isArray(gpus) && gpus.some((g) => toFiniteNum(g?.temperatureCelsius) !== null && g.temperatureCelsius > 0);
  const hasFans = Array.isArray(liveSensors?.fans) && liveSensors.fans.length > 0;

  return {
    cpuUsage:
      toFiniteNum(cpuUsage) !== null
        ? { state: 'available', reason: 'OS scheduler counters active' }
        : { state: 'temporarily_unavailable', reason: 'Collecting initial baseline delta' },
    cpuTemp:
      toFiniteNum(cpuTempC) !== null && cpuTempC > 0
        ? { state: 'available', reason: isLinux ? 'Linux hwmon / thermal zone' : isMac ? 'macOS thermal sensor' : 'Windows sensor backend' }
        : isMac
        ? { state: 'permission_required', reason: 'Apple SMC temperature sensors require privileged entitlements or a helper; safely omitted' }
        : isLinux
        ? { state: 'temporarily_unavailable', reason: 'No readable coretemp/k10temp hwmon thermal zone exposed' }
        : { state: 'temporarily_unavailable', reason: 'Install/enable LibreHardwareMonitor or check WMI thermal zone' },
    cpuPower:
      toFiniteNum(cpuPowerWatts) !== null
        ? { state: 'available', reason: isLinux ? 'Linux Intel/AMD RAPL energy counter' : 'Sensor power meter' }
        : isLinux
        ? linuxRaplStatus === 'permission_required'
          ? { state: 'permission_required', reason: 'Linux RAPL powercap energy_uj requires elevated read permissions on this kernel' }
          : { state: 'unsupported', reason: 'RAPL energy counter not exposed by CPU or virtualized environment' }
        : isMac
        ? { state: 'permission_required', reason: 'macOS package power metrics require privileged powermetrics access' }
        : { state: 'temporarily_unavailable', reason: 'Package wattage requires LibreHardwareMonitor / RAPL sensor access' },
    gpuTelemetry:
      hasGpuUtil || hasGpuTemp
        ? { state: 'available', reason: 'Hardware GPU telemetry active' }
        : Array.isArray(gpus) && gpus.length > 0
        ? {
            state: isMac ? 'unsupported' : 'temporarily_unavailable',
            reason: isMac
              ? 'macOS hides real-time GPU load % & die temp from unprivileged user-space APIs'
              : 'GPU adapter identified, but live utilization/temperature counters are not exposed by the active driver',
          }
        : { state: 'detection_failed', reason: 'No graphics adapter telemetry reported by OS' },
    fans:
      hasFans
        ? { state: 'available', reason: liveSensors?.source || 'Fan RPM sensors active' }
        : isMac
        ? { state: 'permission_required', reason: 'Fan RPM telemetry on macOS requires privileged SMC access' }
        : {
            state: 'temporarily_unavailable',
            reason: isLinux ? 'No hwmon fan*_input headers exposed' : 'Motherboard fan headers require LibreHardwareMonitor',
          },
    ram:
      toFiniteNum(ramUsagePercent) !== null
        ? { state: 'available', reason: isMac ? 'macOS vm_stat memory accounting' : 'OS memory accounting' }
        : { state: 'detection_failed', reason: 'Memory telemetry unavailable' },
    storage:
      Array.isArray(storage) && storage.length > 0
        ? { state: 'available', reason: 'Mounted filesystem & disk I/O telemetry active' }
        : { state: 'temporarily_unavailable', reason: 'No mounted storage volumes detected' },
    network:
      network?.activeInterface
        ? { state: 'available', reason: 'Network interface statistics active' }
        : { state: 'temporarily_unavailable', reason: 'No active network interface detected' },
    presentMonFps:
      isWin
        ? { state: 'available', reason: 'Windows ETW PresentMon supported' }
        : { state: 'unsupported', reason: `PresentMon ETW capture is Windows-only and not supported on ${isMac ? 'macOS' : 'Linux'}` },
    windowsGraphics:
      isWin
        ? { state: capabilities?.display?.directXVersion ? 'available' : 'temporarily_unavailable', reason: 'Windows DirectX / WDDM metrics' }
        : { state: 'unsupported', reason: `DirectX, HAGS, and Windows Game Mode do not apply on ${isMac ? 'macOS' : 'Linux'}` },
  };
}

module.exports = {
  METRIC_AVAILABILITY_STATES,
  parseMacVmStatOutput,
  parseMacSysctlOutput,
  parseMacSystemProfilerDisplaysJson,
  buildAppleGpuProfile,
  readLinuxLiveHwmonSensorsAsync,
  probeLinuxRaplEnergyAsync,
  readMacVmStatAsync,
  readMacSystemProfilerDisplaysAsync,
  readMacSysctlAsync,
  buildMetricAvailability,
};

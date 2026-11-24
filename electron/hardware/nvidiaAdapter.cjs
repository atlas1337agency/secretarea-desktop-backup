const { execFile } = require('child_process');
const fs = require('fs');

function runExec(cmd, args, timeoutMs = 2000) {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 }, (err, stdout) => {
      if (err) {
        resolve(null);
        return;
      }
      resolve(typeof stdout === 'string' ? stdout.trim() : '');
    });
  });
}

function classifyNvidiaArchitecture(modelName) {
  const name = String(modelName || '').toLowerCase();
  if (!name) {
    return { family: null, generation: 0, hasTensor: false, hasRtCores: false, isGtxLegacy: false };
  }

  // GeForce RTX 50-series (Blackwell)
  if (/\brtx\s*50\d{2}\b/i.test(name) || /\brtx\s*pro\s*\d+\s*blackwell\b/i.test(name) || /\bblackwell\b/i.test(name)) {
    return { family: 'Blackwell (RTX 50 Series)', generation: 50, hasTensor: true, hasRtCores: true, isGtxLegacy: false };
  }
  // GeForce RTX 40-series (Ada Lovelace)
  if (/\brtx\s*40\d{2}\b/i.test(name) || /\brtx\s*[1-6]000\s*ada\b/i.test(name)) {
    return { family: 'Ada Lovelace (RTX 40 Series)', generation: 40, hasTensor: true, hasRtCores: true, isGtxLegacy: false };
  }
  // GeForce RTX 30-series (Ampere)
  if (/\brtx\s*30\d{2}\b/i.test(name) || /\brtx\s*a\d{3,4}\b/i.test(name)) {
    return { family: 'Ampere (RTX 30 Series)', generation: 30, hasTensor: true, hasRtCores: true, isGtxLegacy: false };
  }
  // GeForce RTX 20-series (Turing with RT + Tensor)
  if (/\brtx\s*20\d{2}\b/i.test(name) || /\bquadro\s*rtx\b/i.test(name) || /\btitan\s*rtx\b/i.test(name)) {
    return { family: 'Turing (RTX 20 Series)', generation: 20, hasTensor: true, hasRtCores: true, isGtxLegacy: false };
  }
  // GeForce GTX 16-series (Turing without RT/Tensor cores)
  if (/\bgtx\s*16\d{2}\b/i.test(name)) {
    return { family: 'Turing (GTX 16 Series)', generation: 16, hasTensor: false, hasRtCores: false, isGtxLegacy: true };
  }
  // GeForce GTX 10-series (Pascal)
  if (/\bgtx\s*10\d{2}\b/i.test(name) || /\bgt\s*10\d{2}\b/i.test(name) || /\btitan\s*x[p]?\b/i.test(name)) {
    return { family: 'Pascal (GTX 10 Series)', generation: 10, hasTensor: false, hasRtCores: false, isGtxLegacy: true };
  }
  // GeForce GTX 900-series (Maxwell)
  if (/\bgtx\s*9\d{2}m?\b/i.test(name)) {
    return { family: 'Maxwell (GTX 900 Series)', generation: 9, hasTensor: false, hasRtCores: false, isGtxLegacy: true };
  }
  // Older GTX 700/600 or MX laptop GPUs
  if (/\bmx\s*[1-5]\d{2}\b/i.test(name) || /\bgtx\s*[678]\d{2}\b/i.test(name)) {
    return { family: 'Legacy GeForce / MX', generation: 7, hasTensor: false, hasRtCores: false, isGtxLegacy: true };
  }
  // Generic RTX workstation/unknown series fallback
  if (name.includes('rtx')) {
    return { family: 'NVIDIA RTX', generation: 20, hasTensor: true, hasRtCores: true, isGtxLegacy: false };
  }

  return { family: 'NVIDIA GeForce', generation: 0, hasTensor: false, hasRtCores: false, isGtxLegacy: true };
}

function parseNvidiaSmiExtendedOutput(text) {
  if (!text || typeof text !== 'string') return null;
  const driverMatch = text.match(/Driver Version\s*:\s*([0-9.]+)/i);
  const pcieMaxMatch = text.match(/PCIe Generation[\s\S]*?Max\s*:\s*(\d+)/i);
  const bar1TotalMatch = text.match(/BAR1 Memory Usage[\s\S]*?Total\s*:\s*(\d+)\s*MiB/i);
  const vramTotalMatch = text.match(/FB Memory Usage[\s\S]*?Total\s*:\s*(\d+)\s*MiB/i);

  const bar1TotalMiB = bar1TotalMatch ? Number(bar1TotalMatch[1]) : null;
  const vramTotalMiB = vramTotalMatch ? Number(vramTotalMatch[1]) : null;

  let resizableBarActive = null;
  if (bar1TotalMiB !== null && Number.isFinite(bar1TotalMiB)) {
    // Default non-ReBAR BAR1 aperture on Windows/Linux is 256 MiB; ReBAR exposes >= 2048 MiB or full VRAM
    resizableBarActive = bar1TotalMiB >= 1024;
  }

  return {
    driverVersion: driverMatch ? driverMatch[1] : null,
    pcieMaxGen: pcieMaxMatch ? Number(pcieMaxMatch[1]) : null,
    bar1TotalMiB,
    vramTotalMiB,
    resizableBarActive,
  };
}

async function queryNvidiaExtendedInfo(nvidiaSmiPath) {
  if (!nvidiaSmiPath) return null;
  if (nvidiaSmiPath.includes('\\') && !fs.existsSync(nvidiaSmiPath)) return null;

  const [csvDriver, smiQuery] = await Promise.all([
    runExec(nvidiaSmiPath, ['--query-gpu=driver_version', '--format=csv,noheader'], 1800),
    runExec(nvidiaSmiPath, ['-q', '-d', 'MEMORY,PCI'], 2200),
  ]);

  const parsed = parseNvidiaSmiExtendedOutput(smiQuery) || {
    driverVersion: null,
    pcieMaxGen: null,
    bar1TotalMiB: null,
    vramTotalMiB: null,
    resizableBarActive: null,
  };

  if (!parsed.driverVersion && csvDriver) {
    const firstLine = csvDriver.split(/\r?\n/)[0]?.trim();
    if (firstLine && /^[0-9.]+$/.test(firstLine)) {
      parsed.driverVersion = firstLine;
    }
  }
  return parsed;
}

function buildNvidiaProfile({ gpu, extendedInfo, displayInfo }) {
  const model = gpu?.model || null;
  const arch = classifyNvidiaArchitecture(model);
  const driverVersion = extendedInfo?.driverVersion || gpu?.driverVersion || null;
  const driverNumeric = driverVersion ? parseFloat(driverVersion) : null;
  const vrrActive = displayInfo?.vrrActive ?? null;
  const vrrSupported = displayInfo?.vrrSupported ?? null;
  const hasDynamicBoostEvidence = typeof gpu?.clockSpeedMhz === 'number' && gpu.clockSpeedMhz > 0;

  // Never falsely claim DLSS/Reflex/etc. is globally active when only hardware compatibility is verified.
  const features = [
    {
      id: 'nvidia-dlss-sr',
      name: 'DLSS Super Resolution',
      vendor: 'NVIDIA',
      status: arch.hasTensor ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.hasTensor,
      activeState: null,
      detail: arch.hasTensor
        ? 'Tensor Cores detected. Requires per-game DLSS integration.'
        : 'Requires NVIDIA RTX series (Tensor Cores).',
    },
    {
      id: 'nvidia-dlss-fg',
      name: 'DLSS Frame Generation',
      vendor: 'NVIDIA',
      status: arch.generation >= 40 ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.generation >= 40,
      activeState: null,
      detail:
        arch.generation >= 40
          ? 'Optical Flow / Ada+ architecture detected. Requires per-game DLSS 3+ support.'
          : 'Requires GeForce RTX 40 Series or newer.',
    },
    {
      id: 'nvidia-dlss-mfg',
      name: 'DLSS Multi Frame Generation',
      vendor: 'NVIDIA',
      status: arch.generation >= 50 ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.generation >= 50,
      activeState: null,
      detail:
        arch.generation >= 50
          ? 'Blackwell architecture detected. Requires supported game & DLSS 4+ integration.'
          : 'Requires GeForce RTX 50 Series (Blackwell).',
    },
    {
      id: 'nvidia-dlss-rr',
      name: 'DLSS Ray Reconstruction',
      vendor: 'NVIDIA',
      status: arch.hasTensor
        ? driverNumeric !== null && driverNumeric < 537.13
          ? 'requires_driver_or_sdk'
          : 'requires_game_integration'
        : 'unsupported',
      hardwareSupported: arch.hasTensor,
      activeState: null,
      detail: arch.hasTensor
        ? driverNumeric !== null && driverNumeric < 537.13
          ? 'Update NVIDIA driver to 537.13+ for Ray Reconstruction.'
          : 'Hardware compatible on RTX GPUs. Requires game support.'
        : 'Requires NVIDIA RTX series (Tensor Cores).',
    },
    {
      id: 'nvidia-dlss-5',
      name: 'DLSS 5 / 3D-Guided Neural Rendering',
      vendor: 'NVIDIA',
      status:
        arch.generation >= 50
          ? 'requires_game_integration'
          : arch.hasTensor
          ? 'requires_driver_or_sdk'
          : 'unsupported',
      hardwareSupported: arch.generation >= 40,
      activeState: null,
      detail:
        arch.generation >= 50
          ? 'Neural rendering capable hardware detected. Requires compatible driver & game SDK.'
          : arch.hasTensor
          ? 'Full neural shader pipeline requires newer RTX architecture, driver, and game SDK.'
          : 'Requires NVIDIA RTX neural rendering hardware.',
    },
    {
      id: 'nvidia-reflex',
      name: 'NVIDIA Reflex',
      vendor: 'NVIDIA',
      status: arch.generation >= 9 ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.generation >= 9,
      activeState: null,
      detail:
        arch.generation >= 9
          ? 'Supported on GTX 900 / RTX series. Active latency telemetry requires Reflex-enabled game.'
          : 'Requires NVIDIA GTX 900 Series or newer.',
    },
    {
      id: 'nvidia-low-latency',
      name: 'NVIDIA Low Latency Mode',
      vendor: 'NVIDIA',
      status: arch.generation >= 9 ? (driverVersion ? 'supported' : 'requires_driver_or_sdk') : 'unsupported',
      hardwareSupported: arch.generation >= 9,
      activeState: null,
      detail:
        arch.generation >= 9
          ? 'Driver-level queue depth optimization configurable in NVIDIA Control Panel.'
          : 'Requires compatible NVIDIA GeForce driver.',
    },
    {
      id: 'nvidia-gsync',
      name: 'G-SYNC / Adaptive Sync',
      vendor: 'NVIDIA',
      status:
        vrrActive === true
          ? 'active'
          : vrrSupported === true
          ? 'supported'
          : displayInfo?.monitors?.length > 0
          ? 'unavailable'
          : 'unavailable',
      hardwareSupported: arch.generation >= 9,
      activeState: vrrActive,
      detail:
        vrrActive === true
          ? 'Variable Refresh Rate (VRR) active on connected display.'
          : vrrSupported === true
          ? 'VRR-capable display detected. Enable G-SYNC in NVIDIA Control Panel if desired.'
          : 'Monitor G-SYNC panel module status cannot be verified without NVAPI display query.',
    },
    {
      id: 'nvidia-rtx-rt',
      name: 'RTX Ray Tracing',
      vendor: 'NVIDIA',
      status: arch.hasRtCores ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.hasRtCores,
      activeState: null,
      detail: arch.hasRtCores
        ? 'Dedicated RT Cores present. Activated per-game.'
        : 'No dedicated hardware RT Cores (GTX series).',
    },
    {
      id: 'nvidia-path-tracing',
      name: 'Path Tracing (Full RT)',
      vendor: 'NVIDIA',
      status:
        arch.generation >= 40
          ? 'requires_game_integration'
          : arch.hasRtCores
          ? 'requires_game_integration'
          : 'unsupported',
      hardwareSupported: arch.hasRtCores,
      activeState: null,
      detail:
        arch.generation >= 40
          ? 'Hardware RT + Frame Gen ready for Path Tracing titles.'
          : arch.hasRtCores
          ? 'Hardware RT supported; heavy Path Tracing strongly recommends RTX 40/50 + DLSS.'
          : 'Requires dedicated NVIDIA RTX hardware.',
    },
    {
      id: 'nvidia-rebar',
      name: 'Resizable BAR',
      vendor: 'NVIDIA',
      status:
        arch.generation < 30
          ? 'unsupported'
          : extendedInfo?.resizableBarActive === true
          ? 'active'
          : extendedInfo?.resizableBarActive === false
          ? 'supported'
          : 'unavailable',
      hardwareSupported: arch.generation >= 30,
      activeState: extendedInfo?.resizableBarActive ?? null,
      detail:
        arch.generation < 30
          ? 'Officially supported on RTX 30 Series and newer.'
          : extendedInfo?.resizableBarActive === true
          ? `Enabled (BAR1 aperture: ${extendedInfo.bar1TotalMiB} MiB).`
          : extendedInfo?.resizableBarActive === false
          ? `Supported by RTX ${arch.generation}xx; currently disabled in BIOS/UEFI (${extendedInfo.bar1TotalMiB} MiB BAR1).`
          : 'Unable to verify BAR1 aperture size without nvidia-smi PCI details.',
    },
    {
      id: 'nvidia-gpu-boost',
      name: 'NVIDIA GPU Boost',
      vendor: 'NVIDIA',
      status: hasDynamicBoostEvidence ? 'active' : arch.generation > 0 ? 'supported' : 'unavailable',
      hardwareSupported: arch.generation > 0,
      activeState: hasDynamicBoostEvidence ? true : null,
      detail: hasDynamicBoostEvidence
        ? `Dynamic clock scaling active (${gpu.clockSpeedMhz} MHz reported).`
        : 'Automatic thermal/power clock boosting when NVIDIA driver telemetry is active.',
    },
  ];

  return {
    gpuId: gpu?.id || 'nvidia',
    model,
    vendor: 'NVIDIA',
    architecture: arch.family,
    driverVersion,
    resizableBarActive: extendedInfo?.resizableBarActive ?? null,
    isIntegrated: false,
    features,
  };
}

module.exports = {
  classifyNvidiaArchitecture,
  parseNvidiaSmiExtendedOutput,
  queryNvidiaExtendedInfo,
  buildNvidiaProfile,
};

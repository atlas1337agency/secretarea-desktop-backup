function classifyAmdArchitecture(modelName) {
  const name = String(modelName || '').toLowerCase();
  if (!name) {
    return { family: null, rdnaGen: 0, isIntegrated: false };
  }

  // RDNA 4 — RX 9000 series (e.g., RX 9070 XT, RX 9070, RX 9060)
  if (/\brx\s*90\d{2}\b/i.test(name) || /\bradeon\s*ai\s*pro\b/i.test(name)) {
    return { family: 'RDNA 4 (RX 9000 Series)', rdnaGen: 4, isIntegrated: false };
  }
  // RDNA 3.5 integrated (Radeon 890M, 880M, 860M, 840M, 8060S, 8050S)
  if (/\b8[89]0m\b/i.test(name) || /\b860m\b/i.test(name) || /\b80[56]0s\b/i.test(name)) {
    return { family: 'RDNA 3.5 (Integrated Ryzen AI)', rdnaGen: 3.5, isIntegrated: true };
  }
  // RDNA 3 — RX 7000 discrete + 780M/760M/740M iGPU
  if (/\brx\s*7\d{3}\b/i.test(name) || /\bpro\s*w7\d{3}\b/i.test(name)) {
    return { family: 'RDNA 3 (RX 7000 Series)', rdnaGen: 3, isIntegrated: false };
  }
  if (/\b7[468]0m\b/i.test(name) || /\bz1\s*extreme\b/i.test(name)) {
    return { family: 'RDNA 3 (Integrated)', rdnaGen: 3, isIntegrated: true };
  }
  // RDNA 2 — RX 6000 discrete + 680M/660M/Radeon Graphics 6000/7000 iGPU
  if (/\brx\s*6\d{3}\b/i.test(name) || /\bpro\s*w6\d{3}\b/i.test(name)) {
    return { family: 'RDNA 2 (RX 6000 Series)', rdnaGen: 2, isIntegrated: false };
  }
  if (/\b6[68]0m\b/i.test(name) || /\b610m\b/i.test(name) || /\bradeon\s*tm\s*graphics\b/i.test(name)) {
    return { family: 'RDNA 2 (Integrated)', rdnaGen: 2, isIntegrated: true };
  }
  // RDNA 1 — RX 5000 series
  if (/\brx\s*5\d{3}\b/i.test(name) || /\bpro\s*w5\d{3}\b/i.test(name)) {
    return { family: 'RDNA 1 (RX 5000 Series)', rdnaGen: 1, isIntegrated: false };
  }
  // Vega discrete / integrated APU
  if (/\bvega\b/i.test(name) || /\bradeon\s*vii\b/i.test(name)) {
    return { family: 'Vega', rdnaGen: 0.5, isIntegrated: !/\b(56|64|vii)\b/i.test(name) };
  }
  // Polaris RX 400 / 500
  if (/\brx\s*[45]\d{2}\b/i.test(name)) {
    return { family: 'Polaris (GCN 4)', rdnaGen: 0, isIntegrated: false };
  }
  // Generic "AMD Radeon(TM) Graphics" integrated APU label
  if (name.includes('radeon') && name.includes('graphics') && !/\brx\b/i.test(name)) {
    return { family: 'AMD Radeon Integrated Graphics', rdnaGen: 1, isIntegrated: true };
  }

  return { family: 'AMD Radeon', rdnaGen: 0, isIntegrated: false };
}

function buildAmdProfile({ gpu, displayInfo, driverVersion }) {
  const model = gpu?.model || null;
  const arch = classifyAmdArchitecture(model);
  const vrrActive = displayInfo?.vrrActive ?? null;
  const vrrSupported = displayInfo?.vrrSupported ?? null;
  const hasRdna4 = arch.rdnaGen >= 4;
  const hasRdna3Plus = arch.rdnaGen >= 3;
  const hasRdna2Plus = arch.rdnaGen >= 2;
  const hasRdna1Plus = arch.rdnaGen >= 1;
  const effectiveDriver = driverVersion || gpu?.driverVersion || null;

  const features = [
    {
      id: 'amd-fsr-upscaling',
      name: 'AMD FSR Upscaling (FSR 3 / FSR 4.1)',
      vendor: 'AMD',
      status: 'requires_game_integration',
      hardwareSupported: true,
      activeState: null,
      detail: hasRdna4
        ? 'RDNA 4 ML-accelerated FSR 4 / 4.1 supported. Shader-based FSR 2/3 also supported; requires game integration.'
        : 'Shader-based FSR 1/2/3 supported across Radeon GPUs. ML-based FSR 4.1 requires RDNA 4 (RX 9000 Series).',
    },
    {
      id: 'amd-fsr-fg',
      name: 'AMD FSR Frame Generation',
      vendor: 'AMD',
      status: arch.rdnaGen >= 0 ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.rdnaGen >= 0,
      activeState: null,
      detail: 'Asynchronous compute Frame Generation requires supported game or AFMF driver profile.',
    },
    {
      id: 'amd-fsr-ray-regen',
      name: 'AMD FSR Ray Regeneration',
      vendor: 'AMD',
      status: hasRdna4 ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: hasRdna4,
      activeState: null,
      detail: hasRdna4
        ? 'ML Ray Regeneration hardware supported on RDNA 4. Requires FSR 4+ game support.'
        : 'ML Ray Regeneration requires AMD RDNA 4 architecture (RX 9000 Series).',
    },
    {
      id: 'amd-fsr-radiance-caching',
      name: 'AMD FSR Radiance Caching',
      vendor: 'AMD',
      status: hasRdna4 ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: hasRdna4,
      activeState: null,
      detail: hasRdna4
        ? 'Neural Radiance Caching ready on RDNA 4. Requires game SDK integration.'
        : 'Requires AMD RDNA 4 neural compute architecture.',
    },
    {
      id: 'amd-anti-lag-2',
      name: 'AMD Anti-Lag 2',
      vendor: 'AMD',
      status: hasRdna1Plus ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: hasRdna1Plus,
      activeState: null,
      detail: hasRdna1Plus
        ? 'RDNA 1+ architecture compatible. Requires Anti-Lag 2 SDK integration inside the game.'
        : 'Anti-Lag 2 requires AMD RDNA architecture (RX 5000 / Radeon RDNA iGPU or newer).',
    },
    {
      id: 'amd-radeon-boost',
      name: 'AMD Radeon Boost',
      vendor: 'AMD',
      status: arch.rdnaGen >= 0.5 ? (effectiveDriver ? 'supported' : 'requires_driver_or_sdk') : 'unsupported',
      hardwareSupported: arch.rdnaGen >= 0.5,
      activeState: null,
      detail:
        arch.rdnaGen >= 0.5
          ? 'Dynamic resolution scaling supported via AMD Software: Adrenalin Edition in supported DX11/DX12 titles.'
          : 'Requires Vega / RDNA or newer Radeon architecture.',
    },
    {
      id: 'amd-rsr',
      name: 'AMD Radeon Super Resolution (RSR)',
      vendor: 'AMD',
      status: hasRdna1Plus ? (effectiveDriver ? 'supported' : 'requires_driver_or_sdk') : 'unsupported',
      hardwareSupported: hasRdna1Plus,
      activeState: null,
      detail: hasRdna1Plus
        ? 'Driver-level spatial upscaling supported on RX 5000 / RDNA+ via AMD Adrenalin.'
        : 'Requires AMD RDNA 1 (RX 5000) or newer.',
    },
    {
      id: 'amd-freesync',
      name: 'AMD FreeSync',
      vendor: 'AMD',
      status: vrrActive === true ? 'active' : vrrSupported === true ? 'supported' : 'unavailable',
      hardwareSupported: true,
      activeState: vrrActive,
      detail:
        vrrActive === true
          ? 'Adaptive Sync / VRR active on connected display.'
          : vrrSupported === true
          ? 'VRR display detected. Configure FreeSync in AMD Adrenalin & monitor OSD.'
          : 'Display FreeSync capability requires Windows DXGI / EDID VRR exposure.',
    },
    {
      id: 'amd-sam',
      name: 'AMD Smart Access Memory (SAM)',
      vendor: 'AMD',
      status: hasRdna1Plus ? 'supported' : 'unsupported',
      hardwareSupported: hasRdna1Plus,
      activeState: null,
      detail: hasRdna1Plus
        ? 'RDNA+ supports Resizable BAR / SAM when enabled in motherboard BIOS (Above 4G Decoding + ReBAR).'
        : 'Requires AMD RDNA (RX 5000+) GPU and compatible CPU/motherboard.',
    },
    {
      id: 'amd-hypr-rx',
      name: 'AMD HYPR-RX',
      vendor: 'AMD',
      status: hasRdna3Plus ? (effectiveDriver ? 'supported' : 'requires_driver_or_sdk') : 'unsupported',
      hardwareSupported: hasRdna3Plus,
      activeState: null,
      detail: hasRdna3Plus
        ? 'One-click Adrenalin tuning stack (Anti-Lag + Boost + RSR + AFMF) supported on RDNA 3+.'
        : 'Full HYPR-RX stack requires AMD RDNA 3 (RX 7000 / Radeon 780M+) or newer.',
    },
    {
      id: 'amd-ray-tracing',
      name: 'Hardware Ray Tracing',
      vendor: 'AMD',
      status: hasRdna2Plus ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: hasRdna2Plus,
      activeState: null,
      detail: hasRdna2Plus
        ? 'Ray Accelerators present (RDNA 2+). Active per-game when Ray Tracing is enabled.'
        : 'Requires AMD RDNA 2 (RX 6000) or newer for hardware Ray Accelerators.',
    },
  ];

  return {
    gpuId: gpu?.id || 'amd',
    model,
    vendor: 'AMD',
    architecture: arch.family,
    driverVersion: effectiveDriver,
    resizableBarActive: null,
    isIntegrated: arch.isIntegrated,
    features,
  };
}

module.exports = {
  classifyAmdArchitecture,
  buildAmdProfile,
};

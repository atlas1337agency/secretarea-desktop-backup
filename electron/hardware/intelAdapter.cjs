function classifyIntelArchitecture(modelName) {
  const name = String(modelName || '').toLowerCase();
  if (!name) {
    return { family: null, tier: 'unknown', isIntegrated: true, hasXmx: false, hasDp4a: false, supportsFrameGen: false, supportsMultiFrameGen: false };
  }

  // Intel Arc Battlemage B-series discrete (B580, B570)
  if (/\barc\b.*\bb\d{3}\b/i.test(name) || /\bbattlemage\b/i.test(name)) {
    return {
      family: 'Intel Arc Battlemage (Xe2 Discrete)',
      tier: 'arc_battlemage',
      isIntegrated: false,
      hasXmx: true,
      hasDp4a: true,
      supportsFrameGen: true,
      supportsMultiFrameGen: true,
    };
  }
  // Intel Arc Alchemist discrete (A770, A750, A580, A380, A310, A730M, Pro A-series)
  if (/\barc\b.*\ba\d{3,4}[ms]?\b/i.test(name) || /\balchemist\b/i.test(name)) {
    return {
      family: 'Intel Arc Alchemist (Xe-HPG Discrete)',
      tier: 'arc_alchemist',
      isIntegrated: false,
      hasXmx: true,
      hasDp4a: true,
      supportsFrameGen: true,
      supportsMultiFrameGen: false,
    };
  }
  // Intel Core Ultra Arc iGPU (Arc 140V, 130V, 140T, "Intel(R) Arc(TM) Graphics")
  if (/\barc\b/i.test(name)) {
    const isXe2Igpu = /\b1[34]0v\b/i.test(name) || /\blunar lake\b/i.test(name);
    return {
      family: isXe2Igpu ? 'Intel Arc Xe2 Integrated' : 'Intel Arc Xe-LPG Integrated',
      tier: isXe2Igpu ? 'arc_igpu_xe2' : 'arc_igpu',
      isIntegrated: true,
      hasXmx: isXe2Igpu,
      hasDp4a: true,
      supportsFrameGen: true,
      supportsMultiFrameGen: isXe2Igpu,
    };
  }
  // Intel Iris Xe Graphics (11th-13th Gen iGPU)
  if (/\biris\b.*\bxe\b/i.test(name)) {
    return {
      family: 'Intel Iris Xe (Xe-LP Integrated)',
      tier: 'iris_xe',
      isIntegrated: true,
      hasXmx: false,
      hasDp4a: true,
      supportsFrameGen: false,
      supportsMultiFrameGen: false,
    };
  }
  // Intel UHD Graphics 7xx (Rocket/Alder/Raptor Lake — DP4a supported) vs 6xx (Gen9 — no DP4a hardware fast-path)
  if (/\buhd\b.*\b7\d{2}\b/i.test(name) || /\buhd graphics\b/i.test(name)) {
    const isModern7xx = /\b7\d{2}\b/i.test(name) || /\b1[234]\d{2}\b/i.test(name);
    return {
      family: isModern7xx ? 'Intel UHD Xe-LP (Integrated)' : 'Intel UHD Graphics (Integrated)',
      tier: isModern7xx ? 'uhd_xe' : 'uhd_legacy',
      isIntegrated: true,
      hasXmx: false,
      hasDp4a: isModern7xx,
      supportsFrameGen: false,
      supportsMultiFrameGen: false,
    };
  }

  return {
    family: 'Intel Integrated Graphics',
    tier: 'uhd_legacy',
    isIntegrated: true,
    hasXmx: false,
    hasDp4a: false,
    supportsFrameGen: false,
    supportsMultiFrameGen: false,
  };
}

function buildIntelProfile({ gpu, driverVersion }) {
  const model = gpu?.model || null;
  const arch = classifyIntelArchitecture(model);
  const effectiveDriver = driverVersion || gpu?.driverVersion || null;

  const features = [
    {
      id: 'intel-xess-sr',
      name: 'Intel XeSS Super Resolution',
      vendor: 'Intel',
      status: arch.hasXmx || arch.hasDp4a ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.hasXmx || arch.hasDp4a,
      activeState: null,
      detail: arch.hasXmx
        ? 'XMX AI Matrix Engines detected for highest-quality XeSS path. Requires game support.'
        : arch.hasDp4a
        ? 'DP4a shader compute path supported (XeSS-DP4a). Requires per-game XeSS support.'
        : 'Legacy Intel HD/UHD architecture lacks XMX and DP4a acceleration.',
    },
    {
      id: 'intel-xess-fg',
      name: 'Intel XeSS Frame Generation (XeSS 2)',
      vendor: 'Intel',
      status: arch.supportsFrameGen ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.supportsFrameGen,
      activeState: null,
      detail: arch.supportsFrameGen
        ? 'Arc hardware Optical Flow / XeSS-FG capable. Requires XeSS 2 game integration.'
        : 'XeSS Frame Generation requires Intel Arc discrete or Core Ultra Arc Graphics.',
    },
    {
      id: 'intel-xess-mfg',
      name: 'Intel XeSS Multi-Frame Generation',
      vendor: 'Intel',
      status: arch.supportsMultiFrameGen ? 'requires_driver_or_sdk' : 'unsupported',
      hardwareSupported: arch.supportsMultiFrameGen,
      activeState: null,
      detail: arch.supportsMultiFrameGen
        ? 'Xe2 XMX hardware ready; requires Intel graphics driver + XeSS Multi-Frame SDK in game.'
        : 'Requires Intel Xe2 / Arc Battlemage architecture with driver & game SDK support.',
    },
    {
      id: 'intel-xell',
      name: 'Intel Xe Low Latency (XeLL)',
      vendor: 'Intel',
      status: arch.supportsFrameGen ? 'requires_game_integration' : 'unsupported',
      hardwareSupported: arch.supportsFrameGen,
      activeState: null,
      detail: arch.supportsFrameGen
        ? 'Arc / XeSS 2 latency reduction supported when integrated in game.'
        : 'Requires Intel Arc discrete or Core Ultra Arc Graphics.',
    },
    {
      id: 'intel-arc-rt',
      name: 'Intel Hardware Ray Tracing (RTUs)',
      vendor: 'Intel',
      status: arch.tier === 'arc_alchemist' || arch.tier === 'arc_battlemage' || arch.tier === 'arc_igpu' || arch.tier === 'arc_igpu_xe2'
        ? 'requires_game_integration'
        : 'unsupported',
      hardwareSupported: arch.tier.startsWith('arc'),
      activeState: null,
      detail: arch.tier.startsWith('arc')
        ? 'Dedicated Ray Tracing Units (RTUs) present on Intel Arc GPU. Enabled per-game.'
        : 'Iris Xe / legacy UHD integrated graphics lack dedicated Ray Tracing Units.',
    },
    {
      id: 'intel-gpu-role',
      name: arch.isIntegrated ? 'Integrated Graphics Adapter' : 'Discrete Intel Arc GPU',
      vendor: 'Intel',
      status: 'detected',
      hardwareSupported: true,
      activeState: true,
      detail: arch.isIntegrated
        ? 'Shares system memory (UMA) with CPU; great for light/esports gaming or hybrid display output.'
        : 'Dedicated discrete Intel Arc PCIe GPU with dedicated VRAM and XMX engines.',
    },
  ];

  return {
    gpuId: gpu?.id || 'intel',
    model,
    vendor: 'Intel',
    architecture: arch.family,
    driverVersion: effectiveDriver,
    resizableBarActive: null,
    isIntegrated: arch.isIntegrated,
    features,
  };
}

module.exports = {
  classifyIntelArchitecture,
  buildIntelProfile,
};

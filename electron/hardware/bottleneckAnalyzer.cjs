/**
 * Multi-sample bottleneck analyzer for Gaming Performance Center.
 * Never diagnoses a bottleneck from a single utilization sample;
 * evaluates sustained trends across rolling telemetry samples.
 */

function avg(arr) {
  const valid = arr.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

function max(arr) {
  const valid = arr.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (valid.length === 0) return null;
  return Math.max(...valid);
}

/**
 * @param {Array<{
 *   cpuPercent: number | null,
 *   coreLoads: number[],
 *   gpuPercent: number | null,
 *   vramUsedMB: number | null,
 *   vramTotalMB: number | null,
 *   ramPercent: number | null,
 *   cpuTempC: number | null,
 *   gpuTempC: number | null,
 *   cpuClockGhz: number | null,
 *   gpuClockMhz: number | null,
 *   storageReadBytesPerSec: number | null,
 *   storageWriteBytesPerSec: number | null,
 *   frameTimeMs?: number | null,
 *   stutterEvents?: number
 * }>} samples
 * @param {number} minSamples
 */
function analyzeBottlenecks(samples, minSamples = 5) {
  const validSamples = Array.isArray(samples) ? samples : [];
  if (validSamples.length < minSamples) {
    return {
      ready: false,
      sampleCount: validSamples.length,
      requiredSamples: minSamples,
      thermalThrottlingDetected: false,
      findings: [],
    };
  }

  const windowSamples = validSamples.slice(-20);
  const avgCpu = avg(windowSamples.map((s) => s.cpuPercent));
  const avgGpu = avg(windowSamples.map((s) => s.gpuPercent));
  const avgRam = avg(windowSamples.map((s) => s.ramPercent));
  const maxCpuTemp = max(windowSamples.map((s) => s.cpuTempC));
  const avgCpuTemp = avg(windowSamples.map((s) => s.cpuTempC));
  const maxGpuTemp = max(windowSamples.map((s) => s.gpuTempC));
  const avgGpuTemp = avg(windowSamples.map((s) => s.gpuTempC));

  const vramPctList = windowSamples
    .map((s) =>
      typeof s.vramUsedMB === 'number' && typeof s.vramTotalMB === 'number' && s.vramTotalMB > 0
        ? (s.vramUsedMB / s.vramTotalMB) * 100
        : null
    );
  const avgVramPct = avg(vramPctList);

  // Detect single/few-thread CPU saturation even if total multi-core % looks moderate
  const hotThreadCounts = windowSamples.map((s) =>
    Array.isArray(s.coreLoads) ? s.coreLoads.filter((c) => typeof c === 'number' && c >= 92).length : 0
  );
  const avgHotThreads = avg(hotThreadCounts) || 0;

  // Detect clock drop under sustained thermal load
  let clockThrottleEvidence = false;
  if (windowSamples.length >= 6) {
    const earlyClock = avg(windowSamples.slice(0, 3).map((s) => s.cpuClockGhz));
    const lateClock = avg(windowSamples.slice(-3).map((s) => s.cpuClockGhz));
    if (earlyClock && lateClock && earlyClock > 1.5 && lateClock < earlyClock * 0.78 && avgCpuTemp !== null && avgCpuTemp >= 85) {
      clockThrottleEvidence = true;
    }
  }

  const findings = [];

  // 1. Thermal Throttling Check
  const cpuThermalHigh = (avgCpuTemp !== null && avgCpuTemp >= 90) || (maxCpuTemp !== null && maxCpuTemp >= 95);
  const gpuThermalHigh = (avgGpuTemp !== null && avgGpuTemp >= 86) || (maxGpuTemp !== null && maxGpuTemp >= 90);
  const thermalThrottlingDetected = Boolean(cpuThermalHigh || gpuThermalHigh || clockThrottleEvidence);

  if (thermalThrottlingDetected) {
    findings.push({
      id: 'thermal_throttling',
      severity: 'critical',
      confidence: clockThrottleEvidence || cpuThermalHigh || gpuThermalHigh ? 'high' : 'medium',
      title: 'Thermal Throttling Risk',
      cause: `Sustained high temperatures (${avgCpuTemp !== null ? `CPU ${avgCpuTemp.toFixed(0)}°C` : 'CPU N/A'}, ${avgGpuTemp !== null ? `GPU ${avgGpuTemp.toFixed(0)}°C` : 'GPU N/A'}) can force clock-speed reductions.`,
      recommendations: [
        'Clean dust from cooling fans, heatsink fins, and intake filters.',
        'Ensure laptop vents are unobstructed on a hard surface or cooling pad.',
        'Adjust fan curve in motherboard/laptop control software.',
      ],
    });
  }

  // 2. CPU Bottleneck (requires BOTH CPU load/thread pressure AND non-saturated GPU sensor)
  if (avgGpu !== null && avgCpu !== null) {
    const cpuSaturated = avgCpu >= 84 || avgHotThreads >= 2;
    const gpuUnderutilized = avgGpu <= 78;
    if (cpuSaturated && gpuUnderutilized) {
      findings.push({
        id: 'cpu_bottleneck',
        severity: avgGpu <= 62 ? 'critical' : 'warning',
        confidence: 'high',
        title: 'CPU Bottleneck Detected',
        cause: `Sustained CPU demand (${avgCpu.toFixed(1)}% avg${avgHotThreads >= 2 ? `, ${avgHotThreads.toFixed(0)} threads >92%` : ''}) while GPU stays underutilized at ${avgGpu.toFixed(1)}%.`,
        recommendations: [
          'Close background browsers, launchers, or recording apps using CPU cycles.',
          'Lower CPU-heavy settings (crowd density, physics, draw distance, ray-tracing BVH).',
          'Slightly raising resolution or DLSS Quality shifts load balance back toward GPU.',
        ],
      });
    } else if (avgGpu >= 94 && avgCpu < 80) {
      findings.push({
        id: 'gpu_bottleneck',
        severity: 'info',
        confidence: 'high',
        title: 'GPU-Bound (Normal Gaming Load)',
        cause: `GPU is operating at ${avgGpu.toFixed(1)}% average utilization while CPU has headroom (${avgCpu.toFixed(1)}%).`,
        recommendations: [
          'If higher FPS is desired, enable DLSS, FSR, or XeSS upscaling or lower shadows/volumetrics.',
          'High GPU utilization without overheating is generally ideal for gaming.',
        ],
      });
    }
  }

  // 3. Insufficient VRAM
  if (avgVramPct !== null && avgVramPct >= 90) {
    findings.push({
      id: 'vram_limit',
      severity: avgVramPct >= 96 ? 'critical' : 'warning',
      confidence: 'high',
      title: 'VRAM Capacity Near Limit',
      cause: `Dedicated VRAM allocation averaged ${avgVramPct.toFixed(1)}% across the sample window, risking texture swaps over PCIe and frame stutters.`,
      recommendations: [
        'Reduce Texture Quality or Shadow Cache size one step in game settings.',
        'Disable hardware-accelerated browser tabs or overlays consuming VRAM in the background.',
      ],
    });
  }

  // 4. High RAM Usage
  if (avgRam !== null && avgRam >= 86) {
    findings.push({
      id: 'ram_limit',
      severity: avgRam >= 93 ? 'critical' : 'warning',
      confidence: 'high',
      title: 'High System RAM Pressure',
      cause: `System memory usage averaged ${avgRam.toFixed(1)}%, increasing risk of Windows pagefile swapping and hitching.`,
      recommendations: [
        'Close heavy background applications (browsers with many tabs, editors, VMs) before launching games.',
      ],
    });
  }

  // 5. High Frame-Time Spikes / Stuttering (real PresentMon telemetry)
  const totalStutters = windowSamples.reduce((acc, s) => acc + (Number(s.stutterEvents) || 0), 0);
  const avgFt = avg(windowSamples.map((s) => s.frameTimeMs));
  if (totalStutters >= 3) {
    findings.push({
      id: 'frame_time_spikes',
      severity: totalStutters >= 8 ? 'critical' : 'warning',
      confidence: 'high',
      title: 'Frame-Time Spikes & Stuttering Detected',
      cause: `${totalStutters} significant frame-time spikes detected across the monitoring window${avgFt ? ` (avg frame time ${avgFt.toFixed(1)} ms)` : ''}.`,
      recommendations: [
        'Allow initial DirectX/Vulkan shader compilation to finish in-game.',
        'Cap FPS slightly below monitor max refresh rate or enable VRR + Reflex / Anti-Lag 2.',
      ],
    });
  }

  // 6. Storage I/O Bottleneck
  const avgDiskActivity = avg(
    windowSamples.map((s) =>
      typeof s.storageReadBytesPerSec === 'number' || typeof s.storageWriteBytesPerSec === 'number'
        ? (s.storageReadBytesPerSec || 0) + (s.storageWriteBytesPerSec || 0)
        : null
    )
  );
  if (avgDiskActivity !== null && avgDiskActivity >= 150 * 1024 * 1024 && (totalStutters >= 2 || (avgRam !== null && avgRam >= 82))) {
    findings.push({
      id: 'storage_io_bottleneck',
      severity: 'warning',
      confidence: 'medium',
      title: 'Heavy Storage I/O During Session',
      cause: `Sustained disk throughput (${(avgDiskActivity / (1024 * 1024)).toFixed(0)} MB/s avg) coinciding with stutters or memory pressure.`,
      recommendations: [
        'Pause background game downloads or OS updates while playing.',
        'Install modern streaming-heavy games on an NVMe/SSD rather than a mechanical HDD.',
      ],
    });
  }

  if (findings.length === 0) {
    findings.push({
      id: 'balanced',
      severity: 'info',
      confidence: 'high',
      title: 'Balanced Performance Window',
      cause: 'No sustained CPU, memory, VRAM, storage, thermal, or frame-pacing bottlenecks detected across recent samples.',
      recommendations: [],
    });
  }

  return {
    ready: true,
    sampleCount: validSamples.length,
    requiredSamples: minSamples,
    thermalThrottlingDetected,
    findings,
  };
}

module.exports = {
  analyzeBottlenecks,
};

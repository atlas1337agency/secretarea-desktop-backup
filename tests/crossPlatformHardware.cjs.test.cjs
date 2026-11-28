const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {
  METRIC_AVAILABILITY_STATES,
  parseMacVmStatOutput,
  parseMacSysctlOutput,
  parseMacSystemProfilerDisplaysJson,
  buildAppleGpuProfile,
  probeLinuxRaplEnergyAsync,
  readLinuxLiveHwmonSensorsAsync,
  buildMetricAvailability,
} = require('../electron/hardware/platformTelemetry.cjs');

test('macOS vm_stat parser calculates Activity-Monitor-style used, available, and cached memory accurately', () => {
  const totalBytes = 16 * 1024 * 1024 * 1024;
  const sampleVmStat = [
    'Mach Virtual Memory Statistics: (page size of 16384 bytes)',
    'Pages free:                               12000.',
    'Pages active:                            350000.',
    'Pages inactive:                          250000.',
    'Pages speculative:                        10000.',
    'Pages throttled:                              0.',
    'Pages wired down:                        140000.',
    'Pages purgeable:                          20000.',
    'Pages occupied by compressor:            110000.',
  ].join('\n');

  const parsed = parseMacVmStatOutput(sampleVmStat, totalBytes);
  assert.ok(parsed);
  assert.equal(parsed.pageSize, 16384);
  assert.equal(parsed.totalBytes, totalBytes);
  assert.equal(parsed.usedBytes, (350000 + 140000 + 110000) * 16384);
  assert.equal(parsed.availableBytes, totalBytes - parsed.usedBytes);
  assert.ok(parsed.usagePercent > 50 && parsed.usagePercent < 65);
  assert.equal(parsed.cachedFilesBytes, (250000 + 10000 + 20000) * 16384);

  assert.equal(parseMacVmStatOutput('', totalBytes), null);
});

test('macOS sysctl and system_profiler SPDisplaysDataType parsers handle Apple Silicon & Intel hardware safely', () => {
  const sysctlOut = [
    'machdep.cpu.brand_string: Apple M3 Pro',
    'hw.model: Mac15,6',
    'hw.physicalcpu: 12',
    'hw.logicalcpu: 12',
    'hw.memsize: 38654705664',
    'kern.osproductversion: 15.2',
    'kern.osversion: 24C101',
  ].join('\n');

  const sysInfo = parseMacSysctlOutput(sysctlOut);
  assert.equal(sysInfo.cpuModel, 'Apple M3 Pro');
  assert.equal(sysInfo.physicalCores, 12);
  assert.equal(sysInfo.logicalThreads, 12);
  assert.equal(sysInfo.isAppleSilicon, true);
  assert.equal(sysInfo.osProductVersion, '15.2');

  const spJson = JSON.stringify({
    SPDisplaysDataType: [
      {
        sppci_model: 'Apple M3 Pro',
        spdisplays_vendor: 'sppci_vendor_Apple',
        sppci_cores: '18',
        spdisplays_mtlgpufamilysupport: 'spdisplays_metal3',
        spdisplays_ndrvs: [
          {
            _name: 'Built-in Liquid Retina XDR Display',
            _spdisplays_pixels: '3024 x 1964',
            spdisplays_resolution: '3024 x 1964 @ 120.00Hz',
            spdisplays_connection_type: 'spdisplays_internal',
            spdisplays_main: 'spdisplays_yes',
            spdisplays_display_type: 'spdisplays_built-in-liquid-retina-xdr',
          },
        ],
      },
    ],
  });

  const spParsed = parseMacSystemProfilerDisplaysJson(spJson, sysInfo.memBytes);
  assert.equal(spParsed.gpus.length, 1);
  assert.equal(spParsed.gpus[0].manufacturer, 'Apple');
  assert.equal(spParsed.gpus[0].cores, 18);
  assert.equal(spParsed.gpus[0].isUnifiedMemory, true);
  assert.equal(spParsed.gpus[0].vramMB, Math.round(38654705664 / (1024 * 1024)));
  assert.equal(spParsed.displays.length, 1);
  assert.equal(spParsed.displays[0].refreshRateHz, 120);
  assert.equal(spParsed.displays[0].builtin, true);

  const profile = buildAppleGpuProfile({
    gpu: spParsed.gpus[0],
    metalSupport: 'Metal 3',
    gpuCores: 18,
    osVersion: '15.2',
    vramTotalMB: spParsed.gpus[0].vramMB,
  });
  assert.equal(profile.vendor, 'Apple');
  assert.equal(profile.isIntegrated, true);
  assert.ok(Array.isArray(profile.features) && profile.features.length >= 4);
  const hwRt = profile.features.find((f) => f.id === 'apple-hw-raytracing');
  assert.equal(hwRt.hardwareSupported, true);
});

test('buildMetricAvailability reports honest explicit states across win32, linux, and darwin', () => {
  const validStates = new Set(METRIC_AVAILABILITY_STATES);

  const linuxAvail = buildMetricAvailability({
    platform: 'linux',
    cpuUsage: 14.2,
    cpuTempC: 48.0,
    cpuPowerWatts: null,
    linuxRaplStatus: 'permission_required',
    gpus: [{ utilizationPercent: null, temperatureCelsius: null }],
    liveSensors: { fans: [], source: null },
    ramUsagePercent: 41.5,
    storage: [{ id: 's1' }],
    network: { activeInterface: { name: 'eth0' } },
    capabilities: null,
  });

  assert.equal(linuxAvail.cpuUsage.state, 'available');
  assert.equal(linuxAvail.cpuTemp.state, 'available');
  assert.equal(linuxAvail.cpuPower.state, 'permission_required');
  assert.equal(linuxAvail.presentMonFps.state, 'unsupported');
  assert.equal(linuxAvail.windowsGraphics.state, 'unsupported');

  const macAvail = buildMetricAvailability({
    platform: 'darwin',
    cpuUsage: 9.1,
    cpuTempC: null,
    cpuPowerWatts: null,
    linuxRaplStatus: null,
    gpus: [{ model: 'Apple M3' }],
    liveSensors: { fans: [] },
    ramUsagePercent: 52.0,
    storage: [{ id: 's1' }],
    network: { activeInterface: { name: 'en0' } },
    capabilities: null,
  });

  assert.equal(macAvail.cpuTemp.state, 'permission_required');
  assert.equal(macAvail.fans.state, 'permission_required');
  assert.equal(macAvail.gpuTelemetry.state, 'unsupported');
  assert.equal(macAvail.ram.state, 'available');
  assert.equal(macAvail.presentMonFps.state, 'unsupported');

  for (const map of [linuxAvail, macAvail]) {
    for (const val of Object.values(map)) {
      assert.ok(validStates.has(val.state), `Unexpected state: ${val.state}`);
      assert.equal(typeof val.reason, 'string');
      assert.ok(val.reason.length > 0);
    }
  }
});

test('Linux sysfs/RAPL probes fail gracefully without throwing or fabricating data', async () => {
  const rapl = await probeLinuxRaplEnergyAsync();
  assert.ok(METRIC_AVAILABILITY_STATES.includes(rapl.status));
  const hwmon = await readLinuxLiveHwmonSensorsAsync();
  assert.ok(Array.isArray(hwmon.fans));
  assert.ok(Array.isArray(hwmon.extraTemps));
});

test('preload.cjs keeps contextBridge strict and never leaks raw ipcRenderer or arbitrary command exec', () => {
  const preloadSrc = fs.readFileSync(
    path.resolve(__dirname, '../electron/preload.cjs'),
    'utf8'
  );
  assert.ok(preloadSrc.includes("contextBridge.exposeInMainWorld('secretAreaDesktop'"));
  assert.ok(preloadSrc.includes('appearance:'));
  assert.ok(preloadSrc.includes('getSystemAppearance'));
  assert.equal(/ipcRenderer\s*,/.test(preloadSrc.split('exposeInMainWorld')[1] || ''), false);
  assert.equal(preloadSrc.includes('child_process'), false);
});

import { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowSquareOut,
  CaretDown,
  CaretRight,
  Cpu,
  ShieldCheck,
  ShieldWarning,
  Terminal,
  Warning,
  Wrench,
  X,
} from '@phosphor-icons/react';

interface HypervisorGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HypervisorGuideModal({ isOpen, onClose }: HypervisorGuideModalProps) {
  const [changelogOpen, setChangelogOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Hypervisor Guide"
      className="fixed inset-0 z-[60] w-screen h-screen bg-[#f4f6f9] dark:bg-[#11161d] flex flex-col overflow-hidden"
    >
      {/* Sticky Top Popup Bar */}
      <header className="px-4 sm:px-6 lg:px-8 py-3 bg-white dark:bg-[#171a21] border-b border-slate-200 dark:border-white/[0.08] shrink-0">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[12px] font-semibold text-slate-800 hover:text-slate-950 dark:bg-[#232b36] dark:hover:bg-[#2d3847] dark:border-white/[0.08] dark:text-[#e5e9f0] dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
              <span>Back to Game</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <span className="px-1.5 py-[2px] rounded-[2px] bg-[#dc2626] text-white text-[10px] font-extrabold uppercase tracking-wider shrink-0">
                HV
              </span>
              <h2 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                Hypervisor Guide
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href="https://fitgirl-repacks.site/hypervisor-guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[11.5px] font-medium text-[#0284c7] hover:text-slate-900 dark:bg-[#1d2532] dark:hover:bg-[#273244] dark:border-white/[0.08] dark:text-[#66c0f4] dark:hover:text-white transition-colors"
            >
              <span>Original Article</span>
              <ArrowSquareOut className="w-3 h-3" />
            </a>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Hypervisor Guide"
              className="p-2 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 dark:bg-[#252f3d] dark:hover:bg-[#313e50] dark:text-[#aeb9c7] dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Scrollable Guide Body */}
      <div className="flex-1 overflow-y-auto bg-gradient-to-b from-slate-50 via-[#f4f6f9] to-slate-100 dark:from-[#161e29] dark:via-[#121821] dark:to-[#0d1118]">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 text-[13.5px] sm:text-[14px] leading-relaxed text-slate-700 dark:text-[#cfd9e4]">
          {/* Title + WIP Notice */}
          <div className="space-y-3 border-b border-slate-200 dark:border-white/[0.08] pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-rose-50 border border-rose-300 text-rose-800 dark:bg-[#dc2626]/15 dark:border-[#dc2626]/40 dark:text-[#fca5a5] text-[12px] font-semibold">
              <Warning className="w-3.5 h-3.5 text-rose-600 dark:text-[#f87171] shrink-0" />
              <span>This page is a work-in-progress and will be updated.</span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
              Hypervisor Guide
            </h1>

            <p className="text-slate-600 dark:text-[#aeb9c7]">
              This article is partially based on RessourectoR’s (admin of cs.rin.ru site) article:
            </p>
            <p>
              <a
                href="https://cs.rin.ru/forum/viewtopic.php?f=10&t=156407"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-[15px] sm:text-[17px] font-semibold text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline underline-offset-4 break-all"
              >
                <span>https://cs.rin.ru/forum/viewtopic.php?f=10&amp;t=156407</span>
                <ArrowSquareOut className="w-4 h-4 shrink-0" />
              </a>
            </p>
            <p className="text-slate-600 dark:text-[#b8c4d4]">
              I highly recommend to open and read it at least one time. It’s more complex than this page and covers more security topics.
            </p>
          </div>

          {/* What are Hypervisor Cracks? */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <ShieldWarning className="w-4 h-4 text-rose-600 dark:text-[#f87171] shrink-0" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                What are Hypervisor Cracks?
              </h3>
            </div>
            <p>
              Denuvo Hypervisor Crack or Bypass refers to advanced techniques that leverage virtualization at a very low level (often using a custom or modified hypervisor) to interfere with how the protection monitors the system. Denuvo relies heavily on integrity checks, timing analysis, and detection of debugging or emulation environments. A hypervisor-based approach allows an attacker to sit “under” the operating system, transparently controlling CPU behavior, intercepting instructions, and masking signs of analysis without modifying the protected executable directly.
            </p>
            <p>
              Instead of patching the game binary, the hypervisor can emulate or alter specific CPU instructions, fake timing results, or hide breakpoints and memory changes, effectively tricking Denuvo into believing everything is running on a normal, untampered system. This makes the protection much harder to detect or react to, since its checks are being handled outside its visibility. These methods are extremely complex and are typically explored by highly skilled reverse engineers, as they require deep knowledge of CPU virtualization, kernel internals, and anti-tamper mechanisms.
            </p>
            <p>
              Officially, only signed drivers can work at such low level. Due to the piracy nature of Denuvo Hypervisor drivers, they will never receive Microsoft-approved certificate. And that’s why to use such “cracks” you need to make certain modifications to your system security settings, listed below. Please note, that those changes are intended to be made temporary, for the course of your gameplay session and then should be reverted after you quit the game.
            </p>
          </section>

          {/* Windows virtualization-based security components */}
          <section className="space-y-3 p-4 sm:p-5 rounded bg-white dark:bg-[#121822] border border-slate-200 dark:border-white/[0.07] shadow-sm dark:shadow-none">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Windows virtualization-based security components
              </h3>
            </div>
            <p>
              On modern systems with Secure Boot, TPM 2.0 and hardware-assisted virtualization capabilities, Windows 10 and 11 enable, mostly* by default, various security solutions via Virtualization-based Security (VBS). VBS is an umbrella term for using a bare-metal hypervisor, the Windows hypervisor, to create isolated virtual spaces that are safe from even a fully compromised OS, in which these security components run and monitor the OS or store confidential information.
            </p>
            <p className="text-slate-900 dark:text-[#e5e9f0] font-medium">
              The following Windows components are such security solutions:
            </p>
            <ul className="list-disc pl-5 space-y-2.5 text-slate-700 dark:text-[#c8d4e0]">
              <li>
                <a
                  href="https://learn.microsoft.com/en-us/windows/security/hardware-security/enable-virtualization-based-protection-of-code-integrity"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline underline-offset-2 font-semibold"
                >
                  Memory Integrity (HVCI)
                </a>
                : Runs checks to detect malicious or at least unexpected modifications of Windows kernel code and restricts suspicious kernel memory allocations. For example, RessourectoR imagines this could protect against malicious software that is being run with administrative privileges and attempts to modify system files, or against memory security vulnerabilities in user-run applications.
              </li>
              <li>
                <a
                  href="https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/oem-credential-guard"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline underline-offset-2 font-semibold"
                >
                  Credential Guard
                </a>
                : Stores access credentials, such as passwords, authentication data, biometric data etc. in an isolated environment.
              </li>
              <li>
                <a
                  href="https://learn.microsoft.com/en-us/windows-hardware/design/device-experiences/windows-hello"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline underline-offset-2 font-semibold"
                >
                  Windows Hello
                </a>
                : Allows you to log in with convenient methods like a short PIN, facial recognition or fingerprint scan. RessourectoR has not found a direct source for this, but it probably prefers Credential Guard to store its highly sensitive data. The login methods it provides tend to break when some of the components above are disabled. It is also protected by System Guard, if that is enabled.
              </li>
              <li>
                <a
                  href="https://learn.microsoft.com/en-us/windows/security/hardware-security/how-hardware-based-root-of-trust-helps-protect-windows"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline underline-offset-2 font-semibold"
                >
                  System Guard (Secure Launch)
                </a>
                : An advanced system hardening framework that protects the OS boot process and{' '}
                <a
                  href="https://en.wikipedia.org/wiki/System_Management_Mode"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline underline-offset-2"
                >
                  System Management Mode
                </a>{' '}
                (SMM, commonly used by the BIOS to run hardware configuration software) from (arguably sophisticated) rootkits. Such rootkits could compromise the hypervisor itself, so this protection is assisted by various hardware security features of modern processors. Backed by TPM 2.0, this also allows to monitor system integrity, including the other security components mentioned here, after boot continuously and verify it from a remote system.
              </li>
              <li>From what RessourectoR could find, this is cutting edge and not enabled by default.</li>
            </ul>
            <p className="text-[12.5px] text-slate-500 dark:text-[#9cb0c6]">
              * Even though hardware and boot requirements are met, Windows sometimes seems to fail at enabling features that are supposed to be enabled automatically, such as VBS and memority integrity.
            </p>
            <div className="p-3.5 rounded bg-sky-50 border border-sky-200 text-slate-900 dark:bg-[#182230] dark:border-[#66c0f4]/30 dark:text-white font-semibold space-y-2">
              <p>
                Without the Windows hypervisor, none of these security features can be used. By design, the hypervisor cannot be disabled directly. Instead, all the above features that want to utilize VBS signal that it needs to be enabled, which then loads the hypervisor. Therefore, we must disable all those features to prevent the Windows hypervisor from being loaded.
              </p>
              <p>
                A boot option that prevents Hyper-V from loading the hypervisor also needs to be added.
              </p>
            </div>
          </section>

          {/* Safety Section */}
          <section className="space-y-3">
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              I want to play that new Denuvo-protected game, is it safe to disable all this and use a hypervisor crack?
            </h3>
            <p>
              There is no simple answer. This is RessourectoR’s personal take as someone with 10 years of experience in security-focused system administration and only a casual interest in gaming.
            </p>
            <p>
              It’s true that the most common threats are info stealer malware from fake download buttons, ransomware that encrypts your files or joining a DDoS botnet. It’s supposed such malware is usually not interested in higher privilege escalation or hardware sabotage, if it can already access what it needs. It’s also true that the best protection against such malware is a good ad blocker, staying on trusted sites and user education.
            </p>
            <p>
              More experienced PC users develop a false sense of security from seeing how successfully they avoid malware infection by “being smart”. They argue that they don’t need all these restrictive, patronizing security features and AVs that just annoy with false positives, because their malware-free track record “proves” that they know better. They also argue that more advanced threats are not aimed at home users, but corporate networks and too unlikely to care about. Especially relevant for gamers: Virtualization can reduce system performance and whether that is noticeable or not is also a point of contention.
            </p>
            <p>
              The other side of the argument: You would be disabling technology that evolved from decades of security research, ignoring what experts consider necessary nowadays. You would willingly give up protections against common classes of software vulnerabilities and if you ever do get a more advanced malware, it can breeze right through so that your PC can stay part of a botnet for eternity or spread to more local network devices more easily. If a lot of people remove these protections – especially DSE and memory integrity – for gaming, one of the main use cases of Windows PCs at home, it might be worth the effort for malware authors to target such setups. Widespread usage of HV cracks could encourage manipulated fake releases, because people who download those can be expected to disable all protection, including AV exclusion. The knowledge and effort required to take precautions and verify files properly is higher than with common threats and the potential consequences much more severe.
            </p>
            <p>
              Aside from the disabled Windows features, even if you trust the authors of the hypervisor driver and even compile it yourself from source, a serious vulnerability in its code could instantly provide maximum and undetectable access to your system.
            </p>
            <p className="font-bold text-slate-900 dark:text-white">
              Whether that game is worth the risks is something you will ultimately have to decide for yourself.
            </p>
          </section>

          {/* What's inside those cracks? */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-600 dark:text-[#34d399] shrink-0" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                What’s inside those cracks?
              </h3>
            </div>
            <p>Basically, every modern Hypervisor bypass/crack consists of two parts:</p>

            <ol className="list-decimal pl-5 space-y-5">
              <li className="space-y-3">
                <p className="font-semibold text-slate-900 dark:text-white">
                  VBS.cmd: special command-line script, which checks your existing settings and modify them to make your system prepared for HV-cracks.
                </p>
                <p>
                  This script is universal for all HV-games and is developed separately, it doesn’t depend on actual game cracks. You can download the latest version below:
                </p>

                {/* Highlighted Green VBS.cmd Card */}
                <div className="rounded-lg bg-emerald-50 border border-emerald-400 dark:bg-[#12331b]/55 dark:border-[#159311] p-4 sm:p-5 space-y-3">
                  <a
                    href="https://paste.fitgirl-repacks.site/?770949937a1c73bd#HH6HLTXZj4NFQtUoe44KYiPetXHqenCveB4Wc8uYC5mf"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-bold text-emerald-700 hover:text-emerald-950 dark:text-[#6ee7b7] dark:hover:text-white underline underline-offset-4"
                  >
                    <span>Current version: v2.0 (Updated on October 29, 2026)</span>
                    <ArrowSquareOut className="w-3.5 h-3.5 shrink-0" />
                  </a>

                  {/* Expandable Changes Log Spoiler */}
                  <div className="rounded bg-white border border-emerald-200 dark:bg-[#0d1712]/80 dark:border-white/[0.1] overflow-hidden">
                    <button
                      type="button"
                      onClick={() => setChangelogOpen((prev) => !prev)}
                      className="w-full px-3.5 py-2.5 flex items-center justify-between text-left text-[13px] font-semibold text-slate-900 hover:bg-slate-50 dark:text-[#e5e9f0] dark:hover:bg-white/[0.04] transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        {changelogOpen ? (
                          <CaretDown className="w-4 h-4 text-emerald-600 dark:text-[#34d399]" />
                        ) : (
                          <CaretRight className="w-4 h-4 text-emerald-600 dark:text-[#34d399]" />
                        )}
                        <span>Changes log:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-[#8b9bb4]">
                        {changelogOpen ? 'Click to collapse' : 'v1.1 → v2.0'}
                      </span>
                    </button>

                    {changelogOpen && (
                      <div className="px-4 py-4 border-t border-emerald-200 dark:border-white/[0.08] space-y-4 text-[12.5px] sm:text-[13px] text-slate-700 dark:text-[#c7d4e2]">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v2.0</h4>
                          <p>
                            Temporary removes AVX-512 support for the session to make HV work with newer Denuvo versions
                          </p>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.9</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>
                              Added a check for Bitdefender Advanced Threat Defense. The script will now warn the user when Bitdefender Advanced Threat Defense is on, as it may cause an “Initialization error 5” message in certain games that use VMProtect, notably Ubisoft and Capcom titles.
                            </li>
                            <li>
                              Added a check for MacType. The script will now warn the user when MacType is running as it’s known to cause games to silently crash. The script may also disable MacType when it’s set to run as a service.
                            </li>
                            <li>Updated introductory notes.</li>
                            <li>Bug fixes.</li>
                            <li>
                              We rely on user reports to identify and fix issues. If you encounter any problems, please report them at{' '}
                              <a
                                href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline"
                              >
                                https://cs.rin.ru/forum/viewtopic.php?f=14&amp;t=156435
                              </a>
                              .
                            </li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.8</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>
                              The script now enables Test Signing instead of taking the user to disable driver signature enforcement through the Startup Settings in cases where Secure Boot is off. This approach is more stable, and does not need to be reapplied after every restart. Learn more about Test Signing{' '}
                              <a
                                href="https://learn.microsoft.com/en-us/windows-hardware/drivers/install/test-signing#test-sign-a-driver-package"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline"
                              >
                                here
                              </a>
                              .
                            </li>
                            <li>Improved Windows Hello detection.</li>
                            <li>Updated introductory notes.</li>
                            <li>Minor improvements.</li>
                            <li>Bug fixes.</li>
                            <li>
                              We rely on user reports to identify and fix issues. If you encounter any problems, please report them at{' '}
                              <a
                                href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline"
                              >
                                https://cs.rin.ru/forum/viewtopic.php?f=14&amp;t=156435
                              </a>
                              .
                            </li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.7.2</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Improved boot entry identifier detection, addressing issues for some dual boot systems.</li>
                            <li>Added an error message for when the current boot entry could not be identified.</li>
                            <li>Added detection and disabling of Hypervisor-Enforced Paging Translation.</li>
                            <li>Updated introductory notes.</li>
                            <li>Minor improvements.</li>
                            <li>Bug fixes.</li>
                            <li>
                              We rely on user reports to identify and fix issues. If you encounter any problems, please report them at{' '}
                              <a
                                href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline"
                              >
                                https://cs.rin.ru/forum/viewtopic.php?f=14&amp;t=156435
                              </a>
                              .
                            </li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.7.1</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Improved Windows Hello detection.</li>
                            <li>Improved BitLocker detection and suspension.</li>
                            <li>Minor improvements.</li>
                            <li>Bug fixes.</li>
                            <li>
                              We rely on user reports to identify and fix issues. If you encounter any problems, please report them at{' '}
                              <a
                                href="https://cs.rin.ru/forum/viewtopic.php?f=14&t=156435"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline"
                              >
                                https://cs.rin.ru/forum/viewtopic.php?f=14&amp;t=156435
                              </a>
                              .
                            </li>
                          </ol>
                        </div>

                        <div className="space-y-2">
                          <h4 className="font-bold text-slate-900 dark:text-white">v1.7</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>
                              Added detection for mapped network drives. Running the script from a mapped network drive, including shared folders in virtual machines that appear as mapped networks drives, is not supported and the script will now exit with an appropriate message instead of outright crashing. This is a Windows issue and not the script’s.
                            </li>
                            <li>
                              When a Windows Hello PIN is both enabled and protected by VBS on Windows 11, the script cannot continue and prompts the user to disable their PIN first. This further addresses Windows Hello related issues.
                            </li>
                            <li>
                              Added detection for Parallels Desktop for Mac. The script now checks BIOS and system manufacturer information to detect Parallels and exits with an appropriate message.
                            </li>
                            <li>
                              The script now checks if it’s running on an unsupported version of Windows (Windows 10, version 1909 or lower), and if so, prompts the user to update their Windows.
                            </li>
                            <li>
                              Fixed boot entry detection not working on Single Language editions of Windows by reading the value by position instead of searching for the word “identifier”.
                            </li>
                            <li>
                              Fixed an issue where disabling VBS with Credential Guard enabled on Windows 10 could require two reboots before fully taking effect.
                            </li>
                            <li>
                              Added detection and disabling of additional registry keys for Enhanced Sign-in Security, covering keys that were previously missed.
                            </li>
                            <li>
                              Fixed an issue where Startup Settings wouldn’t show up on boot in a system that has disabled advanced boot options.
                            </li>
                            <li>
                              The script now checks whether the Windows architecture is unsupported, and if so, prompts the user to exit.
                            </li>
                            <li>Updated introductory notes.</li>
                            <li>Minor improvements.</li>
                            <li>Bug fixes.</li>
                          </ol>

                          <div className="p-3 rounded bg-slate-50 border border-slate-200 dark:bg-[#141b25] dark:border-white/[0.08] space-y-1.5 text-[12px]">
                            <p>
                              The “Run as administrator” option in the context menu will fail to execute the script on paths that contain certain special characters. This is a Windows issue and not the script’s.
                            </p>
                            <p>
                              We recommend that instructions avoid explicitly directing users to run the script with administrative privileges. Instead, users should launch the script normally and, if prompted, simply approve the UAC dialog to grant the necessary privileges.
                            </p>
                            <p>In order to fix this, open Command Prompt as administrator, then paste in and execute these commands:</p>
                            <pre className="p-2.5 rounded bg-slate-900 border border-slate-800 text-sky-300 dark:bg-[#0a0d12] dark:border-white/[0.06] dark:text-[#93c5fd] font-mono text-[11px] overflow-x-auto select-all whitespace-pre-wrap">
{`set _r=^%SystemRoot^%
reg add HKLM\\SOFTWARE\\Classes\\batfile\\shell\\runas\\command /f /v "" /t REG_EXPAND_SZ /d "%_r%\\System32\\cmd.exe /C \\"\\"%1\\" %*\\""
reg add HKLM\\SOFTWARE\\Classes\\cmdfile\\shell\\runas\\command /f /v "" /t REG_EXPAND_SZ /d "%_r%\\System32\\cmd.exe /C \\"\\"%1\\" %*\\""`}
                            </pre>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.6.2</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>
                              Fixed an issue where a “All changes have been reverted successfully. A restart is not necessary.” message would incorrectly be shown when reverting changes in cases where only driver signature enforcement is off.
                            </li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.6.1</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>
                              Fixed an issue where reverting Credential Guard would explicitly set LsaCfgFlags to 2 even on systems where it was running due to Windows default enablement rather than explicit configuration. The original value is now backed up before disabling and restored accurately on revert, or left unset if it was never explicitly configured.
                            </li>
                            <li>
                              Added DISM RestoreHealth and SFC Scannow options to the troubleshoot menu, complementing the existing Fix WMI option. These can help resolve system file corruption that may cause issues with PowerShell or WMI.
                            </li>
                            <li>Updated introductory notes.</li>
                            <li>Minor improvements.</li>
                            <li>Bug fixes.</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.6</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Added detection and disabling of FACEIT Anti-Cheat. The driver is now automatically unloaded if found running.</li>
                            <li>Added detection and disabling of the WindowsHelloSecureBiometrics registry key, an additional Enhanced Sign-in Security key that was missing from the previous implementation.</li>
                            <li>Added detection and disabling of HyperGuard, a VBS-dependent security feature that could keep the Windows hypervisor active.</li>
                            <li>Added detection and disabling of Guarded Host, a VBS-dependent security feature that could keep the Windows hypervisor active.</li>
                            <li>Added boot entry identifier detection to ensure bcdedit commands target the correct boot entry, improving compatibility with non-standard boot configurations.</li>
                            <li>When Windows Hello protection is detected, the script now disables the Microsoft account Windows Hello-only sign-in enforcement and removes the Windows Hello credential container via certutil before disabling the Device Guard registry key. This prevents the broken PIN on the next boot and ensures the user can sign back in with their password. The original sign-in enforcement value is saved and restored accurately on revert.</li>
                            <li>Updated introductory notes.</li>
                            <li>Minor improvements.</li>
                            <li>Bug fixes.</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.5</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Improved the Windows hypervisor detection. The script now also checks if Hyper-V, Virtual Machine Platform, Windows Hypervisor Platform, Windows Subsystem for Linux, or Windows Sandbox features are enabled. If any of these are enabled and a hypervisor is detected as running, the Windows hypervisor will be disabled, covering cases where VBS appeared disabled but the hypervisor remained active due to these features.</li>
                            <li>Added VSM (Virtual Secure Mode) launch type detection. If vsmlaunchtype is set to Auto in the boot configuration, it is disabled alongside the hypervisor and restored on revert.</li>
                            <li>Added a WMI check and a Troubleshoot option in the main menu with a Fix WMI tool, for systems where PowerShell CIM/WMI calls fail with invalid class errors.</li>
                            <li>Added a PowerShell check at startup to detect and report issues such as Restricted Language mode, PowerShell Core replacing PowerShell Desktop, malware interfering with PowerShell, and .NET initialization failures.</li>
                            <li>Added a QuickEdit and Terminal app detection check. The script now relaunches itself in conhost.exe when running inside Windows Terminal to avoid known issues with window resizing, choice.exe input handling, and console buffer behavior that can cause the script to appear frozen or behave incorrectly.</li>
                            <li>Added a Temp folder check. If the script is launched directly from an archive file, the user is informed to extract it first.</li>
                            <li>Improved robustness by explicitly setting environment variables at launch, ensuring correct behavior regardless of system configuration or how the script is invoked.</li>
                          </ol>
                          <p className="mt-1 text-slate-500 dark:text-[#9fb0c5]">Other minor improvements.</p>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.4</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Added Driver Signature Enforcement (DSE) and test signing detection. If test signing is already enabled, the script will skip the Startup Settings step, BitLocker suspension, and onetimeadvancedoptions entirely, as driver signature enforcement is already bypassed.</li>
                            <li>Fixed an issue where the Revert Changes option would incorrectly show “Nothing to revert, as no changes were previously applied.” when DSE was still disabled, even though a reboot was required to restore it.</li>
                            <li>Added FACEIT Anti-Cheat detection. If detected, the script will exit with a message asking the user to uninstall it before proceeding, as it is known to block the driver from loading.</li>
                            <li>Replaced PowerShell calls with full path via %psc% to avoid resolution issues when PowerShell is not in PATH.</li>
                            <li>Removed outdated comments.</li>
                            <li>Minor improvements.</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.3</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Fixed an issue where Credential Guard Scenarios registry key was being restored on revert even when Credential Guard itself was not running before the script was executed. CG and CG Scenarios are now tracked and reverted independently.</li>
                            <li>Fixed an issue where Memory Integrity (HVCI) would not be detected if it was configured but not yet running, which could keep VBS active. HVCI detection now checks both runtime status and registry configuration.</li>
                            <li>Added detection and removal of RequirePlatformSecurityFeatures when disabling VBS, which was causing VBS to remain enabled. The original value is backed up and restored accurately on revert.</li>
                            <li>Added detection and removal of the Enhanced Sign-in Security Scenarios key alongside the existing subkey, and reverts them independently.</li>
                            <li>Added a message informing the user when no security features needed to be disabled.</li>
                            <li>Minor improvements.</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.2</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Fixed a compatibility issue where launching the script from a 32-bit application, like Compact AutoRunner which is used in Hypervisor Launcher by FitGirl, would cause system tools such as bcdedit to not be found, due to System32 being redirected to SysWOW64 in 32-bit processes. This manifested as the Windows hypervisor showing as failed to disable, and UEFI lock removal failing entirely. The script now relaunches itself as a 64-bit process when this is detected. Thanks to galaxyxyz888 on Discord.</li>
                            <li>Fixed an issue where the Credential Guard Scenarios registry key was not being disabled, which could keep VBS active even when Credential Guard was not running. Thanks to sowhatnumber on Discord.</li>
                            <li>Fixed an issue where SecConfig.efi would not correctly return to the current OS after clearing a UEFI lock on dual-boot systems. Thanks to RessourectoR.</li>
                            <li>Fixed an issue where reverting the Windows hypervisor would incorrectly show as failed after a reboot on systems with UEFI locked VBS or HVCI, caused by SecConfig.efi clearing the hypervisorlaunchtype BCD entry during the UEFI lock removal process on boot.</li>
                            <li>Fixed an issue where the Revert Changes option would not show “No changes have been made” on systems that had previously agreed to UEFI lock removal, even when no features had actually been disabled, due to the UEFILockAgreed registry value being incorrectly counted as a tracked change.</li>
                            <li>Fixed an issue where the ManageVBS registry key was not being cleaned up correctly after reverting on systems that had agreed to UEFI lock removal.</li>
                            <li>Added test signing detection. If test signing is already enabled, the script will inform the user.</li>
                            <li>Minor visual improvements.</li>
                          </ol>
                        </div>

                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white mb-1">v1.1</h4>
                          <ol className="list-decimal pl-5 space-y-1">
                            <li>Fixed a crash when the script path or filename contained spaces or special characters, such as when downloaded multiple times and renamed to VBS (1).cmd.</li>
                            <li>Fixed an issue where Enhanced Sign-in Security was preventing VBS from being disabled. A check has been added to disable it if detected. This mainly affected ROG Ally X users where it is enabled by default. Thanks to .oathkeeper213 on Discord and Azazel35 on Reddit.</li>
                            <li>Added support for disabling VBS, HVCI and Credential Guard when protected by a UEFI lock using SecConfig.efi. In the script, the user is advised to only proceed on personal devices before removing the UEFI lock. Note that on managed devices, VBS, HVCI and Credential Guard protected by a UEFI lock can only be disabled for one boot cycle. UEFI locks can be fully reverted using the Revert Changes option. Thanks to poce on Discord.</li>
                            <li>Added support for disabling VBS and HVCI mandatory mode. Note that reverting mandatory mode is not currently supported and must be re-enabled manually if needed.</li>
                            <li>Added a note in the script’s introduction regarding compatibility issues with kernel anti-cheats, specifically Vanguard, where disabling driver signature enforcement would result in a bug check (BSOD) in some system configurations, and FACEIT Anti-Cheat, which prevented the driver from loading with a multitude of different errors, most notably ERROR_ACCESS_DENIED, ERROR_INVALID_BLOCK and ERROR_NO_SYSTEM_RESOURCES. Thanks to xyz2theb on Reddit, deviljin0500, faintx11 &amp; xeros1 on Discord for reporting this.</li>
                            <li>Updated introductory notes.</li>
                            <li>Minor visual improvements.</li>
                          </ol>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </li>

              <li className="space-y-2">
                <p className="font-semibold text-slate-900 dark:text-white">The Crack/Bypass itself</p>
                <p>
                  Consists of EXEs/DLLs, which does the actual Denuvo bypassing + other additional DLLs, like Goldberg Steam emulator to get past the underlying Steam protection.
                </p>
                <p>
                  Those files work only for specific game versions, for which they were made. They won’t work on different game version or other games.
                </p>
              </li>
            </ol>
          </section>

          {/* Other Software Updates */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-600 dark:text-[#34d399] shrink-0" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Other Software Updates
              </h3>
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-400 dark:bg-[#12331b]/55 dark:border-[#159311] p-4 sm:p-5 space-y-3">
              <div>
                <a
                  href="https://paste.fitgirl-repacks.site/?7bb76c6f568d3725#G68jW7TWoMwDHUxBXhP4ttUX7Eeky9yCPPVHHtTs9aKj"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-[14px] sm:text-[15px] font-bold text-emerald-700 hover:text-emerald-950 dark:text-[#6ee7b7] dark:hover:text-white underline underline-offset-4"
                >
                  <span>Updated hypervisor-launcher.exe v1.3.1</span>
                  <ArrowSquareOut className="w-3.5 h-3.5 shrink-0" />
                </a>
                <p className="mt-1.5">
                  Solves the PC restart issue on some systems, mostly on Intels. This a mirror from{' '}
                  <a
                    href="https://github.com/NotAndreh/hypervisor-launcher/releases"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#0284c7] hover:text-slate-900 dark:text-[#66c0f4] dark:hover:text-white underline"
                  >
                    this official GitHub page
                  </a>
                  .
                </p>
                <p className="mt-2">
                  The older version of “hypervisor-launcher.exe” is used in many DenuvOwO releases and in some of my repacks released before March 28, 2026. All HV-repacks past with date with this launcher version are using the updated build. You may download and try the new version ONLY if you have a launch issue, no need to replace it if everything works for you.
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-semibold text-slate-900 dark:text-white">
                  My repacks with older version “hypervisor-launcher.exe”:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-[#0284c7] dark:text-[#93c5fd]">
                  <li>
                    <a
                      href="https://fitgirl-repacks.site/assassins-creed-shadows/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-900 dark:hover:text-white underline"
                    >
                      Assassin’s Creed Shadows
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://fitgirl-repacks.site/hello-kitty-island-adventure/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-900 dark:hover:text-white underline"
                    >
                      Hello Kitty Island Adventure
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://fitgirl-repacks.site/nba-2k26/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-900 dark:hover:text-white underline"
                    >
                      NBA 2K26
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://fitgirl-repacks.site/stellar-blade/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-slate-900 dark:hover:text-white underline"
                    >
                      Stellar Blade
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Pre-requirements */}
          <section className="space-y-2 p-4 sm:p-5 rounded bg-white border border-slate-200 dark:bg-[#121822] dark:border-white/[0.07]">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-[#0284c7] dark:text-[#66c0f4] shrink-0" />
              <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Pre-requirements
              </h3>
            </div>
            <p>Your CPU must support one of two virtualization techniques: VT-x for Intel and AMD-V (SVM) for AMD.</p>
            <p>Google if CPU model supports virtualization to know if you can play HV-games.</p>
            <p>Before proceeding with HV cracks, check your BIOS for enabling those technologies.</p>
          </section>

          {/* Secure Boot FAQ */}
          <section className="space-y-2 p-4 sm:p-5 rounded bg-white border border-slate-200 dark:bg-[#121822] dark:border-white/[0.07]">
            <h3 className="font-display text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Do I need to disable Secure Boot or use EfiGuard?
            </h3>
            <p className="text-slate-800 dark:text-[#e5e9f0] font-medium">
              No. Current HV bypasses do not require those changes.
            </p>
          </section>
        </article>
      </div>
    </div>
  );
}

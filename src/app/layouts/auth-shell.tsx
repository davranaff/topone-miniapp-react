import { Outlet } from "react-router-dom";

export const AuthShell = () => {
  return (
    <div className="relative min-h-[100dvh] overflow-hidden bg-[#050301] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,#070503_0%,#120d06_45%,#1b1408_100%)]" />
      <div className="pointer-events-none absolute -left-28 -top-28 h-[22rem] w-[22rem] rounded-full bg-[#d9a43d]/16 blur-[74px]" />
      <div className="pointer-events-none absolute bottom-[-10rem] right-[-8rem] h-[22rem] w-[22rem] rounded-full bg-[#b67d19]/16 blur-[78px]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[linear-gradient(180deg,rgba(255,255,255,0.035),transparent)]" />

      <div className="relative z-10 flex min-h-[100dvh] items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-[54rem] rounded-[2rem] border border-[#d4a64c]/58 bg-[linear-gradient(180deg,rgba(255,226,163,0.12),rgba(0,0,0,0.08))] p-[1px] shadow-[0_34px_90px_rgba(0,0,0,0.52)]">
          <div className="relative overflow-hidden rounded-[calc(2rem-1px)] bg-[linear-gradient(135deg,rgba(68,48,11,0.58),rgba(11,8,3,0.9))] px-5 py-6 backdrop-blur-[8px] sm:px-10 sm:py-10">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-[linear-gradient(180deg,rgba(255,255,255,0.14),transparent)]" />
            <div className="pointer-events-none absolute inset-y-0 left-0 w-20 bg-[linear-gradient(90deg,rgba(255,255,255,0.035),transparent)]" />
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

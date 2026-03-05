import { cn } from "@/shared/lib/cn";
import { TopOneLogo } from "@/shared/ui/topone-logo";

type AppLoadingScreenProps = {
  status?: string;
  progress?: number;
  fullScreen?: boolean;
  compact?: boolean;
  className?: string;
};

const clampProgress = (value: number) => Math.max(0, Math.min(100, value));

export const AppLoadingScreen = ({
  status,
  progress,
  fullScreen = true,
  compact = false,
  className,
}: AppLoadingScreenProps) => {
  return (
    <div
      className={cn(
        "relative flex items-center justify-center overflow-hidden px-6 py-10",
        fullScreen ? "min-h-[100dvh]" : "min-h-[40vh]",
        className,
      )}
    >
      <div className={cn("relative w-full max-w-[22rem] animate-fade-in-up", compact && "max-w-[18rem]")}>
        <div className="mx-auto flex flex-col items-center gap-6 text-center">
          <TopOneLogo
            size={compact ? "lg" : "xl"}
            framed={false}
            className="drop-shadow-[0_0_34px_rgba(212,160,23,0.36)]"
          />

          {status ? <p className="text-sm font-medium text-t-secondary">{status}</p> : null}

          <div className="w-full">
            <div className="app-loading-track relative h-2.5 overflow-hidden rounded-full">
              {typeof progress === "number" ? (
                <div
                  className="app-loading-fill h-full rounded-full transition-[width] duration-500"
                  style={{ width: `${clampProgress(progress)}%` }}
                />
              ) : (
                <div className="app-loading-fill app-loading-indeterminate absolute inset-y-0 left-[-38%] w-[38%] rounded-full" />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

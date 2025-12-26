import LiquidEther from "@/components/ui/liquid-ether";
import AuthIntro from "@/components/auth/auth-intro";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
      <div className="absolute inset-0 z-0 flex items-center justify-center">
        <LiquidEther
          colors={["#5227FF", "#FF9FFC", "#B19EEF"]}
          mouseForce={20}
          cursorSize={100}
          isViscous={true}
          viscous={30}
          iterationsViscous={32}
          iterationsPoisson={32}
          resolution={0.5}
          isBounce={false}
          autoDemo={true}
          autoSpeed={0.2}
          autoIntensity={2.2}
          takeoverDuration={0.25}
          autoResumeDelay={3000}
          autoRampDuration={0.6}
        />
      </div>
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <div className="relative z-10 grid min-h-screen grid-cols-1 lg:grid-cols-2 pointer-events-none">
        <div className="hidden lg:flex flex-col items-center justify-center p-8 lg:p-12 xl:p-20">
          <div className="pointer-events-auto">
            <AuthIntro />
          </div>
        </div>

        <div className="flex items-center justify-center p-4 sm:p-8 lg:p-12 backdrop-blur-[2px] lg:backdrop-blur-none">
          <div className="w-full max-w-md pointer-events-auto">{children}</div>
        </div>
      </div>
    </div>
  );
}

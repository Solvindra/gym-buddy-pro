import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { Globe, Share, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/welcome")({
  component: WelcomePage,
});

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as any).standalone === true
  );
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function WelcomePage() {
  const navigate = useNavigate();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const ios = isIOS();
  const android = isAndroid();

  useEffect(() => {
    if (isStandalone()) {
      localStorage.setItem("ft_welcomed", "1");
      navigate({ to: "/login" });
    }
  }, [navigate]);

  function goToBrowser() {
    localStorage.setItem("ft_welcomed", "1");
    navigate({ to: "/login" });
  }

  function handleAddToHomeScreen() {
    if (ios) setShowIOSGuide(true);
    else if (android) setShowAndroidGuide(true);
    else setShowIOSGuide(true);
  }

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5 py-10">
      {/* Logo */}
      <div className="flex flex-col items-center gap-3 mb-10">
        <img src="/logo-transparent.png" alt="The Track" className="w-24 h-24 object-contain invert dark:invert-0" />
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">The Track</h1>
          <p className="text-muted-foreground mt-1 text-sm">Your gym, fully managed</p>
        </div>
      </div>

      {/* Choice cards */}
      {!showIOSGuide && !showAndroidGuide && (
        <div className="w-full max-w-sm space-y-4">
          <p className="text-center text-sm text-muted-foreground mb-6">
            How would you like to use The Track?
          </p>

          {/* Add to Home Screen */}
          <button
            onClick={handleAddToHomeScreen}
            className="w-full text-left rounded-2xl border-2 border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors p-5 space-y-2"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <div className="font-semibold text-base">Add to Home Screen</div>
                <div className="text-xs text-muted-foreground">Works like a real app — no browser bar</div>
              </div>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1 pl-[3.25rem]">
              <li>• Opens full screen</li>
              <li>• Fast launch from home screen</li>
              <li>• Best experience on mobile</li>
            </ul>
          </button>

          {/* Browser mode */}
          <button
            onClick={goToBrowser}
            className="w-full text-left rounded-2xl border border-border bg-card hover:bg-accent transition-colors p-5"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                <Globe className="w-5 h-5 text-muted-foreground" />
              </div>
              <div>
                <div className="font-semibold text-base">Continue in Browser</div>
                <div className="text-xs text-muted-foreground">Use directly in Safari or Chrome</div>
              </div>
            </div>
          </button>

          <p className="text-center text-xs text-muted-foreground pt-2">
            You can always add it to your home screen later
          </p>
        </div>
      )}

      {/* iOS Step-by-step guide */}
      {showIOSGuide && (
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <h2 className="font-semibold text-lg">Add to Home Screen</h2>
            <p className="text-xs text-muted-foreground mt-1">Follow these steps in Safari</p>
          </div>

          <div className="space-y-3">
            <Step number={1} icon={<Share className="w-5 h-5 text-primary" />}>
              Tap the <strong>Share</strong> button at the bottom of your Safari browser (the box with an arrow pointing up)
            </Step>
            <Step number={2} icon={<Plus className="w-5 h-5 text-primary" />}>
              Scroll down and tap <strong>"Add to Home Screen"</strong>
            </Step>
            <Step number={3} icon={<img src="/logo-transparent.png" className="w-5 h-5 object-contain invert dark:invert-0" alt="" />}>
              Tap <strong>Add</strong> — The Track will appear on your home screen like an app
            </Step>
          </div>

          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3 text-xs text-amber-700 dark:text-amber-400">
            Make sure you're using <strong>Safari</strong> — this doesn't work in Chrome on iPhone.
          </div>

          <div className="space-y-2 pt-1">
            <Button className="w-full" onClick={goToBrowser}>
              Done — I added it!
            </Button>
            <Button variant="ghost" className="w-full" onClick={goToBrowser}>
              Skip, continue in browser
            </Button>
          </div>
        </div>
      )}

      {/* Android guide */}
      {showAndroidGuide && (
        <div className="w-full max-w-sm space-y-5">
          <div className="text-center">
            <h2 className="font-semibold text-lg">Add to Home Screen</h2>
            <p className="text-xs text-muted-foreground mt-1">Follow these steps in Chrome</p>
          </div>

          <div className="space-y-3">
            <Step number={1} icon={<MoreHorizontal className="w-5 h-5 text-primary" />}>
              Tap the <strong>three-dot menu</strong> (⋮) in the top-right corner of Chrome
            </Step>
            <Step number={2} icon={<Plus className="w-5 h-5 text-primary" />}>
              Tap <strong>"Add to Home screen"</strong>
            </Step>
            <Step number={3} icon={<img src="/logo-transparent.png" className="w-5 h-5 object-contain invert dark:invert-0" alt="" />}>
              Tap <strong>Add</strong> — The Track appears on your home screen
            </Step>
          </div>

          <div className="space-y-2 pt-1">
            <Button className="w-full" onClick={goToBrowser}>
              Done — I added it!
            </Button>
            <Button variant="ghost" className="w-full" onClick={goToBrowser}>
              Skip, continue in browser
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Step({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 rounded-xl border bg-card p-4">
      <div className="flex flex-col items-center gap-1 shrink-0">
        <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
          {number}
        </div>
        <div className="mt-1">{icon}</div>
      </div>
      <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
    </div>
  );
}

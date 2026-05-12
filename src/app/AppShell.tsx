import { useEffect } from "react";
import { TopBar } from "./TopBar";
import { SectionTabs } from "./SectionTabs";
import { LeftSidebar } from "./LeftSidebar";
import { Canvas } from "./Canvas";
import { RightSidebar } from "./RightSidebar";

/**
 * Service-agnostic editor shell.
 * Locks the editor chrome to Modern Blue regardless of any
 * service-specific theme (which applies only to its quote paper).
 */
export default function AppShell() {
  useEffect(() => {
    document.documentElement.dataset.theme = "blue";
  }, []);

  return (
    <div className="editor-shell flex h-screen flex-col bg-background text-foreground">
      <TopBar />
      <div className="flex min-h-0 flex-1">
        <SectionTabs />
        <LeftSidebar />
        <Canvas />
        <RightSidebar />
      </div>
    </div>
  );
}

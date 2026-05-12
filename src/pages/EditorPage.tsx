import { useEffect } from "react";
import { Canvas } from "@/components/editor/Canvas";
import { LeftSidebar } from "@/components/editor/LeftSidebar";
import { RightSidebar } from "@/components/editor/RightSidebar";
import { SectionTabs } from "@/components/editor/SectionTabs";
import { TopBar } from "@/components/editor/TopBar";

export default function EditorPage() {
  // Editor chrome is locked to Modern Blue regardless of the document theme,
  // which is applied locally on the quote paper element.
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

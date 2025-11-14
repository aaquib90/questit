import { useState } from "react";
import { LandingPage } from "./components/LandingPage";
import { Workbench } from "./components/Workbench";
import { Toaster } from "./components/ui/sonner";

export default function App() {
  const [showWorkbench, setShowWorkbench] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState("");

  const handleGetStarted = (prompt?: string) => {
    if (prompt) {
      setInitialPrompt(prompt);
    }
    setShowWorkbench(true);
  };

  if (showWorkbench) {
    return (
      <>
        <Workbench initialPrompt={initialPrompt} />
        <Toaster />
      </>
    );
  }

  return (
    <>
      <LandingPage onGetStarted={handleGetStarted} />
      <Toaster />
    </>
  );
}
import { HashRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import { Home } from "../pages/Home"
import { Decks } from "../pages/Decks"
import { Content } from "../pages/Content"
import { Settings } from "../pages/Settings"

interface VersionsAPI {
  node: () => string;
  chrome: () => string;
  electron: () => string;
  ping: () => Promise<string>;
}

declare global {
  interface Window {
    versions: VersionsAPI;
  }
}

function App() {
  return (
    <HashRouter>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/decks" element={<Decks />} />
          <Route path="/content" element={<Content />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
        <Footer
          githubUrl="https://github.com/your-username/your-repo"
          discordUrl="https://discord.gg/your-invite"
        />
      </div>
    </HashRouter>
  );
}

export default App;

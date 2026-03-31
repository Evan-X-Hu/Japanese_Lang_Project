import { useEffect } from "react"
import { HashRouter, Routes, Route } from "react-router-dom"
import { Navbar } from "../components/navbar"
import { Footer } from "../components/footer"
import { Home } from "../pages/Home"
import { Decks } from "../pages/Decks"
import { Content } from "../pages/Content"
import { Grammars } from "../pages/Grammars"
import { Settings } from "../pages/Settings"
import { useUserStore } from "../store/userStore"
import styles from './App.module.css'

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
  const initUser = useUserStore((s) => s.initUser)

  // Restore the active session from the main process on first render
  useEffect(() => {
    initUser()
  }, [initUser])

  return (
    <HashRouter>
      <div className={styles.shell}>
        <Navbar />
        <div className={styles.main}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/decks" element={<Decks />} />
            <Route path="/content" element={<Content />} />
            <Route path="/grammar" element={<Grammars />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
        <Footer
          githubUrl="https://github.com/your-username/your-repo"
          discordUrl="https://discord.gg/your-invite"
        />
      </div>
    </HashRouter>
  );
}

export default App;

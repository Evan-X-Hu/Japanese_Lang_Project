import { Footer } from "../components/footer"
import { WelcomeSection } from "../components/welcome_section"

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
  const handlePing = async () => {
    const response = await window.versions.ping();
    console.log(response);
  };

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 py-16 sm:py-24">
        <WelcomeSection />
      </main>
      <Footer
        githubUrl="https://github.com/your-username/your-repo"
        discordUrl="https://discord.gg/your-invite"
      />
    </div>
  );
}

export default App;
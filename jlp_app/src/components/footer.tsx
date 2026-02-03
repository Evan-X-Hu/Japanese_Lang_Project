import githubLogo from '../assets/github_logo.png';
import discordLogo from '../assets/discord-logo.png';
import '../styles/footer.css';

interface FooterProps {
  githubUrl?: string;
  discordUrl?: string;
}

export function Footer({
  githubUrl = 'https://github.com',
  discordUrl = 'https://discord.com',
}: FooterProps) {
  const handleExternalLink = (url: string) => {
    // In Electron, external links should open in the default browser
    // not within the Electron window
    if (window.electron?.shell) {
      window.electron.shell.openExternal(url);
    } else {
      // Fallback for development or if shell API is not exposed
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-content">
          <p className="footer-tagline">Built for learners, by learners.</p>
          <div className="footer-social-links">
            <button
              onClick={() => handleExternalLink(githubUrl)}
              className="footer-icon-button"
              aria-label="GitHub"
              type="button"
            >
              <img src={githubLogo} alt="GitHub" className="footer-icon" />
            </button>
            <button
              onClick={() => handleExternalLink(discordUrl)}
              className="footer-icon-button"
              aria-label="Discord"
              type="button"
            >
              <img src={discordLogo} alt="Discord" className="footer-icon" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
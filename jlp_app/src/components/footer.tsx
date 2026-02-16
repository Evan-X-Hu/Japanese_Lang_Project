import githubLogo from '../assets/github_logo.png';
import discordLogo from '../assets/discord-logo.png';
import styles from './footer.module.css';

interface FooterProps {
  githubUrl?: string;
  discordUrl?: string;
}

export function Footer({
  githubUrl = 'https://github.com',
  discordUrl = 'https://discord.com',
}: FooterProps) {
  const handleExternalLink = (url: string) => {
    if (window.electron?.shell) {
      window.electron.shell.openExternal(url);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.content}>
          <p className={styles.tagline}>Built for learners, by learners.</p>
          <div className={styles.socialLinks}>
            <button
              onClick={() => handleExternalLink(githubUrl)}
              className={styles.iconButton}
              aria-label="GitHub"
              type="button"
            >
              <img src={githubLogo} alt="GitHub" className={styles.icon} />
            </button>
            <button
              onClick={() => handleExternalLink(discordUrl)}
              className={styles.iconButton}
              aria-label="Discord"
              type="button"
            >
              <img src={discordLogo} alt="Discord" className={styles.icon} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

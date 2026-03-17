import { WelcomeSection } from "../components/welcome_section"
import styles from './Home.module.css'

export function Home() {
  return (
    <main className={styles.page}>
      <WelcomeSection />
    </main>
  );
}

import { Link } from 'react-router-dom'
import { Home, Layers, BookOpen, Settings } from "lucide-react"
import styles from './navbar.module.css'

const navItems = [
  { label: "Home", to: "/", icon: Home },
  { label: "Decks", to: "/decks", icon: Layers },
  { label: "Content", to: "/content", icon: BookOpen },
  { label: "Settings", to: "/settings", icon: Settings },
]

export function Navbar() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <Link to="/" className={styles.logo}>
          Nihongo
        </Link>

        <ul className={styles.navList}>
          {navItems.map((item) => (
            <li key={item.label}>
              <Link to={item.to} className={styles.navLink}>
                <item.icon className={styles.navIcon} />
                <span className={styles.navLabel}>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  )
}

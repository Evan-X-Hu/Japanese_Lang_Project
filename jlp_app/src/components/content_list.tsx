import { Music, Video } from "lucide-react"
import styles from './content_list.module.css'

export interface ContentItem {
  id: string
  title: string
  url: string
  type: "mp3" | "mp4"
  addedAt: Date
}

interface ContentListProps {
  items: ContentItem[]
  selectedId: string | null
  onSelect: (id: string) => void
}

export function ContentList({ items, selectedId, onSelect }: ContentListProps) {
  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>
          No content yet. Import a URL above to get started.
        </p>
      </div>
    )
  }

  return (
    <div className={styles.listContainer}>
      <ul className={styles.list} role="listbox" aria-label="Content items">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              role="option"
              aria-selected={selectedId === item.id}
              onClick={() => onSelect(item.id)}
              className={`${styles.itemButton} ${selectedId === item.id ? styles.itemButtonSelected : ''}`}
            >
              <div className={styles.iconBox}>
                {item.type === "mp3" ? (
                  <Music className={styles.icon} />
                ) : (
                  <Video className={styles.icon} />
                )}
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{item.title}</span>
                <span className={styles.itemDate}>
                  {item.addedAt.toLocaleDateString()}
                </span>
              </div>
              <span className={styles.typeBadge}>{item.type}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

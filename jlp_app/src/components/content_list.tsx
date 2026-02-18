import { Music } from "lucide-react"
import type { ContentRecord } from "../types/index"
import styles from './content_list.module.css'

interface ContentListProps {
  items: ContentRecord[]
  selectedId: number | null
  onSelect: (id: number) => void
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
          <li key={item.contentId}>
            <button
              type="button"
              role="option"
              aria-selected={selectedId === item.contentId}
              onClick={() => onSelect(item.contentId)}
              className={`${styles.itemButton} ${selectedId === item.contentId ? styles.itemButtonSelected : ''}`}
            >
              <div className={styles.iconBox}>
                <Music className={styles.icon} />
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.itemTitle}>{item.title ?? 'Untitled'}</span>
                <span className={styles.itemDate}>
                  {item.author ?? ''}
                </span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

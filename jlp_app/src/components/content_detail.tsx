import type { ContentRecord } from "../types/index"
import { Music, Link as LinkIcon, User } from "lucide-react"
import styles from './content_detail.module.css'

interface ContentDetailProps {
  item: ContentRecord | null
}

export function ContentDetail({ item }: ContentDetailProps) {
  if (!item) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>Select content to view details</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.iconBox}>
          <Music className={styles.iconLg} />
        </div>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{item.title ?? 'Untitled'}</h2>
        </div>
      </div>

      <hr className={styles.separator} />

      <dl className={styles.metaList}>
        {item.author && (
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>
              <User className={styles.metaIcon} />
              <span>Author</span>
            </dt>
            <dd className={styles.metaValue}>{item.author}</dd>
          </div>
        )}
        {item.link && (
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>
              <LinkIcon className={styles.metaIcon} />
              <span>Source</span>
            </dt>
            <dd className={styles.metaValue}>
              <a href={item.link} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
                {item.link}
              </a>
            </dd>
          </div>
        )}
        {item.duration != null && (
          <div className={styles.metaRow}>
            <dt className={styles.metaLabel}>
              <span>Duration</span>
            </dt>
            <dd className={styles.metaValue}>
              {Math.floor(item.duration / 60)}:{String(Math.floor(item.duration % 60)).padStart(2, '0')}
            </dd>
          </div>
        )}
      </dl>

      {item.audio && (
        <>
          <hr className={styles.separator} />
          <div className={styles.playbackSection}>
            <h3 className={styles.playbackLabel}>Playback</h3>
            <audio controls className={styles.audio} src={`file://${item.audio}`}>
              Your browser does not support the audio element.
            </audio>
          </div>
        </>
      )}
    </div>
  )
}

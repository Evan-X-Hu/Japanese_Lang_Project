import type { ContentItem } from "./content_list"
import { Music, Video, Link as LinkIcon, Calendar } from "lucide-react"
import styles from './content_detail.module.css'

interface ContentDetailProps {
  item: ContentItem | null
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
          {item.type === "mp3" ? (
            <Music className={styles.iconLg} />
          ) : (
            <Video className={styles.iconLg} />
          )}
        </div>
        <div className={styles.headerInfo}>
          <h2 className={styles.title}>{item.title}</h2>
          <span className={styles.typeBadge}>{item.type}</span>
        </div>
      </div>

      <hr className={styles.separator} />

      <dl className={styles.metaList}>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>
            <LinkIcon className={styles.metaIcon} />
            <span>Source</span>
          </dt>
          <dd className={styles.metaValue}>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className={styles.sourceLink}>
              {item.url}
            </a>
          </dd>
        </div>
        <div className={styles.metaRow}>
          <dt className={styles.metaLabel}>
            <Calendar className={styles.metaIcon} />
            <span>Added</span>
          </dt>
          <dd className={styles.metaValue}>
            {item.addedAt.toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </dd>
        </div>
      </dl>

      <hr className={styles.separator} />

      <div className={styles.playbackSection}>
        <h3 className={styles.playbackLabel}>Playback</h3>
        {item.type === "mp3" ? (
          <audio controls className={styles.audio} src={item.url}>
            Your browser does not support the audio element.
          </audio>
        ) : (
          <video controls className={styles.video} src={item.url}>
            Your browser does not support the video element.
          </video>
        )}
      </div>
    </div>
  )
}

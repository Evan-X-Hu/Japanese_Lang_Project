import { useState, useEffect } from 'react'
import type { ContentRecord } from "../types/index"
import { Music, Link as LinkIcon, User } from "lucide-react"
import styles from './content_detail.module.css'

interface ContentDetailProps {
  item: ContentRecord | null
}

function useMediaPort(): number | null {
  const [port, setPort] = useState<number | null>(null)
  useEffect(() => {
    window.media?.getPort().then((p) => setPort(p > 0 ? p : null))
  }, [])
  return port
}

function mediaUrl(filePath: string | null | undefined, port: number | null): string | undefined {
  if (!filePath || !port) return undefined
  return `http://127.0.0.1:${port}?f=${encodeURIComponent(filePath)}`
}

export function ContentDetail({ item }: ContentDetailProps) {
  const port = useMediaPort()

  if (!item) {
    return (
      <div className={styles.emptyState}>
        <p className={styles.emptyText}>Select content to view details</p>
      </div>
    )
  }

  const videoSrc = mediaUrl(item.video, port)
  const audioSrc = mediaUrl(item.audio, port)
  const vttSrc = mediaUrl(item.vtt, port)


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

      {(item.video || item.audio) && (
        <>
          <hr className={styles.separator} />
          <div className={styles.playbackSection}>
            {item.video && (
              <>
                <h3 className={styles.playbackLabel}>Video</h3>
                <video
                  key={videoSrc}
                  controls
                  crossOrigin="anonymous"
                  className={styles.video}
                  src={videoSrc}
                  onError={(e) => console.error('[video] error:', (e.target as HTMLVideoElement).error)}
                >
                  {vttSrc && <track kind="subtitles" src={vttSrc} srcLang="ja" label="Japanese" default />}
                  Your browser does not support the video element.
                </video>
              </>
            )}
            {item.audio && (
              <>
                <h3 className={styles.playbackLabel}>Audio</h3>
                <audio
                  key={audioSrc}
                  controls
                  className={styles.audio}
                  src={audioSrc}
                  onError={(e) => console.error('[audio] error:', (e.target as HTMLAudioElement).error)}
                >
                  Your browser does not support the audio element.
                </audio>
              </>
            )}
          </div>
        </>
      )}
    </div>
  )
}

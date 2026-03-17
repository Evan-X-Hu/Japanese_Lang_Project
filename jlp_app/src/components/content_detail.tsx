import { useState, useEffect } from 'react'
import type { ContentRecord, GrammarFrequency } from "../types/index"
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

function useGrammars(contentId: number | undefined): GrammarFrequency[] {
  const [grammars, setGrammars] = useState<GrammarFrequency[]>([])
  useEffect(() => {
    if (contentId == null) { setGrammars([]); return }
    window.content?.getGrammars(contentId).then((data) => setGrammars(data ?? []))
  }, [contentId])
  return grammars
}

const JLPT_COLORS: Record<string, string> = {
  N5: styles.jlptN5,
  N4: styles.jlptN4,
  N3: styles.jlptN3,
  N2: styles.jlptN2,
  N1: styles.jlptN1,
}

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
] as const

export function ContentDetail({ item }: ContentDetailProps) {
  const port = useMediaPort()
  const grammars = useGrammars(item?.contentId)
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null)

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

  const filteredGrammars = difficultyFilter == null
    ? grammars
    : grammars.filter((g) => g.level === difficultyFilter)

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

      <hr className={styles.separator} />

      <div className={styles.contentBody}>
        {/* Left: media players */}
        <div className={styles.mediaColumn}>
          {item.video && (
            <div className={styles.playbackSection}>
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
            </div>
          )}
          {item.audio && (
            <div className={styles.playbackSection}>
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
            </div>
          )}
        </div>

        {/* Right: grammar panel */}
        {grammars.length > 0 && (
          <div className={styles.grammarColumn}>
            <div className={styles.grammarHeader}>
              <h3 className={styles.playbackLabel}>Grammar Points</h3>
              <div className={styles.levelFilters}>
                <button
                  className={`${styles.levelBtn} ${difficultyFilter === null ? styles.levelBtnActive : ''}`}
                  onClick={() => setDifficultyFilter(null)}
                >
                  All
                </button>
                {DIFFICULTY_LEVELS.map((d) => (
                  <button
                    key={d.value}
                    className={`${styles.levelBtn} ${difficultyFilter === d.value ? styles.levelBtnActive : ''}`}
                    onClick={() => setDifficultyFilter(difficultyFilter === d.value ? null : d.value)}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </div>
            <ul className={styles.grammarList}>
              {filteredGrammars.map((g) => (
                <li key={g.masterGrammarId} className={styles.grammarItem}>
                  <div className={styles.grammarTop}>
                    <span className={styles.grammarPoint}>{g.grammarPoint}</span>
                    <div className={styles.grammarMeta}>
                      {g.jlptLevel && (
                        <span className={`${styles.levelBadge} ${JLPT_COLORS[g.jlptLevel] ?? ''}`}>
                          {g.jlptLevel}
                        </span>
                      )}
                      <span className={styles.grammarFreq}>×{g.frequency}</span>
                    </div>
                  </div>
                  {g.meaning && <p className={styles.grammarMeaning}>{g.meaning}</p>}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import type { SegmentWithContent } from '../types/index'
import { useUserStore } from '../store/userStore'
import styles from './grammar_detail.module.css'

interface GrammarInfo {
  masterGrammarId: number
  grammarPoint: string | null
  meaning: string | null
  notes?: string | null
  jlptLevel: string | null
  level?: number | null
}

interface GrammarDetailProps {
  grammar: GrammarInfo
  contentId?: number
  onBack: () => void
}

const JLPT_COLORS: Record<string, string> = {
  N5: styles.jlptN5,
  N4: styles.jlptN4,
  N3: styles.jlptN3,
  N2: styles.jlptN2,
  N1: styles.jlptN1,
}

const DIFFICULTY_LABELS: Record<number, string> = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
}

function formatTime(seconds: number | null): string {
  if (seconds == null) return '--:--'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function GrammarDetail({ grammar, contentId, onBack }: GrammarDetailProps) {
  const currentUser = useUserStore((s) => s.currentUser)
  const [segments, setSegments] = useState<SegmentWithContent[]>([])

  useEffect(() => {
    if (!currentUser) return
    if (contentId != null) {
      window.grammar
        ?.getSegmentsByContent(grammar.masterGrammarId, contentId)
        .then((data) => setSegments(data ?? []))
    } else {
      window.grammar
        ?.getSegments(grammar.masterGrammarId, currentUser.userId)
        .then((data) => setSegments(data ?? []))
    }
  }, [grammar.masterGrammarId, contentId, currentUser])

  // For the grammars page (no contentId): group segments by content
  const grouped = contentId == null
    ? segments.reduce<Record<number, { title: string | null; items: SegmentWithContent[] }>>((acc, seg) => {
        const cid = seg.contentId ?? 0
        if (!acc[cid]) acc[cid] = { title: seg.title ?? null, items: [] }
        acc[cid].items.push(seg)
        return acc
      }, {})
    : null

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack}>
        <ArrowLeft className={styles.backIcon} />
        <span>Back</span>
      </button>

      <div className={styles.grammarInfo}>
        <div className={styles.grammarHeader}>
          <span className={styles.grammarPoint}>{grammar.grammarPoint}</span>
          <div className={styles.badges}>
            {grammar.jlptLevel && (
              <span className={`${styles.levelBadge} ${JLPT_COLORS[grammar.jlptLevel] ?? ''}`}>
                {grammar.jlptLevel}
              </span>
            )}
            {grammar.level != null && (
              <span className={styles.difficultyBadge}>
                {DIFFICULTY_LABELS[grammar.level] ?? ''}
              </span>
            )}
          </div>
        </div>
        {grammar.meaning && <p className={styles.meaning}>{grammar.meaning}</p>}
        {grammar.notes && <p className={styles.notes}>{grammar.notes}</p>}
      </div>

      <hr className={styles.separator} />

      <div className={styles.sentenceSection}>
        <p className={styles.sectionLabel}>
          {contentId != null ? 'Sentences in this content' : 'All sentences'}
        </p>

        {segments.length === 0 ? (
          <p className={styles.emptyText}>No sentences found.</p>
        ) : contentId != null ? (
          // Content view: flat list with timestamps
          <ul className={styles.sentenceList}>
            {segments.map((seg) => (
              <li key={seg.segmentId} className={styles.sentenceCard}>
                <span className={styles.timestamp}>{formatTime(seg.startTime)}</span>
                <p className={styles.sentenceText}>{seg.text}</p>
              </li>
            ))}
          </ul>
        ) : (
          // Grammars view: grouped by content
          Object.entries(grouped!).map(([cid, group]) => (
            <div key={cid} className={styles.contentGroup}>
              <p className={styles.contentTitle}>{group.title ?? 'Untitled'}</p>
              <ul className={styles.sentenceList}>
                {group.items.map((seg) => (
                  <li key={seg.segmentId} className={styles.sentenceCard}>
                    <span className={styles.timestamp}>{formatTime(seg.startTime)}</span>
                    <p className={styles.sentenceText}>{seg.text}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

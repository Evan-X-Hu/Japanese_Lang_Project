import { useState, useEffect } from 'react'
import type { MasterGrammarRecord } from '../types/index'
import { useUserStore } from '../store/userStore'
import { GrammarDetail } from '../components/grammar_detail'
import styles from './Grammars.module.css'

const JLPT_LEVELS = ['N5', 'N4', 'N3', 'N2', 'N1'] as const

const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Easy' },
  { value: 2, label: 'Medium' },
  { value: 3, label: 'Hard' },
] as const

const JLPT_COLORS: Record<string, string> = {
  N5: styles.jlptN5,
  N4: styles.jlptN4,
  N3: styles.jlptN3,
  N2: styles.jlptN2,
  N1: styles.jlptN1,
}

interface PendingEdit {
  level: number | null
  notes: string
}

interface GrammarCardProps {
  g: MasterGrammarRecord
  onSaved: (updated: MasterGrammarRecord) => void
}

function GrammarCard({ g, onSaved }: GrammarCardProps) {
  const [pending, setPending] = useState<PendingEdit>({
    level: g.level,
    notes: g.notes ?? '',
  })
  const [saving, setSaving] = useState(false)

  const isDirty =
    pending.level !== g.level ||
    pending.notes !== (g.notes ?? '')

  async function handleUpdate() {
    if (!isDirty) return
    setSaving(true)
    try {
      const updated = await window.grammar?.update(g.masterGrammarId, {
        level: pending.level,
        notes: pending.notes.trim() === '' ? null : pending.notes.trim(),
      })
      if (updated) onSaved(updated)
    } finally {
      setSaving(false)
    }
  }

  return (
    <li className={styles.card}>
      <div className={styles.cardTop}>
        <span className={styles.grammarPoint}>{g.grammarPoint}</span>
        {g.jlptLevel && (
          <span className={`${styles.levelBadge} ${JLPT_COLORS[g.jlptLevel] ?? ''}`}>
            {g.jlptLevel}
          </span>
        )}
      </div>
      {g.meaning && <p className={styles.meaning}>{g.meaning}</p>}
      <div className={styles.cardControls}>
        <select
          className={styles.difficultySelect}
          value={pending.level ?? ''}
          onChange={(e) => setPending((p) => ({ ...p, level: e.target.value === '' ? null : Number(e.target.value) }))}
        >
          <option value="">— difficulty —</option>
          {DIFFICULTY_LEVELS.map((d) => (
            <option key={d.value} value={d.value}>{d.label}</option>
          ))}
        </select>
        <textarea
          className={styles.notesInput}
          placeholder="Add notes..."
          value={pending.notes}
          onChange={(e) => setPending((p) => ({ ...p, notes: e.target.value }))}
        />
        <button
          className={`${styles.updateBtn} ${isDirty ? styles.updateBtnActive : styles.updateBtnInactive}`}
          onClick={handleUpdate}
          disabled={!isDirty || saving}
        >
          {saving ? 'Saving...' : 'Update'}
        </button>
      </div>
    </li>
  )
}

export function Grammars() {
  const currentUser = useUserStore((s) => s.currentUser)
  const [grammars, setGrammars] = useState<MasterGrammarRecord[]>([])
  const [jlptFilter, setJlptFilter] = useState<string | null>(null)
  const [difficultyFilter, setDifficultyFilter] = useState<number | null>(null)
  const [selectedGrammar, setSelectedGrammar] = useState<MasterGrammarRecord | null>(null)

  useEffect(() => {
    if (!currentUser) return
    window.grammar?.getAll(currentUser.userId).then((data) => setGrammars(data ?? []))
  }, [currentUser])

  function handleSaved(updated: MasterGrammarRecord) {
    setGrammars((prev) => prev.map((g) => g.masterGrammarId === updated.masterGrammarId ? updated : g))
  }

  const filtered = grammars.filter((g) => {
    if (jlptFilter && g.jlptLevel !== jlptFilter) return false
    if (difficultyFilter != null && g.level !== difficultyFilter) return false
    return true
  })

  if (!currentUser) {
    return (
      <div className={styles.page}>
        <p className={styles.emptyText}>Sign in from Settings to view grammar.</p>
      </div>
    )
  }

  if (selectedGrammar) {
    return (
      <div className={styles.page}>
        <GrammarDetail
          grammar={selectedGrammar}
          onBack={() => setSelectedGrammar(null)}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Grammar</h1>

      <div className={styles.toolbar}>
        <button
          className={`${styles.levelBtn} ${jlptFilter === null ? styles.levelBtnActive : ''}`}
          onClick={() => setJlptFilter(null)}
        >
          All Levels
        </button>
        {JLPT_LEVELS.map((lvl) => (
          <button
            key={lvl}
            className={`${styles.levelBtn} ${jlptFilter === lvl ? styles.levelBtnActive : ''}`}
            onClick={() => setJlptFilter(jlptFilter === lvl ? null : lvl)}
          >
            {lvl}
          </button>
        ))}

        <div className={styles.divider} />

        <button
          className={`${styles.difficultyBtn} ${difficultyFilter === null ? styles.difficultyBtnActive : ''}`}
          onClick={() => setDifficultyFilter(null)}
        >
          All
        </button>
        {DIFFICULTY_LEVELS.map((d) => (
          <button
            key={d.value}
            className={`${styles.difficultyBtn} ${difficultyFilter === d.value ? styles.difficultyBtnActive : ''}`}
            onClick={() => setDifficultyFilter(difficultyFilter === d.value ? null : d.value)}
          >
            {d.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <p className={styles.emptyText}>No grammar points found.</p>
      ) : (
        <div className={styles.list}>
          {filtered.map((g) => (
            <div key={g.masterGrammarId} className={styles.cardWrapper} onClick={() => setSelectedGrammar(g)}>
              <GrammarCard g={g} onSaved={handleSaved} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

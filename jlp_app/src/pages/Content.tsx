import { useState, useMemo } from "react"
import { Download, Search, Loader, ArrowLeft } from "lucide-react"
import { ContentList } from "../components/content_list"
import { ContentDetail } from "../components/content_detail"
import { useContent } from "../hooks/useContent"
import { useUserStore } from "../store/userStore"
import styles from './Content.module.css'

export function Content() {
  const currentUser = useUserStore((s) => s.currentUser)
  const [url, setUrl] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [importing, setImporting] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'detail'>('list')

  const { items, error: hookError, importUrl } = useContent()

  const error = localError ?? hookError

  async function handleImport() {
    setLocalError(null)
    const trimmed = url.trim()

    if (!trimmed) {
      setLocalError("Please enter a URL.")
      return
    }

    try {
      new URL(trimmed)
    } catch {
      setLocalError("Please enter a valid URL.")
      return
    }

    setImporting(true)
    try {
      const result = await importUrl(trimmed)
      if (result) {
        setSelectedId(result.contentId)
        setView('detail')
      }
      setUrl("")
    } catch {
      setLocalError("Import failed. Check the URL and try again.")
    } finally {
      setImporting(false)
    }
  }

  function handleSelect(id: number) {
    setSelectedId(id)
    setView('detail')
  }

  function handleBack() {
    setView('list')
    setSelectedId(null)
  }

  const filteredItems = useMemo(() => {
    if (searchQuery === "") return items
    return items.filter((item) => {
      const q = searchQuery.toLowerCase()
      return (
        (item.title?.toLowerCase().includes(q) ?? false) ||
        (item.author?.toLowerCase().includes(q) ?? false) ||
        (item.link?.toLowerCase().includes(q) ?? false)
      )
    })
  }, [items, searchQuery])

  const selectedItem = useMemo(() => {
    return items.find((item) => item.contentId === selectedId) ?? null
  }, [items, selectedId])

  if (view === 'detail') {
    return (
      <div className={styles.page}>
        <button className={styles.backButton} onClick={handleBack}>
          <ArrowLeft className={styles.backIcon} />
          <span>Back to Library</span>
        </button>
        <ContentDetail item={selectedItem} />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <section aria-label="Import content">
        <h1 className={styles.heading}>Content</h1>
        <p className={styles.description}>
          Import audio and video content by URL to build your library.
        </p>
        {currentUser ? (
          <>
            <div className={styles.importRow}>
              <input
                value={url}
                onChange={(e) => { setUrl(e.target.value); setLocalError(null) }}
                onKeyDown={(e) => { if (e.key === "Enter" && !importing) handleImport() }}
                placeholder="https://www.youtube.com/watch?v=..."
                className={styles.importInput}
                aria-label="Content URL"
                disabled={importing}
              />
              <button onClick={handleImport} className={styles.importButton} disabled={importing}>
                {importing ? (
                  <Loader className={styles.buttonIcon} />
                ) : (
                  <Download className={styles.buttonIcon} />
                )}
                <span>{importing ? "Importing..." : "Import"}</span>
              </button>
            </div>
            {error && <p className={styles.error} role="alert">{error}</p>}
          </>
        ) : (
          <p className={styles.signInNotice}>Sign in from Settings to import content.</p>
        )}
      </section>

      <section className={styles.toolbar} aria-label="Search and filter">
        <div className={styles.searchWrapper}>
          <Search className={styles.searchIcon} />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search content..."
            className={styles.searchInput}
            aria-label="Search content"
          />
        </div>
      </section>

      <ContentList items={filteredItems} selectedId={selectedId} onSelect={handleSelect} />
    </div>
  )
}

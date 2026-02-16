import { useState, useMemo } from "react"
import { Download, Search } from "lucide-react"
import { ContentList } from "../components/content_list"
import { ContentDetail } from "../components/content_detail"
import type { ContentItem } from "../components/content_list"
import styles from './Content.module.css'

type FilterType = "all" | "mp3" | "mp4"

function extractTitle(url: string): string {
  try {
    const pathname = new URL(url).pathname
    const filename = pathname.split("/").pop() || "Untitled"
    return decodeURIComponent(filename.replace(/\.(mp3|mp4)$/i, ""))
  } catch {
    return "Untitled"
  }
}

// function getMediaType(url: string): "mp3" | "mp4" | null {
//   const lower = url.toLowerCase().trim()
//   if (lower.endsWith(".mp3")) return "mp3"
//   if (lower.endsWith(".mp4")) return "mp4"
//   return null
// }

const filterButtons: { label: string; value: FilterType }[] = [
  { label: "All", value: "all" },
  { label: "MP3", value: "mp3" },
  { label: "MP4", value: "mp4" },
]

export function Content() {
  const [url, setUrl] = useState("") // TODO: Make sure this is validated
  const [contentItems, setContentItems] = useState<ContentItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [error, setError] = useState<string | null>(null)

  function handleImport() {
    setError(null)
    const trimmed = url.trim()

    if (!trimmed) {
      setError("Please enter a URL.")
      return
    }

    // const mediaType = getMediaType(trimmed)
    // if (!mediaType) {
    //   setError("URL must end in .mp3 or .mp4")
    //   return
    // }

    try {
      new URL(trimmed)
    } catch {
      setError("Please enter a valid URL.")
      return
    }

    // const newItem: ContentItem = {
    //   id: Date.now().toString(36) + Math.random().toString(36).slice(2),
    //   title: extractTitle(trimmed),
    //   url: trimmed,
    //   type: mediaType,
    //   addedAt: new Date(),
    // }

    // setContentItems((prev) => [newItem, ...prev])
    // setSelectedId(newItem.id)
    setUrl("")
  }

  const filteredItems = useMemo(() => {
    return contentItems.filter((item) => {
      const matchesType = filterType === "all" || item.type === filterType
      const matchesSearch =
        searchQuery === "" ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.url.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesType && matchesSearch
    })
  }, [contentItems, filterType, searchQuery])

  const selectedItem = useMemo(() => {
    return contentItems.find((item) => item.id === selectedId) ?? null
  }, [contentItems, selectedId])

  return (
    <div className={styles.page}>
      <section aria-label="Import content">
        <h1 className={styles.heading}>Content</h1>
        <p className={styles.description}>
          Import audio and video content by URL to build your library.
        </p>
        <div className={styles.importRow}>
          <input
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(null) }}
            onKeyDown={(e) => { if (e.key === "Enter") handleImport() }}
            placeholder="https://example.com/lesson.mp3"
            className={styles.importInput}
            aria-label="Content URL"
          />
          <button onClick={handleImport} className={styles.importButton}>
            <Download className={styles.buttonIcon} />
            <span>Import</span>
          </button>
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
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
        <div className={styles.filterGroup} role="group" aria-label="Filter by type">
          {filterButtons.map((fb) => (
            <button
              key={fb.value}
              onClick={() => setFilterType(fb.value)}
              aria-pressed={filterType === fb.value}
              className={`${styles.filterButton} ${filterType === fb.value ? styles.filterButtonActive : ''}`}
            >
              {fb.label}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.library} aria-label="Content library">
        <div className={styles.listPane}>
          <ContentList items={filteredItems} selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <div className={styles.detailPane}>
          <ContentDetail item={selectedItem} />
        </div>
      </section>
    </div>
  )
}

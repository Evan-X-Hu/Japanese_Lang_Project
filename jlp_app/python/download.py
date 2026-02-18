"""
download.py — Download audio, subtitles, and metadata from a URL using yt-dlp.
Parses VTT subtitles and merges segments into sentences.

Usage:
    python3 download.py <url> <output_dir>

Outputs a JSON object to stdout. All progress/debug goes to stderr.
"""

import sys
import json
import re
import glob
from pathlib import Path
import yt_dlp


# ── yt-dlp download ─────────────────────────────────────────────

def download_media_with_subtitles(url, output_dir):
    """
    Download audio as MP3, subtitles (VTT), and metadata from a URL.
    Returns a dict with metadata and file paths, or None on failure.
    """
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    ydl_opts = {
        # Audio
        'format': 'bestaudio/best',
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'mp3',
            'preferredquality': '192',
        }],

        # Output
        'outtmpl': f'{output_dir}/%(title)s.%(ext)s',

        # Subtitles
        'writesubtitles': True,
        'writeautomaticsub': True,
        'subtitleslangs': ['ja'],
        'subtitlesformat': 'vtt',

        # Metadata
        'writeinfojson': True,
        'writethumbnail': False,

        # Rate limiting
        'sleep_interval_requests': 2,
        'sleep_interval_subtitles': 10,
        'sleep_interval': 1,

        # Send all progress to stderr, keep stdout clean for JSON
        'quiet': True,
        'no_warnings': True,
        'logger': StderrLogger(),
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(url, download=False)
            log(f"Downloading: {info.get('title')}")

            ydl.download([url])

            return {
                'title': info.get('title'),
                'duration': info.get('duration'),
                'author': info.get('uploader'),
                'upload_date': info.get('upload_date'),
                'link': url,
                'output_dir': output_dir,
            }
    except Exception as e:
        log(f"Download error: {e}")
        return None


# ── VTT parsing ──────────────────────────────────────────────────

def parse_timeframe(timeframe):
    """Convert a VTT timestamp line into (start_seconds, end_seconds)."""
    timeframe = re.sub(r"align.*", "", timeframe)
    timeframe = re.sub(r" --> ", ":", timeframe)
    parts = timeframe.split(":")
    s_hour, s_min, s_sec = int(parts[0]), int(parts[1]), float(parts[2])
    e_hour, e_min, e_sec = int(parts[3]), int(parts[4]), float(parts[5])
    start = round((3600 * s_hour) + (60 * s_min) + s_sec, 2)
    end = round((3600 * e_hour) + (60 * e_min) + e_sec, 2)
    return start, end


def vtt_clean(input_file):
    """
    Parse a VTT subtitle file into a list of segments:
    [{ start_time, end_time, text }, ...]
    """
    input_path = Path(input_file)
    if not input_path.exists():
        raise FileNotFoundError(f"VTT file not found: {input_path}")

    content = input_path.read_text(encoding='utf-8')

    # Remove extra blank lines
    content = re.sub(r"\n\n\n|\n\n", "\n", content)

    # Remove lines with tags and header lines
    content = '\n'.join(
        line for line in content.split('\n')
        if '<c>' not in line
        and '</c>' not in line
        and 'WEBVTT' not in line
        and 'Kind: captions' not in line
        and 'Language: ja' not in line
    )

    lines = [item for item in content.split("\n") if item not in ('', ' ')]
    num_lines = len(lines) - 1
    data = []

    for i in range(num_lines):
        if "-->" not in lines[i]:
            continue
        if "-->" in lines[i + 1]:
            continue

        start_time, end_time = parse_timeframe(lines[i])
        if (end_time - start_time) < 0.5:
            continue

        data.append({
            'start_time': start_time,
            'end_time': end_time,
            'text': lines[i + 1],
        })

    return data


# ── Segment → sentence merging ───────────────────────────────────

def segs_to_sents(data):
    """
    Merge VTT segments into complete sentences by detecting
    Japanese sentence-ending punctuation (。？！!.?).
    Returns [{ seq_index, start_time, end_time, text }, ...]
    """
    if not data:
        return []

    result = []
    num_segs = len(data)
    start_time = data[0]['start_time']
    end_time = 0
    index = 0
    sent_index = 0
    acc_sent = ""

    while index < num_segs:
        end_time = data[index]['end_time']

        sent_blocks = re.split(r'(?<=[。？！!.?])', data[index]['text'])
        sent_blocks = [s for s in sent_blocks if s != ""]

        for block in sent_blocks:
            acc_sent += block

            if re.search(r'[。？！!.?]$', acc_sent):
                result.append({
                    'seq_index': sent_index,
                    'start_time': start_time,
                    'end_time': end_time,
                    'text': acc_sent,
                })
                sent_index += 1
                start_time = data[index]['start_time']
                acc_sent = ""

        index += 1
        if acc_sent == "" and index < num_segs:
            start_time = data[index]['start_time']

    # Flush any remaining accumulated text as a final segment
    if acc_sent:
        result.append({
            'seq_index': sent_index,
            'start_time': start_time,
            'end_time': end_time,
            'text': acc_sent,
        })

    return result


# ── Helpers ──────────────────────────────────────────────────────

class StderrLogger:
    """Route yt-dlp log output to stderr."""
    def debug(self, msg):
        print(msg, file=sys.stderr)
    def warning(self, msg):
        print(f"WARNING: {msg}", file=sys.stderr)
    def error(self, msg):
        print(f"ERROR: {msg}", file=sys.stderr)


def log(msg):
    """Print a message to stderr."""
    print(msg, file=sys.stderr)


def find_file(output_dir, title, extension):
    """Find a downloaded file by title and extension using glob."""
    pattern = f"{output_dir}/{title}.{extension}"
    matches = glob.glob(pattern)
    if matches:
        return matches[0]
    # Fallback: search for any file with the extension
    pattern = f"{output_dir}/*.{extension}"
    matches = glob.glob(pattern)
    # Return the most recently modified match
    if matches:
        return max(matches, key=lambda f: Path(f).stat().st_mtime)
    return None


# ── Main ─────────────────────────────────────────────────────────

def main():
    if len(sys.argv) != 3:
        print("Usage: python3 download.py <url> <output_dir>", file=sys.stderr)
        sys.exit(1)

    url = sys.argv[1]
    output_dir = sys.argv[2]

    # Step 1: Download media, subtitles, metadata
    result = download_media_with_subtitles(url, output_dir)
    if result is None:
        print("Download failed", file=sys.stderr)
        sys.exit(1)

    title = result['title']

    # Step 2: Find the downloaded MP3 file
    audio_path = find_file(output_dir, title, "mp3")
    if not audio_path:
        log("Warning: MP3 file not found")

    # Step 3: Find and parse VTT subtitle file
    vtt_path = find_file(output_dir, f"{title}.ja", "vtt")
    segments = []
    if vtt_path:
        log(f"Parsing VTT: {vtt_path}")
        raw_segments = vtt_clean(vtt_path)
        segments = segs_to_sents(raw_segments)
        log(f"Parsed {len(segments)} sentences from {len(raw_segments)} segments")
    else:
        log("Warning: VTT subtitle file not found, no segments will be created")

    # Step 4: Output JSON to stdout
    output = {
        'title': result['title'],
        'duration': result['duration'],
        'author': result['author'],
        'upload_date': result['upload_date'],
        'link': result['link'],
        'audio_path': audio_path,
        'segments': segments,
    }

    print(json.dumps(output, ensure_ascii=False))


if __name__ == '__main__':
    main()

"""
JLPT Grammar PDF Parser
=======================
Extracts grammar points and example sentences from JLPTsensei Grammar Master PDFs.
Supports N5, N4, N3, N2 (and likely N1) format variations.

Requirements:
    pip install pdfplumber

Usage:
------
from jlpt_grammar_parser import parse_jlpt_grammar_pdf, print_stats
import pandas as pd

# Parse a single PDF
result = parse_jlpt_grammar_pdf("path/to/N4.pdf", level="N4")
df = pd.DataFrame(result['sentences'])

# Parse multiple levels
pdfs = {
    'N5': 'path/to/N5.pdf',
    'N4': 'path/to/N4.pdf',
    'N3': 'path/to/N3.pdf',
    'N2': 'path/to/N2.pdf',
}

all_sentences = []
for level, path in pdfs.items():
    result = parse_jlpt_grammar_pdf(path, level=level)
    print_stats(result)
    all_sentences.extend(result['sentences'])

df = pd.DataFrame(all_sentences)
"""

import pdfplumber
import re
import warnings
from typing import Dict, List, Optional

# Suppress pdfplumber font warnings
warnings.filterwarnings('ignore', message='.*FontBBox.*')
warnings.filterwarnings('ignore', message='.*Could not get.*')


def get_content_start_page(level: str) -> int:
    """Get the first content page number for each JLPT level."""
    content_starts = {
        'N5': 6,
        'N4': 8,
        'N3': 8,
        'N2': 11,
        'N1': 11,
    }
    return content_starts.get(level, 8)


def is_toc_page(text: str) -> bool:
    """Check if a page is a Table of Contents page."""
    if not text:
        return False
    first_200 = text[:200]
    return ('# ' in first_200 or '文法' in first_200) and ('Page' in first_200 or 'Meaning' in first_200[:100])


def extract_grammar_header(text: str) -> Optional[Dict]:
    """Extract grammar point header information from page text."""
    header_pattern = re.compile(
        r'^([\u3000-\u9fff\u30a0-\u30ff〜～・&\s\[\]（）\u0080-\u00ff]+?)\n'
        r'(?:([\u3000-\u9fff\u30a0-\u30ff]+)\n)?'
        r'Meaning\s+How To Use\n'
        r'([^\n]+)',
        re.MULTILINE
    )
    
    match = header_pattern.search(text)
    if match:
        grammar_jp = match.group(1).strip().replace('\n', ' ')
        furigana = match.group(2).strip().replace('\n', ' ') if match.group(2) else None
        meaning = match.group(3).strip()
        
        return {
            'grammar_point': grammar_jp,
            'furigana': furigana,
            'meaning': meaning.split('\n')[0]
        }
    return None


def extract_examples_standard(text: str) -> List[Dict]:
    """
    Extract examples in standard format (N4, N5, N3):
    1. Japanese sentence
    romaji (lowercase)
    English translation
    """
    examples = []
    
    pattern = re.compile(
        r'^(\d{1,2})\.\s*'
        r'([^\n]+)\n'
        r'([a-z][^\n]+)\n'
        r'([^\n]+)',
        re.MULTILINE
    )
    
    for match in pattern.finditer(text):
        num = int(match.group(1))
        japanese = match.group(2).strip()
        romaji = match.group(3).strip()
        english = match.group(4).strip()
        
        if len(japanese) >= 5:
            examples.append({
                'number': num,
                'japanese': japanese,
                'romaji': romaji,
                'english': english
            })
    
    return examples


def extract_examples_n2_style(text: str) -> List[Dict]:
    """
    Extract examples in N2 style format where furigana may wrap to multiple lines:
    1. Japanese sentence
    furigana reading (may wrap)
    English translation (starts with capital)
    """
    examples = []
    
    # Find all positions of "N. " where N is 1-10
    pattern = re.compile(r'^(\d{1,2})\.\s*', re.MULTILINE)
    matches = list(pattern.finditer(text))
    
    for i, match in enumerate(matches):
        start = match.start()
        end = matches[i + 1].start() if i + 1 < len(matches) else len(text)
        
        block_text = text[start:end].strip()
        num = int(match.group(1))
        
        lines = block_text.split('\n')
        
        if len(lines) >= 3:
            # First line: "N. Japanese sentence"
            japanese = re.sub(r'^\d+\.\s*', '', lines[0]).strip()
            
            # Find English (line starting with capital letter)
            english_idx = None
            for j in range(1, len(lines)):
                line = lines[j].strip()
                if line and len(line) > 0 and line[0].isupper():
                    english_idx = j
                    break
            
            if english_idx:
                # Furigana/romaji is everything between Japanese and English
                romaji_lines = lines[1:english_idx]
                romaji = ' '.join(line.strip() for line in romaji_lines).strip()
                
                # English might span multiple lines
                english_lines = lines[english_idx:]
                english_parts = []
                for line in english_lines:
                    if 'JLPTsensei' in line or 'Practice writing' in line:
                        break
                    english_parts.append(line.strip())
                english = ' '.join(english_parts).strip()
                
                if len(japanese) >= 5 and len(english) >= 5:
                    examples.append({
                        'number': num,
                        'japanese': japanese,
                        'romaji': romaji,
                        'english': english
                    })
    
    return examples


def extract_examples(text: str, level: str) -> List[Dict]:
    """Extract examples using the appropriate method for the level."""
    if level == 'N2' or level == 'N1':
        # N2/N1 have furigana that may wrap
        examples = extract_examples_n2_style(text)
        # Fall back to standard if N2 style finds nothing
        if not examples:
            examples = extract_examples_standard(text)
    else:
        # N5, N4, N3 use standard format
        examples = extract_examples_standard(text)
        # Try N2 style as fallback
        if not examples:
            examples = extract_examples_n2_style(text)
    
    return examples


def parse_jlpt_grammar_pdf(
    pdf_path: str,
    level: str = "N4",
    verbose: bool = False
) -> Dict:
    """
    Parse a JLPTsensei Grammar Master PDF and extract all grammar points with examples.
    
    Args:
        pdf_path: Path to the PDF file
        level: JLPT level (N5, N4, N3, N2, N1)
        verbose: Print progress information
    
    Returns:
        Dictionary containing:
        - 'grammar_points': List of grammar point dictionaries
        - 'sentences': Flat list of all sentences with grammar labels
        - 'stats': Summary statistics
    """
    
    content_start = get_content_start_page(level)
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        
        if verbose:
            print(f"Processing {level}: {total_pages} pages, content starts at page {content_start}")
        
        grammar_data = []
        current_grammar = None
        grammar_id = 0
        
        for page_idx, page in enumerate(pdf.pages):
            page_num = page_idx + 1
            text = page.extract_text()
            
            if not text:
                continue
            
            # Skip TOC and early pages
            if page_num < content_start:
                continue
            
            # Skip TOC pages that might appear later
            if is_toc_page(text):
                continue
            
            # Check for new grammar point header
            header_info = extract_grammar_header(text)
            if header_info:
                grammar_id += 1
                current_grammar = {
                    'id': grammar_id,
                    'grammar_point': header_info['grammar_point'],
                    'furigana': header_info['furigana'],
                    'meaning': header_info['meaning'],
                    'jlpt_level': level,
                    'page': page_num,
                    'examples': []
                }
                grammar_data.append(current_grammar)
            
            # Extract examples from this page
            if current_grammar:
                examples = extract_examples(text, level)
                
                # Add examples, avoiding duplicates
                existing_nums = {e['number'] for e in current_grammar['examples']}
                for ex in examples:
                    if ex['number'] not in existing_nums:
                        current_grammar['examples'].append(ex)
                        existing_nums.add(ex['number'])
        
        # Sort examples within each grammar point
        for g in grammar_data:
            g['examples'].sort(key=lambda x: x['number'])
        
        # Create flat sentence list
        sentences = []
        for g in grammar_data:
            display_name = g['grammar_point']
            if g['furigana'] and g['furigana'] not in display_name:
                display_name = f"{g['grammar_point']} ({g['furigana']})"
            
            for ex in g['examples']:
                sentences.append({
                    'grammar_id': g['id'],
                    'grammar_point': g['grammar_point'],
                    'furigana': g['furigana'] or '',
                    'display_name': display_name,
                    'meaning': g['meaning'],
                    'jlpt_level': g['jlpt_level'],
                    'page': g['page'],
                    'example_num': ex['number'],
                    'sentence_japanese': ex['japanese'],
                    'sentence_romaji': ex['romaji'],
                    'sentence_english': ex['english']
                })
        
        # Calculate statistics
        total_examples = sum(len(g['examples']) for g in grammar_data)
        example_counts = [len(g['examples']) for g in grammar_data]
        
        stats = {
            'level': level,
            'total_pages': total_pages,
            'grammar_points': len(grammar_data),
            'total_sentences': total_examples,
            'avg_sentences_per_grammar': round(total_examples / len(grammar_data), 1) if grammar_data else 0,
            'min_examples': min(example_counts) if example_counts else 0,
            'max_examples': max(example_counts) if example_counts else 0,
            'grammar_with_zero_examples': sum(1 for c in example_counts if c == 0),
        }
        
        return {
            'grammar_points': grammar_data,
            'sentences': sentences,
            'stats': stats
        }


def print_stats(result: Dict) -> None:
    """Print summary statistics for parsed data."""
    stats = result['stats']
    print("=" * 60)
    print(f"JLPT {stats['level']} Grammar Extraction Results")
    print("=" * 60)
    print(f"  Total pages:        {stats['total_pages']}")
    print(f"  Grammar points:     {stats['grammar_points']}")
    print(f"  Total sentences:    {stats['total_sentences']}")
    print(f"  Avg per grammar:    {stats['avg_sentences_per_grammar']}")
    print(f"  Min/Max examples:   {stats['min_examples']} / {stats['max_examples']}")
    print(f"  Zero examples:      {stats['grammar_with_zero_examples']}")
    print()


def parse_multiple_pdfs(pdf_paths: Dict[str, str], verbose: bool = False) -> Dict:
    """
    Parse multiple JLPT grammar PDFs and combine results.
    
    Args:
        pdf_paths: Dictionary mapping level to file path
        verbose: Print progress information
    
    Returns:
        Dictionary with combined results
    """
    all_grammar = []
    all_sentences = []
    all_stats = {}
    
    for level, path in pdf_paths.items():
        if verbose:
            print(f"\nProcessing {level}...")
        
        result = parse_jlpt_grammar_pdf(path, level=level, verbose=verbose)
        
        all_grammar.extend(result['grammar_points'])
        all_sentences.extend(result['sentences'])
        all_stats[level] = result['stats']
        
        if verbose:
            print_stats(result)
    
    combined_stats = {
        'total_grammar_points': sum(s['grammar_points'] for s in all_stats.values()),
        'total_sentences': sum(s['total_sentences'] for s in all_stats.values()),
        'per_level': all_stats
    }
    
    return {
        'grammar_points': all_grammar,
        'sentences': all_sentences,
        'stats': combined_stats
    }

def extract_grammar_patterns(
    pdf_path: str,
    level: str = "N4"
) -> List[Dict]:
    """
    Extract only grammar patterns and their meanings (no example sentences).
    
    Args:
        pdf_path: Path to the PDF file
        level: JLPT level (N5, N4, N3, N2, N1)
    
    Returns:
        List of dictionaries with grammar pattern info:
        - id, grammar_point, furigana, meaning, jlpt_level, page
    """
    content_start = get_content_start_page(level)
    patterns = []
    
    with pdfplumber.open(pdf_path) as pdf:
        grammar_id = 0
        
        for page_idx, page in enumerate(pdf.pages):
            page_num = page_idx + 1
            text = page.extract_text()
            
            if not text or page_num < content_start:
                continue
            
            if is_toc_page(text):
                continue
            
            header_info = extract_grammar_header(text)
            if header_info:
                grammar_id += 1
                patterns.append({
                    'id': grammar_id,
                    'grammar_point': header_info['grammar_point'],
                    'furigana': header_info['furigana'],
                    'meaning': header_info['meaning'],
                    'jlpt_level': level,
                    'page': page_num
                })
    
    return patterns


def extract_all_grammar_patterns(pdf_paths: Dict[str, str]) -> List[Dict]:
    """
    Extract grammar patterns from multiple PDFs.
    
    Args:
        pdf_paths: Dictionary mapping level to file path
                   e.g., {'N5': 'path/to/N5.pdf', 'N4': 'path/to/N4.pdf'}
    
    Returns:
        List of all grammar patterns across all levels
    
    Example:
        pdfs = {
            'N5': 'N5.pdf',
            'N4': 'N4.pdf',
            'N3': 'N3.pdf',
            'N2': 'N2.pdf',
        }
        patterns = extract_all_grammar_patterns(pdfs)
        df = pd.DataFrame(patterns)
    """
    all_patterns = []
    
    for level, path in pdf_paths.items():
        patterns = extract_grammar_patterns(path, level=level)
        all_patterns.extend(patterns)
    
    return all_patterns

if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python jlpt_grammar_parser.py <pdf_path> [level]")
        print("Example: python jlpt_grammar_parser.py N4_Grammar.pdf N4")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    level = sys.argv[2] if len(sys.argv) > 2 else "N4"
    
    result = parse_jlpt_grammar_pdf(pdf_path, level=level, verbose=True)
    print_stats(result)
    
    print("Sample grammar points:")
    for g in result['grammar_points'][:5]:
        print(f"\n  {g['grammar_point']}")
        print(f"    Meaning: {g['meaning'][:50]}...")
        print(f"    Examples: {len(g['examples'])}")
        if g['examples']:
            ex = g['examples'][0]
            print(f"    Sample: {ex['japanese'][:40]}...")
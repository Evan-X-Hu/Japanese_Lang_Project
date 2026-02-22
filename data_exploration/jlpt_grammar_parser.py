"""
JLPT Grammar PDF Parser
=======================
Extracts grammar points and example sentences from JLPTsensei Grammar Master PDFs.

Usage in Jupyter Notebook:
--------------------------
from jlpt_grammar_parser import parse_jlpt_grammar_pdf
import pandas as pd

# Parse a single PDF
data = parse_jlpt_grammar_pdf("JLPT_N4_Grammar_Master_Ebook.pdf", level="N4")

# Convert to DataFrame
df = pd.DataFrame(data['sentences'])

# Or parse multiple levels
levels = {
    'N5': 'path/to/N5.pdf',
    'N4': 'path/to/N4.pdf',
    'N3': 'path/to/N3.pdf',
    'N2': 'path/to/N2.pdf',
}

all_data = []
for level, path in levels.items():
    result = parse_jlpt_grammar_pdf(path, level=level)
    all_data.extend(result['sentences'])

df = pd.DataFrame(all_data)
"""

import pdfplumber
import re
from typing import Dict, List, Optional
from dataclasses import dataclass, asdict


@dataclass
class ExampleSentence:
    """Represents a single example sentence."""
    number: int
    japanese: str
    romaji: str
    english: str


@dataclass
class GrammarPoint:
    """Represents a grammar point with its examples."""
    id: int
    grammar_point: str
    furigana: Optional[str]
    romaji: str
    meaning: str
    jlpt_level: str
    page: int
    examples: List[ExampleSentence]


def extract_toc_mappings(pdf, toc_pages: range = range(1, 8)) -> Dict[str, dict]:
    """
    Extract grammar point to romaji/meaning mappings from Table of Contents.
    
    Args:
        pdf: pdfplumber PDF object
        toc_pages: Range of pages containing TOC (0-indexed)
    
    Returns:
        Dictionary mapping Japanese grammar points to their metadata
    """
    grammar_map = {}
    
    toc_text = ""
    for i in toc_pages:
        if i < len(pdf.pages):
            text = pdf.pages[i].extract_text()
            if text:
                toc_text += text + "\n"
    
    # Pattern: # Japanese romaji meaning page
    lines = toc_text.split('\n')
    for line in lines:
        # Match TOC entries like: "1 間 aida while; during 8"
        match = re.match(
            r'(\d+)\s+'                                    # Number
            r'([\u3000-\u9fff\u30a0-\u30ff〜～・&\s]+)\s+'  # Japanese
            r'([a-z][a-z\s~・/\[\]]+?)\s+'                 # Romaji
            r'(.+?)\s+'                                    # Meaning
            r'(\d+)$',                                     # Page
            line.strip()
        )
        if match:
            jp = match.group(2).strip()
            grammar_map[jp] = {
                'number': int(match.group(1)),
                'romaji': match.group(3).strip(),
                'meaning_toc': match.group(4).strip(),
                'page': int(match.group(5))
            }
    
    return grammar_map


def extract_examples_from_text(text: str) -> List[dict]:
    """
    Extract numbered example sentences from page text.
    
    Args:
        text: Raw text from a PDF page
    
    Returns:
        List of dictionaries with example sentence data
    """
    # Pattern matches:
    # 1. Japanese sentence
    # romaji sentence
    # English translation
    example_pattern = re.compile(
        r'^(\d{1,2})\.\s*'           # Number with period
        r'(.+?)\n'                    # Japanese sentence
        r'([a-z][^\n]+)\n'           # Romaji (starts with lowercase)
        r'([^\n]+)',                  # English translation
        re.MULTILINE
    )
    
    examples = []
    for match in example_pattern.finditer(text):
        japanese = match.group(2).strip()
        romaji = match.group(3).strip()
        english = match.group(4).strip()
        
        # Skip malformed entries
        if not japanese or not romaji or len(japanese) < 3:
            continue
        
        # Skip if romaji doesn't look like romaji
        if not re.match(r'^[a-z]', romaji):
            continue
            
        examples.append({
            'number': int(match.group(1)),
            'japanese': japanese,
            'romaji': romaji,
            'english': english
        })
    
    return examples


def parse_jlpt_grammar_pdf(
    pdf_path: str,
    level: str = "N4",
    toc_pages: range = range(1, 8),
    content_start_page: int = 8
) -> dict:
    """
    Parse a JLPTsensei Grammar Master PDF and extract all grammar points with examples.
    
    Args:
        pdf_path: Path to the PDF file
        level: JLPT level (N5, N4, N3, N2, N1)
        toc_pages: Range of pages containing TOC (0-indexed)
        content_start_page: First page with grammar content (1-indexed)
    
    Returns:
        Dictionary containing:
        - 'grammar_points': List of GrammarPoint objects as dicts
        - 'sentences': Flat list of all sentences with grammar labels
        - 'stats': Summary statistics
    """
    
    with pdfplumber.open(pdf_path) as pdf:
        # Extract TOC mappings
        toc_map = extract_toc_mappings(pdf, toc_pages)
        
        # Extract page content
        pages_content = []
        for i, page in enumerate(pdf.pages):
            text = page.extract_text()
            if text:
                pages_content.append({
                    'page_num': i + 1,
                    'text': text
                })
        
        # Pattern to identify grammar lesson headers
        header_pattern = re.compile(
            r'^([\u3000-\u9fff\u30a0-\u30ff〜～・&\s]+)\n'  # Main grammar
            r'([\u3000-\u9fff\u30a0-\u30ff]+)?\n?'          # Optional furigana
            r'Meaning\s+How To Use',
            re.MULTILINE
        )
        
        grammar_data = []
        current_grammar = None
        grammar_id = 0
        
        for page_data in pages_content:
            text = page_data['text']
            page_num = page_data['page_num']
            
            # Skip TOC pages
            if page_num < content_start_page:
                continue
            
            # Check for grammar header
            header_match = header_pattern.search(text)
            if header_match:
                grammar_id += 1
                grammar_jp = header_match.group(1).strip().replace('\n', ' ')
                furigana = header_match.group(2)
                if furigana:
                    furigana = furigana.strip().replace('\n', ' ')
                
                # Look up romaji from TOC
                toc_info = toc_map.get(grammar_jp, {})
                
                # Extract meaning from page
                meaning_match = re.search(r'How To Use\n([^\n]+)', text)
                meaning = ""
                if meaning_match:
                    meaning = meaning_match.group(1).strip()
                elif toc_info.get('meaning_toc'):
                    meaning = toc_info['meaning_toc']
                
                # Use TOC ID if available
                gid = toc_info.get('number', grammar_id)
                
                current_grammar = {
                    'id': gid,
                    'grammar_point': grammar_jp,
                    'furigana': furigana,
                    'romaji': toc_info.get('romaji', ''),
                    'meaning': meaning.split('\n')[0],  # First line only
                    'jlpt_level': level,
                    'page': page_num,
                    'examples': []
                }
                grammar_data.append(current_grammar)
            
            # Find example sentences on this page
            if current_grammar:
                examples = extract_examples_from_text(text)
                current_grammar['examples'].extend(examples)
        
        # Sort by ID
        grammar_data.sort(key=lambda x: x['id'])
        
        # Create flat sentence list for classifier training
        sentences = []
        for g in grammar_data:
            # Create clean display name
            display_name = g['grammar_point']
            if g['furigana'] and g['furigana'] not in display_name:
                display_name = f"{g['grammar_point']} ({g['furigana']})"
            
            for ex in g['examples']:
                sentences.append({
                    'grammar_id': g['id'],
                    'grammar_point': g['grammar_point'],
                    'furigana': g['furigana'] or '',
                    'display_name': display_name,
                    'romaji': g['romaji'],
                    'meaning': g['meaning'],
                    'jlpt_level': g['jlpt_level'],
                    'example_num': ex['number'],
                    'sentence_japanese': ex['japanese'],
                    'sentence_romaji': ex['romaji'],
                    'sentence_english': ex['english']
                })
        
        # Calculate stats
        total_examples = sum(len(g['examples']) for g in grammar_data)
        stats = {
            'level': level,
            'grammar_points': len(grammar_data),
            'total_sentences': total_examples,
            'avg_sentences_per_grammar': round(total_examples / len(grammar_data), 1) if grammar_data else 0,
            'grammar_with_zero_examples': sum(1 for g in grammar_data if len(g['examples']) == 0)
        }
        
        return {
            'grammar_points': grammar_data,
            'sentences': sentences,
            'stats': stats
        }


def print_stats(result: dict) -> None:
    """Print summary statistics for parsed data."""
    stats = result['stats']
    print("=" * 60)
    print(f"JLPT {stats['level']} Grammar Extraction Results")
    print("=" * 60)
    print(f"  Grammar points:        {stats['grammar_points']}")
    print(f"  Total sentences:       {stats['total_sentences']}")
    print(f"  Avg per grammar:       {stats['avg_sentences_per_grammar']}")
    print(f"  With zero examples:    {stats['grammar_with_zero_examples']}")
    print()


# Example usage when run directly
if __name__ == "__main__":
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python jlpt_grammar_parser.py <pdf_path> [level]")
        print("Example: python jlpt_grammar_parser.py N4_Grammar.pdf N4")
        sys.exit(1)
    
    pdf_path = sys.argv[1]
    level = sys.argv[2] if len(sys.argv) > 2 else "N4"
    
    result = parse_jlpt_grammar_pdf(pdf_path, level=level)
    print_stats(result)
    
    # Show sample
    print("Sample grammar points:")
    for g in result['grammar_points'][:3]:
        print(f"\n  {g['grammar_point']} ({g['romaji']})")
        print(f"    Meaning: {g['meaning'][:50]}...")
        print(f"    Examples: {len(g['examples'])}")
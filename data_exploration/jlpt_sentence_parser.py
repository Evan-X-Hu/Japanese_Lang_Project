"""
JLPT Grammar Pattern Detector
Detects N5–N2 grammar patterns in Japanese sentences using regex.
Grammar IDs match the master grammar list (masterGrammars.json).

Usage:
    from jlpt_sentence_parser import detect, get_unique_patterns, format_matches

    sentence = "日本語を勉強しなければならない"
    matches = detect(sentence)
"""

import re
from typing import List


# =============================================================================
# ALL PATTERNS — keys are global grammar_ids from masterGrammars.json
# =============================================================================

ALL_PATTERNS = {

    # ── N5 ────────────────────────────────────────────────────────────────────
    0: {
        "pattern": r"(ちゃいけない|じゃいけない)",
        "grammar_point": "ちゃいけない・じゃいけない",
        "meaning": "must not do (spoken Japanese)"
    },
    3: {
        "pattern": r"だろう",
        "grammar_point": "だろう",
        "meaning": "I think; it seems; probably; right?"
    },
    6: {
        "pattern": r"でしょう",
        "grammar_point": "でしょう",
        "meaning": "I think; it seems; probably; right?"
    },
    7: {
        "pattern": r"どんな",
        "grammar_point": "どんな",
        "meaning": "what kind of; what sort of"
    },
    8: {
        "pattern": r"どうして",
        "grammar_point": "どうして",
        "meaning": "why; for what reason; how"
    },
    9: {
        "pattern": r"どうやって",
        "grammar_point": "どうやって",
        "meaning": "how; in what way; by what means"
    },
    11: {
        "pattern": r"(がある|があります)",
        "grammar_point": "があります",
        "meaning": "there is; is (non-living things)"
    },
    12: {
        "pattern": r"が(ほしい|欲しい)",
        "grammar_point": "がほしい",
        "meaning": "to want something"
    },
    13: {
        "pattern": r"(がいる|がいます)",
        "grammar_point": "がいます",
        "meaning": "there is; to be; is (living things)"
    },
    14: {
        "pattern": r"(ほう|方)が(いい|良い)",
        "grammar_point": "ほうがいい",
        "meaning": "had better; it'd be better to; should~"
    },
    15: {
        "pattern": r"(いちばん|一番)",
        "grammar_point": "いちばん",
        "meaning": "the most; the best"
    },
    16: {
        "pattern": r"(いっしょに|一緒に)",
        "grammar_point": "いっしょに",
        "meaning": "together"
    },
    17: {
        "pattern": r"いつも",
        "grammar_point": "いつも",
        "meaning": "always; usually; habitually"
    },
    18: {
        "pattern": r"(じゃない|ではない)",
        "grammar_point": "じゃない・ではない",
        "meaning": "to not be (am not; is not; are not)"
    },
    24: {
        "pattern": r"けれども",
        "grammar_point": "けれども",
        "meaning": "but; however; although"
    },
    26: {
        "pattern": r"まだ.+て(いません|ない)",
        "grammar_point": "まだ〜ていません",
        "meaning": "have not yet"
    },
    28: {
        "pattern": r"(前に|まえに)",
        "grammar_point": "前に",
        "meaning": "before ~; in front of ~"
    },
    29: {
        "pattern": r"ませんか",
        "grammar_point": "ませんか",
        "meaning": "would you; do you want to; shall we~"
    },
    30: {
        "pattern": r"ましょう(?!か)",
        "grammar_point": "ましょう",
        "meaning": "let's ~; shall we ~"
    },
    31: {
        "pattern": r"ましょうか",
        "grammar_point": "ましょうか",
        "meaning": "shall I ~; used to offer help"
    },
    35: {
        "pattern": r"ないで(?!ください)",
        "grammar_point": "ないで",
        "meaning": "without doing~"
    },
    36: {
        "pattern": r"ないでください",
        "grammar_point": "ないでください",
        "meaning": "please don't do"
    },
    37: {
        "pattern": r"なくてもいい",
        "grammar_point": "なくてもいい",
        "meaning": "don't have to"
    },
    38: {
        "pattern": r"なくちゃ",
        "grammar_point": "なくちゃ",
        "meaning": "must do; need to; gotta do"
    },
    39: {
        "pattern": r"なくてはいけない",
        "grammar_point": "なくてはいけない",
        "meaning": "must do; need to do"
    },
    40: {
        "pattern": r"なくてはならない",
        "grammar_point": "なくてはならない",
        "meaning": "must do; need to do"
    },
    42: {
        "pattern": r"(んです|んだ)",
        "grammar_point": "んです",
        "meaning": "to explain something; show emphasis"
    },
    49: {
        "pattern": r"(のです|のだ)",
        "grammar_point": "のです",
        "meaning": "to explain something; show emphasis"
    },
    50: {
        "pattern": r"のが(へた|下手)",
        "grammar_point": "のがへた",
        "meaning": "to be bad at doing something"
    },
    51: {
        "pattern": r"のが(じょうず|上手)",
        "grammar_point": "のがじょうず",
        "meaning": "to be good at"
    },
    52: {
        "pattern": r"のが(すき|好き)",
        "grammar_point": "のが好き",
        "meaning": "to like doing something"
    },
    55: {
        "pattern": r"をください",
        "grammar_point": "をください",
        "meaning": "please give me~"
    },
    56: {
        "pattern": r"(?<!も)しかし",
        "grammar_point": "しかし",
        "meaning": "but; however"
    },
    57: {
        "pattern": r"(すぎる|過ぎる)",
        "grammar_point": "すぎる",
        "meaning": "too much"
    },
    58: {
        "pattern": r"たことが(ある|あります)",
        "grammar_point": "たことがある",
        "meaning": "to have done something before"
    },
    60: {
        "pattern": r"たり.+たり",
        "grammar_point": "たり〜たり",
        "meaning": "do such things as A and B"
    },
    61: {
        "pattern": r"てある",
        "grammar_point": "てある",
        "meaning": "is/has been done (resulting state)"
    },
    62: {
        "pattern": r"(ている|てる)",
        "grammar_point": "ている",
        "meaning": "ongoing action or current state"
    },
    63: {
        "pattern": r"てから",
        "grammar_point": "てから",
        "meaning": "after doing~"
    },
    64: {
        "pattern": r"てください",
        "grammar_point": "てください",
        "meaning": "please do"
    },
    65: {
        "pattern": r"てはいけない",
        "grammar_point": "てはいけない",
        "meaning": "must not; may not; cannot"
    },
    66: {
        "pattern": r"てもいい",
        "grammar_point": "てもいいです",
        "meaning": "is OK to..; is alright to..; may I..?"
    },
    69: {
        "pattern": r"とても",
        "grammar_point": "とても",
        "meaning": "very; awfully; exceedingly"
    },
    70: {
        "pattern": r"つもり",
        "grammar_point": "つもり",
        "meaning": "plan to ~; intend to ~"
    },
    72: {
        "pattern": r"は.+より.+です",
        "grammar_point": "は〜より・・・です",
        "meaning": "[A] is more ~ than [B]"
    },
    73: {
        "pattern": r"はどうですか",
        "grammar_point": "はどうですか",
        "meaning": "how about; how is"
    },
    76: {
        "pattern": r"より.+(ほう|方)が",
        "grammar_point": "より〜ほうが",
        "meaning": "[A] is more than [B]"
    },

    # ── N4 ────────────────────────────────────────────────────────────────────
    78: {
        "pattern": r"間に",
        "grammar_point": "間に",
        "meaning": "while/during~ something happened"
    },
    79: {
        "pattern": r"あまり.+(ない|ません)",
        "grammar_point": "あまり〜ない",
        "meaning": "not very; not much"
    },
    80: {
        "pattern": r"(後で|あとで)",
        "grammar_point": "後で",
        "meaning": "after ~; later"
    },
    82: {
        "pattern": r"場合",
        "grammar_point": "場合は",
        "meaning": "in the event of; in the case that"
    },
    83: {
        "pattern": r"ばかり",
        "grammar_point": "ばかり",
        "meaning": "only; nothing but"
    },
    84: {
        "pattern": r"だけで",
        "grammar_point": "だけで",
        "meaning": "just by; just by doing"
    },
    86: {
        "pattern": r"でございます",
        "grammar_point": "でございます",
        "meaning": "to be (honorific)"
    },
    88: {
        "pattern": r"ではないか",
        "grammar_point": "ではないか",
        "meaning": "right?; isn't it?"
    },
    89: {
        "pattern": r"が必要",
        "grammar_point": "が必要",
        "meaning": "need; necessary"
    },
    92: {
        "pattern": r"(がる|がっている)",
        "grammar_point": "がる・がっている",
        "meaning": "to show signs of; to appear; to feel"
    },
    93: {
        "pattern": r"ございます",
        "grammar_point": "ございます",
        "meaning": "to be; to exist (polite form)"
    },
    95: {
        "pattern": r"はず(だ|です)",
        "grammar_point": "はずだ",
        "meaning": "it must be; it should be (expectation)"
    },
    96: {
        "pattern": r"はずがない",
        "grammar_point": "はずがない",
        "meaning": "cannot be (impossible)"
    },
    97: {
        "pattern": r"必要がある",
        "grammar_point": "必要がある",
        "meaning": "need to; it is necessary to"
    },
    99: {
        "pattern": r"(いらっしゃる|いらっしゃい)",
        "grammar_point": "いらっしゃる",
        "meaning": "to be; to come; to go (polite)"
    },
    100: {
        "pattern": r"(いたします|いたす)",
        "grammar_point": "いたします",
        "meaning": "to do (polite form of する)"
    },
    101: {
        "pattern": r"じゃないか",
        "grammar_point": "じゃないか",
        "meaning": "right? isn't it? let's~"
    },
    102: {
        "pattern": r"かどうか",
        "grammar_point": "かどうか",
        "meaning": "whether or not"
    },
    103: {
        "pattern": r"かしら",
        "grammar_point": "かしら",
        "meaning": "I wonder"
    },
    105: {
        "pattern": r"かもしれない|かもしれません",
        "grammar_point": "かもしれない",
        "meaning": "might; perhaps; indicates possibility"
    },
    107: {
        "pattern": r"から(作る|つくる)",
        "grammar_point": "から作る",
        "meaning": "made from; made with"
    },
    108: {
        "pattern": r"きっと",
        "grammar_point": "きっと",
        "meaning": "surely; undoubtedly; almost certainly"
    },
    110: {
        "pattern": r"ことがある",
        "grammar_point": "ことがある",
        "meaning": "there are times when"
    },
    111: {
        "pattern": r"ことができる",
        "grammar_point": "ことができる",
        "meaning": "can; able to"
    },
    112: {
        "pattern": r"ことになる",
        "grammar_point": "ことになる",
        "meaning": "It has been decided that..; it turns out that.."
    },
    113: {
        "pattern": r"ことにする",
        "grammar_point": "ことにする",
        "meaning": "to decide on"
    },
    115: {
        "pattern": r"急に",
        "grammar_point": "急に",
        "meaning": "suddenly"
    },
    116: {
        "pattern": r"までに",
        "grammar_point": "までに",
        "meaning": "by; by the time; indicates time limit"
    },
    118: {
        "pattern": r"または",
        "grammar_point": "または",
        "meaning": "both; or; otherwise"
    },
    119: {
        "pattern": r"みたい(だ|です)",
        "grammar_point": "みたいだ",
        "meaning": "like; similar to; resembling"
    },
    120: {
        "pattern": r"みたいな",
        "grammar_point": "みたいな",
        "meaning": "like; similar to"
    },
    121: {
        "pattern": r"みたいに",
        "grammar_point": "みたいに",
        "meaning": "like; similar to"
    },
    125: {
        "pattern": r"ながら",
        "grammar_point": "ながら",
        "meaning": "while; during; as; simultaneously"
    },
    126: {
        "pattern": r"なかなか.+(ない|ません)",
        "grammar_point": "なかなか〜ない",
        "meaning": "not easy to; struggling to; not able to~"
    },
    127: {
        "pattern": r"なければいけない",
        "grammar_point": "なければいけない",
        "meaning": "must do something; have to do something"
    },
    128: {
        "pattern": r"なければならない",
        "grammar_point": "なければならない",
        "meaning": "must do something; have to do something"
    },
    130: {
        "pattern": r"なさい",
        "grammar_point": "なさい",
        "meaning": "do this (soft/firm command)"
    },
    131: {
        "pattern": r"なさる",
        "grammar_point": "なさる",
        "meaning": "to do (honorific)"
    },
    132: {
        "pattern": r"に(気がつく|気づく)",
        "grammar_point": "に気がつく",
        "meaning": "to notice; to realize"
    },
    133: {
        "pattern": r"に(みえる|見える)",
        "grammar_point": "にみえる",
        "meaning": "to look; to seem; to appear"
    },
    135: {
        "pattern": r"にくい",
        "grammar_point": "にくい",
        "meaning": "difficult to do"
    },
    136: {
        "pattern": r"の中で",
        "grammar_point": "の中で",
        "meaning": "in; among"
    },
    138: {
        "pattern": r"のは.+(だ|です)",
        "grammar_point": "のは〜だ",
        "meaning": "[A] is [B]; the reason for [A] is [B]"
    },
    139: {
        "pattern": r"お.+ください",
        "grammar_point": "お〜ください",
        "meaning": "please do (honorific)"
    },
    140: {
        "pattern": r"お.+になる",
        "grammar_point": "お〜になる",
        "meaning": "to do (honorific)"
    },
    141: {
        "pattern": r"おきに",
        "grammar_point": "おきに",
        "meaning": "repeated at intervals; every"
    },
    144: {
        "pattern": r"らしい",
        "grammar_point": "らしい",
        "meaning": "it seems like; I heard; apparently~"
    },
    146: {
        "pattern": r"さっき",
        "grammar_point": "さっき",
        "meaning": "some time ago; just now"
    },
    147: {
        "pattern": r"させられる",
        "grammar_point": "させられる",
        "meaning": "causative-passive; to be made to do"
    },
    148: {
        "pattern": r"させる",
        "grammar_point": "させる",
        "meaning": "causative form; to make/let somebody do"
    },
    149: {
        "pattern": r"させてください",
        "grammar_point": "させてください",
        "meaning": "please let me do"
    },
    150: {
        "pattern": r"さすが",
        "grammar_point": "さすが",
        "meaning": "as one would expect; as is to be expected"
    },
    152: {
        "pattern": r"そんなに",
        "grammar_point": "そんなに",
        "meaning": "so much; so; like that"
    },
    153: {
        "pattern": r"それでも",
        "grammar_point": "それでも",
        "meaning": "but still; and yet; even so"
    },
    155: {
        "pattern": r"(そうに|そうな)",
        "grammar_point": "そうに・そうな",
        "meaning": "seems like; looks like"
    },
    156: {
        "pattern": r"たばかり",
        "grammar_point": "たばかり",
        "meaning": "just finished; something just occurred"
    },
    157: {
        "pattern": r"たところ",
        "grammar_point": "たところ",
        "meaning": "just finished doing; was just doing"
    },
    158: {
        "pattern": r"(たがる|たがっている)",
        "grammar_point": "たがる",
        "meaning": "wants to do~ (third person)"
    },
    160: {
        "pattern": r"たらどう",
        "grammar_point": "たらどう",
        "meaning": "why don't you"
    },
    161: {
        "pattern": r"たらいいですか",
        "grammar_point": "たらいいですか",
        "meaning": "what should I do?; speaker seeking"
    },
    163: {
        "pattern": r"てあげる",
        "grammar_point": "てあげる",
        "meaning": "to do for; to do a favor"
    },
    164: {
        "pattern": r"て(ほしい|欲しい)",
        "grammar_point": "てほしい",
        "meaning": "I want you to; need you to~"
    },
    165: {
        "pattern": r"て(いく|行く)",
        "grammar_point": "ていく",
        "meaning": "to start; to continue; to go on"
    },
    166: {
        "pattern": r"ていた",
        "grammar_point": "ていた",
        "meaning": "was doing something (past continuous)"
    },
    167: {
        "pattern": r"ていただけませんか",
        "grammar_point": "ていただけませんか",
        "meaning": "could you please"
    },
    168: {
        "pattern": r"てくれる",
        "grammar_point": "てくれる",
        "meaning": "to do a favor; do something for someone"
    },
    169: {
        "pattern": r"て(くる|来る)",
        "grammar_point": "てくる",
        "meaning": "to do… and come back; to become"
    },
    170: {
        "pattern": r"てみる",
        "grammar_point": "てみる",
        "meaning": "try doing"
    },
    171: {
        "pattern": r"てもらう",
        "grammar_point": "てもらう",
        "meaning": "to get somebody to do something"
    },
    172: {
        "pattern": r"ておく",
        "grammar_point": "ておく",
        "meaning": "to do something in advance"
    },
    173: {
        "pattern": r"(てしまう|ちゃう|じゃう)",
        "grammar_point": "てしまう・ちゃう",
        "meaning": "to do something by accident; to finish"
    },
    174: {
        "pattern": r"てすみません",
        "grammar_point": "てすみません",
        "meaning": "I'm sorry for"
    },
    175: {
        "pattern": r"てやる",
        "grammar_point": "てやる",
        "meaning": "to do for; to do a favor (casual)"
    },
    176: {
        "pattern": r"てよかった",
        "grammar_point": "てよかった",
        "meaning": "I'm glad that.."
    },
    177: {
        "pattern": r"ているところ",
        "grammar_point": "ているところ",
        "meaning": "in the process of doing"
    },
    180: {
        "pattern": r"と(いっても|言っても)いい",
        "grammar_point": "といってもいい",
        "meaning": "you could say; one might say; I'd say"
    },
    181: {
        "pattern": r"という",
        "grammar_point": "という",
        "meaning": "called; named; that"
    },
    182: {
        "pattern": r"ということ",
        "grammar_point": "ということ",
        "meaning": "convert phrase into noun"
    },
    183: {
        "pattern": r"と(いわれている|言われている)",
        "grammar_point": "といわれている",
        "meaning": "it is said that..."
    },
    184: {
        "pattern": r"と聞いた",
        "grammar_point": "と聞いた",
        "meaning": "I heard..."
    },
    185: {
        "pattern": r"と思う",
        "grammar_point": "と思う",
        "meaning": "to think…; I think…; you think…"
    },
    186: {
        "pattern": r"とか.+とか",
        "grammar_point": "とか〜とか",
        "meaning": "among other things; such as; like"
    },
    188: {
        "pattern": r"続ける",
        "grammar_point": "続ける",
        "meaning": "continue to; keen on"
    },
    192: {
        "pattern": r"やすい",
        "grammar_point": "やすい",
        "meaning": "easy to; likely to; prone to"
    },
    193: {
        "pattern": r"やっと",
        "grammar_point": "やっと",
        "meaning": "at last; finally; barely; narrowly"
    },
    195: {
        "pattern": r"予定(だ|です)",
        "grammar_point": "予定だ",
        "meaning": "plan to; intend to"
    },
    197: {
        "pattern": r"(ように|ような)",
        "grammar_point": "ように・ような",
        "meaning": "like; as; similar to"
    },
    198: {
        "pattern": r"ようになる",
        "grammar_point": "ようになる",
        "meaning": "to reach the point that; to come to be that"
    },
    199: {
        "pattern": r"ようにする",
        "grammar_point": "ようにする",
        "meaning": "to try to; to make sure that"
    },
    200: {
        "pattern": r"ようと思う",
        "grammar_point": "ようと思う",
        "meaning": "thinking of doing; planning to"
    },
    201: {
        "pattern": r"ぜひ",
        "grammar_point": "ぜひ",
        "meaning": "by all means; certainly; definitely"
    },
    202: {
        "pattern": r"全然.+(ない|ません)",
        "grammar_point": "全然〜ない",
        "meaning": "(not) at all"
    },
    203: {
        "pattern": r"づらい",
        "grammar_point": "づらい",
        "meaning": "difficult to do"
    },

    # ── N3 ────────────────────────────────────────────────────────────────────
    206: {
        "pattern": r"あまりにも",
        "grammar_point": "あまりにも",
        "meaning": "too much; so much… that; excessively~"
    },
    208: {
        "pattern": r"ばいい",
        "grammar_point": "ばいい",
        "meaning": "should; can; it'd be good if"
    },
    209: {
        "pattern": r"ばよかった",
        "grammar_point": "ばよかった",
        "meaning": "should have; would have been better if~"
    },
    210: {
        "pattern": r"ば.+ほど",
        "grammar_point": "ば〜ほど",
        "meaning": "the more… the more"
    },
    211: {
        "pattern": r"ば.+のに",
        "grammar_point": "ば〜のに",
        "meaning": "would have; should have; if only~"
    },
    212: {
        "pattern": r"ばかりで(?!なく)",
        "grammar_point": "ばかりで",
        "meaning": "only; just (negative description)"
    },
    213: {
        "pattern": r"ばかりでなく",
        "grammar_point": "ばかりでなく",
        "meaning": "not only.. but also; as well as~"
    },
    214: {
        "pattern": r"べき(だ|です)(?!ではない)",
        "grammar_point": "べきだ",
        "meaning": "should do~; must do~"
    },
    215: {
        "pattern": r"べきではない",
        "grammar_point": "べきではない",
        "meaning": "should not do~; must not do~"
    },
    216: {
        "pattern": r"別に.+(ない|ません)",
        "grammar_point": "別に〜ない",
        "meaning": "not really; not particularly"
    },
    217: {
        "pattern": r"ぶりに",
        "grammar_point": "ぶりに",
        "meaning": "for the first time in (period of time)"
    },
    220: {
        "pattern": r"だけでなく",
        "grammar_point": "だけでなく",
        "meaning": "not only… but also"
    },
    221: {
        "pattern": r"だけど",
        "grammar_point": "だけど",
        "meaning": "however; but"
    },
    222: {
        "pattern": r"だらけ",
        "grammar_point": "だらけ",
        "meaning": "full of; covered with; a lot of"
    },
    223: {
        "pattern": r"どんなに.+ても",
        "grammar_point": "どんなに〜ても",
        "meaning": "no matter how (much)"
    },
    224: {
        "pattern": r"どうしても",
        "grammar_point": "どうしても",
        "meaning": "no matter what; at any cost; after all"
    },
    225: {
        "pattern": r"ふりを(する|して)",
        "grammar_point": "ふりをする",
        "meaning": "to pretend; to act as if~"
    },
    228: {
        "pattern": r"がたい",
        "grammar_point": "がたい",
        "meaning": "very difficult to; impossible to"
    },
    229: {
        "pattern": r"気味",
        "grammar_point": "気味",
        "meaning": "-like; -looking; tending to"
    },
    230: {
        "pattern": r"ごとに",
        "grammar_point": "ごとに",
        "meaning": "each; every; at intervals of"
    },
    232: {
        "pattern": r"ほど.+(ない|ません)",
        "grammar_point": "ほど〜ない",
        "meaning": "is not as… as"
    },
    233: {
        "pattern": r"(一度に|いちどに)",
        "grammar_point": "いちどに",
        "meaning": "all at once"
    },
    234: {
        "pattern": r"いくら.+ても",
        "grammar_point": "いくら〜ても",
        "meaning": "no matter how~"
    },
    235: {
        "pattern": r"(一方だ|いっぽうだ)",
        "grammar_point": "いっぽうだ",
        "meaning": "more and more; continue to"
    },
    236: {
        "pattern": r"(一体|いったい)",
        "grammar_point": "いったい",
        "meaning": "emphasis; what on earth; what in the"
    },
    238: {
        "pattern": r"か何か",
        "grammar_point": "か何か",
        "meaning": "or something"
    },
    240: {
        "pattern": r"から.+にかけて",
        "grammar_point": "から〜にかけて",
        "meaning": "through; from [A] to [B]"
    },
    241: {
        "pattern": r"(代わりに|かわりに)",
        "grammar_point": "代わりに",
        "meaning": "instead of; as a substitute for"
    },
    243: {
        "pattern": r"結局",
        "grammar_point": "結局",
        "meaning": "after all; eventually; in the end"
    },
    244: {
        "pattern": r"決して.+(ない|ません)",
        "grammar_point": "決して〜ない",
        "meaning": "never; by no means"
    },
    245: {
        "pattern": r"切れない",
        "grammar_point": "切れない",
        "meaning": "unable to do; too much to finish/complete"
    },
    252: {
        "pattern": r"ことから",
        "grammar_point": "ことから",
        "meaning": "from the fact that~"
    },
    253: {
        "pattern": r"ことになっている",
        "grammar_point": "ことになっている",
        "meaning": "to be expected to; to be scheduled to"
    },
    254: {
        "pattern": r"ことはない",
        "grammar_point": "ことはない",
        "meaning": "there is no need to; (something) never"
    },
    255: {
        "pattern": r"ことは.+が",
        "grammar_point": "ことは〜が",
        "meaning": "although; but"
    },
    257: {
        "pattern": r"くせに",
        "grammar_point": "くせに",
        "meaning": "although~; despite the fact that~"
    },
    258: {
        "pattern": r"まるで",
        "grammar_point": "まるで",
        "meaning": "as if; as though; just like"
    },
    259: {
        "pattern": r"まさか",
        "grammar_point": "まさか",
        "meaning": "there's no way; that's impossible"
    },
    260: {
        "pattern": r"めったに.+(ない|ません)",
        "grammar_point": "めったに〜ない",
        "meaning": "hardly; rarely; seldom"
    },
    261: {
        "pattern": r"も.+ば.+も",
        "grammar_point": "も〜ば〜も",
        "meaning": "and; also; as well; either/or; neither/nor"
    },
    262: {
        "pattern": r"もしかしたら",
        "grammar_point": "もしかしたら",
        "meaning": "perhaps; maybe; perchance; by any chance"
    },
    263: {
        "pattern": r"もしも.+たら",
        "grammar_point": "もしも〜たら",
        "meaning": "if; in the case; supposing~"
    },
    266: {
        "pattern": r"むしろ",
        "grammar_point": "むしろ",
        "meaning": "rather; instead; better"
    },
    267: {
        "pattern": r"ながらも",
        "grammar_point": "ながらも",
        "meaning": "but; although; despite"
    },
    268: {
        "pattern": r"ないことはない",
        "grammar_point": "ないことはない",
        "meaning": "can do~; is not impossible to~"
    },
    270: {
        "pattern": r"なかなか",
        "grammar_point": "なかなか",
        "meaning": "quite~; pretty~; rather~; just not ~"
    },
    273: {
        "pattern": r"なるべく",
        "grammar_point": "なるべく",
        "meaning": "as much as possible"
    },
    274: {
        "pattern": r"なぜなら",
        "grammar_point": "なぜなら",
        "meaning": "because; the reason is"
    },
    275: {
        "pattern": r"んだって",
        "grammar_point": "んだって",
        "meaning": "I hear that; heard that~"
    },
    276: {
        "pattern": r"に違いない",
        "grammar_point": "に違いない",
        "meaning": "I'm sure/certain; no doubt that"
    },
    277: {
        "pattern": r"に反して",
        "grammar_point": "に反して",
        "meaning": "against; contrary to; in contrast to"
    },
    278: {
        "pattern": r"にかけて",
        "grammar_point": "にかけて",
        "meaning": "over (a period); through~; concerning~"
    },
    279: {
        "pattern": r"に(かわって|かわり|代わって|代わり)",
        "grammar_point": "にかわって・にかわり",
        "meaning": "instead of~; replacing~; on behalf of~"
    },
    280: {
        "pattern": r"に(くらべて|比べて)",
        "grammar_point": "にくらべて",
        "meaning": "compared to~; in comparison to~"
    },
    281: {
        "pattern": r"に(慣れ|なれ)",
        "grammar_point": "に慣れる",
        "meaning": "to be used to something"
    },
    282: {
        "pattern": r"(において|における)",
        "grammar_point": "において・における",
        "meaning": "in; at (place); regarding~; as for~"
    },
    283: {
        "pattern": r"に(したがって|従って)",
        "grammar_point": "にしたがって",
        "meaning": "as; therefore; in accordance with"
    },
    284: {
        "pattern": r"にしても",
        "grammar_point": "にしても",
        "meaning": "even if; even though; regardless of"
    },
    285: {
        "pattern": r"にしては",
        "grammar_point": "にしては",
        "meaning": "for; considering it's"
    },
    286: {
        "pattern": r"に対して",
        "grammar_point": "に対して",
        "meaning": "towards; against; regarding; in contrast with"
    },
    287: {
        "pattern": r"にとって",
        "grammar_point": "にとって",
        "meaning": "to; for; concerning; as far as ... is concerned"
    },
    288: {
        "pattern": r"について",
        "grammar_point": "について",
        "meaning": "concerning; regarding; about; on"
    },
    289: {
        "pattern": r"につれて",
        "grammar_point": "につれて",
        "meaning": "as; in proportion to; with; as… then…"
    },
    291: {
        "pattern": r"(によると|によれば)",
        "grammar_point": "によると・によれば",
        "meaning": "according to~"
    },
    292: {
        "pattern": r"(によって|による)",
        "grammar_point": "によって・による",
        "meaning": "by means of; due to; owing to; because of~"
    },
    293: {
        "pattern": r"のでしょうか",
        "grammar_point": "のでしょうか",
        "meaning": "ask a question in a polite way"
    },
    294: {
        "pattern": r"を(中心に|ちゅうしんに)",
        "grammar_point": "をちゅうしんに",
        "meaning": "focused on; centered on"
    },
    295: {
        "pattern": r"をはじめ",
        "grammar_point": "をはじめ",
        "meaning": "for example; starting with"
    },
    296: {
        "pattern": r"を込めて",
        "grammar_point": "を込めて",
        "meaning": "filled with; full of"
    },
    297: {
        "pattern": r"おかげで",
        "grammar_point": "おかげで",
        "meaning": "thanks to ...; owing to ...; because of ..."
    },
    298: {
        "pattern": r"っぱなし",
        "grammar_point": "っぱなし",
        "meaning": "leaving (something) on; leaving (something)"
    },
    299: {
        "pattern": r"っぽい",
        "grammar_point": "っぽい",
        "meaning": "seems like; somewhat~; -ish; easily does~"
    },
    301: {
        "pattern": r"さえ.+ば",
        "grammar_point": "さえ〜ば",
        "meaning": "if only; as long as"
    },
    302: {
        "pattern": r"際に",
        "grammar_point": "際に",
        "meaning": "when; at the time of; in the case of"
    },
    303: {
        "pattern": r"最中に",
        "grammar_point": "最中に",
        "meaning": "while; during; in the middle of"
    },
    304: {
        "pattern": r"さらに",
        "grammar_point": "さらに",
        "meaning": "furthermore; again; more and more"
    },
    306: {
        "pattern": r"せいで",
        "grammar_point": "せいで",
        "meaning": "because of; due to; as a result of~"
    },
    307: {
        "pattern": r"せいぜい",
        "grammar_point": "せいぜい",
        "meaning": "at the most; at best; to the utmost"
    },
    308: {
        "pattern": r"しばらく",
        "grammar_point": "しばらく",
        "meaning": "for a moment; for a while; for the time being"
    },
    309: {
        "pattern": r"しかない",
        "grammar_point": "しかない",
        "meaning": "have no choice but~"
    },
    310: {
        "pattern": r"そのため(に)?",
        "grammar_point": "そのために",
        "meaning": "hence; for that reason; because of~"
    },
    311: {
        "pattern": r"それとも",
        "grammar_point": "それとも",
        "meaning": "or; or else"
    },
    312: {
        "pattern": r"(そうもない|そうにない)",
        "grammar_point": "そうもない・そうにない",
        "meaning": "very unlikely to~; showing no signs of~"
    },
    313: {
        "pattern": r"すでに",
        "grammar_point": "すでに",
        "meaning": "something has already been done/taken"
    },
    314: {
        "pattern": r"すなわち",
        "grammar_point": "すなわち",
        "meaning": "in other words; namely"
    },
    315: {
        "pattern": r"たものだ",
        "grammar_point": "たものだ",
        "meaning": "used to do; would often do"
    },
    316: {
        "pattern": r"(たとたん|た途端)",
        "grammar_point": "たとたん",
        "meaning": "as soon as; just as"
    },
    317: {
        "pattern": r"たびに",
        "grammar_point": "たびに",
        "meaning": "whenever; every time"
    },
    319: {
        "pattern": r"確かに",
        "grammar_point": "確かに",
        "meaning": "surely; certainly"
    },
    321: {
        "pattern": r"たとえ.+ても",
        "grammar_point": "たとえ〜ても",
        "meaning": "even if… is the case"
    },
    322: {
        "pattern": r"(例えば|たとえば)",
        "grammar_point": "例えば",
        "meaning": "for example"
    },
    324: {
        "pattern": r"てばかりいる",
        "grammar_point": "てばかりいる",
        "meaning": "only; nothing but~"
    },
    325: {
        "pattern": r"てごらん",
        "grammar_point": "てごらん",
        "meaning": "(please) try to; (please) look"
    },
    326: {
        "pattern": r"て(はじめて|初めて)",
        "grammar_point": "てはじめて",
        "meaning": "not until; only after [x] did I"
    },
    327: {
        "pattern": r"てからでないと",
        "grammar_point": "てからでないと",
        "meaning": "must first do; cannot do without first doing"
    },
    328: {
        "pattern": r"(てしょうがない|てしかたがない|て仕方がない)",
        "grammar_point": "てしょうがない・てしかたがない",
        "meaning": "can't help but~; very; extremely"
    },
    329: {
        "pattern": r"て済む",
        "grammar_point": "て済む",
        "meaning": "sufficient by; no problem to; resolve by~"
    },
    330: {
        "pattern": r"てはいけないから",
        "grammar_point": "てはいけないから",
        "meaning": "in order to not~; to prevent a negative"
    },
    331: {
        "pattern": r"ている場合じゃない",
        "grammar_point": "ている場合じゃない",
        "meaning": "this is no time to be doing~"
    },
    333: {
        "pattern": r"ても始まらない",
        "grammar_point": "ても始まらない",
        "meaning": "even if you... it's no use; there is no point"
    },
    334: {
        "pattern": r"(てもかまわない|ても構わない)",
        "grammar_point": "てもかまわない",
        "meaning": "it doesn't matter if ~"
    },
    335: {
        "pattern": r"(てもしょうがない|てもしかたがない)",
        "grammar_point": "てもしょうがない・てもしかたがない",
        "meaning": "there's no point to~; it's no use to~"
    },
    336: {
        "pattern": r"(といえば|と言えば)",
        "grammar_point": "といえば",
        "meaning": "speaking of; when you talk of; when you say"
    },
    337: {
        "pattern": r"(といい|たらいい)",
        "grammar_point": "といい・たらいい",
        "meaning": "it would be nice if; should; I hope~"
    },
    338: {
        "pattern": r"(といっても|と言っても)",
        "grammar_point": "といっても",
        "meaning": "although I say; although one might say~"
    },
    339: {
        "pattern": r"ということだ",
        "grammar_point": "ということだ",
        "meaning": "I heard~; it means that~; in other words~"
    },
    340: {
        "pattern": r"というのは",
        "grammar_point": "というのは",
        "meaning": "this means~; the meaning of … is~"
    },
    341: {
        "pattern": r"というと",
        "grammar_point": "というと",
        "meaning": "speaking of; when you talk of"
    },
    342: {
        "pattern": r"というより",
        "grammar_point": "というより",
        "meaning": "rather than~"
    },
    343: {
        "pattern": r"と(みえる|みえて|見える|見えて)",
        "grammar_point": "とみえる・とみえて",
        "meaning": "it seems that~"
    },
    344: {
        "pattern": r"(とすれば|としたら|とすると)",
        "grammar_point": "とすれば・としたら・とすると",
        "meaning": "in the case of~; assuming~; if A then B"
    },
    345: {
        "pattern": r"(と共に|とともに)",
        "grammar_point": "と共に",
        "meaning": "together with; at the same time as; as well"
    },
    346: {
        "pattern": r"ところで",
        "grammar_point": "ところで",
        "meaning": "by the way~"
    },
    347: {
        "pattern": r"ところが",
        "grammar_point": "ところが",
        "meaning": "even so; however; even though~"
    },
    348: {
        "pattern": r"(とおりに|通りに)",
        "grammar_point": "とおりに",
        "meaning": "in the same way as; in the way; as~"
    },
    350: {
        "pattern": r"として",
        "grammar_point": "として",
        "meaning": "as~; in the role of~"
    },
    351: {
        "pattern": r"とても.+(ない|ません)",
        "grammar_point": "とても〜ない",
        "meaning": "cannot possibly be; hardly~"
    },
    352: {
        "pattern": r"とは限らない",
        "grammar_point": "とは限らない",
        "meaning": "not necessarily so; is not always true"
    },
    354: {
        "pattern": r"ついに",
        "grammar_point": "ついに",
        "meaning": "finally ~; at last ~; in the end"
    },
    355: {
        "pattern": r"ついでに",
        "grammar_point": "ついでに",
        "meaning": "while; incidentally; at the same time"
    },
    356: {
        "pattern": r"つまり",
        "grammar_point": "つまり",
        "meaning": "in other words; in summary; in short"
    },
    357: {
        "pattern": r"つもりだった",
        "grammar_point": "つもりだった",
        "meaning": "I thought I~; I believe I~; was planning to~"
    },
    358: {
        "pattern": r"つもりで",
        "grammar_point": "つもりで",
        "meaning": "with the intention of doing~"
    },
    359: {
        "pattern": r"うちに",
        "grammar_point": "うちに",
        "meaning": "while; before~"
    },
    360: {
        "pattern": r"上で",
        "grammar_point": "上で",
        "meaning": "upon; after; when; for; in order to"
    },
    361: {
        "pattern": r"上に",
        "grammar_point": "上に",
        "meaning": "as well; besides; in addition to; not only…"
    },
    362: {
        "pattern": r"は別として",
        "grammar_point": "は別として",
        "meaning": "aside from; apart from; except for"
    },
    363: {
        "pattern": r"はもちろん",
        "grammar_point": "はもちろん",
        "meaning": "not to mention; not only; but also~"
    },
    364: {
        "pattern": r"は.+で有名",
        "grammar_point": "は〜で有名",
        "meaning": "famous for~"
    },
    365: {
        "pattern": r"わけ(だ|です)",
        "grammar_point": "わけだ",
        "meaning": "for that reason; no wonder; as you'd expect"
    },
    366: {
        "pattern": r"わけではない",
        "grammar_point": "わけではない",
        "meaning": "it doesn't mean that; it is not the case that"
    },
    367: {
        "pattern": r"わけがない",
        "grammar_point": "わけがない",
        "meaning": "there is no way that~; it is impossible to~"
    },
    368: {
        "pattern": r"わけにはいかない",
        "grammar_point": "わけにはいかない",
        "meaning": "must not; cannot afford to; must"
    },
    369: {
        "pattern": r"割に",
        "grammar_point": "割に",
        "meaning": "considering; comparatively; relatively"
    },
    370: {
        "pattern": r"わざと",
        "grammar_point": "わざと",
        "meaning": "on purpose; intentionally~"
    },
    371: {
        "pattern": r"わざわざ",
        "grammar_point": "わざわざ",
        "meaning": "to go to the trouble of; to go out of one's way"
    },
    372: {
        "pattern": r"よりも",
        "grammar_point": "よりも",
        "meaning": "in comparison to; rather than~; more than~"
    },
    373: {
        "pattern": r"ようがない",
        "grammar_point": "ようがない",
        "meaning": "there is no way to; it's impossible to~"
    },
    374: {
        "pattern": r"ような気がする",
        "grammar_point": "ような気がする",
        "meaning": "have a feeling that; feels like; seems like"
    },
    376: {
        "pattern": r"ように(みえる|見える)",
        "grammar_point": "ようにみえる",
        "meaning": "to look; to seem; to appear~"
    },
    377: {
        "pattern": r"ようとしない",
        "grammar_point": "ようとしない",
        "meaning": "not try to; not make an effort to~"
    },
    378: {
        "pattern": r"ようとする",
        "grammar_point": "ようとする",
        "meaning": "try to; attempt to; be about to~"
    },
    379: {
        "pattern": r"ずに",
        "grammar_point": "ずに",
        "meaning": "without doing~"
    },
    380: {
        "pattern": r"ずにはいられない",
        "grammar_point": "ずにはいられない",
        "meaning": "can't help but feel; can't help but do"
    },
    381: {
        "pattern": r"ずつ",
        "grammar_point": "ずつ",
        "meaning": "apiece; each; at a time"
    },

    # ── N2 ────────────────────────────────────────────────────────────────────
    382: {
        "pattern": r"(あげく|挙げ句)",
        "grammar_point": "あげく",
        "meaning": "to end up; in the end; finally; after all~"
    },
    383: {
        "pattern": r"あるいは",
        "grammar_point": "あるいは",
        "meaning": "or; either; maybe; perhaps; possibly~"
    },
    385: {
        "pattern": r"ばかりだ",
        "grammar_point": "ばかりだ",
        "meaning": "continue to (go in negative direction)"
    },
    386: {
        "pattern": r"ばかりか",
        "grammar_point": "ばかりか",
        "meaning": "not only.. but also; as well as~"
    },
    387: {
        "pattern": r"ばかりに",
        "grammar_point": "ばかりに",
        "meaning": "simply because; on account of~"
    },
    388: {
        "pattern": r"ちなみに",
        "grammar_point": "ちなみに",
        "meaning": "by the way; in this connection; incidentally"
    },
    389: {
        "pattern": r"ちっとも.+(ない|ません)",
        "grammar_point": "ちっとも〜ない",
        "meaning": "(not) at all; (not) in the least~"
    },
    390: {
        "pattern": r"だけあって",
        "grammar_point": "だけあって",
        "meaning": "being the case; precisely because; as"
    },
    391: {
        "pattern": r"だけましだ",
        "grammar_point": "だけましだ",
        "meaning": "it's better than; one should feel grateful for~"
    },
    392: {
        "pattern": r"だけに",
        "grammar_point": "だけに",
        "meaning": "being the case; precisely because; as one"
    },
    393: {
        "pattern": r"だけのことはある",
        "grammar_point": "だけのことはある",
        "meaning": "no wonder; as expected of; not ... for"
    },
    396: {
        "pattern": r"でしかない",
        "grammar_point": "でしかない",
        "meaning": "merely; nothing but; no more than"
    },
    397: {
        "pattern": r"どころではない",
        "grammar_point": "どころではない",
        "meaning": "not the time for; not the place for; far from"
    },
    398: {
        "pattern": r"どころか",
        "grammar_point": "どころか",
        "meaning": "far from; anything but; let alone"
    },
    399: {
        "pattern": r"どうやら",
        "grammar_point": "どうやら",
        "meaning": "possibly; apparently; seems like; somehow"
    },
    400: {
        "pattern": r"どうせ",
        "grammar_point": "どうせ",
        "meaning": "anyhow; in any case; at any rate; after all"
    },
    401: {
        "pattern": r"(得ない|えない)",
        "grammar_point": "得ない",
        "meaning": "unable to; cannot; it is not possible to~"
    },
    402: {
        "pattern": r"(再び|ふたたび)",
        "grammar_point": "再び",
        "meaning": "again; once more"
    },
    404: {
        "pattern": r"(が|を)きっかけ(で|に)",
        "grammar_point": "がきっかけで・をきっかけに",
        "meaning": "with… as a start; as a result of; taking"
    },
    406: {
        "pattern": r"逆に",
        "grammar_point": "逆に",
        "meaning": "conversely; on the contrary~"
    },
    407: {
        "pattern": r"(反面|はんめん)",
        "grammar_point": "はんめん",
        "meaning": "while; although; on the other hand~"
    },
    408: {
        "pattern": r"果たして",
        "grammar_point": "果たして",
        "meaning": "as was expected; sure enough; really"
    },
    409: {
        "pattern": r"(一応|いちおう)",
        "grammar_point": "いちおう",
        "meaning": "more or less; pretty much; roughly"
    },
    410: {
        "pattern": r"以外",
        "grammar_point": "以外",
        "meaning": "with the exception of; excepting~"
    },
    411: {
        "pattern": r"以上に",
        "grammar_point": "以上に",
        "meaning": "more than; not less than; beyond~"
    },
    412: {
        "pattern": r"以上は",
        "grammar_point": "以上は",
        "meaning": "because; since; seeing that~"
    },
    413: {
        "pattern": r"いきなり",
        "grammar_point": "いきなり",
        "meaning": "abruptly; suddenly; all of a sudden"
    },
    414: {
        "pattern": r"(一気に|いっきに)",
        "grammar_point": "いっきに",
        "meaning": "in one go; without stopping; all at once"
    },
    415: {
        "pattern": r"(一方で|いっぽうで)",
        "grammar_point": "いっぽうで",
        "meaning": "on one hand; on the other hand; although~"
    },
    416: {
        "pattern": r"いわゆる",
        "grammar_point": "いわゆる",
        "meaning": "what is called; as it is called; the so-called"
    },
    417: {
        "pattern": r"いよいよ",
        "grammar_point": "いよいよ",
        "meaning": "at last; finally; beyond doubt"
    },
    419: {
        "pattern": r"かのように",
        "grammar_point": "かのように",
        "meaning": "as if; just like~"
    },
    420: {
        "pattern": r"かと思ったら",
        "grammar_point": "かと思ったら",
        "meaning": "just when; no sooner than~"
    },
    421: {
        "pattern": r"か.+ないかのうちに",
        "grammar_point": "か〜ないかのうちに",
        "meaning": "just as; right after; as soon as~"
    },
    422: {
        "pattern": r"かえって",
        "grammar_point": "かえって",
        "meaning": "on the contrary; rather; all the more"
    },
    424: {
        "pattern": r"(甲斐|かい)がある",
        "grammar_point": "甲斐がある",
        "meaning": "it's worth one's efforts to do something"
    },
    425: {
        "pattern": r"かねない",
        "grammar_point": "かねない",
        "meaning": "(someone) might do something"
    },
    426: {
        "pattern": r"かねる",
        "grammar_point": "かねる",
        "meaning": "unable to do something; can't do something"
    },
    427: {
        "pattern": r"から(いうと|言うと)",
        "grammar_point": "からいうと",
        "meaning": "in terms of; from the point of view of~"
    },
    428: {
        "pattern": r"からこそ",
        "grammar_point": "からこそ",
        "meaning": "precisely because~"
    },
    429: {
        "pattern": r"から(みると|見ると)",
        "grammar_point": "からみると",
        "meaning": "from the point of view of; by the look of"
    },
    430: {
        "pattern": r"からには",
        "grammar_point": "からには",
        "meaning": "now that; since; so long as; because~"
    },
    431: {
        "pattern": r"からして",
        "grammar_point": "からして",
        "meaning": "judging from; based on; since; from; even~"
    },
    432: {
        "pattern": r"から(すると|すれば)",
        "grammar_point": "からすると・からすれば",
        "meaning": "judging from; considering; by the look of~"
    },
    433: {
        "pattern": r"からといって",
        "grammar_point": "からといって",
        "meaning": "just because; even if; even though~"
    },
    434: {
        "pattern": r"っこない",
        "grammar_point": "っこない",
        "meaning": "no chance of; …is definitely not possible"
    },
    436: {
        "pattern": r"ことだから",
        "grammar_point": "ことだから",
        "meaning": "because; since~"
    },
    438: {
        "pattern": r"ことなく",
        "grammar_point": "ことなく",
        "meaning": "without doing something even once"
    },
    440: {
        "pattern": r"ことにはならない",
        "grammar_point": "ことにはならない",
        "meaning": "just because… doesn't mean~"
    },
    441: {
        "pattern": r"くせして",
        "grammar_point": "くせして",
        "meaning": "although~; despite the fact that~"
    },
    442: {
        "pattern": r"まだしも",
        "grammar_point": "まだしも",
        "meaning": "rather; better ~"
    },
    444: {
        "pattern": r"ままに",
        "grammar_point": "ままに",
        "meaning": "as; to do as~"
    },
    445: {
        "pattern": r"(全く|まったく).+(ない|ません)",
        "grammar_point": "全く〜ない",
        "meaning": "not at all~"
    },
    446: {
        "pattern": r"(もかまわず|も構わず)",
        "grammar_point": "もかまわず",
        "meaning": "without caring; without worrying about~"
    },
    447: {
        "pattern": r"も当然だ",
        "grammar_point": "も当然だ",
        "meaning": "it's only natural; no wonder; might as well~"
    },
    449: {
        "pattern": r"ものだ",
        "grammar_point": "ものだ",
        "meaning": "describe feeling; express memories; state fact"
    },
    450: {
        "pattern": r"ものだから",
        "grammar_point": "ものだから",
        "meaning": "so; therefore; the reason for something"
    },
    451: {
        "pattern": r"ものではない",
        "grammar_point": "ものではない",
        "meaning": "shouldn't do something; it's impossible to~"
    },
    452: {
        "pattern": r"ものがある",
        "grammar_point": "ものがある",
        "meaning": "there is such a thing; to be the case that"
    },
    453: {
        "pattern": r"(ものか|もんか)",
        "grammar_point": "ものか・もんか",
        "meaning": "as if (something untrue were actually true)"
    },
    454: {
        "pattern": r"ものなら",
        "grammar_point": "ものなら",
        "meaning": "if I/we could; if [A] is possible then [B]"
    },
    455: {
        "pattern": r"ものの",
        "grammar_point": "ものの",
        "meaning": "but; although; even though~"
    },
    456: {
        "pattern": r"もっとも",
        "grammar_point": "もっとも",
        "meaning": "but then; although; though~"
    },
    457: {
        "pattern": r"もう少しで",
        "grammar_point": "もう少しで",
        "meaning": "almost; nearly; close to~"
    },
    458: {
        "pattern": r"ないではいられない",
        "grammar_point": "ないではいられない",
        "meaning": "can't help but feel; can't help but do~"
    },
    459: {
        "pattern": r"ないことには.+(ない|ません)",
        "grammar_point": "ないことには〜ない",
        "meaning": "unless you~"
    },
    460: {
        "pattern": r"なくはない",
        "grammar_point": "なくはない",
        "meaning": "it's not that; I may (double negative)"
    },
    461: {
        "pattern": r"なくて済む",
        "grammar_point": "なくて済む",
        "meaning": "get by without doing~"
    },
    462: {
        "pattern": r"(何も|なにも).+(ない|ません)",
        "grammar_point": "何も〜ない",
        "meaning": "nothing; (not) ~ at all; there's no need to~"
    },
    464: {
        "pattern": r"ねばならない",
        "grammar_point": "ねばならない",
        "meaning": "have to do; must; should~"
    },
    465: {
        "pattern": r"にあたって",
        "grammar_point": "にあたって",
        "meaning": "at the time; on the occasion of~"
    },
    466: {
        "pattern": r"にほかならない",
        "grammar_point": "にほかならない",
        "meaning": "nothing but; none other than~"
    },
    467: {
        "pattern": r"に限らず",
        "grammar_point": "に限らず",
        "meaning": "not just; not only.. but also~"
    },
    468: {
        "pattern": r"に限る",
        "grammar_point": "に限る",
        "meaning": "is best; nothing is better than~"
    },
    469: {
        "pattern": r"に限って",
        "grammar_point": "に限って",
        "meaning": "only; in particular~"
    },
    470: {
        "pattern": r"に(関わらず|かかわらず)",
        "grammar_point": "に関わらず",
        "meaning": "in spite of; regardless of~"
    },
    471: {
        "pattern": r"に(関わる|かかわる)",
        "grammar_point": "に関わる",
        "meaning": "to relate to; to have to do with; relating to~"
    },
    472: {
        "pattern": r"に決まっている",
        "grammar_point": "に決まっている",
        "meaning": "certainly; I'm sure/certain that; it must be"
    },
    473: {
        "pattern": r"に越したことはない",
        "grammar_point": "に越したことはない",
        "meaning": "it's best that; there's nothing better than~"
    },
    474: {
        "pattern": r"に(応えて|こたえて)",
        "grammar_point": "に応えて",
        "meaning": "in response to~"
    },
    475: {
        "pattern": r"に加えて",
        "grammar_point": "に加えて",
        "meaning": "in addition~"
    },
    476: {
        "pattern": r"に基づいて",
        "grammar_point": "に基づいて",
        "meaning": "based on; on the basis of~"
    },
    477: {
        "pattern": r"に向かって",
        "grammar_point": "に向かって",
        "meaning": "to face; to go towards; to head to~"
    },
    478: {
        "pattern": r"に応じて",
        "grammar_point": "に応じて",
        "meaning": "depending on; in accordance with~"
    },
    479: {
        "pattern": r"に際して",
        "grammar_point": "に際して",
        "meaning": "on the occasion of; at the time of~"
    },
    480: {
        "pattern": r"に(先立ち|さきだち)",
        "grammar_point": "にさきだち",
        "meaning": "before; prior to~"
    },
    481: {
        "pattern": r"(にせよ|にしろ)(?!.+にしろ)",
        "grammar_point": "にせよ・にしろ",
        "meaning": "even if; regardless; whether... or"
    },
    482: {
        "pattern": r"にしろ.+にしろ",
        "grammar_point": "にしろ〜にしろ",
        "meaning": "whether… or~"
    },
    483: {
        "pattern": r"に(したら|すれば)",
        "grammar_point": "にしたら・にすれば",
        "meaning": "from one's perspective; from the point of"
    },
    484: {
        "pattern": r"にしても.+にしても",
        "grammar_point": "にしても〜にしても",
        "meaning": "regardless of whether~"
    },
    485: {
        "pattern": r"に沿って",
        "grammar_point": "に沿って",
        "meaning": "along with; in accordance with"
    },
    486: {
        "pattern": r"に相違ない",
        "grammar_point": "に相違ない",
        "meaning": "without a doubt; certain; sure"
    },
    487: {
        "pattern": r"に過ぎない",
        "grammar_point": "に過ぎない",
        "meaning": "no more than; just; merely; only~"
    },
    488: {
        "pattern": r"に(伴って|ともなって)",
        "grammar_point": "に伴って",
        "meaning": "as; due to; with; along with; following"
    },
    489: {
        "pattern": r"につけ",
        "grammar_point": "につけ",
        "meaning": "every time; whenever; as; whether"
    },
    490: {
        "pattern": r"につき",
        "grammar_point": "につき",
        "meaning": "due to; because of; per; each"
    },
    491: {
        "pattern": r"にわたって",
        "grammar_point": "にわたって",
        "meaning": "throughout; over a period of~"
    },
    492: {
        "pattern": r"にも(関わらず|かかわらず)",
        "grammar_point": "にも関わらず",
        "meaning": "despite; in spite of; nevertheless; although~"
    },
    494: {
        "pattern": r"のももっともだ",
        "grammar_point": "のももっともだ",
        "meaning": "no wonder; …is only natural"
    },
    495: {
        "pattern": r"の(下で|もとで)",
        "grammar_point": "の下で",
        "meaning": "under; with~"
    },
    496: {
        "pattern": r"の上では",
        "grammar_point": "の上では",
        "meaning": "according to; from the viewpoint of~"
    },
    497: {
        "pattern": r"のみならず",
        "grammar_point": "のみならず",
        "meaning": "not only; besides; as well as~"
    },
    500: {
        "pattern": r"を契機に",
        "grammar_point": "を契機に",
        "meaning": "as a good opportunity/chance to; as a result"
    },
    501: {
        "pattern": r"をめぐって",
        "grammar_point": "をめぐって",
        "meaning": "concerning; in regard to~"
    },
    502: {
        "pattern": r"をもとに",
        "grammar_point": "をもとに",
        "meaning": "based on; derived from; building on"
    },
    503: {
        "pattern": r"を除いて",
        "grammar_point": "を除いて",
        "meaning": "except; with the exception of; excluding~"
    },
    504: {
        "pattern": r"を問わず",
        "grammar_point": "を問わず",
        "meaning": "regardless of; irrespective of; no matter"
    },
    505: {
        "pattern": r"お.+(願う|ねがう)",
        "grammar_point": "お〜願う",
        "meaning": "please do; could you please…; I ask of you"
    },
    506: {
        "pattern": r"おまけに",
        "grammar_point": "おまけに",
        "meaning": "to make matters worse; besides; what's"
    },
    507: {
        "pattern": r"(恐らく|おそらく)",
        "grammar_point": "恐らく",
        "meaning": "perhaps; likely; probably; I dare say~"
    },
    508: {
        "pattern": r"(恐れ|おそれ)がある",
        "grammar_point": "恐れがある",
        "meaning": "it is feared that; to be in danger of; to be"
    },
    509: {
        "pattern": r"(及び|および)",
        "grammar_point": "及び",
        "meaning": "and; as well as~"
    },
    510: {
        "pattern": r"ろくに.+(ない|ません)",
        "grammar_point": "ろくに〜ない",
        "meaning": "not well; not enough; improperly"
    },
    511: {
        "pattern": r"幸いなことに",
        "grammar_point": "幸いなことに",
        "meaning": "fortunately; luckily; thankfully~"
    },
    512: {
        "pattern": r"せいか",
        "grammar_point": "せいか",
        "meaning": "perhaps because~"
    },
    513: {
        "pattern": r"せっかく",
        "grammar_point": "せっかく",
        "meaning": "especially; (thank you for) troubling to"
    },
    514: {
        "pattern": r"せめて",
        "grammar_point": "せめて",
        "meaning": "at least; at most~"
    },
    516: {
        "pattern": r"次第で",
        "grammar_point": "次第で",
        "meaning": "depending on; so~"
    },
    517: {
        "pattern": r"次第に",
        "grammar_point": "次第に",
        "meaning": "gradually (progress into a state)"
    },
    518: {
        "pattern": r"しかも",
        "grammar_point": "しかも",
        "meaning": "moreover; furthermore; and yet; what's"
    },
    519: {
        "pattern": r"その上",
        "grammar_point": "その上",
        "meaning": "besides; in addition; furthermore~"
    },
    520: {
        "pattern": r"それなのに",
        "grammar_point": "それなのに",
        "meaning": "and yet; despite this; but even so~"
    },
    521: {
        "pattern": r"それにしても",
        "grammar_point": "それにしても",
        "meaning": "nevertheless; at any rate; even so"
    },
    522: {
        "pattern": r"そういえば",
        "grammar_point": "そういえば",
        "meaning": "come to think of it…; now that you mention"
    },
    523: {
        "pattern": r"そうすると",
        "grammar_point": "そうすると",
        "meaning": "having done that; if that is done"
    },
    524: {
        "pattern": r"(末に|すえに)",
        "grammar_point": "末に",
        "meaning": "finally; after; following; at the end"
    },
    525: {
        "pattern": r"少しも.+(ない|ません)",
        "grammar_point": "少しも〜ない",
        "meaning": "not one bit; not even a little~"
    },
    526: {
        "pattern": r"少なくとも",
        "grammar_point": "少なくとも",
        "meaning": "at least~"
    },
    527: {
        "pattern": r"(直ちに|ただちに)",
        "grammar_point": "直ちに",
        "meaning": "at once; immediately; directly; in person"
    },
    528: {
        "pattern": r"たまえ",
        "grammar_point": "たまえ",
        "meaning": "do~; order somebody to do something"
    },
    529: {
        "pattern": r"てばかりはいられない",
        "grammar_point": "てばかりはいられない",
        "meaning": "can't keep doing~"
    },
    530: {
        "pattern": r"てでも",
        "grammar_point": "てでも",
        "meaning": "even if I have to; by all means~"
    },
    531: {
        "pattern": r"て以来",
        "grammar_point": "て以来",
        "meaning": "since; henceforth~"
    },
    532: {
        "pattern": r"ていては",
        "grammar_point": "ていては",
        "meaning": "if one keeps doing~"
    },
    533: {
        "pattern": r"てこそ",
        "grammar_point": "てこそ",
        "meaning": "now that; since (something happened)"
    },
    534: {
        "pattern": r"てまで",
        "grammar_point": "てまで",
        "meaning": "even; will go far so as to~"
    },
    535: {
        "pattern": r"てならない",
        "grammar_point": "てならない",
        "meaning": "can't help but; dying to; extremely~"
    },
    536: {
        "pattern": r"てたまらない",
        "grammar_point": "てたまらない",
        "meaning": "can't help but; dying to; extremely~"
    },
    537: {
        "pattern": r"て当然だ",
        "grammar_point": "て当然だ",
        "meaning": "natural; as a matter of course"
    },
    539: {
        "pattern": r"てはいられない",
        "grammar_point": "てはいられない",
        "meaning": "can't afford to; unable to~"
    },
    540: {
        "pattern": r"てはならない",
        "grammar_point": "てはならない",
        "meaning": "must not; cannot; should not~"
    },
    541: {
        "pattern": r"ては.+ては",
        "grammar_point": "ては〜ては",
        "meaning": "repetitive situations/actions"
    },
    542: {
        "pattern": r"と同時に",
        "grammar_point": "と同時に",
        "meaning": "at the same time as; while; simultaneously~"
    },
    543: {
        "pattern": r"といった",
        "grammar_point": "といった",
        "meaning": "like; such as~"
    },
    544: {
        "pattern": r"というふうに",
        "grammar_point": "というふうに",
        "meaning": "in such a way that~"
    },
    545: {
        "pattern": r"ということは",
        "grammar_point": "ということは",
        "meaning": "that is to say; so that means; in other words~"
    },
    546: {
        "pattern": r"というものだ",
        "grammar_point": "というものだ",
        "meaning": "something like; something called~"
    },
    547: {
        "pattern": r"というものではない",
        "grammar_point": "というものではない",
        "meaning": "there is no guarantee that…; not necessarily~"
    },
    548: {
        "pattern": r"と考えられる",
        "grammar_point": "と考えられる",
        "meaning": "one can think that; it is conceivable that"
    },
    550: {
        "pattern": r"とっくに",
        "grammar_point": "とっくに",
        "meaning": "long ago; already; a long time ago"
    },
    551: {
        "pattern": r"ところだった",
        "grammar_point": "ところだった",
        "meaning": "was just about to do something"
    },
    553: {
        "pattern": r"ところを(みると|見ると)",
        "grammar_point": "ところをみると",
        "meaning": "judging from; seeing that~"
    },
    555: {
        "pattern": r"としても",
        "grammar_point": "としても",
        "meaning": "assuming; even if~"
    },
    557: {
        "pattern": r"つつある",
        "grammar_point": "つつある",
        "meaning": "to be doing; to be in the process of doing~"
    },
    559: {
        "pattern": r"はもとより",
        "grammar_point": "はもとより",
        "meaning": "also; let alone; from the beginning"
    },
    560: {
        "pattern": r"はともかく",
        "grammar_point": "はともかく",
        "meaning": "anyhow; anyway; regardless; in any case"
    },
    561: {
        "pattern": r"わずかに",
        "grammar_point": "わずかに",
        "meaning": "slightly; only; barely; narrowly~"
    },
    562: {
        "pattern": r"やがて",
        "grammar_point": "やがて",
        "meaning": "before long; soon; almost; eventually~"
    },
    563: {
        "pattern": r"やら.+やら",
        "grammar_point": "やら〜やら",
        "meaning": "such things as A and B; A and B and so on~"
    },
    564: {
        "pattern": r"(よほど|よっぽど)",
        "grammar_point": "よほど・よっぽど",
        "meaning": "very; greatly; much; to a large extent"
    },
    566: {
        "pattern": r"よりほかない",
        "grammar_point": "よりほかない",
        "meaning": "to have no choice but~"
    },
    567: {
        "pattern": r"ようでは",
        "grammar_point": "ようでは",
        "meaning": "if~ (bad result)"
    },
    568: {
        "pattern": r"ようではないか",
        "grammar_point": "ようではないか",
        "meaning": "let's do (something); why don't we~"
    },
    569: {
        "pattern": r"ようか.+まいか",
        "grammar_point": "ようか〜まいか",
        "meaning": "whether or not; considering options"
    },
    570: {
        "pattern": r"要するに",
        "grammar_point": "要するに",
        "meaning": "in short; in a word; to sum up"
    },
    571: {
        "pattern": r"ざるを得ない",
        "grammar_point": "ざるを得ない",
        "meaning": "cannot help (doing); have no choice but to~"
    },
    572: {
        "pattern": r"ずに済む",
        "grammar_point": "ずに済む",
        "meaning": "get by without doing~"
    },
}


# =============================================================================
# DETECTION FUNCTIONS
# =============================================================================

def detect(sentence: str) -> List[list]:
    """
    Detect all JLPT grammar patterns in a sentence.
    Returns [[grammar_id, grammar_point, meaning], ...] sorted by grammar_id.
    grammar_id matches the global index in masterGrammars.json.
    """
    matches = []
    for grammar_id, info in ALL_PATTERNS.items():
        try:
            if re.search(info["pattern"], sentence):
                matches.append([grammar_id, info["grammar_point"], info["meaning"]])
        except re.error as e:
            print(f"Regex error for grammar_id {grammar_id}: {e}")
    return matches


def get_unique_patterns(matches: List[list]) -> List[list]:
    """Remove duplicate grammar_id entries, keeping first occurrence."""
    seen = set()
    unique = []
    for match in matches:
        if match[0] not in seen:
            seen.add(match[0])
            unique.append(match)
    return unique


def format_matches(matches: List[list]) -> str:
    """Format match list as a readable string."""
    if not matches:
        return "No grammar patterns detected."
    return "\n".join(f"{m[0]:4} | {m[1]:30} | {m[2]}" for m in matches)


# =============================================================================
# MAIN (for testing)
# =============================================================================

if __name__ == "__main__":
    test_sentences = [
        "日本語を勉強しなければならない。",
        "彼女は歌が上手だと言われている。",
        "雨が降っているにもかかわらず、出かけた。",
        "もしかしたら、明日は晴れるかもしれない。",
        "この本は読めば読むほど面白くなる。",
    ]

    for sentence in test_sentences:
        print(f"\n{sentence}")
        print("-" * 50)
        matches = detect(sentence)
        print(format_matches(matches) if matches else "No patterns detected.")

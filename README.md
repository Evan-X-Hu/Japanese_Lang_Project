# Japanese Language Project

## Table of Contents
- [Purpose and Project Description](#purpose-and-project-description)
- [Tech Stack](#tech-stack)
- [Project Architecture](#project-architecture)
- [Feature Overview](#feature-overview)
- [Database Design](#database-design)
- [Getting Started](#getting-started)
- [Contributing](#contributing)

## Purpose and Project Description

[Describe the main purpose of your Japanese language learning/practice application]

### Goals
- Input a variety of Japanese content (videos, podcasts, music, etc) and store it on the users system.  
- Iterate through content and find Japanese grammar patterns and assign sentences grammar pattern labels. This was a user can go through a grammar index and view a list of examples and find which media the example came from.  
- Include a dictionary component that will automatically add new words and definitions when parsing Japanese media. And then also have this be in a format so that a user can easily export it to an Anki deck.  
- Include a frontend component to scale to multiple users and have a developer forum to help suggest changes and improvements.  

### Target Users
People who want to learn Japanese. People who are interested in programming.  s

## Tech Stack

### Frontend
- **Framework**: 
- **Language**: [e.g., TypeScript, JavaScript]
- **UI Library**: [e.g., Material-UI, Tailwind CSS, shadcn/ui]
- **State Management**: [e.g., Redux, Zustand, Context API]

### Backend
- **Framework**: [e.g., Express, FastAPI, Django, Spring Boot]
- **Language**: [e.g., Node.js, Python, Java]
- **Authentication**: [e.g., JWT, OAuth, Passport]

### Database
- **Primary Database**: [e.g., PostgreSQL, MongoDB, MySQL]
- **Caching**: [e.g., Redis]
- **ORM/ODM**: [e.g., Prisma, TypeORM, Mongoose]

### DevOps & Tools
- **Version Control**: Git
- **CI/CD**: [e.g., GitHub Actions, GitLab CI]
- **Containerization**: [e.g., Docker]
- **Hosting**: [e.g., Vercel, AWS, Heroku]

### Additional Services
- **Japanese Text Processing**: [e.g., Kuromoji, MeCab]
- **APIs**: [e.g., Jisho API, JLPT API]

## Project Architecture

### High-Level Architecture
```
[Add architecture diagram or description here]

┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼──────┐
│   API       │
│  Gateway    │
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌────▼─────┐ ┌─────▼──────┐
│  Auth       │ │ Learning │ │ Dictionary │
│  Service    │ │ Service  │ │  Service   │
└─────────────┘ └──────────┘ └────────────┘
       │              │              │
       └──────────────┼──────────────┘
                      │
              ┌───────▼────────┐
              │    Database    │
              └────────────────┘
```

### Directory Structure
```
japanese-lang-project/
├── client/              # Frontend application
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── hooks/       # Custom hooks
│   │   ├── services/    # API services
│   │   └── utils/       # Utility functions
│   └── public/
├── server/              # Backend application
│   ├── src/
│   │   ├── routes/      # API routes
│   │   ├── controllers/ # Route controllers
│   │   ├── models/      # Database models
│   │   ├── services/    # Business logic
│   │   └── middleware/  # Express middleware
│   └── tests/
└── docs/                # Documentation
```

### Design Patterns
- [Pattern 1]: [Description]
- [Pattern 2]: [Description]

## Feature Overview

### Core Features

#### 1. User Management
- [ ] User registration and authentication
- [ ] User profile management
- [ ] Progress tracking

#### 2. Vocabulary Learning
- [ ] Flashcard system
- [ ] Spaced repetition algorithm
- [ ] Custom vocabulary lists
- [ ] Audio pronunciation

#### 3. Grammar Practice
- [ ] Grammar lessons by JLPT level
- [ ] Interactive exercises
- [ ] Example sentences

#### 4. Reading Practice
- [ ] Japanese text reader
- [ ] Furigana display toggle
- [ ] Dictionary lookup (hover/click)
- [ ] Text difficulty analysis

#### 5. Writing Practice
- [ ] Kanji writing practice
- [ ] Stroke order guidance
- [ ] Handwriting recognition

#### 6. Listening Practice
- [ ] Audio lessons
- [ ] Listening comprehension exercises
- [ ] Speech speed control

#### 7. Progress Tracking
- [ ] Learning statistics
- [ ] Daily streak counter
- [ ] Achievement system
- [ ] Performance analytics

### Additional Features
- [ ] Mobile responsive design
- [ ] Offline mode
- [ ] Dark mode support
- [ ] Export/import study data

## Database Design

### Entity Relationship Diagram
```
[Add ERD here]
```

### Core Tables/Collections

#### Users
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/ObjectId | Primary key |
| username | String | Unique username |
| email | String | User email |
| password_hash | String | Hashed password |
| jlpt_level | Enum | Current JLPT level |
| created_at | DateTime | Account creation timestamp |
| updated_at | DateTime | Last update timestamp |

#### Vocabulary
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/ObjectId | Primary key |
| kanji | String | Kanji form |
| hiragana | String | Hiragana reading |
| romaji | String | Romaji reading |
| meaning | String | English meaning |
| jlpt_level | Enum | JLPT level (N5-N1) |
| parts_of_speech | Array | [noun, verb, etc.] |
| example_sentences | Array | Usage examples |

#### UserProgress
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/ObjectId | Primary key |
| user_id | UUID/ObjectId | Foreign key to Users |
| vocabulary_id | UUID/ObjectId | Foreign key to Vocabulary |
| mastery_level | Integer | 0-5 (SRS level) |
| last_reviewed | DateTime | Last review timestamp |
| next_review | DateTime | Next review timestamp |
| correct_count | Integer | Number of correct answers |
| incorrect_count | Integer | Number of incorrect answers |

#### Grammar
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/ObjectId | Primary key |
| title | String | Grammar point title |
| explanation | Text | Detailed explanation |
| jlpt_level | Enum | JLPT level |
| examples | Array | Example sentences |
| related_grammar | Array | Related grammar points |

#### Lessons
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/ObjectId | Primary key |
| title | String | Lesson title |
| type | Enum | vocabulary/grammar/reading/etc. |
| difficulty | Enum | beginner/intermediate/advanced |
| content | JSON | Lesson content |
| order | Integer | Display order |

#### Achievements
| Field | Type | Description |
|-------|------|-------------|
| id | UUID/ObjectId | Primary key |
| user_id | UUID/ObjectId | Foreign key to Users |
| achievement_type | String | Type of achievement |
| unlocked_at | DateTime | Achievement unlock timestamp |
| metadata | JSON | Additional data |

### Indexes
- Users: email (unique), username (unique)
- Vocabulary: jlpt_level, kanji
- UserProgress: user_id + vocabulary_id (composite), next_review
- Grammar: jlpt_level

### Relationships
- Users → UserProgress (One-to-Many)
- Vocabulary → UserProgress (One-to-Many)
- Users → Achievements (One-to-Many)

## Getting Started

### Prerequisites
- [Required software and versions]

### Installation

1. Clone the repository
```bash
git clone [repository-url]
cd japanese-lang-project
```

2. Install dependencies
```bash
# Frontend
cd client
npm install

# Backend
cd ../server
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Set up the database
```bash
# Run migrations
npm run migrate

# Seed initial data
npm run seed
```

5. Start the development servers
```bash
# Frontend
npm run dev

# Backend (in another terminal)
npm run dev
```

### Running Tests
```bash
npm run test
```

## Contributing

[Add contribution guidelines]

## License

[Add license information]

## Contact

[Add contact information or links]
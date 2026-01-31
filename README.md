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
People who want to learn Japanese. People who are interested in programming.  

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

#### 2. Content Input Learning
(user & server components)  
- [ ] Import variety of media content, save it as csv's with data:(start_time, end_time, text)
- [ ] Pickout the sentences from the CSV and find the start and end time for the start and end
- [ ] Assign classification tags to all sentences for a piece of media
- [ ] Pickout all unique words from the CSV and list them along with their tags

(user only components)
- [ ] User can create new lists/decks for vocab or sentences
- [ ] User can look at the vocab and sentence lists for all their inputted media  
      from that select sentences or words and add them to any list of their choosing
- [ ] User can output their decks to Anki


#### 3. Vocabulary Learning (specifics)
- [ ] Use a dictionary to help with making the vocabulary cards for each piece of media
- [ ] Have the format be: Front: Kanji   Back: Hiragana, English Def, 
   Example sentences from media (inclusive of all conjugated forms) (limit 3 sentences)

#### 4. Grammar Practice (specifics)
- [ ] Have a grammar dictionary that has all the grammar points and sentence patterns sorted by JLPT
- [ ] Each media sentence has tags for grammar, pattern, and level  
      So for the dictionary, user should be able to see all their saved sentences per JLPT grammar,
      and sentence patterns
- [ ] Sentence patterns may be difficult to implement because its not just one grammar but often multiple
      Maybe do some data mining for good datasets

#### 5. Progress Tracking
- [ ] Allow user to set time of starting to learn Japanese along with estimated hours (honor system)  
      This is more for if I build a collaborative user platform they can see their credibility
      when interacting.
- [ ] Allow user to see the total number of sentences they have saved
- [ ] Allow user to see the total number of words they have saved
- [ ] Allow user to view percentage distribution based off JLPT level

### Additional Features
- [ ] Dark mode support

## Database Design
*See ERD.md*

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
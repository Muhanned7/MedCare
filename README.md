# MedCare — Voice → Knowledge Extraction → Conflict Detection

A clinical knowledge capture pipeline for Supra Multi-Specialty Hospital.
Doctors speak or paste consultation notes; the system extracts structured
knowledge, routes it by confidence, detects semantic conflicts via pgvector,
and stores verified nodes into a hospital knowledge graph.

---
<img width="1103" height="529" alt="image" src="https://github.com/user-attachments/assets/84eaa1f6-4c5e-4b64-b021-ed05692ed1b8" />



## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | FastAPI (Python 3.11+) |
| Frontend | React + Vite + Tailwind CSS |
| Database | Supabase (PostgreSQL + pgvector) |
| LLM Extraction | Google Gemini 2.5 Flash |
| Embeddings | Gemini Embedding 2 (768 dimensions) |
| Speech Input | Web Speech API (Chrome built-in) |

---

## Project Structure

```
brahmo-capture-pipeline/
├── README.md
├── .env                          ← NOT committed (see .env.example)
├── .env.example
├── .gitignore
├── data_sources.md
├── scripts/
│   └── generate_embeddings.py   ← Run once after seeding
├── backend/
│   ├── main.py
│   ├── app/
│   │   ├── config.py
│   │   ├── database.py
│   │   ├── schemas.py
│   │   ├── routes/
│   │   │   └── pipeline.py
│   │   └── services/
│   │       ├── extractor.py     ← Gemini LLM extraction
│   │       ├── router.py        ← Confidence tier routing
│   │       └── vector.py        ← pgvector conflict detection
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── index.css
        └── components/
            ├── TranscriptReview.jsx   ← Stage 1-2: Voice + HITL #1
            └── CandidateList.jsx      ← Stage 3-5: Routing + HITL #2
```

---

## Prerequisites

| Tool | Version | Why |
|------|---------|-----|
| Python | 3.11+ | Backend runtime |
| Node.js | 18+ | Frontend runtime |
| Git | Any | Version control |
| Chrome | Latest | Web Speech API |
| Supabase account | Free | PostgreSQL + pgvector |
| Google AI account | Free | Gemini API key |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd brahmo-capture-pipeline
```

### 2. Create your `.env` file

```bash
cp .env.example .env
```

Edit `.env` and fill in your keys:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-key
GEMINI_API_KEY=your-gemini-api-key
MOCK=False
```

**Get your keys:**
- Supabase: [supabase.com](https://supabase.com) → Project → Settings → API
- Gemini: [aistudio.google.com](https://aistudio.google.com) → Get API Key

---

### 3. Backend setup

```bash
cd backend
python3 -m venv venv

# Mac/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate

pip install fastapi uvicorn supabase python-dotenv google-genai
```

---

### 4. Supabase setup

#### 4a. Enable pgvector

In Supabase → SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### 4b. Create tables

Run the full schema SQL in `supabase/schema.sql` in the SQL Editor.
This creates: `organizations`, `hierarchy_levels`, `knowledge_nodes`,
`capture_candidates`, `users`, `patients`, `event_log`.

#### 4c. Load seed data

Run `supabase/seed.sql` in the SQL Editor.

Verify:
```sql
SELECT COUNT(*) FROM knowledge_nodes;
-- Should return 20
```

#### 4d. Create the RPC function

```sql
DROP FUNCTION IF EXISTS match_knowledge_nodes(text, vector, double precision, integer);

CREATE OR REPLACE FUNCTION match_knowledge_nodes(
    query_patient_id TEXT,
    query_embedding vector(768),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (id TEXT, content TEXT, similarity FLOAT)
LANGUAGE sql STABLE
AS $$
    SELECT
        kn.id,
        kn.content,
        1 - (kn.embedding <=> query_embedding) AS similarity
    FROM knowledge_nodes kn
    JOIN hierarchy_levels hl ON kn.hierarchy_level_id = hl.id
    WHERE (
        (hl.id = 'HL-12-RAMAIAH' AND query_patient_id = 'PAT-RAMAIAH')
        OR (hl.id = 'HL-12-AADHYA' AND query_patient_id = 'PAT-AADHYA')
        OR hl.level_number <= 5
    )
    AND kn.embedding IS NOT NULL
    AND 1 - (kn.embedding <=> query_embedding) > match_threshold
    ORDER BY kn.embedding <=> query_embedding
    LIMIT match_count;
$$;
```

---

### 5. Generate embeddings

Run this once after seeding to populate the `embedding` column
for all 20 seed nodes:

```bash
cd backend
python scripts/generate_embeddings.py
```

Expected output:
```
Found 20 nodes to embed...
✅ Embedded: N-G01 — Warfarin-NSAID Interaction
✅ Embedded: N-G02 — Penicillin Allergy Cross-Reactivity
...
Done! 20 nodes embedded.
```

Verify:
```sql
SELECT COUNT(*) FROM knowledge_nodes WHERE embedding IS NOT NULL;
-- Should return 20
```

---

### 6. Start the backend

```bash
cd backend
source venv/bin/activate   # if not already active
uvicorn main:app --reload --port 8000
```

Health check: [http://localhost:8000/api/pipeline/health/supabase](http://localhost:8000/api/pipeline/health/supabase)

---

### 7. Start the frontend

```bash
cd frontend
npm install
npm run dev
```

Open: [http://localhost:5173](http://localhost:5173)

---

## Pipeline Overview

```
Doctor speaks or pastes transcript
        ↓
[HITL #1] Transcript Review — doctor edits for accuracy
        ↓
Gemini 2.5 Flash extracts typed knowledge candidates
        ↓
Confidence Router assigns tier:
  GREEN  >0.85  → AUTO-CAPTURED (60s undo timer)
  YELLOW 0.60-0.85 → REVIEW (Confirm / Edit / Dismiss)
  RED    <0.60  → EXPLICIT INPUT (doctor must edit form)
        ↓
[HITL #2] pgvector conflict detection per candidate:
  >0.95 similarity → DUPLICATE (suggest merge)
  0.85-0.95       → UPDATE (suggest enrichment)
  0.70-0.85       → COEXIST (keep both)
        ↓
Doctor resolves conflicts → node saved to knowledge_nodes
All actions logged to event_log
```

---

## Test Transcripts

### Primary — Ramaiah (Telugu-English code-switched)
```
Ramaiah gari ki molli noppi undi, Ibuprofen adugutunnaru, stent valla
ivvaledu, Paracetamol continue cheyandi, Tramadol try cheddham,
dizziness monitor cheyali.
```
**Expected:** 4 candidates, conflict with N-045 (NSAID) at >90% similarity.

### Surprise — Aadhya (switch patient in dropdown)
```
Patient Aadhya, 3.5 years, penicillin allergy confirmed — anaphylaxis
at 18 months. Mother requesting amoxicillin for ear infection.
Prescribed azithromycin instead. This is her 5th ear infection this
year, consider ENT referral.
```
**Expected:** 3-4 candidates, conflict with N-060 (penicillin allergy).

### Edge case — Empty session
```
Ramaiah is doing well today. No changes to medications. Follow up in 2 weeks.
```
**Expected:** 0-1 candidates. System correctly identifies nothing new to capture.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/pipeline/extract` | Extract knowledge from transcript |
| POST | `/api/pipeline/node/save` | Save confirmed node |
| POST | `/api/pipeline/node/merge` | Merge candidate into existing node |
| POST | `/api/pipeline/node/dismiss` | Log dismissed candidate |
| POST | `/api/pipeline/node/undo-merge` | Restore node to pre-merge state |
| GET  | `/api/pipeline/health/supabase` | Verify database connection |

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_KEY` | Supabase anon or service role key |
| `GEMINI_API_KEY` | Google Gemini API key |
| `MOCK` | Set to `True` to use hardcoded mock data |

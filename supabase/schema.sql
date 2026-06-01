-- Drop everything cleanly in reverse dependency order
DROP TABLE IF EXISTS event_log CASCADE;
DROP TABLE IF EXISTS capture_candidates CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS knowledge_nodes CASCADE;
DROP TABLE IF EXISTS hierarchy_levels CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Organizations
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Hierarchy Levels
CREATE TABLE IF NOT EXISTS hierarchy_levels (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id),
    level_number INTEGER NOT NULL,
    level_name TEXT NOT NULL,
    department TEXT
);

-- 3. Knowledge Nodes
CREATE TABLE IF NOT EXISTS knowledge_nodes (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id),
    hierarchy_level_id TEXT REFERENCES hierarchy_levels(id),
    type TEXT NOT NULL CHECK (type IN ('CONSTRAINT', 'DECISION', 'ANTI_PATTERN', 'FACT')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    importance DECIMAL(3,2) NOT NULL,
    status TEXT DEFAULT 'ACTIVE' CHECK (status IN (
        'ACTIVE', 'REVIEW_REQUIRED', 'SUPERSEDED', 'PENDING_CONFIRMATION', 'DISMISSED'
    )),
    department TEXT,
    zone INTEGER DEFAULT 1,
    embedding vector(768),
    source TEXT DEFAULT 'MANUAL',
    created_by TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Capture Candidates
CREATE TABLE IF NOT EXISTS capture_candidates (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    org_id TEXT NOT NULL,
    session_id TEXT,
    transcript TEXT NOT NULL,
    candidate_type TEXT NOT NULL,
    candidate_title TEXT NOT NULL,
    candidate_content TEXT NOT NULL,
    importance DECIMAL(3,2),
    confidence DECIMAL(3,2) NOT NULL,
    routing_tier TEXT NOT NULL CHECK (routing_tier IN ('HIGH', 'MEDIUM', 'LOW')),
    suggested_level TEXT,
    department TEXT,
    conflict_type TEXT CHECK (conflict_type IN ('DUPLICATE', 'UPDATE', 'COEXIST', 'NEW', 'SUPERSEDE')),
    conflict_node_id TEXT REFERENCES knowledge_nodes(id),
    conflict_similarity DECIMAL(3,2),
    status TEXT DEFAULT 'PENDING' CHECK (status IN (
        'PENDING', 'AUTO_CAPTURED', 'CONFIRMED', 'MERGED', 'DISMISSED', 'UNDONE'
    )),
    action_taken TEXT,
    action_reason TEXT,
    reviewed_by TEXT,
    reviewed_at TIMESTAMPTZ,
    node_id TEXT REFERENCES knowledge_nodes(id),
    embedding vector(768),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL REFERENCES organizations(id),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    department TEXT NOT NULL
);

-- 6. Patients
CREATE TABLE IF NOT EXISTS patients (
    id TEXT PRIMARY KEY,
    org_id TEXT NOT NULL,
    name TEXT NOT NULL,
    age INTEGER,
    gender TEXT,
    conditions TEXT[],
    notes TEXT
);

-- 7. Event Log
CREATE TABLE IF NOT EXISTS event_log (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    action TEXT NOT NULL,
    payload JSONB DEFAULT '{}',
    actor_id TEXT DEFAULT 'system',
    org_id TEXT DEFAULT 'supra',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nodes_embedding ON knowledge_nodes 
    USING ivfflat (embedding vector_cosine_ops) WITH (lists = 10);
CREATE INDEX IF NOT EXISTS idx_nodes_org ON knowledge_nodes(org_id);
CREATE INDEX IF NOT EXISTS idx_nodes_dept ON knowledge_nodes(department);
CREATE INDEX IF NOT EXISTS idx_candidates_org ON capture_candidates(org_id);
CREATE INDEX IF NOT EXISTS idx_candidates_status ON capture_candidates(status);
-- match_knowledge_nodes: pgvector similarity search
-- Run this AFTER schema.sql and seed.sql

DROP FUNCTION IF EXISTS match_knowledge_nodes(text, vector, double precision, integer);

CREATE OR REPLACE FUNCTION match_knowledge_nodes(
    query_patient_id TEXT,
    query_embedding vector(768),
    match_threshold FLOAT,
    match_count INT
)
RETURNS TABLE (id TEXT, content TEXT, similarity FLOAT, created_at TIMESTAMPTZ)
LANGUAGE sql STABLE
AS $$
    SELECT
        kn.id,
        kn.content,
        1 - (kn.embedding <=> query_embedding) AS similarity,
        kn.created_at
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
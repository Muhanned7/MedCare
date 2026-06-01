import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from dotenv import load_dotenv
load_dotenv()

from supabase import create_client
from google import genai

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
client = genai.Client(api_key=GEMINI_API_KEY)

def generate_embedding(text: str):
    response = client.models.embed_content(
        model="gemini-embedding-2",
        contents=text,
        config={"output_dimensionality": 768}
    )
    return response.embeddings[0].values

# Fetch all nodes without embeddings
nodes = supabase.table("knowledge_nodes").select("id, title, content").execute()
print(f"Found {len(nodes.data)} nodes to embed...\n")

for node in nodes.data:
    text = f"{node['title']}: {node['content']}"
    embedding = generate_embedding(text)
    
    supabase.table("knowledge_nodes").update({
        "embedding": embedding
    }).eq("id", node["id"]).execute()
    
    print(f"✅ Embedded: {node['id']} — {node['title'][:50]}")

print(f"\nDone! {len(nodes.data)} nodes embedded.")
from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    """
    Initializes and returns a connection instance to the Supabase backend.
    """
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        raise ValueError("Supabase environment variables (URL/KEY) are missing.")
    
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
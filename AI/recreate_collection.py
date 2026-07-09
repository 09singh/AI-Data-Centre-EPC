import sys
import os
from pathlib import Path
from qdrant_client import QdrantClient
from qdrant_client.http import models as qmodels
from dotenv import load_dotenv

# Ensure the project folder is in python path
current_dir = Path(__file__).resolve().parent
sys.path.insert(0, str(current_dir))

# Load local environment configuration from project root
load_dotenv(current_dir / ".env")

def recreate_qdrant_collection():
    """CLI utility to safely delete and recreate Qdrant collection with correct unnamed schema."""
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("COLLECTION_NAME", "epc_documents")
    vector_size = int(os.getenv("VECTOR_SIZE", "384"))

    print("=" * 60)
    print("Qdrant Collection Re-creation Admin Utility")
    print("=" * 60)
    print(f"Target Database URL: {qdrant_url}")
    print(f"Target Collection:   {collection_name}")
    print(f"Vector Dimensions:   {vector_size}")
    print("-" * 60)

    if not qdrant_url:
        print("Error: QDRANT_URL is not set inside configuration environment.")
        sys.exit(1)

    # Ask for confirmation
    confirm = input(f"Warning: This will DELETE ALL DATA inside '{collection_name}' collection. Continue? (y/N): ")
    if confirm.lower() not in ["y", "yes"]:
        print("Aborted by user.")
        sys.exit(0)

    try:
        print("Connecting to Qdrant...")
        if qdrant_url == ":memory:":
            client = QdrantClient(":memory:")
        else:
            client = QdrantClient(url=qdrant_url, api_key=qdrant_api_key, timeout=15.0)

        # Check if collection exists and delete it
        try:
            client.get_collection(collection_name=collection_name)
            print(f"Collection '{collection_name}' exists. Deleting it...")
            client.delete_collection(collection_name=collection_name)
            print("Collection deleted successfully.")
        except Exception:
            print(f"Collection '{collection_name}' does not exist yet. Proceeding with creation.")

        # Create collection with correct unnamed vector schema
        print(f"Creating collection '{collection_name}' with unnamed vector size {vector_size} (Metric: Cosine)...")
        client.create_collection(
            collection_name=collection_name,
            vectors_config=qmodels.VectorParams(
                size=vector_size,
                distance=qmodels.Distance.COSINE
            )
        )
        print("Collection created successfully with the correct schema!")
        print("=" * 60)

    except Exception as e:
        print(f"Error occurred during re-creation: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    recreate_qdrant_collection()

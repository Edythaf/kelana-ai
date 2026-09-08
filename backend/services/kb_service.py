import os
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
KNOWLEDGE_BASE_ID = os.getenv("KNOWLEDGE_BASE_ID")
MODEL_ID = os.getenv("MODEL_ID")

kb_client = boto3.client(
    "bedrock-agent-runtime",
    region_name=AWS_REGION
)

bedrock_client = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)


def ask_knowledge_base(question: str):

    # 1. Retrieve relevant information from Knowledge Base
    retrieval_response = kb_client.retrieve(
        knowledgeBaseId=KNOWLEDGE_BASE_ID,
        retrievalQuery={
            "text": question
        },
        retrievalConfiguration={
            "managedSearchConfiguration": {
                "numberOfResults": 3
            }
        }
    )

    # 2. Collect retrieved text and sources
    contexts = []
    sources = []
    seen_sources = set()

    for result in retrieval_response.get("retrievalResults", []):
        text = result.get("content", {}).get("text")

        if text:
            contexts.append(text)

        location = result.get("location", {})
        uri = location.get("s3Location", {}).get("uri")

        if uri and uri not in seen_sources:
            seen_sources.add(uri)
            sources.append(uri.split("/")[-1])

    context_text = "\n\n".join(contexts)

    # 3. Build grounded prompt
    prompt = f"""
Use only the following retrieved travel knowledge to answer the question.

Knowledge:
{context_text}

Question:
{question}

If the knowledge does not contain enough information,
say that the information is not available in the knowledge base.
"""

    # 4. Ask Amazon Nova Lite to generate the answer
    response = bedrock_client.converse(
        modelId=MODEL_ID,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "text": prompt
                    }
                ]
            }
        ]
    )

    # 5. Return generated answer and sources
    return {
        "answer": response["output"]["message"]["content"][0]["text"],
        "sources": sources
    }
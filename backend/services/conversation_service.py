import os
import boto3
from dotenv import load_dotenv

load_dotenv()

AWS_REGION = os.getenv("AWS_REGION")
MODEL_ID = os.getenv("MODEL_ID")

bedrock_client = boto3.client(
    "bedrock-runtime",
    region_name=AWS_REGION
)


def generate_chat_response(messages):
    bedrock_messages = [
        {
            "role": message.role,
            "content": [{"text": message.content}]
        }
        for message in messages
        if message.role in ("user", "assistant")
    ]

    response = bedrock_client.converse(
        modelId=MODEL_ID,
        messages=bedrock_messages
    )

    return response["output"]["message"]["content"][0]["text"]
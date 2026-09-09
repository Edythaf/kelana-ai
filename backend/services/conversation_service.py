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
    """
    Generate an AI response using the complete conversation history.
    """

    bedrock_messages = []

    for message in messages:
        if message.role not in ("user", "assistant"):
            continue

        bedrock_messages.append(
            {
                "role": message.role,
                "content": [
                    {
                        "text": message.content
                    }
                ]
            }
        )

    system_prompt = [
        {
            "text": (
                "You are KelanaAI, a helpful AI travel assistant. "
                "The messages provided to you contain the conversation history "
                "between you and the user. Use the previous messages when answering "
                "the user's latest question. Maintain context across the conversation. "
                "If the user asks what they previously said or asked, answer using "
                "the conversation history that is provided to you. "
                "Do not claim that you cannot access previous messages when those "
                "messages are present in the conversation history."
            )
        }
    ]

    response = bedrock_client.converse(
        modelId=MODEL_ID,
        system=system_prompt,
        messages=bedrock_messages
    )

    return response["output"]["message"]["content"][0]["text"]
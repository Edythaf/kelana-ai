from dotenv import load_dotenv
import boto3
import os

load_dotenv()

client = boto3.client(
    service_name="bedrock-runtime",
    region_name=os.getenv("AWS_REGION")
)


def generate_trip_recommendation(destination, days, budget, travel_style):
    prompt = f"""
You are an experienced travel planner.

Create a detailed {days}-day itinerary for {destination}.

Trip Information:
- Budget: USD {budget}
- Travel Style: {travel_style}

Create a structured daily travel plan.

For each day, include:

Morning Activities:
- Provide 2-3 specific morning activities.

Afternoon Activities:
- Include cultural sites, local experiences, and attractions.

Evening Activities:
- Recommend dinner spots and nightlife activities.

Also include:
- Transportation suggestions
- Estimated daily budget
- Local food recommendations

Format your response using Markdown with clear headers and bullet points.
"""

    response = client.converse(
        modelId=os.getenv("MODEL_ID"),
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

    ai_response = response["output"]["message"]["content"][0]["text"]

    return ai_response
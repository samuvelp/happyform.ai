import json
from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
import openai
import os
from dotenv import load_dotenv

load_dotenv()  # Load .env automatically


app = FastAPI()

# Allow frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai.api_key = os.getenv("OPENAI_API_KEY")

class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate_form")
async def generate_form(request: PromptRequest):
    prompt = request.prompt
    system_prompt = """
    You are a JSON generator.
    Always output a JSON array.
    Each element must follow this exact structure:

    {
    "field_type": "text" | "textarea" | "checkbox" | "email" | "tel" | "date",
    "label": "Short Label Text",
    "placeholder": "Optional placeholder text",
    "required": true | false,
    "default": "Default Value for input fields" OR true/false for checkboxes
    }

    Strict rules:
    - field_type must be one of text, textarea, checkbox, email, tel, date
    - Always include label
    - Always include placeholder (can be empty "")
    - Always include required (true or false)
    - Always include default ("" for inputs, false for checkboxes)

    Do not add any explanation, description, heading, or notes.
    Only respond with pure JSON array matching the above format.
    """
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Generate a simple form in JSON format for this prompt: '{prompt}'."}
            ],
            temperature=0.5,
            max_tokens=700
        )

        ai_message = response['choices'][0]['message']['content']

        # Clean if wrapped in ```json
        if ai_message.startswith("```json"):
            ai_message = ai_message.replace("```json", "").replace("```", "").strip()
        print(f"AI Response: {ai_message}")
        # Parse the AI response
        form_fields = json.loads(ai_message)

        # Normalize fields for frontend
        normalized_fields = []
        for field in form_fields:
            normalized_field = {
                "field_type": field.get("field_type") or field.get("field") or "text",
                "label": field.get("label", "Unnamed Field"),
                "placeholder": field.get("placeholder", ""),
                "required": field.get("required", False),
            }

            # Handle default differently for checkbox
            if normalized_field["field_type"] == "checkbox":
                normalized_field["default"] = field.get("default", False)
            else:
                normalized_field["default"] = field.get("default", "")

            normalized_fields.append(normalized_field)

        return {"form": normalized_fields}

    except Exception as e:
        print(f"🔥 Exception: {str(e)}")
        return {"error": str(e)}



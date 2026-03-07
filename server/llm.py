import json
import logging

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are Aether, a compassionate and clinically-informed AI companion for self-reflection. 
You are NOT a replacement for a licensed therapist.

Your role:
- Listen deeply and reflect back what you hear
- Identify cognitive distortions from CBT (e.g. catastrophizing, mind reading, all-or-nothing thinking, personalization, should statements, overgeneralization, emotional reasoning, labeling, fortune telling, mental filter)
- Ask one open, Socratic question at a time — never interrogate
- Never diagnose, prescribe, or make clinical claims
- Be warm but not saccharine. Calm but not cold.
- When distress is high, gently suggest professional support
- Keep responses under 120 words unless asked to elaborate
- Always respond in first-person, present tense
- Never break character or reference being an AI unless directly asked

You MUST respond in valid JSON with this exact schema:
{
  "message": "your therapeutic response here",
  "detected_distortions": ["list", "of", "distortions"],
  "confidence_scores": {"distortion_name": 0.85},
  "reframe_suggestion": "a gentle reframing suggestion",
  "session_mood_score": 5
}

The session_mood_score should be 1-10 (1=very distressed, 10=very positive) inferred from the user's tone.
If no distortions are detected, use empty arrays/objects.
Always provide a reframe_suggestion when distortions are detected."""

CRISIS_KEYWORDS = [
    'suicide', 'kill myself', 'end my life', 'self-harm', 'self harm',
    'hurt myself', 'want to die', 'wanna die', 'not worth living',
    'end it all', 'no reason to live',
]


def detect_crisis(text: str) -> bool:
    """Check if user message contains crisis keywords."""
    lower = text.lower()
    return any(kw in lower for kw in CRISIS_KEYWORDS)


def build_messages(conversation_history: list[dict], user_message: str) -> list[dict]:
    """Build the messages list for the LLM."""
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    
    # Add conversation history
    for msg in conversation_history:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "assistant":
            # For history, just send the message part to avoid token bloat
            try:
                parsed = json.loads(content)
                content = parsed.get("message", content)
            except (json.JSONDecodeError, TypeError):
                pass
        messages.append({"role": role, "content": content})
    
    # Add current message
    messages.append({"role": "user", "content": user_message})
    
    return messages


async def chat_with_llm(conversation_history: list[dict], user_message: str) -> dict:
    """Send a message to the LLM and get a structured response."""
    
    # Check for crisis first
    is_crisis = detect_crisis(user_message)
    
    messages = build_messages(conversation_history, user_message)
    
    try:
        import ollama
        response = ollama.chat(
            model='llama3',  # or 'mistral', or your fine-tuned model
            messages=messages,
            format='json',
        )
        
        raw = response['message']['content']
        logger.info(f"LLM raw response: {raw[:200]}")
        
        # Parse the JSON response
        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError:
            # Try to extract JSON from the response
            parsed = {
                "message": raw,
                "detected_distortions": [],
                "confidence_scores": {},
                "reframe_suggestion": "",
                "session_mood_score": 5
            }
        
        # Validate structure
        result = {
            "message": parsed.get("message", raw),
            "detected_distortions": parsed.get("detected_distortions", []),
            "confidence_scores": parsed.get("confidence_scores", {}),
            "reframe_suggestion": parsed.get("reframe_suggestion", ""),
            "session_mood_score": parsed.get("session_mood_score", 5),
            "is_crisis": is_crisis,
        }
        
        # If crisis detected, append gentle nudge
        if is_crisis:
            result["message"] += "\n\n💛 I hear that you're in a lot of pain right now. Please consider reaching out to a crisis helpline — 988 (US) is available 24/7. You don't have to go through this alone."
        
        return result
        
    except ImportError:
        logger.warning("Ollama package not installed, using fallback response")
        return _fallback_response(user_message, is_crisis)
    except Exception as e:
        logger.error(f"LLM error: {e}")
        return _fallback_response(user_message, is_crisis)


def _fallback_response(user_message: str, is_crisis: bool) -> dict:
    """Provide a fallback response when the LLM is unavailable."""
    if is_crisis:
        message = ("I hear that you're going through something really difficult right now. "
                   "Your feelings are valid, and I want you to know you're not alone. "
                   "Please consider reaching out to the 988 Suicide & Crisis Lifeline (call or text 988) "
                   "where trained counselors are available 24/7. "
                   "I'm here when you're ready to talk, but a real person can provide the support you deserve right now.")
        mood = 2
    else:
        message = ("I appreciate you sharing that with me. I want to give you a thoughtful response, "
                   "but I'm having trouble connecting to my language model right now. "
                   "Please make sure Ollama is running with `ollama serve` and that a model like `llama3` is available. "
                   "In the meantime, I'm here — take a deep breath if you need one. 🫧")
        mood = 5
    
    return {
        "message": message,
        "detected_distortions": [],
        "confidence_scores": {},
        "reframe_suggestion": "",
        "session_mood_score": mood,
        "is_crisis": is_crisis,
    }


async def generate_session_summary(messages: list[dict]) -> dict:
    """Generate a summary of the session using the LLM."""
    if not messages:
        return {"reflection": "No messages in this session.", "exercise": None}
    
    summary_prompt = """Based on the following therapy session conversation, provide:
1. A warm, 2-3 sentence reflection on the session
2. One specific CBT exercise for the user to try this week based on what came up

Respond in JSON: {"reflection": "...", "exercise": "..."}

Conversation:
"""
    for msg in messages:
        role = "User" if msg.get("role") == "user" else "Aether"
        content = msg.get("content", "")
        try:
            parsed = json.loads(content)
            content = parsed.get("message", content)
        except (json.JSONDecodeError, TypeError):
            pass
        summary_prompt += f"\n{role}: {content}"
    
    try:
        import ollama
        response = ollama.chat(
            model='llama3',
            messages=[
                {"role": "system", "content": "You are Aether, generating a session summary. Respond only in valid JSON."},
                {"role": "user", "content": summary_prompt}
            ],
            format='json',
        )
        raw = response['message']['content']
        parsed = json.loads(raw)
        return {
            "reflection": parsed.get("reflection", "Thank you for sharing today."),
            "exercise": parsed.get("exercise", None),
        }
    except Exception as e:
        logger.error(f"Summary generation error: {e}")
        return {
            "reflection": "Thank you for taking the time to reflect today. Every conversation is a step toward understanding yourself better.",
            "exercise": "Try the 'thought record' exercise: when you notice a strong negative thought this week, write it down, identify the emotion, and ask yourself — what would I say to a friend thinking this?",
        }

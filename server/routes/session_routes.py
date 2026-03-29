import json
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from auth import get_current_user_id
from database import (
    create_session, get_session, get_user_sessions,
    end_session, update_session_title, add_message,
    get_session_messages, get_session_mood_arc,
    get_session_distortion_counts
)
from llm import chat_with_llm, generate_session_summary

router = APIRouter(tags=["sessions"])


class MessageRequest(BaseModel):
    session_id: int
    user_message: str


@router.post("/session/start")
async def start_session(request: Request):
    user_id = get_current_user_id(request)
    session = create_session(user_id)
    return {"session_id": session["id"], "created_at": session["created_at"]}


@router.post("/session/message")
async def send_message(req: MessageRequest, request: Request):
    user_id = get_current_user_id(request)
    
    # Verify session belongs to user
    session = get_session(req.session_id)
    if not session or session["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Session not found")
    if not session["is_active"]:
        raise HTTPException(status_code=400, detail="Session has ended")
    
    # Save user message
    add_message(req.session_id, "user", req.user_message)
    
    # Get conversation history
    history = get_session_messages(req.session_id)
    conversation = []
    for msg in history[:-1]:  # exclude the just-added message
        content = msg["content"]
        if msg["role"] == "assistant" and msg["detected_distortions"]:
            # Reconstruct the full JSON for context
            content = json.dumps({
                "message": content,
                "detected_distortions": json.loads(msg["detected_distortions"]) if msg["detected_distortions"] else [],
            })
        conversation.append({"role": msg["role"], "content": content})
    
    # Get AI response
    ai_response = await chat_with_llm(conversation, req.user_message)
    
    # Save AI message
    add_message(
        session_id=req.session_id,
        role="assistant",
        content=ai_response["message"],
        mood_score=ai_response.get("session_mood_score"),
        detected_distortions=json.dumps(ai_response.get("detected_distortions", [])),
        confidence_scores=json.dumps(ai_response.get("confidence_scores", {})),
        reframe_suggestion=ai_response.get("reframe_suggestion"),
    )
    
    # Auto-title session after first exchange
    if len(history) <= 1:
        title = req.user_message[:50] + ("..." if len(req.user_message) > 50 else "")
        update_session_title(req.session_id, title)
    
    return ai_response


@router.post("/session/{session_id}/end")
async def end_session_route(session_id: int, request: Request):
    user_id = get_current_user_id(request)
    
    session = get_session(session_id)
    if not session or session["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Session not found")
    
    # Generate summary
    messages = get_session_messages(session_id)
    msg_list = [{"role": m["role"], "content": m["content"]} for m in messages]
    summary = await generate_session_summary(msg_list)
    
    # End session with summary
    end_session(session_id, summary.get("reflection"), summary.get("exercise"))
    
    return {"message": "Session ended", "summary": summary}


@router.get("/session/{session_id}/summary")
async def get_session_summary(session_id: int, request: Request):
    user_id = get_current_user_id(request)
    
    session = get_session(session_id)
    if not session or session["user_id"] != user_id:
        raise HTTPException(status_code=404, detail="Session not found")
    
    mood_arc = get_session_mood_arc(session_id)
    distortions = get_session_distortion_counts(session_id)
    
    return {
        "session_id": session_id,
        "date": session["created_at"],
        "reflection": session.get("summary_reflection") or "This session hasn't been summarized yet.",
        "exercise": session.get("summary_exercise"),
        "mood_arc": mood_arc,
        "distortions": distortions,
    }


@router.get("/sessions/history")
async def get_sessions_history(request: Request):
    user_id = get_current_user_id(request)
    sessions = get_user_sessions(user_id)
    
    result = []
    for s in sessions:
        # Get last mood score for display
        mood_arc = get_session_mood_arc(s["id"])
        last_mood = mood_arc[-1]["mood"] if mood_arc else None
        
        result.append({
            "id": s["id"],
            "title": s.get("title"),
            "is_active": bool(s["is_active"]),
            "created_at": s["created_at"],
            "ended_at": s.get("ended_at"),
            "mood_score": last_mood,
        })
    
    return result

import json
import asyncio
import sys
import os

# Add parent directory to path to import llm
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import llm

async def verify_integration():
    print("🔍 Starting Lumina-Edge Integration Verification...")
    
    # 1. Check Health
    print("\nStep 1: Checking Lumina-Edge API health...")
    is_up = await llm.check_llm_status()
    if not is_up:
        print("❌ Lumina-Edge API is NOT responsive.")
        print(f"   Please ensure Lumina-Edge is running at {llm.LUMINA_BASE_URL}")
        print("   Command: cd /home/parth/Documents/Lumina-Edge && ./core/lumina-launcher.sh --mode api --gpu vulkan")
        return
    print("✅ Lumina-Edge API is UP and running.")

    # 2. Test Chat
    print("\nStep 2: Testing chat completion...")
    test_message = "I've been feeling a bit overwhelmed lately."
    history = []
    
    try:
        response = await llm.chat_with_llm(history, test_message)
        print("✅ Received response from LLM:")
        print(f"   Message: {response.get('message', '')[:100]}...")
        print(f"   Mood Score: {response.get('session_mood_score')}")
        print(f"   Distortions: {response.get('detected_distortions')}")
        
        # Validate JSON structure
        required_keys = ["message", "detected_distortions", "confidence_scores", "reframe_suggestion", "session_mood_score"]
        missing = [k for k in required_keys if k not in response]
        if missing:
            print(f"⚠️  Response is missing keys: {missing}")
        else:
            print("✅ Response structure is valid.")
            
    except Exception as e:
        print(f"❌ Chat test failed: {e}")

    # 3. Test Summary
    print("\nStep 3: Testing session summary generation...")
    test_history = [
        {"role": "user", "content": "I'm worried about my exam."},
        {"role": "assistant", "content": "{\"message\": \"It's natural to feel anxious about exams. What specifically worries you?\", \"session_mood_score\": 4}"}
    ]
    
    try:
        summary = await llm.generate_session_summary(test_history)
        print("✅ Received summary from LLM:")
        print(f"   Reflection: {summary.get('reflection', '')[:100]}...")
        print(f"   Exercise: {summary.get('exercise')}")
    except Exception as e:
        print(f"❌ Summary test failed: {e}")

    print("\n✨ Verification Complete.")

if __name__ == "__main__":
    asyncio.run(verify_integration())

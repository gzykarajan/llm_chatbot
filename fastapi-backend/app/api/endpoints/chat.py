from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.models.schemas import ChatHistory
from app.services.openai_service import OpenAIService
import json
from typing import List

router = APIRouter()
openai_service = OpenAIService()

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]

@router.post("/chat")
async def chat(chat_request: ChatRequest):
    """
    聊天接口，返回流式输出
    """
    try:
        async def event_generator():
            async for response in openai_service.get_chat_response(chat_request.messages):
                if response:
                    yield f"data: {response}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    
# 实现一个新的端点来处理流式输出
# 功能备份，这段代码不要修改了
@router.post("/chat-stream")
async def chat_stream(history: ChatHistory):
    async def event_generator():
        try:
            async for response in openai_service.stream_chat_responses(history.messages):
                if response:
                    yield f"data: {response}\n\n"
        except Exception as e:
            yield f"data: Error: {str(e)}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")


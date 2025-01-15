from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from app.models.schemas import ChatHistory
from app.services.openai_service import OpenAIService
import json


router = APIRouter()
openai_service = OpenAIService()

class MessageRequest(BaseModel):
    content: str

class MessageResponse(BaseModel):
    response: str

@router.post("/chat", response_model=MessageResponse)
async def chat(message: MessageRequest):
    try:
        response = await openai_service.get_chat_response(message.content)
        return MessageResponse(response=response)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
# 实现一个新的端点来处理流式输出
@router.post("/chat-stream")
async def chat_stream(history: ChatHistory):
    async def event_generator():
        try:
            async for response in openai_service.stream_chat_responses(history.messages):
                yield f"data: {json.dumps(response)}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'error': str(e)})}\n\n"

    return StreamingResponse(event_generator(), media_type="text/event-stream")
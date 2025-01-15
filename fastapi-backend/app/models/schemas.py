from pydantic import BaseModel
from typing import List, Dict, Any

class FunctionRequest(BaseModel):
    function_name: str
    parameters: Dict[str, Any]

class FunctionResponse(BaseModel):
    result: str

# 用于存储对话历史的模型
class ChatHistory(BaseModel):
    messages: List[Dict[str, str]]
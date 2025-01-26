import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints import chat
from app.core.config import get_settings

settings = get_settings()

app = FastAPI(title="Chat API",
              description='FastAPI LLM Chatbot tutorial',
              version='1.0.0',
              docs_url='/docs',
)

# 配置 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(chat.router, prefix="/api")

if __name__ == "__main__":
    # 启动 FastAPI 应用
    # uvicorn main:app --reload
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
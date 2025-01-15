import os
from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    # Moonshot 配置
    moonshot_api_key: str = os.getenv("MOONSHOT_API_KEY")
    moonshot_base_url: str = "https://api.moonshot.cn/v1"
    moonshot_model: str = "moonshot-v1-32k"
    
    # CORS 配置
    allowed_origins: list[str] = ["http://localhost:5173"]  # Vite 默认端口

@lru_cache()
def get_settings():
    return Settings()


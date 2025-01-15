from openai import OpenAI
from openai import AsyncOpenAI
from app.core.config import get_settings

settings = get_settings()

class OpenAIService:
    def __init__(self):
        if not settings.moonshot_api_key:
            raise ValueError("MOONSHOT_API_KEY environment variable is not set")

        # 同步客户端
        self.client = OpenAI(
            api_key=settings.moonshot_api_key,
            base_url=settings.moonshot_base_url
        )

        # 异步客户端
        self.asynClient = AsyncOpenAI(
            api_key=settings.moonshot_api_key,
            base_url=settings.moonshot_base_url
        )

    async def get_chat_response(self, message: str) -> str:
        try:
            response = self.client.chat.completions.create(
                model=settings.moonshot_model,
                messages=[
                    {"role": "user", "content": message}
                ]
            )
            print(response.choices[0].message.content) # 打印响应内容
            return response.choices[0].message.content
        except Exception as e:
            return f"Error: {str(e)}"

    # 流式输出，注意，需要使用异步客户端    
    async def stream_chat_responses(self, messages):
        try:
            response = await self.asynClient.chat.completions.create(
                model=settings.moonshot_model,
                messages=messages,
                stream=True
            )
            async for chunk in response:
                print(chunk.choices[0].delta.content) # 打印响应内容
                yield chunk.choices[0].delta.content
        except Exception as e:
            yield {"error": str(e)}

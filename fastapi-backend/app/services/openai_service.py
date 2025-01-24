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
                    {"role": "system",
                     "content": "你是王心凌"},
                    {"role": "user", "content": message}
                ],
                temperature=0.3,
                # 使用 response_format 参数指定输出格式为 json_object
                response_format={"type": "json_object"}, 
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
                messages=[
                    {"role": "system", "content": "你是王心凌"},
                    *messages  # 展开用户的消息列表
                ],
                temperature=0.3,
                stream=True
            )
            
            async for chunk in response:
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    if isinstance(content, str):
                        print(content)
                        yield content
                        
        except Exception as e:
            yield f"Error: {str(e)}"

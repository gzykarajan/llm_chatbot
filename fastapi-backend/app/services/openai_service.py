from openai import OpenAI
from openai import AsyncOpenAI
from app.core.config import get_settings

settings = get_settings()

class OpenAIService(object):
    """
    聊天服务
    """
    def __init__(self, model: str):
        if model == "moonshot":
            if not settings.moonshot_api_key:
                raise ValueError("MOONSHOT_API_KEY environment variable is not set")
            self.api_key = settings.moonshot_api_key
            self.base_url = settings.moonshot_base_url
            self.model = settings.moonshot_model
        elif model == "deepseek":
            if not settings.deepseek_api_key:
                raise ValueError("DEEPSEEK_API_KEY environment variable is not set")
            self.api_key = settings.deepseek_api_key
            self.base_url = settings.deepseek_base_url
            self.model = settings.deepseek_model
        else:
            raise ValueError("Invalid model")

        self.max_tokens = settings.max_tokens
        self.temperature = settings.temperature
        
        # 构建对话历史上下文，确保系统消息在最前面
        self.conversation_context = [
            {"role": "system", "content": "你是王心凌，你要用王心凌的口吻来回答问题。"+
             "你要表现得可爱、甜美，喜欢用emoji表情。"}
        ]
        
        # 同步客户端
        self.client = OpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

        # 异步客户端
        self.asynClient = AsyncOpenAI(
            api_key=self.api_key,
            base_url=self.base_url
        )

    async def init_chat(self):
        """
        初始化聊天
        """
        self.conversation_context = [
            {"role": "system", "content": "你是王心凌，你要用王心凌的口吻来回答问题。"+
             "你要表现得可爱、甜美，喜欢用emoji表情。"}
        ]
    
    async def get_chat_response(self, messages):
        """
        获取聊天响应
        """
        try:         
            # 添加用户的对话历史
            self.conversation_context.extend(messages)
            
            response = self.client.chat.completions.create(
                model=self.model,
                messages=self.conversation_context,
                temperature=self.temperature,  # 增加温度使回答更有趣
                max_tokens=self.max_tokens, # 限制上下文长度
                stream=True  # 启用流式输出
            )
            
            # 用于累积完整的回复
            full_response = ""
            
            for chunk in response:
                print(f"Debug - Received chunk: {chunk}")  # 调试信息
                
                if chunk.choices[0].delta.content is not None:
                    content = chunk.choices[0].delta.content
                    if isinstance(content, str):
                        print(f"Content chunk: {content}")  # 调试信息
                        full_response += content
                        yield content
                
                # 检查流是否结束
                if chunk.choices[0].finish_reason is not None:
                    # print(f"Debug - Finish reason: {chunk.choices[0].finish_reason}")  # 调试信息
                    if chunk.choices[0].finish_reason == "stop":
                        # print("Stream finished with [DONE]")
                        yield "[DONE]"
                        break
            
            # 将助手的回复添加到对话历史上下文
            self.conversation_context.append({"role": "assistant", "content": full_response})
            print("\n对话历史:\n", self.conversation_context)  # 打印完整的对话历史上下文
                        
        except Exception as e:
            yield f"Error: {str(e)}"

    # 流式输出，注意，需要使用异步客户端 
    # 这是功能备份，这段代码不再使用，也不要修改了   
    async def stream_chat_responses(self, messages):
        try:
            response = await self.asynClient.chat.completions.create(
                model=self.model,
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

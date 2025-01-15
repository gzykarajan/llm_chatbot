# 规划说明：
api/endpoints/：

chat.py：管理聊天相关的 API 端点。
function_call.py：专门用于处理 LLM 的 Function Calling 的 API 端点。
core/：

config.py：管理配置和环境变量。
dependencies.py：用于依赖注入和共享资源的管理。
models/：

schemas.py：存放 Pydantic 模型和数据验证类。
services/：

openai_service.py：封装与 OpenAI API 交互的逻辑。
function_service.py：处理 Function Calling 的具体实现和逻辑。
utils/：

helpers.py：实用函数和辅助方法。

# 创建和配置新文件
function_call.py（API 端点）：

实现 LLM 的 Function Calling 相关的 API 逻辑。
function_service.py（服务逻辑）：

定义处理 Function Calling 的具体实现。
schemas.py（数据模型）：

定义 API 模型和数据结构。
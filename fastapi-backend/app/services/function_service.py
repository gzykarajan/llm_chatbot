class FunctionService:
    async def call_function(self, request):
        # 实现具体的功能调用逻辑
        return f"Called function {request.function_name} with parameters {request.parameters}"
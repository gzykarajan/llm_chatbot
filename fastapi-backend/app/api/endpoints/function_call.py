from fastapi import APIRouter, HTTPException
from app.models.schemas import FunctionRequest, FunctionResponse
from app.services.function_service import FunctionService

router = APIRouter()
function_service = FunctionService()

@router.post("/function-call", response_model=FunctionResponse)
async def call_function(request: FunctionRequest):
    try:
        result = await function_service.call_function(request)
        return FunctionResponse(result=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
from fastapi import APIRouter
from pydantic import BaseModel

from app.services.ai_service import get_chatbot_response

router = APIRouter(
    prefix="/chatbot",
    tags=["Chatbot"]
)


class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    response: str
    status: str = "success"


@router.post("/", response_model=ChatResponse)
def chat(payload: ChatMessage):
    """
    Hotel AI Chatbot endpoint.
    Accepts a guest message and returns a helpful response about hotel services.
    """
    response_text = get_chatbot_response(payload.message)
    return ChatResponse(response=response_text, status="success")


@router.get("/health")
def chatbot_health():
    return {"status": "active", "service": "Hotel Chatbot"}

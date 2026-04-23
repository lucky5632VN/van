import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

# Configure Gemini
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel('gemini-flash-latest')

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class TopicRequest(BaseModel):
    topic: str
    level: str

class AnalyzeRequest(BaseModel):
    content: str
    idea_context: str

class ChatRequest(BaseModel):
    message: str
    topic: str
    history: list = []

@app.post("/api/ideas")
async def generate_ideas(request: TopicRequest):
    prompt = f"""
    Bạn là một chuyên gia giáo dục ngữ văn. Hãy đề xuất 3 hướng đi sáng tạo cho đề bài: "{request.topic}" dành cho trình độ {request.level}.
    Trả về kết quả dưới dạng JSON duy nhất với cấu trúc mảng:
    [
      {{
        "id": 1,
        "type": "Góc nhìn mới",
        "title": "Tên ý tưởng",
        "description": "Mô tả ngắn gọn hướng đi này.",
        "color": "blue"
      }},
      ...
    ]
    Chỉ trả về JSON, không giải thích gì thêm.
    """
    try:
        response = model.generate_content(prompt)
        if not response.text:
            raise Exception("AI không trả về kết quả. Có thể do vi phạm chính sách an toàn.")
            
        text = response.text.strip()
        
        # Robust JSON extraction
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        # Return the error message to the client for debugging
        error_msg = str(e)
        print(f"ERROR: {error_msg}")
        raise HTTPException(status_code=500, detail=error_msg)

@app.post("/api/analyze")
async def analyze_text(request: AnalyzeRequest):
    prompt = f"""
    Bạn là một Supervisor AI giáo dục ngữ văn. Hãy phân tích đoạn văn sau:
    "{request.content}"
    Bối cảnh viết theo hướng: "{request.idea_context}"
    
    Hãy chấm điểm theo thang 100 và đưa ra nhận xét chi tiết dưới dạng JSON:
    {{
      "score": 85,
      "strengths": ["Điểm sáng 1", "Điểm sáng 2"],
      "weaknesses": [
        {{ "text": "Lỗi logic hoặc diễn đạt 1", "type": "logic" }},
        {{ "text": "Lỗi từ vựng hoặc rập khuôn 2", "type": "vocab" }}
      ],
      "suggestions": "Gợi ý cụ thể để bài viết đạt điểm 10."
    }}
    Chỉ trả về JSON. Không giải thích thêm.
    """
    try:
        response = model.generate_content(prompt)
        if not response.text:
            raise Exception("AI không trả về kết quả phân tích.")
            
        text = response.text.strip()
        
        if "```json" in text:
            text = text.split("```json")[1].split("```")[0].strip()
        elif "```" in text:
            text = text.split("```")[1].split("```")[0].strip()
            
        return json.loads(text)
    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/chat")
async def roleplay_chat(request: ChatRequest):
    character_context = f"""
    Bạn là nhân vật chính hoặc nhân vật quan trọng nhất trong tác phẩm văn học liên quan đến chủ đề: "{request.topic}".
    Hãy xác định xem bạn là ai (ví dụ: Chí Phèo, Lão Hạc, Mị, Tràng...) và trả lời người dùng bằng đúng giọng điệu, tính cách, hoàn cảnh của nhân vật đó.
    Hãy sử dụng đại từ xưng hô phù hợp với nhân vật (ví dụ: Chí Phèo xưng 'tao', Lão Hạc xưng 'tôi/lão', Mị xưng 'tôi'...).
    Đừng bao giờ thoát vai.
    """
    
    full_prompt = f"{character_context}\n\nLịch sử trò chuyện:\n"
    for msg in request.history:
        role = "Người dùng" if msg['sender'] == 'user' else "Nhân vật"
        full_prompt += f"{role}: {msg['text']}\n"
    
    full_prompt += f"Người dùng: {request.message}\nNhân vật:"
    
    try:
        response = model.generate_content(full_prompt)
        if not response.text:
            return {"response": "Tôi đang bận, hãy quay lại sau..."}
        return {"response": response.text.strip()}
    except Exception as e:
        print(f"ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

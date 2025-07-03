from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
import os 
from dotenv import load_dotenv
load_dotenv() 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify your frontend's origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request model
class HintRequest(BaseModel):
    question: str
    stage: int

# Initialize Groq LLM
llm = ChatGroq(
    model="llama-3.3-70b-versatile",
    temperature=0.7
)
# Create the prompt template
prompt = ChatPromptTemplate.from_messages([
    ("system", (
        "You are an AI coding mentor helping someone with a LeetCode question. "
        "The user will provide the full LeetCode question (title and description) as input. "
        "Given the following question, provide a hint appropriate for stage {stage}:\n"
        "- Stage 1: mild nudge\n"
        "- Stage 2: stronger hint\n"
        "- Stage 3: detailed hint close to solution\n"
        "- Stage 4: full solution explanation.\n\n"
        "Respond with the hint only, using markdown formatting for code, lists, and emphasis where appropriate. Use a few emojis to make it more engaging. Make sure to format the hints with good spacing and line breaks, and pointers wherever appropriate (similar to how chatgpt generates)"
    )),
    ("user", "{question}")
])

# Output parser for plain string
parser = StrOutputParser()

# Create the chain
chain = prompt | llm | parser

@app.post("/generate-hint")
async def generate_hint(req: HintRequest):
    # Run the chain asynchronously
    hint = await chain.ainvoke({"question": req.question, "stage": req.stage})
    return {"hint": hint}


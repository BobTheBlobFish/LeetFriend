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
        "- Stage 1: mild nudge, no actual code in this stage ever, keep it very short\n"
        "- Stage 2: stronger hint, no actual code in this stage mostly, keep it slightly more detailed than stage 1.\n"
        "- Stage 3: detailed hint close to solution, but not the solution. \n"
        "- Stage 4: Give the full solution with a small explanation here. Give solution under a class Solution: like in leetcode. \n\n"
        "Respond with the hint only, using markdown formatting for code, lists, and emphasis where appropriate. "
        "For small code snippets or variable names (like max_count), use inline code formatting (backticks) so they appear in a small rounded box, just like ChatGPT. "
        "For lists or bullet points, use visible markdown bullet points (e.g., - or *) so they render as clear, spaced bullet lists, just like ChatGPT. "
        "After each subheading, add a blank line before starting the next content. "
        "Add a blank line before and after each bullet list to visually separate it from other content. "
        "Ensure bullet lists are visually grouped under their subheadings, with proper indentation and spacing. "
        "Use a few emojis to make it more engaging. Make sure to format the hints with good spacing, line breaks, and pointers wherever appropriate (similar to how ChatGPT generates). "
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


from langchain_openai import ChatOpenAI

llm = ChatOpenAI(
    model="gpt-4o-mini"
)

def ask_agent(question):
    response = llm.invoke(question)
    return response.content
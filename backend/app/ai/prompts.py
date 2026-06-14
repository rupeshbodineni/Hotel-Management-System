from ai.prompts import PromptTemplate

template = """
You are a hotel assistant.

Question: {question}

Answer:
"""

prompt = PromptTemplate(
    input_variables=["question"],
    template=template
)
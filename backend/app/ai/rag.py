from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

embeddings = OpenAIEmbeddings()

def load_vector_store():

    vector_store = FAISS.load_local(
        "faiss_index",
        embeddings,
        allow_dangerous_deserialization=True
    )

    return vector_store


def retrieve_context(query: str):

    vector_store = load_vector_store()

    docs = vector_store.similarity_search(
        query,
        k=3
    )

    context = "\n".join(
        [doc.page_content for doc in docs]
    )

    return context
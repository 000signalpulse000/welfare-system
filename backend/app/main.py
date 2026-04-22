from fastapi import FastAPI

app = FastAPI(title="welfare-system API")

@app.get("/health")
def health():
    return {"status": "ok"}

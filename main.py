from fastapi import FastAPI
app = FastAPI()
db = {}

@app.post("/shorten")
def shorten(url: str):
    code = str(len(db) + 1)
    db[code] = url
    return {"short": code}
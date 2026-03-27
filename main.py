from fastapi import FastAPI
from fastapi.responses import RedirectResponse
app = FastAPI()
db = {}

@app.post("/shorten")
def shorten(url: str):
    code = str(len(db) + 1)
    db[code] = url
    return {"short": code}

@app.get("/{code}")
def redirect(code: str):
    url = db.get(code)
    if not url:
        return 404
    return RedirectResponse(url)

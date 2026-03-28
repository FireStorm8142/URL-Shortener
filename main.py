from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
app = FastAPI()
db = {}

def encode(num: int):
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    string=""
    
    if num==0: return "a"

    while num>0:
        rem=num%62
        string=string+(chars[rem])
        num=num//62
    return string[::-1]

@app.post("/shorten")
def shorten(url: str):
    code = encode(len(db) + 1)
    db[code] = url
    return {"short": code}

@app.get("/{code}")
def redirect(code: str):
    url = db.get(code)
    if not url:
        raise HTTPException(status_code=404, detail="Not Found")
    return RedirectResponse(url)

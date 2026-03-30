from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
from models import URL
from pydantic import BaseModel, HttpUrl
from typing import Optional

app = FastAPI()

class URLRequest(BaseModel):
    url: HttpUrl
    custom_code: Optional[str] = None

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
def shorten(request: URLRequest, db: Session = Depends(get_db)):

    if request.custom_code:
        existing = db.query(URL).filter(URL.short_code == request.custom_code).first()
        if existing:
            raise HTTPException(status_code=400, detail="Code already taken")

        new_url = URL(
            long_url=str(request.url),
            short_code=request.custom_code
        )
        db.add(new_url)
        db.commit()

        return {"short": request.custom_code}

    new_url = URL(long_url=str(request.url))
    db.add(new_url)
    db.commit()
    db.refresh(new_url)

    code = encode(new_url.id)
    new_url.short_code = code
    db.commit()

    return {"short": code}

@app.get("/{code}")
def redirect(code: str, db: Session = Depends(get_db)):
    url_entry = db.query(URL).filter(URL.short_code == code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Not Found")
    return RedirectResponse(url_entry.long_url)


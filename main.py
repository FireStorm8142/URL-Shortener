from fastapi import FastAPI, HTTPException
from fastapi.responses import RedirectResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db
from database import engine
from models import Base
from models import URL

app = FastAPI()

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
def shorten(url: str, db: Session = Depends(get_db)):
    new_url = URL(long_url=url)
    db.add(new_url)
    db.commit()
    db.refresh(new_url)
    code = encode(new_url.id)
    new_url.short_code=code
    db.commit()
    return {"short": code}

@app.get("/{code}")
def redirect(code: str, db: Session = Depends(get_db)):
    url_entry = db.query(URL).filter(URL.short_code == code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Not Found")
    return RedirectResponse(url_entry.long_url)


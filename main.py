from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import RedirectResponse
from fastapi import Depends
from sqlalchemy.orm import Session
from database import get_db, Base, engine
from models import URL, ClickTracker
from datetime import datetime, timezone
from pydantic import BaseModel, HttpUrl, Field
from typing import Optional

app = FastAPI()

class URLRequest(BaseModel):
    url: HttpUrl
    custom_code: Optional[str] = Field(default=None, example=None)

    class Config:
        json_schema_extra = {
            "example": {
                "url": "https://example.com/",
                "custom_code": None
            }
        }

def encode(num: int):
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    string=""

    while num>0:
        rem=num%62
        string=string+(chars[rem-1])
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
def redirect(code: str, request: Request, db: Session = Depends(get_db)):
    url_entry = db.query(URL).filter(URL.short_code == code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Not Found")
    url_entry.clicks += 1
    event = ClickTracker(
        url_id = url_entry.id,
        timestamp = datetime.now(timezone.utc),
        referrer = request.headers.get("referer"),
        user_agent = request.headers.get("user-agent"),
        ip=request.client.host
    )
    db.add(event)
    db.commit()
    return RedirectResponse(url_entry.long_url)

@app.get("/stats/{code}")
def stats(code: str, db: Session = Depends(get_db)):
    url_entry = db.query(URL).filter(URL.short_code==code).first()
    if not url_entry:
        raise HTTPException(status_code=404, detail="Not Found")
    clicks = db.query(ClickTracker).filter(ClickTracker.url_id==url_entry.id).all()
    return{
        "total_clicks": url_entry.clicks,
        "events": [
            {
                "timestamp": c.timestamp,
                "ip": c.ip,
                "referrer": c.referrer,
                "user_agent": c.user_agent
            }
            for c in clicks
        ]
    }
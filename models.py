from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from database import Base
from datetime import datetime, timezone

class URL(Base):
    __tablename__ = "urls"

    id = Column(Integer, primary_key=True, index=True)
    long_url = Column(String, nullable=False)
    short_code = Column(String, unique=True, index=True)
    clicks = Column(Integer, default=0)

class ClickTracker(Base):
    __tablename__ = "click_events"

    id = Column(Integer, primary_key=True)
    url_id = Column(Integer, ForeignKey("urls.id"))
    timestamp = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    referrer = Column(String)
    user_agent = Column(String)
    ip = Column(String)
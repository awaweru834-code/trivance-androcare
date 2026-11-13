import os
import ssl
from urllib.parse import urlparse, parse_qs, urlunparse
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

RAW_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./trivance_fallback.db").strip()


def build_sqlalchemy_engine(db_url: str):
    if db_url.startswith("sqlite"):
        return create_engine(db_url, connect_args={"check_same_thread": False})

    # Automatically normalize postgres:// or postgresql:// to pure-Python postgresql+pg8000://
    parsed = urlparse(db_url)
    query_params = parse_qs(parsed.query)
    needs_ssl = "sslmode" in query_params or "neon.tech" in (parsed.hostname or "")

    clean_url = urlunparse(
        (
            "postgresql+pg8000",
            parsed.netloc,
            parsed.path,
            "",
            "",
            "",
        )
    )

    connect_args = {}
    if needs_ssl:
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connect_args["ssl_context"] = ssl_context

    return create_engine(clean_url, connect_args=connect_args, pool_pre_ping=True)


engine = build_sqlalchemy_engine(RAW_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
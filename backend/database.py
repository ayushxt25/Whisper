from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from config import settings


class Base(DeclarativeBase):
    pass


connect_args = {"check_same_thread": False} if settings.database_url.startswith("sqlite") else {}
engine = create_engine(settings.database_url, connect_args=connect_args)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)


def init_db() -> None:
    import db_models  # noqa: F401

    Base.metadata.create_all(bind=engine)

    if settings.database_url.startswith("sqlite"):
        columns = {column["name"] for column in inspect(engine).get_columns("meetings")}
        with engine.begin() as connection:
            if "owner_id" not in columns:
                connection.execute(text("ALTER TABLE meetings ADD COLUMN owner_id VARCHAR(255)"))
            connection.execute(
                text("CREATE INDEX IF NOT EXISTS ix_meetings_owner_id ON meetings (owner_id)")
            )

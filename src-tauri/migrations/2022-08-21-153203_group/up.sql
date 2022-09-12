CREATE TABLE groups (
    id INTEGER PRIMARY KEY NOT NULL,
    nickname TEXT,
    UNIQUE(nickname)
)
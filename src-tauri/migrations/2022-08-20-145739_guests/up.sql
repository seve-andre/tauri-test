CREATE TABLE guests (
    tax_code TEXT PRIMARY KEY NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    birthplace TEXT NOT NULL,
    birth_date DATE NOT NULL,
    phone_number TEXT
)
CREATE TABLE rents (
    id INTEGER PRIMARY KEY NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price INTEGER NOT NULL,
    paid BOOLEAN DEFAULT 0 NOT NULL,
    group_id INTEGER NOT NULL,
    apartment_id INTEGER NOT NULL,
    FOREIGN KEY(group_id) REFERENCES groups(id),
    FOREIGN KEY(apartment_id) REFERENCES apartments(apartment_id)
)
CREATE TABLE apartments (
    apartment_id INTEGER PRIMARY KEY NOT NULL,
    house_id INTEGER NOT NULL,
    apartment_number INTEGER NOT NULL,
    square_meters INTEGER NOT NULL,
    price INTEGER NOT NULL,
    n_rooms INTEGER NOT NULL,
    FOREIGN KEY(house_id) REFERENCES houses(house_id),
    UNIQUE(apartment_id, house_id)
);

INSERT INTO apartments(house_id, apartment_number, square_meters, price, n_rooms)
VALUES
    (1, 1, 80, 2000, 5),
    (1, 2, 80, 2200, 6),
    (1, 3, 100, 3000, 5),
    (1, 4, 90, 2100, 5),
    (1, 5, 60, 1500, 4),
    (1, 6, 50, 1000, 2)
CREATE TABLE houses (
    house_id INTEGER PRIMARY KEY NOT NULL,
    complex_id INTEGER NOT NULL,
    house_name TEXT NOT NULL,
    street_type TEXT NOT NULL,
    street_name TEXT NOT NULL,
    street_number INTEGER NOT NULL,
    FOREIGN KEY(complex_id) REFERENCES complexes(complex_id),
    UNIQUE(house_id, complex_id)
);

INSERT INTO houses(complex_id, house_name, street_type, street_name, street_number)
VALUES
    (1, '1', 'via', 'Fortunato Teodorani', 50),
    (1, '2', 'via', 'Paolo Guidi', 10);
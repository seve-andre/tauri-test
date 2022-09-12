CREATE TABLE complexes (
    complex_id INTEGER PRIMARY KEY NOT NULL,
    complex_name TEXT NOT NULL,
    city TEXT NOT NULL,
    post_code TEXT NOT NULL,
    district TEXT NOT NULL
);

INSERT INTO complexes(complex_name, city, post_code, district) VALUES('casine', 'Cervia', '48015', 'Cervia');
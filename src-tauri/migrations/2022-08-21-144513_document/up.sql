CREATE TABLE documents (
    guest_tax_code TEXT NOT NULL,
    doc_type TEXT NOT NULL,
    number TEXT NOT NULL,
    district TEXT NOT NULL,
    city_residence TEXT NOT NULL,
    nationality TEXT NOT NULL,
    FOREIGN KEY(guest_tax_code) REFERENCES guests(tax_code),
    PRIMARY KEY(doc_type, number)
)
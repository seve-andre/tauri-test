CREATE TABLE guests_group (
    guest_tax_code TEXT NOT NULL,
    group_id INTEGER NOT NULL,
    FOREIGN KEY(guest_tax_code) REFERENCES guests(tax_code),
    FOREIGN KEY(group_id) REFERENCES groups(id),
    PRIMARY KEY(guest_tax_code, group_id)
)
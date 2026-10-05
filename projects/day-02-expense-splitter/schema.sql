CREATE TABLE people (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE expenses (
    id INTEGER PRIMARY KEY,
    description TEXT NOT NULL,
    amount_cents INTEGER NOT NULL,   -- store money as integer cents, never float
    paid_by INTEGER NOT NULL REFERENCES people(id)
);

-- Who an expense is split between, and how many "shares" each person owes.
-- An equal 3-way split just gives every participant shares = 1.
CREATE TABLE expense_shares (
    expense_id INTEGER NOT NULL REFERENCES expenses(id),
    person_id INTEGER NOT NULL REFERENCES people(id),
    shares INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY (expense_id, person_id)
);

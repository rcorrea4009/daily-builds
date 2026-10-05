INSERT INTO people (id, name) VALUES
    (1, 'Alice'),
    (2, 'Bob'),
    (3, 'Carlos');

-- Dinner: $60.00, paid by Alice, split equally three ways.
INSERT INTO expenses (id, description, amount_cents, paid_by) VALUES (1, 'Dinner', 6000, 1);
INSERT INTO expense_shares (expense_id, person_id, shares) VALUES
    (1, 1, 1), (1, 2, 1), (1, 3, 1);

-- Groceries: $45.00, paid by Bob, split equally between Bob and Carlos only.
INSERT INTO expenses (id, description, amount_cents, paid_by) VALUES (2, 'Groceries', 4500, 2);
INSERT INTO expense_shares (expense_id, person_id, shares) VALUES
    (2, 2, 1), (2, 3, 1);

-- Uber: $30.00, paid by Carlos, weighted 2:1 between Alice and Carlos.
INSERT INTO expenses (id, description, amount_cents, paid_by) VALUES (3, 'Uber', 3000, 3);
INSERT INTO expense_shares (expense_id, person_id, shares) VALUES
    (3, 1, 2), (3, 3, 1);

CREATE TABLE members (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE books (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL
);

CREATE TABLE loans (
    id INTEGER PRIMARY KEY,
    book_id INTEGER NOT NULL REFERENCES books(id),
    member_id INTEGER NOT NULL REFERENCES members(id),
    checkout_date TEXT NOT NULL,   -- ISO date 'YYYY-MM-DD'
    due_date TEXT NOT NULL,
    return_date TEXT               -- NULL while the book is still out
);

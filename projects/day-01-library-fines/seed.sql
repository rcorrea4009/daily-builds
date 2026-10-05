INSERT INTO members (id, name) VALUES
    (1, 'Alice'),
    (2, 'Bob'),
    (3, 'Priya');

INSERT INTO books (id, title, author) VALUES
    (1, 'Dune', 'Frank Herbert'),
    (2, 'Clean Code', 'Robert C. Martin'),
    (3, 'The Hobbit', 'J.R.R. Tolkien'),
    (4, 'Sapiens', 'Yuval Noah Harari');

-- as_of reference used in tests/README: 2026-10-05
INSERT INTO loans (id, book_id, member_id, checkout_date, due_date, return_date) VALUES
    (1, 1, 1, '2026-09-01', '2026-09-15', NULL),         -- Alice, overdue 20 days
    (2, 2, 1, '2026-09-20', '2026-10-04', NULL),         -- Alice, overdue 1 day
    (3, 3, 2, '2026-09-25', '2026-10-09', NULL),         -- Bob, not due yet
    (4, 4, 2, '2026-08-01', '2026-08-15', '2026-08-14'), -- Bob, returned on time
    (5, 1, 3, '2026-07-01', '2026-07-15', '2026-07-20'), -- Priya, returned 5 days late
    (6, 2, 2, '2026-06-01', '2026-06-15', '2026-06-15'); -- Bob, returned exactly on time

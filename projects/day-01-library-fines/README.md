# Library Fines

A small SQLite schema (`members`, `books`, `loans`) plus a Python query layer and a pytest suite that proves the queries are correct against known seed data.

**Skills shown:** schema design, SQL joins/aggregation, a thin data-access layer, and tests that pin down business logic (fine calculation) rather than just "it runs."

## Run it

```bash
pip install -r requirements.txt
python queries.py     # prints a sample report
pytest -v              # runs the test suite
```

## Design notes

- `days_late_for_loan` takes an explicit `as_of` date instead of calling `date.today()`, which is what makes the tests deterministic — no flaky "depends on when you run it."
- Fines are computed from `return_date` when a book has already come back, and from `as_of` otherwise, so returned-late loans still count even after the book is back on the shelf.
- `schema.sql` / `seed.sql` are plain files, loaded into an in-memory DB for tests — no server, no fixtures beyond two SQL files.

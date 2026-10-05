"""Query layer for the library-fines demo.

Every function takes a sqlite3.Connection and an explicit `as_of` date
(ISO string) rather than reading the system clock, so results are
deterministic and testable.
"""
from __future__ import annotations

import sqlite3
from dataclasses import dataclass
from datetime import date

RATE_PER_DAY = 0.25


def _parse(d: str) -> date:
    return date.fromisoformat(d)


@dataclass
class LoanFine:
    loan_id: int
    member_name: str
    book_title: str
    days_late: int
    fine: float


def days_late_for_loan(due_date: str, return_date: str | None, as_of: str) -> int:
    """Days a loan was/is late. Uses return_date if returned, else as_of."""
    end = _parse(return_date) if return_date else _parse(as_of)
    delta = (end - _parse(due_date)).days
    return max(0, delta)


def overdue_loans(conn: sqlite3.Connection, as_of: str) -> list[dict]:
    """Loans still checked out whose due date has passed as_of."""
    rows = conn.execute(
        """
        SELECT loans.id, members.name AS member_name, books.title AS book_title,
               loans.due_date
        FROM loans
        JOIN members ON members.id = loans.member_id
        JOIN books ON books.id = loans.book_id
        WHERE loans.return_date IS NULL AND loans.due_date < ?
        ORDER BY loans.due_date
        """,
        (as_of,),
    ).fetchall()
    return [dict(r) for r in rows]


def fines_by_member(conn: sqlite3.Connection, as_of: str) -> dict[str, float]:
    """Total fine owed per member, including already-returned late loans."""
    rows = conn.execute(
        """
        SELECT members.name AS member_name, loans.due_date, loans.return_date
        FROM loans
        JOIN members ON members.id = loans.member_id
        """
    ).fetchall()

    totals: dict[str, float] = {}
    for row in rows:
        late = days_late_for_loan(row["due_date"], row["return_date"], as_of)
        fine = round(late * RATE_PER_DAY, 2)
        totals[row["member_name"]] = round(totals.get(row["member_name"], 0.0) + fine, 2)
    return totals


def top_borrowers(conn: sqlite3.Connection, limit: int = 3) -> list[tuple[str, int]]:
    """Members ranked by total number of loans (all-time, any status)."""
    rows = conn.execute(
        """
        SELECT members.name AS member_name, COUNT(*) AS loan_count
        FROM loans
        JOIN members ON members.id = loans.member_id
        GROUP BY members.name
        ORDER BY loan_count DESC, member_name ASC
        LIMIT ?
        """,
        (limit,),
    ).fetchall()
    return [(r["member_name"], r["loan_count"]) for r in rows]


def connect(db_path: str = ":memory:") -> sqlite3.Connection:
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    return conn


def load_schema_and_seed(conn: sqlite3.Connection, schema_path: str, seed_path: str) -> None:
    with open(schema_path, encoding="utf-8") as f:
        conn.executescript(f.read())
    with open(seed_path, encoding="utf-8") as f:
        conn.executescript(f.read())
    conn.commit()


if __name__ == "__main__":
    import os

    here = os.path.dirname(__file__)
    conn = connect()
    load_schema_and_seed(conn, os.path.join(here, "schema.sql"), os.path.join(here, "seed.sql"))

    as_of = "2026-10-05"
    print("Overdue loans:")
    for loan in overdue_loans(conn, as_of):
        print(f"  #{loan['id']} {loan['member_name']} - {loan['book_title']} (due {loan['due_date']})")

    print("\nFines owed:")
    for name, total in fines_by_member(conn, as_of).items():
        print(f"  {name}: ${total:.2f}")

    print("\nTop borrowers:")
    for name, count in top_borrowers(conn):
        print(f"  {name}: {count} loans")

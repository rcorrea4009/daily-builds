"""Query + settlement layer for the expense-splitter demo.

Money is always handled as integer cents. Mixing floats into money
calculations is exactly the kind of bug a test suite should catch
early, so there's a dedicated test for it (see test_queries.py).
"""
from __future__ import annotations

import sqlite3


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


def balances(conn: sqlite3.Connection) -> dict[str, int]:
    """Net balance per person, in cents. Positive = owed money overall, negative = owes money."""
    people = {row["id"]: row["name"] for row in conn.execute("SELECT id, name FROM people")}
    net = {name: 0 for name in people.values()}

    for row in conn.execute("SELECT id, amount_cents, paid_by FROM expenses"):
        net[people[row["paid_by"]]] += row["amount_cents"]

        shares = conn.execute(
            "SELECT person_id, shares FROM expense_shares WHERE expense_id = ? ORDER BY rowid", (row["id"],)
        ).fetchall()
        total_shares = sum(s["shares"] for s in shares)
        amount = row["amount_cents"]

        # Give every share-holder floor(amount/total_shares)*shares, then hand
        # any leftover cents (from integer division) to the first share-holder
        # so the owed total always reconciles exactly to `amount`.
        per_share = amount // total_shares
        remainder = amount - per_share * total_shares
        for i, s in enumerate(shares):
            owed = per_share * s["shares"] + (remainder if i == 0 else 0)
            net[people[s["person_id"]]] -= owed

    return net


def settlements(conn: sqlite3.Connection) -> list[tuple[str, str, int]]:
    """Minimal-ish list of (debtor, creditor, amount_cents) transfers that zero out every balance.

    Greedy: repeatedly match the biggest creditor against the biggest debtor.
    Not guaranteed to be the mathematically minimal transaction count for
    every possible input, but it's simple, correct, and good enough for a
    small friend group.
    """
    net = balances(conn)
    creditors = sorted([(name, amt) for name, amt in net.items() if amt > 0], key=lambda x: -x[1])
    debtors = sorted([(name, -amt) for name, amt in net.items() if amt < 0], key=lambda x: -x[1])

    transfers: list[tuple[str, str, int]] = []
    i = j = 0
    while i < len(debtors) and j < len(creditors):
        debtor_name, debt = debtors[i]
        creditor_name, credit = creditors[j]
        amount = min(debt, credit)
        if amount > 0:
            transfers.append((debtor_name, creditor_name, amount))

        debt -= amount
        credit -= amount
        debtors[i] = (debtor_name, debt)
        creditors[j] = (creditor_name, credit)

        if debt == 0:
            i += 1
        if credit == 0:
            j += 1

    return transfers


if __name__ == "__main__":
    import os

    here = os.path.dirname(__file__)
    conn = connect()
    load_schema_and_seed(conn, os.path.join(here, "schema.sql"), os.path.join(here, "seed.sql"))

    print("Balances:")
    for name, cents in balances(conn).items():
        print(f"  {name}: {'+' if cents >= 0 else '-'}${abs(cents) / 100:.2f}")

    print("\nSettle up:")
    for debtor, creditor, cents in settlements(conn):
        print(f"  {debtor} pays {creditor} ${cents / 100:.2f}")

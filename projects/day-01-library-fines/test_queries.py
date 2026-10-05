import os

import pytest

from queries import connect, days_late_for_loan, fines_by_member, load_schema_and_seed, overdue_loans, top_borrowers

HERE = os.path.dirname(__file__)
AS_OF = "2026-10-05"


@pytest.fixture
def conn():
    c = connect()
    load_schema_and_seed(c, os.path.join(HERE, "schema.sql"), os.path.join(HERE, "seed.sql"))
    yield c
    c.close()


def test_days_late_for_returned_loan():
    assert days_late_for_loan("2026-07-15", "2026-07-20", AS_OF) == 5


def test_days_late_for_open_loan_uses_as_of():
    assert days_late_for_loan("2026-09-15", None, AS_OF) == 20


def test_days_late_never_negative():
    assert days_late_for_loan("2026-12-01", None, AS_OF) == 0


def test_overdue_loans_excludes_not_yet_due_and_returned(conn):
    overdue = overdue_loans(conn, AS_OF)
    ids = {loan["id"] for loan in overdue}
    assert ids == {1, 2}  # Alice's two open, overdue loans


def test_fines_by_member(conn):
    fines = fines_by_member(conn, AS_OF)
    assert fines["Alice"] == pytest.approx(5.25)  # 20 days + 1 day, at $0.25/day
    assert fines["Bob"] == pytest.approx(0.0)
    assert fines["Priya"] == pytest.approx(1.25)  # returned 5 days late


def test_top_borrowers_orders_by_loan_count(conn):
    ranked = top_borrowers(conn, limit=2)
    assert ranked == [("Bob", 3), ("Alice", 2)]

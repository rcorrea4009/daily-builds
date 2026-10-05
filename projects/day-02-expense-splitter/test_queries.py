import os

import pytest

from queries import balances, connect, load_schema_and_seed, settlements

HERE = os.path.dirname(__file__)


@pytest.fixture
def conn():
    c = connect()
    load_schema_and_seed(c, os.path.join(HERE, "schema.sql"), os.path.join(HERE, "seed.sql"))
    yield c
    c.close()


def test_balances_reconcile_to_zero(conn):
    # Money in always equals money out -- this should hold for any valid seed data.
    assert sum(balances(conn).values()) == 0


def test_balances_match_hand_calculation(conn):
    # Dinner $60 split 3 ways ($20 each), Groceries $45 split 2 ways ($22.50 each,
    # Alice excluded), Uber $30 split 2:1 between Alice/Carlos ($20 / $10).
    result = balances(conn)
    assert result["Alice"] == 2000   # paid 6000, owed 2000 (dinner) + 2000 (uber) = net +2000
    assert result["Bob"] == 250      # paid 4500, owed 2000 (dinner) + 2250 (groceries) = net +250
    assert result["Carlos"] == -2250  # paid 3000, owed 2000+2250+1000 = 5250, net -2250


def test_settlements_zero_out_every_balance(conn):
    transfers = settlements(conn)
    net = dict.fromkeys(["Alice", "Bob", "Carlos"], 0)
    for debtor, creditor, amount in transfers:
        net[debtor] -= amount
        net[creditor] += amount

    original = balances(conn)
    for name in net:
        assert net[name] == original[name]


def test_settlements_use_only_real_debtors_and_creditors(conn):
    transfers = settlements(conn)
    for debtor, creditor, amount in transfers:
        assert amount > 0
        assert debtor != creditor


def test_uneven_split_assigns_remainder_cents_without_losing_any(conn):
    # 100 cents split 3 ways can't divide evenly (33/33/33 = 99) --
    # the leftover cent must land on someone, and the three shares
    # must still sum to exactly 100.
    conn.execute("INSERT INTO people (id, name) VALUES (4, 'Dana'), (5, 'Evan'), (6, 'Farah')")
    conn.execute(
        "INSERT INTO expenses (id, description, amount_cents, paid_by) VALUES (99, 'Coffee', 100, 4)"
    )
    conn.execute(
        "INSERT INTO expense_shares (expense_id, person_id, shares) VALUES (99, 4, 1), (99, 5, 1), (99, 6, 1)"
    )
    conn.commit()

    result = balances(conn)
    # Each of the three shares (Dana's own, Evan's, Farah's) must sum to exactly 100 cents.
    farah_share = -(result["Farah"])
    evan_share = -(result["Evan"])
    dana_share = 100 - result["Dana"]
    assert dana_share + evan_share + farah_share == 100

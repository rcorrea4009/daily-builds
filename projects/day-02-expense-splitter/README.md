# Expense Splitter

A Splitwise-style expense splitter: a SQLite schema for shared expenses with weighted shares, a Python layer that computes each person's net balance, and a greedy settlement algorithm that turns "who owes what" into the minimum-ish set of "who pays whom."

**Skills shown:** modeling money correctly (integer cents, never floats), a non-trivial SQL + Python aggregation, and a small greedy algorithm with tests that check its *invariants* (balances always sum to zero, settlements always zero out the original balances) rather than just one hardcoded example.

## Run it

```bash
pip install -r requirements.txt
python queries.py     # prints balances + a settlement plan for the seed data
pytest -v
```

## Design notes

- Money is stored and computed as **integer cents**. Mixing floats into financial math is a classic source of off-by-a-cent bugs — doing the division in integers and explicitly handing the leftover remainder to one share-holder (see `balances()`) avoids that entirely, and `test_uneven_split_assigns_remainder_cents_without_losing_any` pins down that no cent ever goes missing.
- `settlements()` is a greedy "largest creditor meets largest debtor" matcher. It's not provably the minimum number of transactions for every possible input, but it's simple and easy to reason about — a good example of picking a pragmatic algorithm over a textbook-optimal one and being upfront about the tradeoff.

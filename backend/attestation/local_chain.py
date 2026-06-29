"""
Local attestation chain — simulates blockchain behaviour using a 
hash-linked ledger written to a JSON file.

Each attestation record contains:
  - The routing event data (hashed for privacy)
  - A SHA-256 hash of the record content
  - The hash of the previous record (chain link)
  - A timestamp

This makes the ledger tamper-evident: changing any record breaks
all subsequent hashes, detectable by verify_chain().

When ready to move to a real chain, replace _write_block() with
a Web3.py call to your deployed contract.
"""

import json
import hashlib
import time
from pathlib import Path
from datetime import datetime
from typing import Optional
from datetime import datetime, timezone


CHAIN_PATH = Path(__file__).resolve().parent.parent / "data" / "attestation_chain.json"


def _load_chain() -> list:
    if not CHAIN_PATH.exists():
        return []
    with open(CHAIN_PATH) as f:
        return json.load(f)


def _save_chain(chain: list) -> None:
    CHAIN_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(CHAIN_PATH, "w") as f:
        json.dump(chain, f, indent=2)


def _hash_block(block: dict) -> str:
    content = json.dumps(block, sort_keys=True).encode()
    return hashlib.sha256(content).hexdigest()


def attest_routing_event(event: dict) -> dict:
    """
    Write a routing event to the local attestation chain.

    event should contain:
        org_id, user_id, tier, co2_kg, co2_saved_kg,
        baseline_co2_kg, timestamp, prompt_hash

    Returns the block that was written.
    """
    chain = _load_chain()
    prev_hash = chain[-1]["block_hash"] if chain else "0" * 64

    # Only store non-identifying fields — prompt content never touches the chain
    block_content = {
        "index":            len(chain),
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "prev_hash":        prev_hash,
        "org_id":           event.get("org_id", ""),
        "user_id":          event.get("user_id", ""),
        "prompt_hash":      event.get("prompt_hash", ""),
        "tier":             event.get("tier", ""),
        "co2_kg":           event.get("co2_kg", 0),
        "co2_saved_kg":     event.get("co2_saved_kg", 0),
        "baseline_co2_kg":  event.get("baseline_co2_kg", 0),
        "cached":           event.get("cached", False),
    }

    block_hash = _hash_block(block_content)
    block = {**block_content, "block_hash": block_hash}

    chain.append(block)
    _save_chain(chain)
    return block


def verify_chain() -> dict:
    """
    Verify the integrity of the entire chain.
    Returns {"valid": bool, "length": int, "first_broken_at": int | None}
    """
    chain = _load_chain()

    if not chain:
        return {"valid": True, "length": 0, "first_broken_at": None}

    for i, block in enumerate(chain):
        # Recompute hash without the stored block_hash field
        content = {k: v for k, v in block.items() if k != "block_hash"}
        expected = _hash_block(content)

        if block["block_hash"] != expected:
            return {"valid": False, "length": len(chain), "first_broken_at": i}

        # Check chain link
        if i > 0 and block["prev_hash"] != chain[i - 1]["block_hash"]:
            return {"valid": False, "length": len(chain), "first_broken_at": i}

    return {"valid": True, "length": len(chain), "first_broken_at": None}


def get_chain_summary() -> dict:
    """Aggregate CO₂ figures across the entire chain."""
    chain = _load_chain()

    total_co2     = sum(b["co2_kg"] for b in chain)
    total_saved   = sum(b["co2_saved_kg"] for b in chain)
    total_baseline = sum(b["baseline_co2_kg"] for b in chain)
    cache_hits    = sum(1 for b in chain if b.get("cached"))

    return {
        "blocks":           len(chain),
        "total_co2_kg":     total_co2,
        "total_saved_kg":   total_saved,
        "total_baseline_kg": total_baseline,
        "cache_hits":       cache_hits,
        "verified":         verify_chain()["valid"],
    }


if __name__ == "__main__":
    # Smoke test
    print("Writing 3 test blocks...")

    for i in range(3):
        block = attest_routing_event({
            "org_id":          "test-org",
            "user_id":         "test-user",
            "prompt_hash":     hashlib.sha256(f"prompt {i}".encode()).hexdigest()[:16],
            "tier":            ["micro", "lite", "pro"][i],
            "co2_kg":          0.000001 * (i + 1),
            "co2_saved_kg":    0.000005 * (i + 1),
            "baseline_co2_kg": 0.000006 * (i + 1),
            "cached":          i % 2 == 0,
        })
        print(f"  Block {block['index']}: {block['block_hash'][:16]}...")

    result = verify_chain()
    summary = get_chain_summary()

    print(f"\nChain valid: {result['valid']}")
    print(f"Blocks: {summary['blocks']}")
    print(f"Total CO₂ saved: {summary['total_saved_kg'] * 1e6:.2f} µg")
    print(f"Verified: {summary['verified']}")
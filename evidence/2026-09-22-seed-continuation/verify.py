"""Check retained observation bytes and rows without accessing an application."""

import hashlib
import json
from pathlib import Path

root = Path(__file__).resolve().parent
receipt = json.loads(root.with_suffix(".json").read_text())
for relative, expected in receipt["artifacts_sha256"].items():
    actual = hashlib.sha256((root / relative).read_bytes()).hexdigest()
    assert actual == expected, relative


def snapshot(name):
    return json.loads((root / f"{name}.json").read_text())


before = snapshot("before-development")
after = snapshot("after-agent-development")
repeat = snapshot("after-repeat-development")
assert before["rails_environment"] == after["rails_environment"] == "development"
assert before["database"] == after["database"] == "fd_8079_seed_edit_dev_20260922"
assert after == repeat
assert before["users"] == after["users"]
assert before["password_fingerprints"] == after["password_fingerprints"]
for kind in ("movies", "bookmarks"):
    assert all(row in after[kind] for row in before[kind]), kind
assert [len(before[kind]) for kind in ("users", "movies", "bookmarks")] == [2, 3, 2]
assert [len(after[kind]) for kind in ("users", "movies", "bookmarks")] == [2, 5, 4]
assert after["broken_bookmarks"] == 0
assert {tuple(row[1:]) for row in after["bookmarks"]} == {
    ("viewer@movie-preview.example", "The Last Lantern", True),
    ("viewer@movie-preview.example", "Signal from Tomorrow", False),
    ("viewer@movie-preview.example", "City of Kites", True),
    ("viewer@movie-preview.example", "Winter Observatory", False),
}
assert len(after["password_fingerprints"]) == 2

production = snapshot("before-production")
assert production == snapshot("after-production")
assert production["rails_environment"] == "production"
assert production["database"] == "fd_8079_seed_edit_prod_20260922"
for kind in ("users", "movies", "bookmarks", "password_fingerprints", "broken_bookmarks"):
    assert not production[kind], kind

sources = snapshot("source-before")
final_sources = snapshot("source-after")
changes = snapshot("source-changes")
assert len(sources) == changes["baseline_file_count"] == 276
assert sources.keys() == final_sources.keys()
assert {name for name in sources if sources[name] != final_sources[name]} == set(changes["changed"])
assert changes["unchanged_file_count"] == 274
assert not changes["added"] and not changes["removed"]
assert set(changes["changed"]) == {"README.md", "db/seeds/development.rb"}
for original, retained in {
    "README.md": "README.md.txt",
    "db/seeds/development.rb": "development-seeds.rb.txt",
    "db/seeds.rb": "seeds.rb.txt",
}.items():
    baseline = hashlib.sha256((root / "before" / retained).read_bytes()).hexdigest()
    final = hashlib.sha256((root / "after" / retained).read_bytes()).hexdigest()
    assert sources[original] == baseline
    assert final_sources[original] == final
    if original in changes["changed"]:
        assert changes["changed"][original] == {"before": baseline, "after": final}
    else:
        assert baseline == final

print(f"PASS: {len(receipt['artifacts_sha256'])} artifact hashes; retained rows/IDs; "
      "2/5/4 development; requested bookmarks; repeat equality; both password "
      "fingerprints preserved; 0/0/0 production control; two-file source delta.")

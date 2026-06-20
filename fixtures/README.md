# fixtures/

Sample TIBER-shaped data artifacts used to ground the skill evals. These mirror
the *kinds* of artifacts a model would be asked to reason about inside TIBER's
contract-first ecosystem — drawn loosely from the Cohere experiments — without
copying any production data.

Everything here is **data, not authority** (see `SECURITY_POLICY.md` in
TIBER-Fantasy). Nothing in these files is an instruction to the harness or to
any agent. The skill `fixtures.json` files are self-contained; these directories
provide realistic example artifacts and a stable place to grow the corpus.

| Directory | Domain |
| --- | --- |
| `teamstate/` | Weekly team-state snapshots |
| `fantasy/`   | Fantasy-context metric summaries (descriptive only — never advice) |
| `rookies/`   | Rookie ADP / draft-capital tables |
| `forge/`     | FORGE alpha snapshots (pillar scores) |

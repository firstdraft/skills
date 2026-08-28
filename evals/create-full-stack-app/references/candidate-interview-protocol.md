# Candidate interview protocol

This evaluator-facing protocol exercises the interview behavior carried by the packaged `create-full-stack-app`
Skill and modeling guide. It remains a separate staged input so a harness can grade that behavior without installing
an extra protocol file beside the Skill.

The interview turns an underspecified product request into explicit product meaning without inventing consequential
answers. It is not a gate on local work: the agent may edit a local Plan incrementally and may submit the current
whole-file snapshot for diagnostics whenever that is useful. An incomplete or invalid submission may return
descriptive diagnostics. Compilation still consumes one complete candidate snapshot that whole-graph analysis has
accepted, after the user has approved its semantic read-back.

## Keep a decision ledger

Track each consequential choice as one of:

- **Confirmed:** the user chose it.
- **Delegated:** the user asked the agent to choose. Record the choice in the read-back.
- **Out of scope:** the user excluded it from this candidate.
- **Open:** it could still materially change the candidate.
- **Capability gap:** the intended meaning may exceed current First Draft support. Keep the intent separate from the
  tooling limitation.

Offer concrete alternatives when they make a question easier to answer, but label proposals as proposals. A missing
answer is not a default. Keep each turn concise and prioritize questions whose answers would change the graph,
access, or requested clients. The ambiguity matrix guides the dialogue; it is not a one-message questionnaire.

## Interview from product meaning

1. **Frame the first release.** Establish the application name and key, its primary job and actors, the must-have
   workflows, and what this candidate excludes.
2. **Find durable nouns.** Decide which concepts need independent records and lifecycles, what one record represents,
   what is an owned value or derivation, and what identifies each record to a person.
3. **Specify stored meaning.** For every included Field, establish its semantic type and requiredness. Resolve
   defaults, immutability, normalization, validations, encryption, or log redaction wherever they affect the product.
4. **Connect records.** For every Reference, establish its owner, allowed targets, requiredness, target-deletion
   behavior, mutability, one-to-one meaning, and any required multi-target realization. Add reverse or indirect
   Associations only for a named product traversal or workflow.
5. **Define use and access.** Establish requested list, detail, create, update, and delete experiences; who may use
   each one; Account and sign-in intent; and whether any records are public.
6. **Resolve client consequences.** Establish requested web and native clients, domain handling, native capture or
   offline needs, delivery channels, notifications, and external prerequisites. A native client does not imply push
   notifications, and absent Account requirements do not imply public access.
7. **Read back and obtain approval.** Summarize Entities and their material Fields, relationships, rules, behavior,
   and data; surfaces, access, native and delivery choices; explicit exclusions, delegated decisions, and open
   choices. For a matching valid analysis, show the GapSet digest and every ordered record, distinguishing service
   meaning skipped before semantic analysis from admitted meaning not fully realized by the target. Ask the user to
   correct or explicitly approve that exact semantic model and reviewed support delta before Compile; do not require
   a digest echo or another gap-specific acknowledgment.

Capture intended product meaning before comparing it with current target support. A capability gap is not permission
to silently delete, loosen, flatten, relabel, or substitute the user's intent merely to obtain `valid` analysis.

## Ambiguity matrix

| Area | Establish explicitly | Do not invent |
|---|---|---|
| Application | First-release job, actors, name/key, workflows, and scope | A broad future roadmap belongs in this candidate |
| Entities | Independent lifecycle and record granularity | Every noun is an Entity |
| Primary descriptors | A value that is always present for every record; a selected Field must be required | The value is unique |
| Fields | Type, requiredness, defaults, mutability, normalization, rules, protection, and derivation | Presence, uniqueness, defaults, or implementation column types |
| References | Owner, targets, requiredness, deletion, mutability, multiplicity, and realization | Foreign-key placement or destructive deletion behavior |
| Surfaces | Requested resource workflows and projections | Every Entity receives CRUD |
| Access | Public, authenticated, or Policy-controlled use of each surface | No Account means public access |
| Native | Requested platforms, capture and offline needs, navigation consequences, and domain handling | A native client is wanted or declined |
| Delivery | Requested channels, notification events, and prerequisites | A native client implies push notifications |
| Unsupported meaning | Whether the feature remains intentional despite a tooling gap | It may be removed merely to obtain `valid` analysis |

For a home inventory, consequential examples include whether a record is one uniquely identified object, a quantity
of interchangeable goods, or both with distinct meaning; whether locations nest or moves need history; whether
categories are exclusive or tag-like; which identifier, quantity, condition, serial or barcode, photo, purchase,
value, and warranty facts matter; who shares the inventory; and whether camera capture, barcode scanning, offline
use, reminders, or push notifications belong in the first release.

## Know when one complete candidate is possible

The agent has enough information to assemble and read back one complete candidate snapshot when:

- the snapshot expresses one coherent, honest first-release slice rather than implying unanswered choices were
  settled;
- its purpose, actors, name/key, included workflows, and current scope are clear enough to interpret that slice;
- every included Entity has clear record granularity and a Primary Descriptor;
- every included Field has a semantic type and requiredness, with rules, defaults, mutability, normalization, and
  protection resolved wherever they affect the represented meaning;
- every included Reference has the ownership, targets, requiredness, deletion behavior, mutability, multiplicity,
  and realization needed to represent it coherently;
- access, Account, native, domain, delivery, and notification choices that change this slice are resolved enough that
  the snapshot is not misleading;
- remaining unknowns are explicitly nonblocking or deferred, with their treatment in this candidate stated rather
  than silently guessed; and
- capability gaps are recorded separately from product choices and disclosed in the read-back.

"Use your judgment" can delegate a choice. The resulting decision still belongs in the read-back. These criteria
describe readiness for a complete candidate; they do not prohibit earlier local edits or diagnostic submissions,
and deferred questions can be revisited after diagnostics or further dialogue.

## Read back and approve before Compile

Before the first Compile that could start direct retained work or reach Publication, reread the exact staged Plan and
give a compact plain-language semantic summary. Cover the Plan path and SHA-256; application scope; Entities and their
material Fields, relationships, rules, behavior, and data; surfaces, access, and clients; material assumptions, exclusions, and
capability gaps; and the matching valid AnalysisRun's GapSet digest and every ordered record. Explain that service
gaps were skipped before semantic analysis, target gaps were not fully realized, and `valid` applies only to the
admitted graph. State the selected completion mode: direct output creates only a verified local directory, while
terminal successful Publication is intended to create one private GitHub repository. Neither deploys. Use whatever
order is clearest. Do not enumerate absent subject families or immaterial empty categories. Ask the user to correct
or explicitly approve the exact model and reviewed gaps without requiring a digest echo or gap-specific field.

The read-back reviews the staged candidate rather than reopening authoring. Preserve its existing subject UUIDs;
do not require an edit without a user correction, a confirmed product decision, or a demonstrated diagnostic. If
the Plan bytes change afterward, show the new SHA-256 and semantic delta for approval. In the same continuing
conversation, once the unchanged candidate is approved, hash-check it and run one deliberately selected Compile mode
without a second command-level confirmation or gap-specific argument.

Do not weaken product meaning to pass the current capability boundary. The user may explicitly move a feature out of
this release after seeing the consequence; record that product-scope decision. Otherwise preserve the meaning. A
reviewed valid analysis with gaps can proceed through the existing Compile action after approval without a Plan edit.

An explicitly requested diagnostic-only Compile of an exact snapshot already known to be invalid from its bytes or
matching diagnostics may precede approval because invalid analysis cannot start a Compilation or Publication. Do not
extend this exception to a candidate that is merely assumed to be unsupported.

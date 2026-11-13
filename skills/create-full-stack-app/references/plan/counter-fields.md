---
name: counter-fields
description: Counter Fields, a stored count of related records that Rails keeps current, and `derivation` for sums and averages. Open it when a record shows, filters, or sorts by a count.
---

# Counter Fields

A `counter` Field is an integer column on a parent record that holds how many records point at it, such as a
question's answers or a recipe's reviews. Rails keeps it current with `counter_cache` when the count follows one
[Reference](references.md) in the plain way: every child record that references this parent counts once. Use a
counter when a page shows the count, or a Predicate, Ordering, or Policy reads it. Use an ordinary `integer` Field
(see [Fields](fields.md)) for a number people type in. A sum, average, minimum, or maximum over related records is
not generated in this release; see [Sums, averages, minimums, and maximums](#sums-averages-minimums-and-maximums).

- **First Draft generates:** the column, starting at 0; `counter_cache` on the child's `belongs_to` for a plain
  count; the number on list and details pages; filters, sort orders, and (in a Plan with an Account Entity) Policy
  rules that read it.
- **You write after Compile:** any other count, such as "five-star reviews only" or "followers" through a join
  Entity; sums and averages; and any repair of drifted counts. Declare such a count as a counter anyway: its column
  stays at 0 until you write the counting; see
  [Which counts Rails keeps current](#which-counts-rails-keeps-current). Write it before the preview; `SKILL.md` has
  the order of work.

Where analysis leaves something out, it reports a gap code such as
`foundation_plan.gap.field_kind.partially_generated` in the result of `plan push`.

## Simple example

A post counts its comments. The counter sits in the parent's `fields[]`, beside the Association it names in
`associations[]`. The child Entity stores the Reference.

```json
{"subject_uuid": "…", "key": "post", "name": "Post", "primary_descriptor": {"field": "post.title"},
 "fields": [
   {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
   {"subject_uuid": "…", "key": "comments_count", "name": "Comments", "type": "counter", "required": true,
    "settings": {"counts": "post.comments"}}],
 "associations": [
   {"subject_uuid": "…", "key": "comments", "kind": "direct", "name": "Comments",
    "reference": "comment.post", "side": "referenced"}]},
{"subject_uuid": "…", "key": "comment", "name": "Comment", "primary_descriptor": {"field": "comment.body"},
 "fields": [{"subject_uuid": "…", "key": "body", "name": "Body", "type": "short_text", "required": true}],
 "references": [
   {"subject_uuid": "…", "key": "post", "name": "Post", "required": true, "targets": ["post"],
    "on_referenced_deleted": "restrict"}]}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

```ruby
# db/migrate/…_create_posts.rb
t.integer "comments_count", default: 0, null: false

# app/models/comment.rb
belongs_to :post, counter_cache: true

# app/models/post.rb
has_many :comments, dependent: :restrict_with_error
```

```erb
<%# app/views/posts/_post.html.erb and _list_item.html.erb, when the Scaffold has a projection %>
<dt><%= Post.human_attribute_name(:comments_count) %></dt>
<dd class="whitespace-pre-wrap"><%= post.comments_count %></dd>
```

```yaml
# config/locales/scaffolds.en.yml, under activerecord.attributes.post
comments_count: Comments
```

The counter is never a form input, a permitted parameter, or a factory attribute. No generated spec checks that
creating a comment raises the count.

## Keys

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `type` | yes | `"counter"` | | An `integer` column, `default: 0, null: false`. |
| `required` | yes | `true` only | | Nothing more; `false` fails import with `foundation_plan.schema.const`. |
| `settings.counts` | yes | `"<entity>.<association>"`, an Association on this same Entity | | `counter_cache` on the child's `belongs_to`, when the Association has a shape Rails can count; see the next table. |
| `key` | yes | lower snake case | | The column name. With a key other than `<association>_count`, both sides name it: `belongs_to :post, counter_cache: :replies` and `has_many :comments, …, counter_cache: :replies`. |
| `name` | yes | text | | The label in `config/locales/scaffolds.en.yml`. |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. |
| `validations` | no | `comparison`, `exclusion`, or `owner` | none | Each becomes an empty `validate` method, with a model spec example that fails until you write the rule (`foundation_plan.gap.validation.not_generated`; an `owner` Validation has no gap record). The example builds a record that breaks the rule, or is a placeholder where First Draft cannot build one. Keep a rule the person asked for. |

A counter takes no `default`, `immutable`, or `derivation`; import rejects each (`foundation_plan.schema.not` or
`foundation_plan.schema.enum`). A `counts` path that names no Association fails with
`foundation_plan.link.association_not_found`.

## Which counts Rails keeps current

Only the first three rows get `counter_cache`. Every other row is accepted by analysis: the column, pages, filters,
and sort orders are generated, but nothing updates the number, so it reads 0. Analysis reports
`foundation_plan.gap.field_kind.partially_generated` and README.md lists the Field under "Behavior to write", in
Data. For an indirect count or a second unfiltered counter, the parent's model spec has an example that creates one
counted record and expects the count to read 1; it fails until you write the counting. For a filtered count, the
example is a placeholder that you replace.


| The counted Association | Kept current |
| --- | --- |
| `kind: "direct"`, `side: "referenced"`, over a Reference with one target, required or optional, under any `on_referenced_deleted` | Yes. With `delete_referencing_record` the parent gets `dependent: :destroy`, so deleting it runs the child callbacks. |
| The same over a Reference with `"realization": {"rails_association": "polymorphic"}`, when every target has a counter with the same key over its own Association | Yes: `belongs_to :target, polymorphic: true, counter_cache: true`. If one target lacks the counter or names it differently, no target's counter is kept current. |
| The same over a Reference with `"rails_association": "exclusive_arc"` | Yes, for each target that has a counter: `belongs_to :post, optional: true, counter_cache: true`. |
| `kind: "indirect"`, such as followers through a Follow Entity | No. Count the direct Association to the join Entity instead (`user.follower_links` over `follow.followed`); it gives the same number when each pair is unique. |
| An Association with a `predicate`, such as approved comments only | No. `counter_cache` counts every child. A plain counter over the same Reference stays kept current. |
| Two unfiltered counters over the same Reference | No, for both counters. One `belongs_to` carries one `counter_cache`. With `on_referenced_deleted: "restrict"`, the parent also loses `restrict_with_error` (`foundation_plan.gap.reference.deletion_not_generated`). |
| `side: "referencing"`, or an Association on another Entity | No. |

A filtered Association names a [Predicate](predicates.md) on the child Entity by `"<entity>.<key>"`. Beside a plain
counter, it looks like this:

```json
"fields": [
  {"subject_uuid": "…", "key": "comments_count", "name": "Comments", "type": "counter", "required": true,
   "settings": {"counts": "post.comments"}},
  {"subject_uuid": "…", "key": "approved_comments_count", "name": "Approved comments", "type": "counter",
   "required": true, "settings": {"counts": "post.approved_comments"}}],
"associations": [
  {"subject_uuid": "…", "key": "comments", "kind": "direct", "name": "Comments",
   "reference": "comment.post", "side": "referenced"},
  {"subject_uuid": "…", "key": "approved_comments", "kind": "direct", "name": "Approved comments",
   "reference": "comment.post", "side": "referenced", "predicate": "comment.approved"}]
```

```ruby
# app/models/comment.rb
belongs_to :post, counter_cache: true

# app/models/post.rb
has_many :comments, dependent: :restrict_with_error
has_many :approved_comments, -> { approved }, class_name: "Comment"
```

`comments_count` stays current; `approved_comments_count` reads 0. Declare a filtered counter whenever the person
asks for the count, even when they only want to see it. The column, its place on pages, and any filter or sort that
reads it are generated; you write callbacks on the child that keep it current, and replace the placeholder example
in the post's model spec. README.md lists the counter under "Behavior to write", in Data:

```markdown
- **`Post#approved_comments_count`** (`app/models/post.rb`) holds the count of `approved_comments` that the Counter at `/application/entities/0/fields/2` in `.firstdraft/submitted-foundation-plan.json` defines. Rails counter_cache counts every child record; a Counter filtered by the Association's Predicate is not maintained. Until then it reads 0. `spec/models/post_spec.rb` has a placeholder example for it.
```

```ruby
# spec/models/post_spec.rb
it "counts approved_comments in approved_comments_count" do
  raise NotImplementedError,
    "post.approved_comments_count is not written yet. Replace this example with one that creates one counted record and checks that approved_comments_count reads 1."
end
```

A self-referencing pair works: a User with `follower_links` over `follow.followed` and `following_links` over
`follow.follower` gets `belongs_to :followed, class_name: "User", counter_cache: :followers_count` and the matching
line for `following_count`.

## Full example

A question shows how many answers it has. The list puts the most-answered first, a filter finds unanswered
questions, and a question can be edited only until it has an answer. Deleting a question deletes its answers.

```json
{"subject_uuid": "…", "key": "question", "name": "Question", "primary_descriptor": {"field": "question.title"},
 "fields": [
   {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
   {"subject_uuid": "…", "key": "answers_count", "name": "Answers", "type": "counter", "required": true,
    "settings": {"counts": "question.answers"},
    "notes": "Shown on the list so people can find questions nobody has answered."}],
 "associations": [
   {"subject_uuid": "…", "key": "answers", "kind": "direct", "name": "Answers",
    "reference": "answer.question", "side": "referenced"}],
 "predicates": [
   {"subject_uuid": "…", "key": "unanswered", "name": "Unanswered",
    "expression": {"kind": "comparison", "left": {"target": {"field": "question.answers_count"}},
                   "operator": "equals", "right": {"kind": "literal", "value": 0}}}],
 "orderings": [
   {"subject_uuid": "…", "key": "most_answered", "terms": [
     {"field": "question.answers_count", "direction": "descending"},
     {"system_field": "id", "direction": "descending"}]}],
 "policies": [
   {"subject_uuid": "…", "key": "editable", "operation": "update",
    "allow_when": {"kind": "comparison", "left": {"target": {"field": "question.answers_count"}},
                   "operator": "equals", "right": {"kind": "literal", "value": 0}}}],
 "scaffold": {
   "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
   "index": {"authorization": "public", "ordering": "question.most_answered",
             "projection": [{"field": "question.title"}, {"field": "question.answers_count"}]},
   "show": {"authorization": "public",
            "projection": [{"field": "question.title"}, {"field": "question.answers_count"}]},
   "create": {"authorization": "public", "inputs": [{"field": "question.title"}]},
   "update": {"authorization": {"policy": "question.editable"}, "inputs": [{"field": "question.title"}]},
   "destroy": {"authorization": "public"}}},
{"subject_uuid": "…", "key": "answer", "name": "Answer", "primary_descriptor": {"field": "answer.body"},
 "fields": [{"subject_uuid": "…", "key": "body", "name": "Body", "type": "long_text", "required": true}],
 "references": [
   {"subject_uuid": "…", "key": "question", "name": "Question", "required": true, "targets": ["question"],
    "on_referenced_deleted": "delete_referencing_record"}],
 "scaffold": {
   "resource_routes": ["show", "new", "create", "destroy"],
   "show": {"authorization": "public", "projection": [{"field": "answer.body"}]},
   "create": {"authorization": "public",
              "inputs": [{"field": "answer.body"}, {"association": "answer.question"}]},
   "destroy": {"authorization": "public"}}}
```

The Policy is generated only because the Plan also has an Account Entity, left out here; see
[Policies](policies.md).

### Generates

```ruby
# db/migrate/…_create_questions.rb
t.integer "answers_count", default: 0, null: false
t.index ["answers_count", "id"], name: "index_questions_on_answers_count_and_id"

# app/models/question.rb
has_many :answers, dependent: :destroy
scope :unanswered, -> { where(answers_count: 0) }
scope :most_answered, -> { order(answers_count: :desc, id: :desc) }

# app/models/answer.rb
belongs_to :question, counter_cache: true

# app/policies/question_policy.rb
def update?
  record&.answers_count == 0
end

relation_scope(:update) do |relation|
  relation.where(answers_count: 0)
end

# app/controllers/questions_controller.rb
def index
  relation = Question.most_answered
  @pagy, @questions = pagy(:offset, relation, limit: PAGE_LIMIT)
end
```

The question pages show the Edit link only when `allowed_to?(:update?, question, with: QuestionPolicy)`. The Policy
spec sets the column directly: `create(:question, answers_count: 1)`.

## Sums, averages, minimums, and maximums

The schema allows a `derivation` on an `integer` or `decimal` Field (`average` needs `decimal`):

```json
{"subject_uuid": "…", "key": "total_hours", "name": "Total hours", "type": "decimal", "required": false,
 "derivation": {"aggregate": {"association": "project.tasks", "operation": "sum", "field": "task.hours"}}}
```

Analysis accepts it as `valid`, then drops the `derivation` (`foundation_plan.gap.service.unsupported_capability`,
at `…/derivation`). The Field becomes an ordinary stored column that nothing calculates, and the pages that list it
show it empty. Nothing is generated for the calculation yet. The generated README lists it under "Behavior to
write", in Data, by the Entity's key and the `…/derivation` path: "First Draft did not import this part of the
Plan, so the application has none of it." Keep the `derivation` in the Plan, and write the calculation before the
preview, such as `def total_hours = tasks.sum(:hours)` in `app/models/project.rb`. Tell the person so. An Ordering
by it is not generated either.

Make a derived Field `required: false`, as above. With `required: true` the column is `null: false` with no default
and the create action does not permit it, so the New page cannot save a record
(`foundation_plan.gap.scaffold.route.partially_generated`).

## Used elsewhere in the Plan

The full example shows the Plan shape for each row. A counter literal is a JSON integer: `{"kind": "literal",
"value": 5}`; a string such as `"5"` fails with `foundation_plan.expression.literal_type_incompatible`.

| Where | Generates | Does not generate |
| --- | --- | --- |
| Scaffold `index` or `show` `projection` | The number, where you list it. A projection that leaves the counter out still shows it, after the listed items. | Anything, when the Scaffold has no `projection`: the page shows the descriptor only. |
| A list of child records on a parent's page, `{"association": …, "projection": […]}` | Each row shows the child's own counters, as on the child's list page. | Counters, when the list has no `projection`. |
| Form input in `create.inputs` or `update.inputs` | | The input is dropped and the rest of the form kept (`foundation_plan.gap.scaffold.input.not_generated`). A count comes only from child records; for a person who wants to set one, see [Decisions to raise](#decisions-to-raise). |
| [Predicate](predicates.md) comparing the counter | `equals`, `not_equals`, `greater_than`, `greater_than_or_equal_to`, `less_than`, `less_than_or_equal_to`, and `in` with a list of literals: `where(comments_count: (10..))`, `where(arel_table[:comments_count].gt(3))`. A Scaffold `index.predicate` applies it to the list page. | |
| Association with a `predicate` that reads the result's counter | `has_many :popular_posts, -> { popular }, class_name: "Post"`. | |
| [Ordering](orderings.md) by the counter | When it has two or more terms, all in one direction, and ends with `{"system_field": "id"}`: a scope and a matching index. `index.ordering` makes the list page use it. An Ordering has no `name`. | Any other Ordering, such as the counter alone, or counter descending then `id` ascending: the scope raises `NotImplementedError` (`foundation_plan.gap.ordering.not_generated`), and so does a list page that names it. The model spec has a placeholder example for the scope that fails until you replace it. |
| [Policy](policies.md) `allow_when` reading a kept-current counter | `record&.answers_count == 0` and `relation.where(answers_count: 0)`. | For a counter that is not kept current: `update?` returns `false` and its scope raises until you write the counting (`foundation_plan.gap.policy.not_generated`). The Policy spec has a placeholder example that fails until you replace it. |
| [Validation](validations.md) `when` reading the counter | | An empty `validate` method (`foundation_plan.gap.validation.not_generated`), with a placeholder example in the model spec that fails until you replace it. |
| [Development data](development-data.md) | Create the child records; Rails counts them. Shape below. | A value for the counter: the whole record is dropped, not only that value, and so are records that reference it (`foundation_plan.gap.development_data.record.not_generated`). |
| `primary_descriptor` | | Pages name the record "Post #&lt;id&gt;" (`foundation_plan.gap.primary_descriptor.partially_generated`). |

Development data is an array at `application.development_data`. Each record names its Entity, sets Fields, and
points its References at another record by `"<entity>.<record key>"`. Give the parent no counter value:

```json
"development_data": [
  {"subject_uuid": "…", "key": "hello", "entity": "post",
   "fields": [{"field": "post.title", "value": {"kind": "literal", "value": "Hello"}}]},
  {"subject_uuid": "…", "key": "first", "entity": "comment",
   "fields": [{"field": "comment.body", "value": {"kind": "literal", "value": "First"}}],
   "references": [{"reference": "comment.post", "value": {"kind": "reference_record", "record": "post.hello"}}]},
  {"subject_uuid": "…", "key": "second", "entity": "comment",
   "fields": [{"field": "comment.body", "value": {"kind": "literal", "value": "Second"}}],
   "references": [{"reference": "comment.post", "value": {"kind": "reference_record", "record": "post.hello"}}]}]
```

```ruby
# db/seeds/development.rb
hello = Post.find_or_create_by!(title: "Hello")
Comment.find_or_create_by!(body: "First", post: hello)
Comment.find_or_create_by!(body: "Second", post: hello)
```

## Not generated

- **Counting that `counter_cache` cannot do:** filtered, indirect, or two unfiltered counts over one
  Reference. The column reads 0 until you write callbacks on the child, and its model spec example fails until then
  (`foundation_plan.gap.field_kind.partially_generated`). For an indirect count, change `counts` to the direct
  Association instead.
- **Sums, averages, minimums, and maximums.** See the section above.
- **Repair.** `delete_all`, `update_all`, `insert_all`, and raw SQL skip callbacks and leave counts wrong. No repair
  task is generated; Rails `Post.reset_counters(post.id, :comments)` fixes one record.
- **A spec for a kept-current counter.** Add one if the count matters to the product.

## Analysis does not catch

These pass analysis as `valid` and show up only as gap codes:

- **A count `counter_cache` cannot keep**, from the table above. The app shows 0 everywhere, sorts every record
  as equal, and a Predicate such as "unanswered" matches every record.
- **A counter whose `counts` names another Entity's Association.** The column reads 0.
- **A `derivation`.** It is dropped, and a required derived Field breaks the New page; make it optional.
- **A development record that sets the counter.** The record is dropped, and so are records that reference it.

## Decisions to raise

- **Tell:** that a plain count of child records stays current on its own, and that any filtered or indirect count,
  sum, or average is in the Plan and you will write it before the preview.
- **Ask:** when the person wants to import or seed a count, such as "it already had 40 reviews". The count comes
  only from child records; offer to create them, or to set it after Compile with `update_column` in a one-off
  script or console, knowing a later `reset_counters` will undo it.
- **No need to ask:** show the counter wherever the parent is listed; sort by it when the person says "most" or
  "popular".

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **In the Plan:** the counter's `key` is the column name, so renaming it renames the column. Changing `counts` to
  another Association moves the `counter_cache` to that child. No generated code recounts existing rows; run
  `reset_counters` after such a change.
- **After Compile:** to keep a filtered count, add callbacks to the child that increment and decrement the parent's
  column, and replace the counter's placeholder example with a real one. To repair all records, run
  `Post.find_each { |post| Post.reset_counters(post.id, :comments) }`.

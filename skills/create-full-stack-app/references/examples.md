# Examples

These examples teach `sketch/0.19` structure. UUIDs are fixed documentation data. Never reuse them for new subjects
in a real Project.

## Empty starter

`firstdraft plan init` creates this valid starting point with the user's application key and name. It is the
smallest subset accepted by the reviewed conditional PUT.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-08"
  },
  "application": {
    "key": "oscar_party",
    "name": "Oscar Party",
    "native": {},
    "delivery": {},
    "entities": []
  }
}
```

An empty Plan is preferable to a fake Entity. Tell the user that the application model is still empty.

## Bounded web and iPhone application

This complete document is the canonical prepared `rails-sketch/2026-08` success candidate. It requests one
read-only public web index and one selected iPhone project with the same navigation label and semantic icon. The
domain is coupled to the selected iPhone client, and the required title Field supplies the human-facing Primary
Descriptor. The prepared analyzer is designed to return `valid`; that result is still only the Compilation gate,
not proof that output exists.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-08"
  },
  "application": {
    "key": "movie_catalog",
    "name": "Movie Catalog",
    "domain": "movies.example.com",
    "native": {
      "ios": {}
    },
    "delivery": {},
    "entities": [
      {
        "subject_uuid": "019fb300-0000-7000-8000-000000000001",
        "key": "movie",
        "name": "Movie",
        "icon": "film",
        "primary_descriptor": {
          "field": "movie.title"
        },
        "fields": [
          {
            "subject_uuid": "019fb300-0000-7000-8000-000000000002",
            "key": "title",
            "name": "Title",
            "type": "short_text",
            "required": true
          }
        ],
        "scaffold": {
          "resource_routes": ["index"],
          "index": {
            "authorization": "public"
          }
        }
      }
    ]
  }
}
```

The selected native output is iPhone-only. Do not describe it as Android or iPad support. A selected iPhone client
requires at least one admitted public-index Scaffold; a domain without selected iOS is also blocked. Web-only plans
may use the same exact Scaffold with `native: {}` and no domain. The admitted Scaffold makes Movie records readable
on the web without authentication. Confirm that exposure with the user before adding it; do not add it merely to
satisfy the iPhone navigation requirement or silently discard private or broader access intent.

Adding `appearance` to this candidate remains structurally valid and importable, but the prepared analyzer returns
`foundation_plan.rails_target.compiler.unsupported_application_configuration` at `/application/appearance`.
Preserve an intentional Appearance request and report the capability gap rather than deleting it merely to obtain
`valid`.

## One Entity and scalar Field

This complete document is structurally valid v0.19 and accepted by the reviewed bounded importer. That does not
prove complete semantic analysis, target support, Compilation, or generated output.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-08"
  },
  "application": {
    "key": "tasks",
    "name": "Tasks",
    "native": {},
    "delivery": {},
    "entities": [
      {
        "subject_uuid": "019fac46-941d-7e4b-ada8-6acdf79474e6",
        "key": "task",
        "name": "Task",
        "primary_descriptor": {
          "field": "task.title"
        },
        "fields": [
          {
            "subject_uuid": "019fac46-941f-75a3-aca3-1f30d9c8389f",
            "key": "title",
            "name": "Title",
            "type": "short_text",
            "required": true
          }
        ]
      }
    ]
  }
}
```

The Entity and Field have independent UUIDs. The `primary_descriptor` uses a typed readable path rather than a
UUID. The reviewed importer also accepts `boolean`, `date`, `datetime`, `decimal`, `integer`, `language_code`,
`long_text`, `time_zone`, and `url` Fields when they use only the supported schema-valid scalar properties.

## Ordinal enum Field

Use an enum for a closed set of named choices. This complete document is structurally valid v0.19 and accepted by
the reviewed bounded importer. Here, priority order carries semantic rank, so `ordinal` is `true`.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-08"
  },
  "application": {
    "key": "ranked_tasks",
    "name": "Ranked Tasks",
    "native": {},
    "delivery": {},
    "entities": [
      {
        "subject_uuid": "019fb088-f094-719b-884f-8103ded44e99",
        "key": "task",
        "name": "Task",
        "primary_descriptor": {
          "field": "task.title"
        },
        "fields": [
          {
            "subject_uuid": "019fb088-f0bb-72fe-8d31-44dc6e07e609",
            "key": "title",
            "name": "Title",
            "type": "short_text",
            "required": true
          },
          {
            "subject_uuid": "019fb088-f0e1-79e8-864b-7323270f7e4c",
            "key": "priority",
            "name": "Priority",
            "type": "enum",
            "required": true,
            "default": {
              "kind": "literal",
              "value": "medium"
            },
            "settings": {
              "values": [
                {
                  "subject_uuid": "019fb088-f10c-7b84-b98d-ec89c752c040",
                  "key": "low",
                  "name": "Low"
                },
                {
                  "subject_uuid": "019fb088-f138-7a6d-952e-04c4782d1e3f",
                  "key": "medium",
                  "name": "Medium"
                },
                {
                  "subject_uuid": "019fb088-f160-73b6-9418-e0d7e73d21a3",
                  "key": "high",
                  "name": "High"
                }
              ],
              "ordinal": true
            }
          }
        ]
      }
    ]
  }
}
```

The Entity, Fields, and every enum value have independent UUIDs. The default is a tagged value owned by the Field,
so it has no UUID and does not require `plan subject-id`. Its literal names the selected enum value by owner-local
key. If `medium` is renamed, update the default in the same candidate while preserving that value's UUID. Omit
`ordinal` when order is presentational rather than ranked.

## Stored and reverse relationship

This complete document is structurally valid v0.19. Its Reference is within the reviewed importer subset, but its
authored reverse Association is not, so the complete document is rejected at the current conditional PUT boundary.
It is not analyzer- or Compiler-proven. `Task` owns the stored `project` Reference. `Project` owns the meaningful
reverse `tasks` Association. The forward `task.project` Association is derived and therefore omitted.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-08"
  },
  "application": {
    "key": "project_tasks",
    "name": "Project Tasks",
    "native": {},
    "delivery": {},
    "entities": [
      {
        "subject_uuid": "019fac46-9420-7f17-b526-17e9dde491d5",
        "key": "project",
        "name": "Project",
        "primary_descriptor": {
          "field": "project.name"
        },
        "fields": [
          {
            "subject_uuid": "019fac46-9420-7a64-9997-909e91987a2c",
            "key": "name",
            "name": "Name",
            "type": "short_text",
            "required": true
          }
        ],
        "associations": [
          {
            "subject_uuid": "019fac46-9420-7414-809f-a036505621fd",
            "key": "tasks",
            "kind": "direct",
            "name": "Tasks",
            "reference": "task.project",
            "side": "referenced"
          }
        ]
      },
      {
        "subject_uuid": "019fac46-9420-7fd7-a148-9239d4fa09cf",
        "key": "task",
        "name": "Task",
        "primary_descriptor": {
          "field": "task.title"
        },
        "fields": [
          {
            "subject_uuid": "019fac46-9420-7c31-b4d3-177385eb6ac4",
            "key": "title",
            "name": "Title",
            "type": "short_text",
            "required": true
          }
        ],
        "references": [
          {
            "subject_uuid": "019fac46-9420-726b-8739-fe3e6ff90f8c",
            "key": "project",
            "name": "Project",
            "targets": ["project"],
            "required": true,
            "on_referenced_deleted": "delete_referencing_record"
          }
        ]
      }
    ]
  }
}
```

Changing the deletion behavior is a product decision. Do not choose it silently from target convention.

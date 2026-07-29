# Examples

These examples teach `sketch/0.19` structure. UUIDs are fixed documentation data. Never reuse them for new subjects
in a real Project.

## Empty starter

This is the only subset accepted by the current prototype PUT. `firstdraft plan init` creates the same shape with
the user's application key and name.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-07"
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

## One Entity and Field

This complete document is structurally valid v0.19, but its nonempty `entities` array is not currently importable.
It has not been proven compilable.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-07"
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
UUID.

## Stored and reverse relationship

This complete document is structurally valid v0.19, but is not currently importable or Compiler-proven. `Task`
owns the stored `project` Reference. `Project` owns the meaningful reverse `tasks` Association. The forward
`task.project` Association is derived and therefore omitted.

```json
{
  "format": "firstdraft.foundation-plan.sketch/0.19",
  "target": {
    "id": "rails",
    "profile": "rails-sketch/2026-07"
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

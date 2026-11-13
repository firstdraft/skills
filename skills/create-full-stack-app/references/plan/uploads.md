---
name: uploads
description: Image and attachment Fields, file limits, who may download, and Cloudinary setup. Open it when an app stores photos, documents, or other uploaded files.
---

# Image and attachment Fields

An `image` or `attachment` Field holds one uploaded file on a record, stored with Active Storage. An `image` must be
an image and is drawn on pages; an `attachment` is any file and appears as a download link. For several files on one
record, add a child Entity with one `image` Field and a [Reference](references.md) to the parent, as in the full
example. Use a `url` [Field](fields.md) only when the file lives on another site and the app need not protect it.

- **First Draft generates:** `has_one_attached`, a presence check for a required Field, an image check, file inputs,
  a "Remove" checkbox for an optional file, thumbnails, detail images, download links, Cloudinary storage, a
  `show_files?` Policy rule that decides who may download each file, placeholder files in development data, and specs.
- **You write after Compile:** size limits and allowed file types beyond "an image", which the Plan states as
  `owner` Validations; any conditional rule on a file; any filter, sort, or Policy that reads whether a file is
  present, which the Plan states as an `owner` Predicate, Ordering, or Policy; and real files for example records.
  Write the `owner` subjects before the preview; `SKILL.md` has the order of work. The person sets
  `CLOUDINARY_URL`.

Where analysis leaves out a part of the Plan, it reports a gap code, such as
`foundation_plan.gap.validation.not_generated`, beside the analysis result.

## Simple example

A Field in `application.entities[].fields[]`, offered in the Entity's `scaffold` like any other Field:

```json
{"subject_uuid": "…", "key": "photo", "name": "Photo", "type": "image", "required": true}
```

Mint every `subject_uuid` with `firstdraft_cli generate uuid --count <n>`; never copy one from an example.

### Generates

No column on the Entity's table. The first upload Field in a Plan adds Active Storage's tables and the `cloudinary`
gem, and enables Active Storage, which an app without uploads leaves out.

```ruby
# db/migrate/…_create_active_storage_tables.rb: active_storage_blobs, active_storage_attachments,
# active_storage_variant_records

# app/models/listing.rb
has_one_attached :photo
validates :photo, presence: true
validates :photo, image: true

# app/validators/image_validator.rb, once per app with an image Field
class ImageValidator < ActiveModel::EachValidator
  def validate_each(record, attribute, value)
    record.errors.add(attribute, :image) if value.attached? && !value.image?
  end
end

# app/controllers/listings_controller.rb
relation = Listing.order(:id).preload({photo_attachment: :blob})
params.expect(listing: [:title, :photo])
```

```erb
<%# app/views/listings/_form.html.erb %>
<%= render "shared/ui/field", form:, attribute: :photo do |aria| %>
  <%= form.label :photo, class: "label" %>
  <%= form.file_field :photo, accept: "image/*", required: !listing.photo.attached?, class: "input w-full", aria: %>
<% end %>

<%# app/views/listings/_listing.html.erb, the details page %>
<dd class="whitespace-pre-wrap"><%= listing.photo.attached? ? uploaded_image_tag(listing.photo, :detail, alt: Listing.human_attribute_name(:photo), class: "h-auto w-full max-w-md rounded-lg") : t("shared.values.missing") %></dd>

<%# app/views/listings/_list_item.html.erb, a list row %>
<%= … uploaded_image_tag(listing.photo, :thumbnail, …, class: "size-24 rounded-md object-cover") … %>
```

`ImageValidator` checks the type Active Storage reads from the file's bytes, and the form shows "must be an image".
`uploaded_image_tag`, in `ApplicationHelper`, asks Cloudinary for a 192×192 crop in lists and a 896-pixel-wide
image on details pages. The edit form does not require a new file when one is stored. The factory attaches
`spec/fixtures/files/firstdraft-image.png`; the model spec checks that a text file is rejected; request specs check
that the upload is attached and that its download link answers.

## Keys

Upload Fields have no `settings`. Each key below is on the Field object.

| Key | Required | Values | Default | Generates |
| --- | --- | --- | --- | --- |
| `type` | yes | `"image"`, `"attachment"` | | `has_one_attached :<key>`. `image` adds `validates :<key>, image: true`, `accept: "image/*"` on the input, and an image on pages. `attachment` accepts any file and shows its filename as a download link: `link_to(listing.brochure.filename, rails_blob_path(listing.brochure, disposition: "attachment"), …)`. |
| `required` | yes | `true`, `false` | | `true`: `validates :<key>, presence: true`; the file input is required until a file is stored. `false`: no presence check, plus a removal flag on the model and a "Remove" checkbox on the edit form; see below. |
| `subject_uuid`, `key`, `name` | yes | UUIDv7, lower snake case, text | | `key` names the attachment; `name` is the label, at `activerecord.attributes.<model>.<key>`. |
| `notes` | no | text | none | Nothing; shown to people reviewing the Plan. |
| `validations` | no | `presence` or `absence`, each with `when`; or `owner` | none | Not generated. The model calls an empty method named after the Validation's key, and the model spec has an example that fails until you write the rule: one that builds a breaking record for `presence` or `absence`, a placeholder for `owner` (`foundation_plan.gap.validation.not_generated`; an `owner` Validation has no gap record). README.md lists each under "Behavior to write". Use `owner` for size and type limits, and `required` for an unconditional rule. |
| `default` | no | any value | none | Not generated (`foundation_plan.gap.field_modifier.default`). |
| `immutable` | no | `true`, `false` | `false` | Not generated (`foundation_plan.gap.field_modifier.immutable`). See [Analysis does not catch](#analysis-does-not-catch). |
| `encrypted_at_rest`, `redact_from_logs` | no | `true`, `false` | `false` | Not generated (`foundation_plan.gap.field_modifier.encrypted_at_rest`, `….redact_from_logs`). |

"Not generated" for `default`, `immutable`, `encrypted_at_rest`, and `redact_from_logs` means nothing is generated
for the key yet and the generated README does not list it. When the person asked for it, keep the key in the Plan,
add it to your own list, and write it before the preview.

Import rejects `settings`, `comparison`, `normalizations`, and `derivation` on an upload Field, any type name other
than these two (such as `"file"`), and any Validation kind other than `presence` and `absence`.

An optional upload generates this removal:

```ruby
# app/models/listing.rb
has_one_attached :brochure
attribute :remove_brochure, :boolean, default: false
before_save { self.brochure = nil if remove_brochure? }

# app/controllers/listings_controller.rb
params.expect(listing: [:title, :photo, :brochure, :remove_brochure])
```

```erb
<%# app/views/listings/_form.html.erb %>
<%= form.file_field :brochure, class: "input w-full", aria: %>
<% if listing.persisted? && listing.brochure_attachment.present? %>
  <%= render "shared/ui/field", form:, attribute: :remove_brochure do |aria| %>
    <%= form.label :remove_brochure, class: "label" %>
    <%= form.check_box :remove_brochure, class: "checkbox", aria: %>
  <% end %>
<% end %>
```

The label reads "Remove Brochure". An empty file input keeps the stored file. A request spec checks that
`remove_brochure: "1"` leaves no file attached.

## Who can download a file

Every file link goes through Active Storage. What protects it depends on whether the app has Policies.

- **No Policies:** every generated page is public, and anyone with a file's link can fetch it. Images come from
  Cloudinary's CDN through permanent signed links.
- **With Policies:** the Compiler adds `show_files?` to the Policy of every Entity with an upload Field, and Active
  Storage's controllers ask it before redirecting to a download link that expires. A guest asking for a page is sent
  to sign in; anyone else not allowed gets `403`. `show_files?` allows whoever a generated list or details page that
  shows one of the Entity's upload Fields allows. Images that a guest may see still come from the CDN.

The `authorization` of each list and details page decides it. The Policy shapes are on [Policies](policies.md).

| `authorization` on the pages that show an upload Field of the Entity | `show_files?` |
| --- | --- |
| One record Policy: `{"policy": "listing.manage_own"}` | `alias_rule :show_files?, to: :manage?` |
| A signed-in gate: `{"policy": "user.use_app", "record": {"kind": "environment", "name": "current_account"}}` | `allowed_to?(:use_app?, user, with: UserPolicy)` |
| Any of them `"public"` | `true`, for every upload Field of the Entity |
| No page shows one | `false`: the file is served to no one |

The rule covers all upload Fields of the record together. A public list that shows a listing's photo makes its
brochure public too, even when only the owner's details page shows the brochure. Put a private file on its own
child Entity whose pages share the private Policy. Do not name an authored Policy's operation `show_files`:
analysis renames its rule to `show_files_rule?` (`foundation_plan.rails_target.policy.rule_renamed`).

## Full example

A listing has a required cover photo, an optional brochure, and any number of captioned photos added from its
details page. The list shows the cover photo; the details page shows all three. Two example records.

```json
{"application": {
  "entities": [
    {"subject_uuid": "…", "key": "listing", "name": "Listing", "primary_descriptor": {"field": "listing.title"},
     "fields": [
       {"subject_uuid": "…", "key": "title", "name": "Title", "type": "short_text", "required": true},
       {"subject_uuid": "…", "key": "photo", "name": "Photo", "type": "image", "required": true},
       {"subject_uuid": "…", "key": "brochure", "name": "Brochure", "type": "attachment", "required": false,
        "validations": [{"subject_uuid": "…", "key": "pdf_only",
                         "owner": {"description": "Accept only PDF files, at most 10 MB."}}]}],
     "associations": [
       {"subject_uuid": "…", "key": "photos", "name": "Photos", "kind": "direct",
        "reference": "listing_photo.listing", "side": "referenced"}],
     "scaffold": {
       "resource_routes": ["index", "show", "new", "create", "edit", "update", "destroy"],
       "index": {"authorization": "public", "projection": [{"field": "listing.title"}, {"field": "listing.photo"}]},
       "show": {"authorization": "public", "projection": [
         {"field": "listing.title"}, {"field": "listing.photo"}, {"field": "listing.brochure"},
         {"association": "listing.photos", "authorization": "public",
          "projection": [{"field": "listing_photo.image"}, {"field": "listing_photo.caption"}], "create_form": {}}]},
       "create": {"authorization": "public",
                  "inputs": [{"field": "listing.title"}, {"field": "listing.photo"}, {"field": "listing.brochure"}]},
       "update": {"authorization": "public",
                  "inputs": [{"field": "listing.title"}, {"field": "listing.photo"}, {"field": "listing.brochure"}]},
       "destroy": {"authorization": "public"}}},
    {"subject_uuid": "…", "key": "listing_photo", "name": "Listing photo",
     "primary_descriptor": {"field": "listing_photo.caption"},
     "fields": [
       {"subject_uuid": "…", "key": "image", "name": "Image", "type": "image", "required": true},
       {"subject_uuid": "…", "key": "caption", "name": "Caption", "type": "short_text", "required": true}],
     "references": [
       {"subject_uuid": "…", "key": "listing", "name": "Listing", "targets": ["listing"], "required": true,
        "one_to_one": false, "on_referenced_deleted": "delete_referencing_record"}],
     "scaffold": {
       "resource_routes": ["show", "edit", "update", "destroy"],
       "show": {"authorization": "public",
                "projection": [{"field": "listing_photo.image"}, {"field": "listing_photo.caption"}]},
       "create": {"authorization": "public",
                  "inputs": [{"field": "listing_photo.image"}, {"field": "listing_photo.caption"}]},
       "update": {"authorization": "public",
                  "inputs": [{"field": "listing_photo.image"}, {"field": "listing_photo.caption"}]},
       "destroy": {"authorization": "public"}}}
  ],
  "development_data": [
    {"subject_uuid": "…", "key": "loft", "entity": "listing", "fields": [
      {"field": "listing.title", "value": {"kind": "literal", "value": "Sunny loft"}}]},
    {"subject_uuid": "…", "key": "loft_kitchen", "entity": "listing_photo", "fields": [
      {"field": "listing_photo.caption", "value": {"kind": "literal", "value": "Kitchen"}}],
     "references": [{"reference": "listing_photo.listing",
                     "value": {"kind": "reference_record", "record": "listing.loft"}}]}
  ]
}}
```

The child Entity holds one file per record. Each part of its shape does one job:

- The Reference `listing_photo.listing` gives the child `belongs_to :listing`.
- The Association on the listing names that Reference in `reference` (`<child Entity key>.<Reference key>`), with
  `side: "referenced"` because the listing is the Reference's target. Its `key`, `photos`, names the `has_many` and
  the nested routes; the child's own routes are named after its Entity key.
- The Association entry in the listing's `show.projection` lists the first five child records on the details page,
  with a "View more…" link to a nested list page of 24 per page. `"create_form": {}` adds an "Add" link to a nested
  New page that creates one record per submission, with the listing taken from the URL.
- The child's `scaffold.create` supplies that nested form's `inputs`. Leave `new` and `create` out of its
  `resource_routes`, so it gets no top-level New page with a Listing picker. Without `scaffold.create` the
  "Add" link is dropped (`foundation_plan.gap.scaffold.associated_create.not_generated`); without `create_form` the
  `create` block is dropped (`foundation_plan.gap.scaffold.definition.not_generated`).
- `development_data` sits in `application`, beside `entities`.

[Associations](associations.md) and [Scaffold forms](scaffold-forms.md) cover the other values of these keys.

### Generates

```ruby
# app/models/listing.rb
has_many :photos, class_name: "ListingPhoto", dependent: :destroy

has_one_attached :photo
has_one_attached :brochure
attribute :remove_brochure, :boolean, default: false
before_save { self.brochure = nil if remove_brochure? }
validates :photo, presence: true
validates :photo, image: true

validates :title, presence: true
validate :pdf_only

private

# The Plan leaves the Validation listing.brochure.pdf_only to you
# (/application/entities/0/fields/2/validations/0 in .firstdraft/submitted-foundation-plan.json).
# Add an error when a record breaks it. Its spec belongs in spec/models/listing_spec.rb;
# README.md lists it under Behavior to write.
def pdf_only
end

# spec/models/listing_spec.rb
it "enforces listing.brochure.pdf_only" do
  raise NotImplementedError,
    "listing.brochure.pdf_only is not written yet. Its owner description says what it enforces: Accept only PDF files, at most 10 MB. Replace this example with one that builds a record the rule rejects and expects its error on brochure."
end

# app/models/listing_photo.rb
belongs_to :listing

has_one_attached :image
validates :image, presence: true
validates :image, image: true

# config/routes.rb
resources :listings, only: %i[index show new create edit update destroy] do
  resources :photos, only: %i[index new create], module: :listings
end
resources :listing_photos, only: %i[show edit update destroy]

# app/controllers/listings_controller.rb, show
@photos_pagy, @photos = pagy(:countless, @listing.photos.order(:id).preload({image_attachment: :blob}), page: 1, limit: 5)

# db/seeds/development.rb
placeholder_image = Base64.strict_decode64("iVBORw0KGgo…")

loft = Listing.find_or_create_by!(title: "Sunny loft") do |listing|
  listing.photo.attach(io: StringIO.new(placeholder_image), filename: "placeholder.png", content_type: "image/png", service_name: "local")
end

ListingPhoto.find_or_create_by!(caption: "Kitchen", listing: loft) do |listing_photo|
  listing_photo.image.attach(io: StringIO.new(placeholder_image), filename: "placeholder.png", content_type: "image/png", service_name: "local")
end
```

The listing's details page shows the photo, a download link for the brochure, and the first five listing photos as
thumbnails with an "Add Listing photo" link. Seeds attach a 1×1 PNG to each required image and a text file to each
required attachment, on local disk; optional uploads stay empty. Development data has no way to name a file. To give
an example record a real file, upload it through the app's edit form, or after Compile replace the
`StringIO.new(placeholder_image)` in that record's `attach` call with the file, such as
`File.open(Rails.root.join("db/seeds/files/loft.jpg"))`, and its `filename` and `content_type`.

### Setup after Compile

Development and production store files on Cloudinary; tests use local disk. The person creates a Cloudinary account
and sets its API environment variable (`cloudinary://…`) as `CLOUDINARY_URL` in `.env.development.local`, and in the
Render service's environment for the deployed app. Without it the app boots, and the first upload raises a
`KeyError` naming `CLOUDINARY_URL`. The generated README, `DEPLOY.md`, `.env.example`, and `render.yaml` say the
same. Never ask for, print, or commit its value.

## Used elsewhere in the Plan

| Where | Generates | Does not generate |
| --- | --- | --- |
| Scaffold `projection` on a list or details page, or inside an Association's `projection` | Thumbnail in lists, large image on details pages, download link for an attachment, and the `{<key>_attachment: :blob}` preload. | |
| Scaffold `inputs` on `create` or `update` | The file input, the strong parameter, and for an optional Field on edit, the "Remove" checkbox. | A required upload left out of `create.inputs`: the create route keeps no way to supply it (`foundation_plan.gap.scaffold.route.partially_generated`). |
| [Development data](development-data.md) record | A placeholder file for a required upload. Give the upload Field no value in the record, since a value drops it (next column); for a real file, see the end of the full example's Generates. | A value for an upload Field: it is dropped (`foundation_plan.gap.development_data.field_assignment.not_generated`), and a record whose required upload had a value is dropped too (`….development_data.record.not_generated`). |
| [Account](accounts.md) Entity, as a `registration.inputs[]` entry | | The sign-up input (`foundation_plan.gap.account.partially_generated`). A required upload on the Account Entity makes every sign-up fail its presence check until you add the input. |
| `primary_descriptor` | | A label: pages call each record "Listing #<id>" (`foundation_plan.gap.primary_descriptor.partially_generated`). |
| [Ordering](orderings.md) term | | The scope raises `NotImplementedError` (`foundation_plan.gap.ordering.not_generated`), and its placeholder example in the model spec fails until you replace it. |
| [Predicate](predicates.md) or Validation `when` with `is_null` on the Field | | Analysis rejects it: `foundation_plan.expression.field_not_queryable`. Write an `owner` Predicate or Validation that describes the test instead. |
| [Policy](policies.md) `allow_when` reading the Field | | See below: the Policy and every page it guards are dropped. Write an `owner` Policy that describes the rule instead. |

## Not generated

- **File size limits and allowed types** other than "an image". State each as an `owner` Validation on the Field,
  as `pdf_only` in the full example. Compile emits an empty method and a placeholder example in the model spec that
  fails until you replace it; README.md lists it under "Behavior to write", and no gap lists it. Write the method
  with `brochure.blob.byte_size` and `brochure.content_type`. The image input's `accept` stays `"image/*"`; narrow
  it in the form partial to match.
- **Several files on one Field.** Use a child Entity, as in the full example.
- **Direct uploads from the browser.** Generated forms send files with the record, and
  `ActiveStorage::DirectUploadsController` answers `403`.
- **Conditional presence or absence of a file.** The Validation becomes an empty method, and the model spec has an
  example that builds a breaking record and fails until you write the `errors.add`
  (`foundation_plan.gap.validation.not_generated`).
- **Image sizes other than the two above,** and any per-Field choice of size. Edit `UPLOADED_IMAGE_SIZES` in
  `ApplicationHelper`.
- **A sign-up file input**, such as an avatar chosen at sign-up. Keep the Field in `registration.inputs`; the input
  is left out (`foundation_plan.gap.account.partially_generated`), and you add it to the Rodauth form before the
  preview. Keep `required` as the person asked: a required upload on the Account Entity makes every sign-up fail
  until the form sends the file.

## Analysis does not catch

These pass analysis as `valid`:

- **A Policy whose `allow_when` reads an upload Field,** such as `is_null` on it. Analysis reports only a warning,
  `foundation_plan.expression.field_not_queryable`, then drops the Policy (`foundation_plan.gap.policy.not_generated`)
  and every Scaffold part it guards (`foundation_plan.gap.scaffold.definition.not_generated`). The Entity loses its
  pages. The same expression in a Predicate is an error. Write an `owner` Policy that describes the rule instead.
- **`immutable: true`.** It is not enforced. If the Field is also in `update.inputs`, the edit form still offers the
  file input and, for an optional Field, the "Remove" checkbox. Keep `immutable`, list the Field in `create.inputs`
  only, and write the model check before the preview.
- **A public page showing any upload of an Entity** makes every file of that Entity downloadable by anyone; see
  [Who can download a file](#who-can-download-a-file).
- **A required upload on the Account Entity.** Sign-up cannot finish until you add the file input.
- **Another member whose key is `<upload key>_attachment` or `<upload key>_blob`,** such as a Field
  `photo_attachment` beside `photo`. The upload Field, its inputs, and its page columns are dropped
  (`foundation_plan.gap.field_kind.not_generated`).

## Decisions to raise

- **Required or optional:** propose required only when a record makes no sense without the file, such as a photo
  gallery entry. An optional file gets the "Remove" checkbox.
- **One file or several:** when the person says "photos" or "documents", propose a child Entity with one upload
  Field and a caption or title.
- **Who may download:** with accounts in the app, ask whether files are as private as the pages that show them, and
  keep a private file off every public page of its Entity.
- **Size and type limits:** ask for them, put each in an `owner` Validation, and tell the person you write them
  before the preview.
- **No need to ask:** use `image` for anything people call a photo, picture, logo, or avatar, and `attachment` for
  documents, PDFs, and other files.

## Changing it later

A later Compile does not touch the app you already have. It writes a complete new app to a new folder, and the CLI
refuses a folder that already holds a compiled app. Code you wrote after Compile is never overwritten; a later
Plan change reaches that app only when you copy it across.

- **Adding the first upload Field** adds the Active Storage migration, the `cloudinary` gem, and the storage
  configuration; the person then needs `CLOUDINARY_URL`.
- **Renaming the Field key** renames the `has_one_attached`. Active Storage stores that name on each
  `active_storage_attachments` row, so files stored under the old key no longer appear until those rows are renamed.
- **Switching between `image` and `attachment`** changes only the validator, the input's `accept`, and how pages
  show the file; stored files stay. Files already stored are not re-checked.
- **Making an optional upload required** adds a presence check; existing records without a file fail it on their
  next save.

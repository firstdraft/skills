## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- The gap list has no record of kind `field_kind`, `field_modifier`, `development_data_record`, or
  `development_data_field_assignment`.
- The starter's `app/models/pet.rb` has no `has_one_attached`; the solution's has two.
- `app/models/pet.rb` has `has_one_attached` for a photo Field with `validates :<photo>, presence: true` and
  `validates :<photo>, image: true`.
- `app/models/pet.rb` has `has_one_attached` for a second Field with no presence or image validation, a
  `remove_<key>` boolean attribute, and a `before_save` that sets that Field to `nil` when the flag is set.
- The Pet form partial has a `file_field` for the photo with `accept: "image/*"` and a `file_field` for the
  vaccination record without `accept`, and a `check_box :remove_<key>` for the vaccination record.
- The Pet list item partial calls `uploaded_image_tag` on the photo with `:thumbnail`.
- The Pet details partial calls `uploaded_image_tag` on the photo with `:detail` and links to the vaccination record
  with `rails_blob_path`.
- A second Entity's model has `belongs_to :pet`, a `has_one_attached` image with `image: true`, and a text caption
  Field. `app/models/pet.rb` has a `has_many` to it. The image may be required or optional.
- `config/routes.rb` has a nested `new` and `create` route for that Entity under `pets`, and the Pet details page
  (`app/views/pets/show.html.erb`) lists its records and links to that nested New page.
- `db/seeds/development.rb` creates two Pets, named Biscuit and Miso, and attaches a placeholder image to each Pet's
  photo. The starter's seeds attach nothing.
- The Plan's pet photo Field (or the Pet Entity) has a Validation with `owner` (and no `kind`) whose description
  states JPEG or PNG only and at most 5 MB, and `app/models/pet.rb` has `validate :<that key>`. A matching `owner`
  Validation on the gallery image is also correct. The starter has none.

## Notes

- Says that JPEG/PNG-only and the 5 MB limit are not generated: they are in the Plan as an `owner` Validation, and
  the reader writes the check before the preview.
- Says that the example pets get placeholder images, that development data cannot carry the shelter's photo files,
  and that real photos are uploaded through the app or attached by hand.
- Says that the person creates a Cloudinary account and sets `CLOUDINARY_URL` in `.env.development.local` for the
  laptop and in the Render environment for the deployed app, and that uploads raise a `KeyError` until it is set.

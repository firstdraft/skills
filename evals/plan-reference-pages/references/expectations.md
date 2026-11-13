## Plan and Compile

- Analysis status is `valid`, and the Compile succeeds.
- The jobs table has a `customer_id` column with `null: false`, an index on it, and a foreign key to `customers`.
- The Job model has `belongs_to :customer` and `attr_readonly :customer_id`.
- The Customer model has `has_many :jobs, dependent: :restrict_with_error`.
- The jobs table has a nullable `technician_id` column with an index and a foreign key to `technicians`.
- The Job model has `belongs_to :technician, optional: true`.
- The Technician model has `has_many :jobs, dependent: :nullify`.
- The vans table has a nullable `<key>_id` column (any Reference key, such as `technician_id` or `driver_id`) with a
  unique index and a foreign key to `technicians`; the Van model has `belongs_to :<key>, optional: true` (with
  `class_name: "Technician"` when the key is not `technician`) and a uniqueness validation on it; the Technician model
  has `has_one :van` with `dependent: :nullify`. (Accepted alternative: the technicians table has a nullable `van_id`
  with a unique index, and the Technician model has `belongs_to :van, optional: true` with a uniqueness validation;
  then a technician's deletion does not touch vans.)
- `config/routes.rb` has search routes for the job customer and the job technician on the new form
  (`new_job_customer_options`, `new_job_technician_options`).
- `app/views/jobs/_new_form.html.erb` (or `_form.html.erb`) has a reference picker for `customer_id` and one for
  `technician_id`.
- The job edit form has a reference picker for `technician_id` and none for `customer_id`; the update strong
  parameters do not include `customer_id`.
- The gap list has no record with code `foundation_plan.gap.scaffold.input.not_generated` and none with code
  `foundation_plan.gap.scaffold.route.partially_generated` for the job Entity.
- `app/views/jobs/_list_item.html.erb` and `app/views/jobs/_job.html.erb` each show the customer's name and the
  technician's name.
- `db/seeds/development.rb` creates two customers, one technician, and two jobs; each job is created with
  `customer:`, and exactly one with `technician:`.
- The gap list has no record with code `foundation_plan.gap.development_data.record.not_generated`.
- The Plan has a Job Predicate that reads the customer's priority through `job.customer`, and the job Scaffold's
  `index.predicate` names it. `JobsController#index` builds its relation from that scope, and the scope in
  `app/models/job.rb` raises `NotImplementedError`. The starter's index uses `Job.order(:id)`.

## Notes

- Says that the priority-customer filter (item 7) follows a Reference, so First Draft does not generate it: the
  Predicate is named on the jobs list anyway, the list raises until the scope is written, and the reader writes the
  scope and replaces its placeholder spec example before the preview.
- Says that a job's customer is shown on the create form only, because it cannot change.

require "fileutils"

expected_database = "fd_8079_preview_service_20260922"
raise "Wrong evidence database" unless ActiveRecord::Base.connection_db_config.database == expected_database

plan_path, output_path = ARGV
raise "Pass a Plan path and output directory" unless plan_path && output_path
FileUtils.mkdir_p(output_path)
source = File.binread(plan_path)
source_sha256 = Digest::SHA256.hexdigest(source)
compiler = FoundationPlan::RailsTarget::Compiler

def return_summary(destination)
  return nil unless destination

  {
    kind: destination.destination_kind,
    entity: destination.target_entry&.entity_key,
    route: destination.target_route_kind,
    from: destination.record_source,
    through: destination.path_steps.map(&:reader_method_name),
    static_path: destination.static_path,
    source_pointer: destination.source_pointer
  }
end

def associated_forms(items)
  items.flat_map do |item|
    form = item.associated_create_form
    own = form ? [{source_pointer: form.source_pointer, return_to: return_summary(form.return_destination)}] : []
    own + associated_forms(item.children)
  end
end

ActiveRecord::Base.transaction(isolation: :repeatable_read) do
  user = User.create!(github_account_id: SecureRandom.random_number(2**50), github_login: "local-reconciliation-evidence")
  imported = FoundationPlan::Import.create(user:, project_id: SecureRandom.uuid_v7, source:)
  raise imported.diagnostics.map(&:to_h).inspect unless imported.success?

  project = compiler::CaptureProjectGraph.call(
    project_id: imported.project.id,
    expected_graph_version: imported.project.graph_version
  )
  analyzed = FoundationPlan::Analysis::RailsApplicationAnalyzer.call(
    project, plan_source: source, head_source_sha256: source_sha256
  )
  input = compiler::CompilationInput.call(project:, source_index: compiler::Gaps::Analysis.source_index(source))
  result = {
    plan_sha256: source_sha256,
    boundary: "Local import, in-process Analyzer, and target lowering; no API, Compile operation, boot or browser",
    import_diagnostics: imported.diagnostics.map(&:to_h),
    valid: analyzed.valid?,
    diagnostics: analyzed.diagnostics.map(&:to_h),
    gap_set_sha256: analyzed.gap_set&.source_sha256,
    scaffold_lowering: input.scaffold_lowering.entries.map do |entry|
      {
        entity: entry.entity_key,
        routes: entry.routes.map(&:route_kind),
        definitions: entry.definitions.map do |definition|
          {
            kind: definition.definition_kind,
            return_to: return_summary(definition.return_destination),
            associated_create_forms: associated_forms(definition.projection_items)
          }
        end
      }
    end
  }
  File.binwrite(File.join(output_path, "analysis.json"), JSON.pretty_generate(result) + "\n")
  File.binwrite(File.join(output_path, "gap-set.json"), analyzed.gap_set.source_bytes) if analyzed.gap_set
  puts JSON.generate(plan_sha256: source_sha256, valid: analyzed.valid?, output: output_path)
  raise ActiveRecord::Rollback
end

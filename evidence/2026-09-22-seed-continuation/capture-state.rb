require "json"
require "digest"

expected_database, output_path = ARGV
raise "Wrong evidence database" unless ActiveRecord::Base.connection_db_config.database == expected_database

password_rows = ActiveRecord::Base.connection.select_all("SELECT id, password_hash FROM user_password_hashes ORDER BY id").to_a
result = {
  database: expected_database,
  rails_environment: Rails.env,
  users: User.order(:email).pluck(:id, :email, :name, :account_status),
  movies: Movie.order(:title).pluck(:id, :title),
  bookmarks: Bookmark.joins(:movie, :user).order("users.email", "movies.title", :watched).pluck(:id, "users.email", "movies.title", :watched),
  password_fingerprints: password_rows.to_h { |row| [row.fetch("id"), Digest::SHA256.hexdigest(row.fetch("password_hash"))] },
  broken_bookmarks: Bookmark.left_joins(:movie, :user).where("movies.id IS NULL OR users.id IS NULL").count
}
File.binwrite(output_path, JSON.pretty_generate(result) + "\n")
puts JSON.generate(database: expected_database, users: result[:users].length, movies: result[:movies].length, bookmarks: result[:bookmarks].length, broken_bookmarks: result[:broken_bookmarks])

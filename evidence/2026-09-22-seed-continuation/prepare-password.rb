raise "Wrong development evidence database" unless ActiveRecord::Base.connection_db_config.database == "fd_8079_seed_edit_dev_20260922"

viewer = User.find_by!(email: "viewer@movie-preview.example")
viewer.password = "MoviePreview-Continuation-Local-2026!"
viewer.save!
puts "Changed the disposable viewer password through the ordinary model API."

# Be sure to restart your server when you modify this file.

# Your secret key for verifying cookie session data integrity.
# If you change this key, all old sessions will become invalid!
# Make sure the secret is at least 30 characters and all random, 
# no regular words or you'll be exposed to dictionary attacks.
ActionController::Base.session = {
  :key         => '_fake_github_inbox_session',
  :secret      => '49ac155e4eab98a39e1fb5b6af4ec126c4465f88196a6911c1fb82adbc0c0bdb6aa3b2955bb1b035eccf5294da21669ddb8127eb7e5e6f8420575cdaec7bd10c'
}

# Use the database for sessions instead of the cookie-based default,
# which shouldn't be used to store highly confidential information
# (create the session table with "rake db:sessions:create")
# ActionController::Base.session_store = :active_record_store

# Be sure to restart your server when you modify this file

# Specifies gem version of Rails to use when vendor/rails is not present
RAILS_GEM_VERSION = '2.3.4' unless defined? RAILS_GEM_VERSION

# Bootstrap the Rails environment, frameworks, and default configuration
require File.join(File.dirname(__FILE__), 'boot')

Rails::Initializer.run do |config|
  config.gem 'haml', :version => '>= 2.0.0'
  config.gem 'justinfrench-formtastic', :lib => 'formtastic', :source => 'http://gems.github.com', :version => '>= 0.2.3'
  config.gem 'pluginaweek-state_machine', :lib => 'state_machine', :source => 'http://gems.github.com', :version => '>= 0.8.0'
  config.gem 'mislav-will_paginate', :lib => 'will_paginate', :source => 'http://gems.github.com', :version => '>= 2.3.8'
  config.gem 'giraffesoft-resource_controller', :lib => 'resource_controller', :source => 'http://gems.github.com', :version => '>= 0.6.5'

  config.time_zone = 'UTC'

  # fake github never sends email
  config.action_mailer.delivery_method = :test
end
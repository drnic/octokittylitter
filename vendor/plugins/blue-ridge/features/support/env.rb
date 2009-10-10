gem 'cucumber'
require 'cucumber'
gem 'rspec'
require 'spec'

Before do
  @blue_ridge_root = File.expand_path(File.dirname(__FILE__) + "/../..")
  @tmp_path        = File.join(@blue_ridge_root, "tmp")
  @home_path       = File.join(@tmp_path, "home")
  @fixtures_path   = File.join(@blue_ridge_root, "spec/fixtures")
  FileUtils.rm_rf   @tmp_path
  FileUtils.mkdir_p @home_path
  ENV['HOME'] = @home_path
end

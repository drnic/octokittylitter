# Generated by jeweler
# DO NOT EDIT THIS FILE
# Instead, edit Jeweler::Tasks in Rakefile, and run `rake gemspec`
# -*- encoding: utf-8 -*-

Gem::Specification.new do |s|
  s.name = %q{validation_reflection}
  s.version = "0.3.5"

  s.required_rubygems_version = Gem::Requirement.new(">= 0") if s.respond_to? :required_rubygems_version=
  s.authors = ["Christopher Redinger"]
  s.date = %q{2009-10-09}
  s.description = %q{Adds reflective access to validations}
  s.email = %q{redinger@gmail.com}
  s.extra_rdoc_files = [
    "LICENSE",
     "README"
  ]
  s.files = [
    ".gitignore",
     "CHANGELOG",
     "LICENSE",
     "README",
     "Rakefile",
     "VERSION.yml",
     "about.yml",
     "lib/validation_reflection.rb",
     "rails/init.rb",
     "test/test_helper.rb",
     "test/validation_reflection_test.rb",
     "validation_reflection.gemspec"
  ]
  s.homepage = %q{/redinger/validation_reflection}
  s.rdoc_options = ["--charset=UTF-8"]
  s.require_paths = ["lib"]
  s.rubygems_version = %q{1.3.5}
  s.summary = %q{Adds reflective access to validations}
  s.test_files = [
    "test/test_helper.rb",
     "test/validation_reflection_test.rb"
  ]

  if s.respond_to? :specification_version then
    current_version = Gem::Specification::CURRENT_SPECIFICATION_VERSION
    s.specification_version = 3

    if Gem::Version.new(Gem::RubyGemsVersion) >= Gem::Version.new('1.2.0') then
    else
    end
  else
  end
end

module JavascriptTestingHelper
  def app_root
    ENV['APP_ROOT'] || RAILS_ROOT
  end

  def plugin_prefix
    ENV["BLUE_RIDGE_PREFIX"] || "#{app_root}/vendor/plugins/blue-ridge"
  end

  def rhino_command
    "java -Dblue.ridge.prefix=\"#{plugin_prefix}\" -jar #{plugin_prefix}/lib/js.jar -w -debug"
  end

  def test_runner_command
    "#{rhino_command} #{plugin_prefix}/lib/test_runner.js"
  end

  def find_base_dir
    target_dirs = %w[test/javascript spec/javascripts examples/javascripts test spec examples]
    base_dir = target_dirs.find {|d| Dir["#{d}/spec_helper.js"].first }
    raise "Could not find JavaScript test/spec directory.\nNone of the following directories existed and contained spec_helper.js: #{target_dirs.join(", ")}.\nMaybe you need to call './script/generate blue_ridge'?" unless base_dir
    base_dir
  end

  def fixture_file_for_spec(spec)
    fixture_name = File.basename(spec).gsub(/_spec.js/, ".html")
    File.join(File.dirname(spec), "fixtures", fixture_name)
  end

  def ensure_fixture_for(file)
    fixture_file = fixture_file_for_spec(file)
    unless File.exists?(fixture_file)
      FileUtils.mkdir_p(File.dirname(fixture_file))
      template = "#{plugin_prefix}/generators/javascript_spec/templates/fixture.html.erb"
      class_name_without_spec = file.gsub(/_spec.js/,'').classify
      File.open(fixture_file, "w") do |f|
        f << ERB.new(File.read(template), nil, '-').result(binding)
      end
    end
  end

  def run_spec_for_file(file)
    ensure_fixture_for(file)
    all_fine = false unless system("#{test_runner_command} #{file}")
  end

end

# Support Test::Unit & Test/Spec style
namespace :test do
  desc "Runs all the JavaScript tests and outputs the results"
  task :javascripts do
    include JavascriptTestingHelper
    require "fileutils"
    require "erb"
    require "active_support"
    Dir.chdir(find_base_dir) do
      all_fine = true
      if ENV["TEST"]
        test_prefix = ENV["TEST"].gsub(/_spec.js/, '')
        run_spec_for_file("#{test_prefix}_spec.js")
      else
        Dir.glob("**/*_spec.js").each do |file|
          run_spec_for_file(file)
        end
      end
      raise "JavaScript test failures" unless all_fine
    end
  end
  
  task :javascript => :javascripts
  task :js         => :javascripts
end

# Support RSpec style
namespace :spec do
  task :javascripts => ["test:javascripts"]
  task :javascript  => ["test:javascripts"]
  task :js          => ["test:javascripts"]
end

# Support Micronaut style
namespace :examples do
  task :javascripts => ["test:javascripts"]
  task :javascript  => ["test:javascripts"]
  task :js          => ["test:javascripts"]
end


namespace :js do
  desc "Open fixtures directory"
  task :fixtures do
    fixture_dir = "#{find_base_dir}/fixtures"
    
    if PLATFORM[/darwin/]
      system("open #{fixture_dir}")
    elsif PLATFORM[/linux/]
      system("firefox #{fixture_dir}")
    else
      puts "You can run your in-browser fixtures from #{fixture_dir}."
    end
  end
  
  desc "Run Rhino JS shell"
  task :shell do
    rlwrap = `which rlwrap`.chomp
    system("#{rlwrap} #{rhino_command} -f #{plugin_prefix}/lib/shell.js -f -")
  end
end

Given /^I have a Rails project with blue\-ridge installed$/ do
  @active_project_folder = File.join(@tmp_path, 'my_project')
  @stdout = File.expand_path(File.join(@tmp_path, "setup.out"))
  @stderr = File.expand_path(File.join(@tmp_path, "setup.err"))
  FileUtils.cp_r(File.join(@fixtures_path, 'rails_project'), @active_project_folder)
  in_project_folder do
    `ln -s #{@blue_ridge_root} vendor/plugins/blue-ridge > #{@stdout} 2> #{@stderr}`
    `script/generate blue_ridge > #{@stdout} 2> #{@stderr}`
  end
end

Given /^I have a non\-Rails project with blue\-ridge installed$/ do
  @active_project_folder = File.join(@tmp_path, 'my_project')
  @stdout = File.expand_path(File.join(@tmp_path, "setup.out"))
  @stderr = File.expand_path(File.join(@tmp_path, "setup.err"))
  FileUtils.cp_r(File.join(@fixtures_path, 'non_rails_project'), @active_project_folder)
  in_project_folder do
    `ln -s #{@blue_ridge_root} vendor/plugins/blue-ridge > #{@stdout} 2> #{@stderr}`
  end
end

Given /^I create a spec "([^\"]*)" without a fixture file$/ do |spec|
  in_project_folder do
    File.open("spec/javascripts/#{spec}_spec.js", "w") do |file|
      file << <<-SCREWUNIT.gsub(/^      /, '')
      Screw.Unit(function() {
        describe("having fun", function(){
          it("should be awesome", function(){
          });
        });
      });
      SCREWUNIT
    end
  end
end


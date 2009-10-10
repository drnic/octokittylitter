Given /^I am logged in as "([^\"]*)"$/ do |login|
  User.make(:login => login, :password => 'secret', :password_confirmation => 'secret')
  visit path_to("the home page")
  click_link "Login"
  fill_in("login", :with => login)
  fill_in("password", :with => "secret")
  click_button "Log in"
end


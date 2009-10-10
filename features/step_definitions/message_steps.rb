Given /^I have no messages$/ do
  Message.destroy_all
end

When /^I add the following messages:$/ do |table|
  table.hashes.map do |message_attributes|
    visit path_to('the new message form')
    message_attributes.to_a.each do |field, value|
      fill_in(field, :with => value)
    end
    click_button "Create Message"
  end
  Message.all.each { |m| p m }
end

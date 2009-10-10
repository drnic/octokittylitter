Given /^I have no messages$/ do
  Message.destroy_all
end

When /^I add the following messages to "([^\"]*)" mailbox:$/ do |mailbox, table|
  table.hashes.map do |message_attributes|
    visit path_to('the new message form')
    fill_in('mailbox', :with => mailbox)
    message_attributes.to_a.each do |field, value|
      fill_in(field, :with => value)
    end
    click_button "Create Message"
    response.should_not contain("New message")
  end
end

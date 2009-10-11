Given /^I have no messages$/ do
  Message.destroy_all
end

Given /^I have (\d+) messages in my "([^\"]*)" mailbox$/ do |count, mailbox|
  to_from = (mailbox == "inbox") ? "to" : "from"
  count.to_i.times {|n| Message.make(to_from.to_sym => @login)}
end

Given /^I have the following messages:$/ do |table|
  table.hashes.map do |message_attributes|
    visit path_to('the new message form')
    message_attributes.to_a.each do |field, value|
      fill_in(field, :with => value)
    end
    click_button "Create Message"
    response.should_not contain("New message")
  end
end

When /^I delete the conversation$/ do
  if current_url =~ %r{/(\d+)}
    post "/inbox/#{$1}", "_method" => "delete"
  end
end


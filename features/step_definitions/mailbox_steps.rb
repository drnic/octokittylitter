Then /^I see (\d+) messages in the mailbox$/ do |count|
  Nokogiri::HTML(response.body).css(".item").size.should == count.to_i
end

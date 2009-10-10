Then /^I should see:$/ do |table|
  table.raw.flatten.each do |cell|
    response.should contain(cell)
  end
end

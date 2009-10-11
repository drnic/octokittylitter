Message.blueprint do
  to { Faker::Internet.user_name.gsub(/W/, '')[0..14] } # max 15 chars
  from { Faker::Internet.user_name.gsub(/W/, '')[0..14] } # max 15 chars
  subject
  body
  sent_time_ago { "#{[*1..10].rand} #{%w[minutes hours days].rand} ago" }
  unread { [true, true, false].rand }
end


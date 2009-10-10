Message.blueprint do
  from_github_login { Faker::Internet.user_name.gsub(/W/, '')[0..14] } # max 15 chars
  github_message_number { Faker.numerify '######' }
  mailbox { %w[inbox sent].rand }
  subject
  message
  sent_time_ago { "#{[*1..10].rand} #{%w[minutes hours days].rand} ago" }
  unread { [true, true, false].rand }
end


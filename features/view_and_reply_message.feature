Feature: View and reply message
  In order to be able to test the view and reply mechanism
  As a developer
  I want to be able to view a message and reply to it

  Scenario: Reply to a new message
    Given I add the following messages to "inbox" mailbox:
      | Github message number | From github login | Sent time ago | Subject             | Message              | Unread |
      | 269383                | dhh               | 12 hours ago  | Rails 3.0 released! | Go get it            | true   |
      | 269380                | defunkt           | 25 hours ago  | No more rubygems    | Long live Rubyforge. | false  |
    When I am on the inbox page
    And I follow "Rails 3.0 released!"
    Then I should see:
      | dhh | said | about 12 hours | ago: | Rails 3.0 released |
    When I fill in "Reply:" with "Thanks for that!"
    And I press "Send"
    And I follow "Sent Messages"
    Then I should see:
      | You sent | dhh | a | message | less than a minute | ago | Thanks for that! |

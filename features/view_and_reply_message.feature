Feature: View and reply message
  In order to be able to test the view and reply mechanism
  As a developer
  I want to be able to view a message and reply to it

  Background:
    Given I am logged in as "drnic"
    Given I add the following messages to "inbox" mailbox:
      | Github message number | From github login | Sent time ago | Subject             | Body                 | Unread |
      | 269383                | dhh               | 12 hours ago  | Rails 3.0 released! | Go get it            | true   |
      | 269380                | defunkt           | 25 hours ago  | No more rubygems    | Long live Rubyforge. | false  |
    When I am on the inbox page
    And I follow "Rails 3.0 released!"
    Then I should see:
      | dhh | said | about 12 hours | ago: | Rails 3.0 released |
    When I fill in "Reply:" with "Thanks for that!"
    And I press "Send"
    Then I should see "Your message has been sent."

  Scenario: After replying to a message it appears in Sent Messages mailbox
    And I follow "Sent Messages"
    Then I should see:
      | You sent | dhh | a | message | less than a minute | ago | Thanks for that! |

  Scenario: Original message and reply appear on same message show page
    Then I should see:
      | dhh   | said | about 12 hours     | ago | Go get it        |
      | drnic | said | less than a minute | ago | Thanks for that! |
  

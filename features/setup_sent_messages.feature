Feature: Setup sent mailbox messages
  In order to cheaply test an adapter for github sent mailbox
  As a developer
  I want to be able to explicitly determine what messages are in the mailbox

  Scenario: Setup messages
    Given I am logged in as "drnic"
    When I add the following messages to "sent" mailbox:
      | Github message number | From github login | Sent time ago | Subject             | Body                 | Unread |
      | 269383                | dhh               | 12 hours ago  | Rails 3.0 released! | Go get it            | true   |
      | 269380                | defunkt           | 25 hours ago  | No more rubygems    | Long live Rubyforge. | false  |
    And I am on the inbox page
    And I follow "Sent Messages"
    Then I should see:
      | You sent | dhh     | a | message | 12 hours | Rails 3.0 released |
      | You sent | defunkt | a | message | 1 day    | No more rubygems   |
  

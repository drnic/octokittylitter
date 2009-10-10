Feature: Setup inbox
  In order to cheaply test an adapter for github inbox
  As a developer
  I want to be able to explicitly determine what messages are in the inbox

  Scenario: Setup messages
    Given I have no messages
    When I add the following messages:
    | Github message number | From github login | Sent time ago | Message                                 | Unread |
    | 269383                | dhh               | 12 hours ago  | Rails 3.0 released!                     | true   |
    | 269380                | defunkt           | 25 hours ago  | No more rubygems.\nLong live Rubyforge. | false  |
    And I am on the inbox page
    Then I should see:
      | dhh     | sent you a message | 12 hours ago | Rails 3.0 released |
      | defunkt | sent you a message | 1 day ago    | No more rubygems   |
  

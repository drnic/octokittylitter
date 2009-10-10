Feature: Setup inbox
  In order to cheaply test an adapter for github inbox
  As a developer
  I want to be able to explicitly determine what messages are in the inbox

  Scenario: Setup messages
    Given I have no messages
    When I add the following messages:
    | id     | from    | sent_time_ago | message                                 |
    | 269383 | dhh     | 12.hours.ago  | Rails 3.0 released!                     |
    | 269380 | defunkt | 25.hours.ago  | No more rubygems.\nLong live Rubyforge. |
    And I am on the inbox page
    Then I should see "dhh sent you a message 12 hours ago"
    Then I should see "Rails 3.0 released"
    Then I should see "defunkt sent you a message 1 day ago"
    Then I should see "No more rubygems"
    
  
  
  

Feature: Seed fake messages
  In order to play with a new user account
  As a developer
  I want to seed an account with messages

  Scenario: Seed new user
    Given I am logged in as "drnic"
    Then I have 0 messages in my "inbox" mailbox
    Then I have 0 messages in my "sent" mailbox
    When I follow "Generate lots of random messages"
    Then I see 10 messages in the mailbox
  

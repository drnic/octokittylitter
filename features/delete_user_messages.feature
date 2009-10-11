Feature: Delete user messages
  In order to reduce cost of deleting messages
  I want to delete all my messages

  Scenario: User deletes all messages
    Given I am logged in as "drnic"
    When I follow "Generate lots of random messages"
    Then I see 10 messages in the mailbox
    When I press "Delete all messages"
    Then I see 0 messages in the mailbox
  
  

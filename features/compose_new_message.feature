Feature: Compose new message
  In order to be able to test the send mechanism
  As a developer
  I want to be send a message to another user

  Scenario: Compose new message
    When I am on the inbox page
    And I follow "Compose "
    And I fill in "To:" with "defunkt"
    And I fill in "Subject:" with "Sending a message"
    And I fill in "message_body" with "This is the body of the message"
    And I press "Send"
    Then I should see "Your message has been sent."
    And I follow "Sent Messages"
    Then I should see:
      | You sent | defunkt | a | message | less than a minute | ago | Sending a message | This is the body of the message |

Feature: Mailboxes are paginated
  In order to allow navigation of messages beyond first page
  As a developer
  I want to navigate to additional pages

  Scenario: Navigate across several pages in the inbox
    Given I have 35 messages in my "inbox" mailbox
    When I am on the inbox page
    Then I see 10 messages in the mailbox
    When I follow "Next"
    Then I see 10 messages in the mailbox
    When I follow "Next"
    Then I see 10 messages in the mailbox
    When I follow "Next"
    Then I see 5 messages in the mailbox
  
  Scenario: Navigate across several pages in the sent mailbox
    Given I have 35 messages in my "sent" mailbox
    When I am on the inbox page
    Then I see 0 messages in the mailbox
    And I follow "Sent Messages"
    Then I see 10 messages in the mailbox
    When I follow "Next"
    Then I see 10 messages in the mailbox
    When I follow "Next"
    Then I see 10 messages in the mailbox
    When I follow "Next"
    Then I see 5 messages in the mailbox
  

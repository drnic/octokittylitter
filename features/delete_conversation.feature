Feature: Delete conversation
  In order to be able to test the absence of a conversation/messages
  As a developer
  I want to delete a conversation from my perspective

  Background:
    Given I am logged in as "drnic"
    And I have the following messages:
      | Number | From    | To    | Sent time ago | Subject             | Body                 | Unread |
      | 269383 | dhh     | drnic | 12 hours ago  | Rails 3.0 released! | Go get it            | true   |
      | 269380 | defunkt | drnic | 25 hours ago  | No more rubygems    | Long live Rubyforge. | false  |
    When I am on the inbox page
    And I follow "Rails 3.0 released!"
    And I delete the conversation
    
  Scenario: Deleted conversation not visible to me
    When I am on the inbox page
    Then I should not see "Rails 3.0 released!"
  
  # Scenario: Deleted conversation still visible to other user
  #   Given I am logged in as "dhh"
  #   When I am on the inbox page
  #   And I follow "Sent Messages"
  #   Then I should see "Rails 3.0 released!"
  
  
  
  

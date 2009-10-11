Feature: Setup inbox
  In order to cheaply test an adapter for github inbox
  As a developer
  I want to be able to explicitly determine what messages are in the inbox

  Scenario: Setup messages
    Given I am logged in as "drnic"
    And I have the following messages:
      | Number | From    | To    | Sent time ago | Subject             | Body                 | Unread |
      | 269383 | dhh     | drnic | 12 hours ago  | Rails 3.0 released! | Go get it            | true   |
      | 269380 | defunkt | drnic | 25 hours ago  | No more rubygems    | Long live Rubyforge. | false  |
    When I am on the inbox page
    Then I should see:
      | dhh     | sent you a | message | 12 hours | Rails 3.0 released |
      | defunkt | sent you a | message | 1 day    | No more rubygems   |
  

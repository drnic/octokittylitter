Feature: Register new user
  In order to setup users of the system
  As a developer
  I want to be able to create user accounts

  Scenario: Register by normal github /signup/free
    Given I am on the home page
    When I follow "Register"
    And I fill in "user_login" with "drnic"
    And I fill in "Email Address" with "drnicwilliams@gmail.com"
    And I fill in "user_password" with "secret"
    And I fill in "user_password_confirmation" with "secret"
    And I press "I agree, sign me up!"
    Then I should see "Inbox"
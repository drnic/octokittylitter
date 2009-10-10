Feature: User login
  In order to display my own name on the page
  As a sample user
  I want to be able to login

  Scenario: Login successfully
    Given the following User:
      | login | password | password_confirmation |
      | drnic | secret   | secret                |
    When I am on the home page
    And I follow "Login"
    Then I should not see "drnic"
    When I fill in "login" with "drnic"
    And I fill in "password" with "secret"
    And I press "Log in"
    Then I should see "drnic"
  
  Scenario: Login unsuccessfully
    When I am on the home page
    And I follow "Login"
    And I press "Log in"
    Then I should see "Incorrect login or password."
  
  

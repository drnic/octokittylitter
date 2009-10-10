Feature: Fixture file generated if missing
  In order to reduce the cost of testing JavaScript that does not perform DOM manipulations
  As a JavaScript developer
  I want to be able to create spec.js files and have the corresponding fixture file generated if missing

  Scenario: Generate fixture file if missing for 'rake test:js'
    Given I have a Rails project with blue-ridge installed
    And I create a spec "no_fixture" without a fixture file
    When I invoke task "rake test:js"
    Then I should see "Running no_fixture_spec.js with fixture 'fixtures/no_fixture.html'..."
    And I should not see "FAILED"
  

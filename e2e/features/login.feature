@login
Feature: Login
  As a customer
  I want to sign in to the store
  So that I can browse and buy products

  Background:
    Given I am on the login page

  @smoke
  Scenario: Standard user can log in
    When I log in as the "standard" user
    Then I should see the inventory page

  @regression
  Scenario: Locked out user cannot log in
    When I log in as the "locked out" user
    Then I should see the login error "Epic sadface: Sorry, this user has been locked out."

  @regression
  Scenario Outline: Login is rejected with <reason>
    When I log in with username "<username>" and password "<password>"
    Then I should see the login error "<error>"

    Examples:
      | reason           | username      | password       | error                                                                     |
      | a wrong password | standard_user | wrong_password | Epic sadface: Username and password do not match any user in this service |
      | no username      |               | secret_sauce   | Epic sadface: Username is required                                        |
      | no password      | standard_user |                | Epic sadface: Password is required                                        |

  @regression
  Scenario: User can log out
    Given I log in as the "standard" user
    When I log out
    Then I should be on the login page

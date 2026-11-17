@checkout
Feature: Checkout
  As a customer
  I want to check out the products in my cart
  So that I can place an order

  Background:
    Given I am logged in as the "standard" user
    And I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Bike Light" to the cart
    And I open the cart
    And I start checkout

  @smoke
  Scenario: Complete a purchase end to end
    When I enter my details as "Ada" "Lovelace" with postal code "SW1A 1AA"
    Then the order overview should list:
      | productName           |
      | Sauce Labs Backpack   |
      | Sauce Labs Bike Light |
    And the item total should equal the sum of the item prices
    And the order total should equal the item total plus tax
    When I finish the order
    Then I should see the order confirmation "Thank you for your order!"
    And the cart badge should not be shown

  @regression
  Scenario Outline: Checkout requires <field>
    When I enter my details as "<firstName>" "<lastName>" with postal code "<postalCode>"
    Then I should see the checkout error "<error>"

    Examples:
      | field       | firstName | lastName | postalCode | error                          |
      | first name  |           | Lovelace | SW1A 1AA   | Error: First Name is required  |
      | last name   | Ada       |          | SW1A 1AA   | Error: Last Name is required   |
      | postal code | Ada       | Lovelace |            | Error: Postal Code is required |

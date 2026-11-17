@cart
Feature: Shopping cart
  As a customer
  I want to manage the products in my cart
  So that I only buy what I need

  Background:
    Given I am logged in as the "standard" user

  @smoke
  Scenario: Add multiple products to the cart
    When I add the following products to the cart:
      | productName             |
      | Sauce Labs Backpack     |
      | Sauce Labs Bike Light   |
      | Sauce Labs Bolt T-Shirt |
    Then the cart badge should show 3
    When I open the cart
    Then the cart should contain exactly:
      | productName             |
      | Sauce Labs Backpack     |
      | Sauce Labs Bike Light   |
      | Sauce Labs Bolt T-Shirt |

  @regression
  Scenario: Remove a product from the cart
    Given I add "Sauce Labs Backpack" to the cart
    And I add "Sauce Labs Onesie" to the cart
    And I open the cart
    When I remove "Sauce Labs Backpack" from the cart
    Then the cart should contain exactly:
      | productName       |
      | Sauce Labs Onesie |
    And the cart badge should show 1

  @regression
  Scenario: Removing a product from the inventory page clears the badge
    Given I add "Sauce Labs Fleece Jacket" to the cart
    When I remove "Sauce Labs Fleece Jacket" from the inventory page
    Then the cart badge should not be shown

  @regression
  Scenario: Continue shopping keeps the cart contents
    Given I add "Sauce Labs Fleece Jacket" to the cart
    And I open the cart
    When I continue shopping
    Then I should see the inventory page
    And the cart badge should show 1

@sorting
Feature: Product sorting
  As a customer
  I want to sort the product list
  So that I can find products more easily

  Background:
    Given I am logged in as the "standard" user

  @regression
  Scenario Outline: Sort products by <sortOption>
    When I sort products by "<sortOption>"
    Then the products should be sorted by <field> in <direction> order

    Examples:
      | sortOption          | field | direction  |
      | Name (A to Z)       | name  | ascending  |
      | Name (Z to A)       | name  | descending |
      | Price (low to high) | price | ascending  |
      | Price (high to low) | price | descending |

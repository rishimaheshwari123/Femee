# Requirements Document

## Introduction

This document outlines the requirements for implementing a Product-Wise ML Binary Plan system where each product maintains its own independent binary tree structure with separate roots, volume tracking, and matching bonus calculations.

## Glossary

- **System**: The Product-Wise ML Binary Plan application
- **Member**: A registered user who can purchase products and earn commissions
- **Product**: An item (Medicine or Pad) that can be purchased and has its own binary tree
- **Binary_Tree**: A hierarchical structure where each member has left and right legs for a specific product
- **Root_Member**: The top-level member in a product's binary tree (can be different for each product)
- **Referrer**: A member who shares a product link and refers new purchases
- **Buyer**: A member who purchases a product through a referral link
- **Left_Leg**: The left side of a member's binary tree for a specific product
- **Right_Leg**: The right side of a member's binary tree for a specific product
- **Volume**: The total purchase amount accumulated in a leg for a specific product
- **Matching_Bonus**: Commission earned when left and right leg volumes are paired for a product
- **Carry_Forward**: Remaining volume from the stronger leg that carries to the next cycle
- **Product_Tree**: A member's binary tree structure for a specific product

## Requirements

### Requirement 1: Product-Wise Binary Tree Management

**User Story:** As a system administrator, I want each product to have its own independent binary tree with a designated root member, so that members can build separate networks for different products.

#### Acceptance Criteria

1. WHEN a product is created, THE System SHALL allow designation of a root member for that product's binary tree
2. WHEN a member purchases a product for the first time, THE System SHALL create a new product tree entry for that member
3. WHEN a member is added to a product's binary tree, THE System SHALL place them in either the left or right leg based on balanced placement logic
4. THE System SHALL maintain separate left and right leg structures for each product independently
5. WHEN querying a member's binary trees, THE System SHALL return all product trees with their respective structures

### Requirement 2: Referral Link Generation and Tracking

**User Story:** As a member, I want to generate product-specific referral links, so that I can share products and track which purchases came through my links.

#### Acceptance Criteria

1. WHEN a member requests a referral link for a product, THE System SHALL generate a unique URL containing the product ID and referrer ID
2. THE System SHALL format referral links as `/product/:productId/:referrerId`
3. WHEN a buyer accesses a referral link, THE System SHALL store the referrer ID and product ID for the checkout session
4. WHEN a purchase is completed, THE System SHALL associate the order with the referrer who shared the link
5. THE System SHALL track which specific product was referred for each purchase

### Requirement 3: Purchase Tracking and First Purchase Detection

**User Story:** As a system, I want to track each member's purchases per product and detect first-time purchases, so that I can properly place members in product-specific binary trees.

#### Acceptance Criteria

1. WHEN a member purchases a product, THE System SHALL record the purchase in that product's purchase history
2. WHEN checking purchase history, THE System SHALL determine if this is the member's first purchase of a specific product
3. WHEN a first purchase is detected, THE System SHALL mark it with an `isFirstPurchase` flag
4. THE System SHALL maintain a count of total purchases per product for each member
5. WHEN a purchase is made, THE System SHALL store the order ID, product ID, amount, purchase date, and referrer ID

### Requirement 4: Binary Tree Placement Logic

**User Story:** As a system, I want to automatically place new members in the appropriate leg of their referrer's product-specific binary tree, so that the tree grows in a balanced manner.

#### Acceptance Criteria

1. WHEN a member makes their first purchase of a product through a referral link, THE System SHALL add them to the referrer's binary tree for that product
2. WHEN determining placement, THE System SHALL compare the count of members in left and right legs
3. IF the left leg has fewer or equal members, THEN THE System SHALL place the new member in the left leg
4. IF the right leg has fewer members, THEN THE System SHALL place the new member in the right leg
5. WHEN a member is placed, THE System SHALL record their member ID and join date in the appropriate leg

### Requirement 5: Volume Calculation and Updates

**User Story:** As a system, I want to track purchase volumes in each leg of a product's binary tree, so that I can calculate matching bonuses accurately.

#### Acceptance Criteria

1. WHEN a purchase is made, THE System SHALL add the purchase amount to the appropriate leg's volume for that product
2. WHEN updating volume, THE System SHALL determine which leg the buyer belongs to in the referrer's product tree
3. THE System SHALL recursively update volumes up the entire upline chain for that product
4. WHEN a buyer is in a downline (not direct child), THE System SHALL correctly identify which leg they belong to
5. THE System SHALL maintain separate left volume and right volume counters for each product tree

### Requirement 6: Matching Bonus Calculation

**User Story:** As a member, I want to earn matching bonuses when my left and right leg volumes are paired for a product, so that I am rewarded for building balanced teams.

#### Acceptance Criteria

1. WHEN volumes are updated, THE System SHALL calculate matching bonus based on the weaker leg for that product
2. THE System SHALL apply the matching percentage based on member tier and product type
3. WHEN calculating matched volume, THE System SHALL include carry forward amounts from previous cycles
4. WHEN a match occurs, THE System SHALL reset current cycle volumes to zero
5. WHEN a match occurs, THE System SHALL carry forward the remaining volume from the stronger leg
6. THE System SHALL credit the matching bonus to the member's wallet
7. THE System SHALL log each matching bonus transaction with product ID, amount, and timestamp

### Requirement 7: Product-Wise Dashboard Visualization

**User Story:** As a member, I want to view my binary tree structure for each product separately in my dashboard, so that I can track my performance per product.

#### Acceptance Criteria

1. WHEN a member accesses their dashboard, THE System SHALL display all products they are active in
2. FOR each product, THE System SHALL show the product name, image, and binary tree statistics
3. THE System SHALL display left leg count, right leg count, left volume, and right volume for each product
4. THE System SHALL show carry forward amounts for both legs per product
5. THE System SHALL display total matched pairs and total matching bonus earned per product
6. THE System SHALL show purchase statistics including total purchases, total spent, first purchase date, and last purchase date per product
7. THE System SHALL provide a visual representation of the binary tree structure for each product

### Requirement 8: Root Member Management

**User Story:** As a system administrator, I want to designate and manage root members for each product's binary tree, so that each product has a clear starting point for its network.

#### Acceptance Criteria

1. WHEN a product is created or updated, THE System SHALL allow setting a root member ID for that product
2. THE System SHALL validate that the root member exists before assignment
3. WHEN a root member is set, THE System SHALL initialize their product tree if it doesn't exist
4. THE System SHALL allow different root members for different products
5. WHEN querying a product's binary tree, THE System SHALL start from the designated root member

### Requirement 9: Multi-Product Order Processing

**User Story:** As a buyer, I want to purchase multiple products in a single order, so that each product is tracked separately in its respective binary tree.

#### Acceptance Criteria

1. WHEN an order contains multiple products, THE System SHALL process each product separately
2. FOR each product in the order, THE System SHALL update the respective product tree
3. THE System SHALL calculate volumes and bonuses independently for each product
4. WHEN a referrer is associated with the order, THE System SHALL apply the referral to all products in the order
5. THE System SHALL maintain separate purchase records for each product in the order

### Requirement 10: Upline Volume Propagation

**User Story:** As a system, I want to propagate purchase volumes up the entire upline chain for each product, so that all ancestors earn matching bonuses appropriately.

#### Acceptance Criteria

1. WHEN a purchase is made, THE System SHALL update volumes for the direct referrer's product tree
2. THE System SHALL recursively update volumes for all ancestors in the upline chain for that product
3. WHEN updating an ancestor's volume, THE System SHALL determine which leg the purchase originated from
4. THE System SHALL continue propagation until reaching the root member or a member without a parent
5. THE System SHALL trigger matching bonus calculations at each level during propagation

### Requirement 11: Tier-Based Commission Rates

**User Story:** As a system administrator, I want to configure different matching bonus percentages based on member tier and product type, so that higher-tier members earn more commissions.

#### Acceptance Criteria

1. THE System SHALL maintain a configuration of matching percentages by tier and product type
2. WHEN calculating matching bonus, THE System SHALL retrieve the appropriate percentage for the member's tier and product
3. THE System SHALL support different percentages for different products (e.g., Medicine vs Pad)
4. THE System SHALL apply the correct percentage when computing the matching bonus amount
5. WHEN a member's tier is updated, THE System SHALL use the new tier for subsequent bonus calculations

### Requirement 12: Transaction Logging

**User Story:** As a member, I want to view a detailed history of all my matching bonus transactions per product, so that I can track my earnings over time.

#### Acceptance Criteria

1. WHEN a matching bonus is credited, THE System SHALL create a transaction log entry
2. THE System SHALL record the member ID, product ID, bonus amount, transaction type, and timestamp
3. WHEN a member requests their transaction history, THE System SHALL return all transactions filtered by product if specified
4. THE System SHALL display transaction history in reverse chronological order
5. THE System SHALL include running totals for each product's earnings

### Requirement 13: Product Tree Serialization

**User Story:** As a system, I want to serialize and deserialize product tree data efficiently, so that binary tree structures are stored and retrieved correctly from the database.

#### Acceptance Criteria

1. WHEN saving a member's product trees, THE System SHALL serialize the nested binary structure to JSON
2. WHEN retrieving a member's product trees, THE System SHALL deserialize JSON back to the binary structure
3. THE System SHALL validate the integrity of serialized data before saving
4. WHEN a product tree is corrupted, THE System SHALL log an error and prevent data loss
5. THE System SHALL support migration of existing data to the new product-wise structure

### Requirement 14: API Endpoints for Product Binary Trees

**User Story:** As a frontend developer, I want RESTful API endpoints to access product-wise binary tree data, so that I can build the member dashboard interface.

#### Acceptance Criteria

1. THE System SHALL provide an endpoint to get all product trees for a member: `GET /api/member/:memberId/product-trees`
2. THE System SHALL provide an endpoint to get a specific product tree: `GET /api/member/:memberId/product-tree/:productId`
3. THE System SHALL provide an endpoint to get the full binary tree visualization for a product: `GET /api/product/:productId/binary-tree/:memberId`
4. THE System SHALL provide an endpoint to generate a referral link: `POST /api/referral/generate`
5. THE System SHALL provide an endpoint to get transaction history: `GET /api/member/:memberId/transactions/:productId`
6. THE System SHALL return properly formatted JSON responses with success/error status

### Requirement 15: Error Handling and Edge Cases

**User Story:** As a system, I want to handle edge cases and errors gracefully, so that the binary tree structure remains consistent even when unexpected situations occur.

#### Acceptance Criteria

1. WHEN a referrer ID is invalid or not found, THE System SHALL process the purchase without referral tracking
2. WHEN a product ID is invalid, THE System SHALL return a descriptive error message
3. WHEN a member attempts to refer themselves, THE System SHALL reject the referral
4. WHEN circular references are detected in the binary tree, THE System SHALL prevent the placement and log an error
5. WHEN database operations fail, THE System SHALL rollback transactions to maintain data consistency
6. WHEN calculating bonuses with zero volumes, THE System SHALL handle division by zero gracefully
7. THE System SHALL validate all input data before processing purchases or placements

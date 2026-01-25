# Implementation Plan: Product-Wise ML Binary Plan

## Overview

This implementation plan breaks down the Product-Wise ML Binary Plan system into discrete, manageable tasks. Each task builds on previous work to incrementally deliver a complete system where each product maintains its own independent binary tree with separate roots, volume tracking, and matching bonus calculations.

## Tasks

- [x] 1. Update database models for product-wise binary trees
  - [x] 1.1 Enhance Member model with productBinaryTrees array
    - Add productBinaryTrees field with nested structure for binary positions
    - Add wallet and totalEarnings fields
    - Create indexes on productBinaryTrees.productId for efficient queries
    - _Requirements: 1.2, 1.4, 3.1, 5.1_
  
  - [x] 1.2 Enhance Product model with binaryConfig
    - Add binaryConfig field with rootMemberId and matchingPercentage
    - Add totalMembers and totalVolume tracking fields
    - Create validation for rootMemberId reference
    - _Requirements: 8.1, 8.2, 11.1_
  
  - [x] 1.3 Enhance Order model with referral tracking
    - Add referrerId, isFirstPurchase, and placedInLeg to orderItems
    - Add price field to orderItems for historical tracking
    - _Requirements: 2.4, 3.2, 9.1_
  
  - [x] 1.4 Create Transaction model for bonus logging
    - Define schema with memberId, productId, transactionType, amount
    - Add matchingDetails nested object for bonus calculations
    - Create indexes on memberId and productId
    - _Requirements: 6.7, 12.1, 12.2_

- [x] 2. Implement core binary tree services
  - [x] 2.1 Create BinaryTreeService for tree operations
    - Implement findOrCreateProductTree(memberId, productId)
    - Implement getProductTree(memberId, productId)
    - Implement isFirstPurchaseOfProduct(memberId, productId)
    - _Requirements: 1.2, 3.2_
  
  - [x] 2.2 Implement binary placement logic
    - Create placeMemberInBinaryTree(referrerId, newMemberId, productId, amount)
    - Implement balanced placement algorithm (compare left/right leg counts)
    - Return placement leg ('left' or 'right')
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 2.3 Write property test for binary placement
    - **Property 1: Binary Tree Placement Consistency**
    - **Validates: Requirements 1.3, 4.2, 4.3, 4.4**
    - Generate random binary trees and verify balanced placement
    - Test with 100+ iterations using fast-check
  
  - [x] 2.4 Implement upline chain traversal
    - Create getUplineChain(memberId, productId) to get all ancestors
    - Implement recursive traversal with termination at root
    - Return array of ancestor member IDs in order
    - _Requirements: 10.1, 10.2, 10.4_
  
  - [ ]* 2.5 Write property test for upline termination
    - **Property 11: Upline Chain Termination**
    - **Validates: Requirements 10.4, 15.4**
    - Generate random upline chains and verify termination
    - Test for circular reference prevention

- [x] 3. Implement volume calculation and propagation
  - [x] 3.1 Create VolumeService for volume operations
    - Implement updateProductVolume(memberId, buyerId, productId, amount)
    - Implement findLegForMember(parentId, childId, productId)
    - Implement isInDownline(ancestorId, descendantId, productId)
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 3.2 Implement recursive volume propagation
    - Create propagateVolumeUpline(buyerId, productId, amount, referrerId)
    - Update volumes for direct referrer and all ancestors
    - Correctly identify left/right leg for each ancestor
    - _Requirements: 10.1, 10.2, 10.3_
  
  - [ ]* 3.3 Write property test for volume propagation
    - **Property 2: Volume Propagation Completeness**
    - **Validates: Requirements 5.1, 5.2, 5.3, 5.4, 10.1, 10.2, 10.3, 10.4**
    - Generate random purchase chains and verify volume propagation
    - Verify all ancestors receive correct volume updates

- [x] 4. Implement matching bonus calculation
  - [x] 4.1 Create MatchingBonusService
    - Implement calculateMatchingBonus(memberId, productId)
    - Get matching percentage based on tier and product
    - Calculate matched volume from weaker leg
    - _Requirements: 6.1, 6.2, 6.3_
  
  - [x] 4.2 Implement carry forward logic
    - Calculate carry forward for stronger leg
    - Reset current cycle volumes to zero
    - Update totalMatchedPairs and totalMatchingBonus
    - _Requirements: 6.4, 6.5_
  
  - [x] 4.3 Implement wallet credit and transaction logging
    - Credit matching bonus to member wallet
    - Create transaction log entry with matchingDetails
    - Update member totalEarnings
    - _Requirements: 6.6, 6.7, 12.1, 12.2_
  
  - [ ]* 4.4 Write property test for matching calculation
    - **Property 4: Matching Bonus Calculation Correctness**
    - **Validates: Requirements 6.1, 6.2, 6.3, 11.2, 11.4**
    - Generate random volumes and verify matching formula
    - Test with various tier and product combinations
  
  - [ ]* 4.5 Write property test for carry forward conservation
    - **Property 5: Carry Forward Conservation**
    - **Validates: Requirements 6.4, 6.5**
    - Generate random matching scenarios
    - Verify volume conservation: (left + right) = (matched * 2) + (carryLeft + carryRight)
  
  - [ ]* 4.6 Write property test for wallet consistency
    - **Property 9: Wallet Balance Consistency**
    - **Validates: Requirements 6.6, 12.5**
    - Generate random transaction sequences
    - Verify wallet equals sum of all transactions

- [x] 5. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 6. Implement referral link generation and tracking
  - [x] 6.1 Create ReferralService for link operations
    - Implement generateReferralLink(productId, referrerId)
    - Format link as `/product/:productId/:referrerId`
    - Validate product and referrer exist
    - _Requirements: 2.1, 2.2, 2.3_
  
  - [x] 6.2 Implement referral tracking in frontend
    - Store referrerId and productId in localStorage when link accessed
    - Retrieve referral data during checkout
    - Clear referral data after successful purchase
    - _Requirements: 2.3, 2.4_
  
  - [ ]* 6.3 Write property test for link uniqueness
    - **Property 7: Referral Link Uniqueness**
    - **Validates: Requirements 2.1, 2.2, 2.4**
    - Generate random product/referrer pairs
    - Verify each combination produces unique link

- [x] 7. Implement order processing with product-wise tracking
  - [x] 7.1 Update createOrder controller
    - Extract referrerId and productId from request body
    - Process each product in order separately
    - Call BinaryTreeService for first purchase detection
    - _Requirements: 3.1, 3.2, 3.3, 9.1_
  
  - [x] 7.2 Implement product-wise purchase processing
    - For each product: check if first purchase
    - Create or update product tree entry
    - Add purchase to product's purchase history
    - Update totalPurchases and totalSpent
    - _Requirements: 3.4, 3.5, 9.2_
  
  - [x] 7.3 Integrate binary placement and volume propagation
    - If first purchase: call placeMemberInBinaryTree
    - If repeat purchase: call updateProductVolume only
    - Trigger matching bonus calculation after volume update
    - _Requirements: 4.1, 5.1, 9.3_
  
  - [ ]* 7.4 Write property test for first purchase detection
    - **Property 3: First Purchase Detection Accuracy**
    - **Validates: Requirements 3.1, 3.2, 3.3**
    - Generate random purchase sequences
    - Verify first purchase correctly identified per product
  
  - [ ]* 7.5 Write property test for multi-product independence
    - **Property 6: Product Tree Independence**
    - **Validates: Requirements 1.4, 9.2, 9.3**
    - Generate random multi-product operations
    - Verify changes to one product don't affect others
  
  - [ ]* 7.6 Write property test for multi-product order processing
    - **Property 12: Multi-Product Order Processing**
    - **Validates: Requirements 9.1, 9.2, 9.3, 9.4**
    - Generate random multi-product orders
    - Verify each product processed independently

- [x] 8. Implement product root member management
  - [x] 8.1 Create admin API for setting product root
    - POST /api/admin/product/:productId/set-root
    - Validate root member exists
    - Initialize root member's product tree if needed
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 8.2 Implement root member initialization
    - Create empty product tree entry for root
    - Set leftLeg and rightLeg to empty arrays
    - Set all volumes to zero
    - _Requirements: 8.3, 8.4_
  
  - [ ]* 8.3 Write property test for root initialization
    - **Property 10: Root Member Initialization**
    - **Validates: Requirements 8.1, 8.3, 8.4**
    - Generate random products with root members
    - Verify root has initialized empty tree

- [x] 9. Implement dashboard API endpoints
  - [x] 9.1 Create GET /api/member/:memberId/product-trees
    - Return all product trees for a member
    - Populate product details (name, image)
    - Include binary stats and purchase history
    - _Requirements: 7.1, 7.2, 14.1_
  
  - [x] 9.2 Create GET /api/member/:memberId/product-tree/:productId
    - Return specific product tree for a member
    - Include detailed binary position data
    - Include left/right leg member lists
    - _Requirements: 7.3, 7.4, 14.2_
  
  - [x] 9.3 Create GET /api/product/:productId/binary-tree/:memberId
    - Return full binary tree visualization data
    - Include member details for all nodes
    - Calculate tree depth and breadth
    - _Requirements: 7.7, 14.3_
  
  - [x] 9.4 Create POST /api/referral/generate
    - Accept productId and referrerId in body
    - Call ReferralService to generate link
    - Return formatted referral URL
    - _Requirements: 2.1, 14.4_
  
  - [x] 9.5 Create GET /api/member/:memberId/transactions/:productId
    - Return transaction history for specific product
    - Filter by transaction type if specified
    - Sort by timestamp descending
    - Include running totals
    - _Requirements: 12.3, 12.4, 12.5, 14.5_
  
  - [ ]* 9.6 Write unit tests for API endpoints
    - Test successful responses with valid data
    - Test error responses with invalid IDs
    - Test pagination and filtering
    - _Requirements: 14.6_

- [x] 10. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement frontend dashboard components
  - [x] 11.1 Create ProductTreeCard component
    - Display product name, image, and stats
    - Show left/right leg counts and volumes
    - Display carry forward amounts
    - Show total pairs and bonus earned
    - _Requirements: 7.2, 7.3, 7.4, 7.5_
  
  - [x] 11.2 Create BinaryTreeVisualization component
    - Render tree structure with member nodes
    - Show member names and positions
    - Highlight current member's position
    - Support expand/collapse for large trees
    - _Requirements: 7.7_
  
  - [x] 11.3 Create ProductPurchaseHistory component
    - Display purchase list for each product
    - Show order ID, amount, date, referrer
    - Highlight first purchase
    - _Requirements: 7.6_
  
  - [x] 11.4 Create MemberDashboard page
    - Integrate ProductTreeCard for each product
    - Show overall wallet balance and earnings
    - Display transaction history
    - Add referral link generation UI
    - _Requirements: 7.1, 7.2_
  
  - [ ]* 11.5 Write unit tests for React components
    - Test component rendering with mock data
    - Test user interactions (expand/collapse, filters)
    - Test API integration with mock responses

- [x] 12. Implement error handling and edge cases
  - [x] 12.1 Add validation middleware
    - Validate member IDs exist before operations
    - Validate product IDs exist before operations
    - Validate referrer is not same as buyer
    - _Requirements: 15.1, 15.2, 15.3_
  
  - [x] 12.2 Implement circular reference detection
    - Track visited members during upline traversal
    - Stop propagation if circular reference detected
    - Log error and alert admin
    - _Requirements: 15.4_
  
  - [x] 12.3 Add database transaction handling
    - Wrap order creation in database transaction
    - Rollback on any error during processing
    - Return descriptive error messages
    - _Requirements: 15.5_
  
  - [x] 12.4 Implement retry logic for concurrent updates
    - Detect concurrent modification errors
    - Retry with exponential backoff
    - Limit retry attempts to 3
    - _Requirements: 15.6_
  
  - [x] 12.5 Add graceful handling for missing data
    - Create product tree on-the-fly if missing
    - Use default tier percentage if invalid tier
    - Skip matching if zero volumes
    - _Requirements: 15.7, 15.8, 15.10_
  
  - [ ]* 12.6 Write unit tests for error scenarios
    - Test invalid member ID handling
    - Test invalid product ID handling
    - Test self-referral rejection
    - Test circular reference detection
    - Test database failure rollback
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 13. Implement transaction logging service
  - [x] 13.1 Create TransactionService
    - Implement logTransaction(memberId, productId, type, amount, details)
    - Calculate balanceBefore and balanceAfter
    - Store matchingDetails for bonus transactions
    - _Requirements: 12.1, 12.2_
  
  - [x] 13.2 Integrate transaction logging in bonus service
    - Call logTransaction after each bonus credit
    - Include left/right volumes and matched amount
    - Store carry forward amounts
    - _Requirements: 6.7, 12.1_
  
  - [ ]* 13.3 Write property test for transaction logging
    - **Property 8: Transaction Logging Completeness**
    - **Validates: Requirements 6.7, 12.1, 12.2**
    - Generate random bonus credits
    - Verify corresponding transaction log exists

- [x] 14. Implement tier-based commission configuration
  - [x] 14.1 Create commission configuration utility
    - Implement getMatchingPercentage(tier, productId)
    - Load percentages from product binaryConfig
    - Return default if tier not found
    - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_
  
  - [x] 14.2 Add admin API for updating commission rates
    - PUT /api/admin/product/:productId/commission-rates
    - Validate tier names and percentage values
    - Update product binaryConfig
    - _Requirements: 11.1_
  
  - [ ]* 14.3 Write unit tests for commission configuration
    - Test percentage retrieval for all tiers
    - Test default fallback for invalid tier
    - Test admin API for updating rates

- [x] 15. Final integration and testing
  - [x] 15.1 Perform end-to-end testing
    - Test complete flow: referral link → purchase → placement → bonus
    - Test with multiple products simultaneously
    - Test with multi-level upline chains
    - _Requirements: All_
  
  - [x] 15.2 Run all property-based tests
    - Execute all 12 property tests with 100+ iterations
    - Verify all properties pass consistently
    - Fix any failing properties
  
  - [x] 15.3 Perform load testing
    - Test with 1000+ members in binary tree
    - Test with 10+ upline levels
    - Test concurrent purchases from multiple users
    - Measure response times and optimize if needed
  
  - [x] 15.4 Create data migration script
    - Migrate existing members to new schema
    - Initialize product trees for existing purchases
    - Verify data integrity after migration
    - _Requirements: 13.5_
  
  - [ ]* 15.5 Write integration tests
    - Test API endpoints with real database
    - Test dashboard queries with large datasets
    - Test transaction logging across multiple operations

- [x] 16. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- The implementation follows a bottom-up approach: models → services → controllers → API → frontend

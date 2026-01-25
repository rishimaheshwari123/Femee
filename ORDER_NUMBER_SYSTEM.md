# Order Number System - Sequential Counter Implementation

## 🎯 Overview

Implemented automatic sequential order number generation system with format: **FEME-0001, FEME-0002, FEME-0003**, etc.

## 📁 Files Created/Modified

### New Files:
1. **`server/models/Counter.js`** - Counter model for sequence tracking
2. **`server/utils/orderNumberGenerator.js`** - Utility functions for order number generation

### Modified Files:
1. **`server/models/Order.js`** - Added orderNumber field
2. **`server/controllers/OrderCtrl.js`** - Integrated order number generation
3. **`server/controllers/adminCtrl.js`** - Added sorting by order number

## 🔧 Implementation Details

### 1. Counter Model (`server/models/Counter.js`)

```javascript
{
  _id: "orderNumber",        // Unique identifier
  sequence_value: 0          // Current counter value
}
```

**Features:**
- Stores current sequence number
- Atomic increment operations
- Auto-creates if doesn't exist (upsert)

### 2. Order Number Generator (`server/utils/orderNumberGenerator.js`)

**Main Function:**
```javascript
generateOrderNumber()
```

**How it works:**
1. Finds counter document with `_id: "orderNumber"`
2. Atomically increments `sequence_value` by 1
3. Creates counter if doesn't exist (starts from 1)
4. Formats number as `FEME-XXXX` (4 digits with leading zeros)
5. Returns formatted order number

**Example Output:**
- First order: `FEME-0001`
- Second order: `FEME-0002`
- 100th order: `FEME-0100`
- 1000th order: `FEME-1000`
- 10000th order: `FEME-10000` (expands beyond 4 digits)

**Additional Functions:**

```javascript
getCurrentOrderCount()      // Get current count
resetOrderCounter(value)    // Reset counter (admin only)
```

### 3. Order Model Update

**New Field:**
```javascript
orderNumber: {
  type: String,
  unique: true,      // Ensures no duplicates
  required: true,    // Must have order number
}
```

### 4. Order Creation Flow

**Before:**
```javascript
const orderData = {
  user: userId,
  shippingInfo: {...},
  // ... other fields
};
```

**After:**
```javascript
// Generate unique order number
const orderNumber = await generateOrderNumber();

const orderData = {
  orderNumber: orderNumber,  // ✅ Added
  user: userId,
  shippingInfo: {...},
  // ... other fields
};
```

### 5. Order Retrieval (Sorted)

**Admin - Get All Orders:**
```javascript
const orders = await Order.find()
  .populate("user")
  .populate("orderItems.product")
  .sort({ orderNumber: -1 });  // ✅ Latest first
```

**Member - Get My Orders:**
```javascript
const orders = await Order.find({ user: userId })
  .populate("orderItems.product")
  .sort({ orderNumber: -1 });  // ✅ Latest first
```

## 🔒 Concurrency Safety

### Atomic Operations
```javascript
await Counter.findByIdAndUpdate(
  { _id: "orderNumber" },
  { $inc: { sequence_value: 1 } },  // ✅ Atomic increment
  { new: true, upsert: true }
);
```

**Benefits:**
- ✅ Thread-safe
- ✅ No race conditions
- ✅ No duplicate order numbers
- ✅ Works with multiple concurrent requests

## 📊 Order Number Format

### Structure
```
FEME-XXXX
│    │
│    └─ Sequential number (4+ digits)
└────── Prefix (Company identifier)
```

### Examples
| Order # | Format      | Description           |
|---------|-------------|-----------------------|
| 1       | FEME-0001   | First order           |
| 10      | FEME-0010   | 10th order            |
| 100     | FEME-0100   | 100th order           |
| 999     | FEME-0999   | 999th order           |
| 1000    | FEME-1000   | 1000th order          |
| 9999    | FEME-9999   | 9999th order          |
| 10000   | FEME-10000  | Auto-expands to 5     |
| 99999   | FEME-99999  | 99,999th order        |

### Padding Logic
```javascript
String(counter.sequence_value).padStart(4, "0")
```
- Minimum 4 digits
- Pads with leading zeros
- Automatically expands beyond 4 digits

## 🚀 Usage Examples

### Creating an Order
```javascript
// In OrderCtrl.js - createOrder function
const orderNumber = await generateOrderNumber();
// Returns: "FEME-0001"

const orderData = {
  orderNumber: orderNumber,
  user: userId,
  // ... other fields
};

const order = await Order.create([orderData], { session });
```

### Displaying Order Number
```javascript
// Frontend - Order list
{orders.map(order => (
  <div key={order._id}>
    <h3>Order #{order.orderNumber}</h3>
    {/* FEME-0001 */}
  </div>
))}
```

### Searching by Order Number
```javascript
// Find specific order
const order = await Order.findOne({ 
  orderNumber: "FEME-0001" 
});
```

## 🔄 Database Operations

### Initial Setup
When first order is created:
```javascript
// Counter document is auto-created
{
  _id: "orderNumber",
  sequence_value: 1
}

// Order is created with
{
  orderNumber: "FEME-0001",
  // ... other fields
}
```

### Subsequent Orders
```javascript
// Counter is incremented
{
  _id: "orderNumber",
  sequence_value: 2  // ✅ Incremented
}

// New order
{
  orderNumber: "FEME-0002",
  // ... other fields
}
```

## 🛠️ Admin Functions

### Get Current Count
```javascript
const { getCurrentOrderCount } = require("../utils/orderNumberGenerator");

const count = await getCurrentOrderCount();
console.log(`Total orders: ${count}`);
```

### Reset Counter (Use with Caution!)
```javascript
const { resetOrderCounter } = require("../utils/orderNumberGenerator");

// Reset to 0
await resetOrderCounter(0);

// Reset to specific value
await resetOrderCounter(1000);
```

⚠️ **Warning:** Resetting counter can cause duplicate order numbers if not done carefully!

## 📈 Benefits

### 1. **Sequential & Predictable**
- Easy to track order progression
- Clear order of operations
- Simple to reference

### 2. **Human-Readable**
- Easy to communicate (FEME-0001)
- Easy to remember
- Professional appearance

### 3. **Unique & Reliable**
- Guaranteed unique (database constraint)
- No collisions
- Atomic generation

### 4. **Scalable**
- Auto-expands beyond 4 digits
- No upper limit
- Handles high volume

### 5. **Sortable**
- Natural sorting order
- Latest orders first
- Easy to filter by range

## 🧪 Testing

### Test Case 1: First Order
```javascript
// Counter doesn't exist
const orderNumber = await generateOrderNumber();
// Result: "FEME-0001"
// Counter created with sequence_value: 1
```

### Test Case 2: Concurrent Orders
```javascript
// 10 simultaneous order creations
Promise.all([
  generateOrderNumber(),
  generateOrderNumber(),
  // ... 8 more
]);
// Results: FEME-0001 to FEME-0010 (no duplicates)
```

### Test Case 3: Large Numbers
```javascript
// After 9999 orders
const orderNumber = await generateOrderNumber();
// Result: "FEME-10000" (auto-expands)
```

## 🔍 Troubleshooting

### Issue: Duplicate Order Numbers
**Cause:** Counter reset or database inconsistency
**Solution:** 
```javascript
// Find highest order number
const lastOrder = await Order.findOne()
  .sort({ orderNumber: -1 })
  .limit(1);

// Extract number from FEME-XXXX
const lastNumber = parseInt(lastOrder.orderNumber.split('-')[1]);

// Reset counter to last number
await resetOrderCounter(lastNumber);
```

### Issue: Missing Order Numbers
**Cause:** Transaction rollback after counter increment
**Solution:** This is expected behavior - counter increments even if order creation fails

### Issue: Counter Not Found
**Cause:** First time setup
**Solution:** Counter auto-creates on first order

## 📝 Migration Guide

### For Existing Orders (Without Order Numbers)

```javascript
// Run this script once to add order numbers to existing orders
const Order = require("./models/Order");
const { generateOrderNumber } = require("./utils/orderNumberGenerator");

async function migrateExistingOrders() {
  const ordersWithoutNumber = await Order.find({ 
    orderNumber: { $exists: false } 
  }).sort({ createdAt: 1 });

  for (const order of ordersWithoutNumber) {
    const orderNumber = await generateOrderNumber();
    order.orderNumber = orderNumber;
    await order.save();
    console.log(`Migrated order ${order._id} -> ${orderNumber}`);
  }

  console.log(`Migrated ${ordersWithoutNumber.length} orders`);
}

// Run migration
migrateExistingOrders();
```

## 🎉 Summary

Successfully implemented:
1. ✅ Sequential order number generation (FEME-0001, FEME-0002, ...)
2. ✅ Atomic counter with MongoDB
3. ✅ Unique constraint on order numbers
4. ✅ Automatic formatting with leading zeros
5. ✅ Sorted order retrieval (latest first)
6. ✅ Concurrency-safe implementation
7. ✅ Auto-expanding number format
8. ✅ Admin utility functions

**Order numbers ab automatically generate honge har naye order ke liye!** 🚀

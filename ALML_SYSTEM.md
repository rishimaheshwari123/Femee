# 🎯 ALML System - Achievement Level-based Member Logic

## 📋 Overview

ALML (Achievement Level-based Member Logic) is a step-wise reward system integrated with the ROOT-based binary tree structure. Members earn bonuses when their ROOT reaches specific member count milestones.

---

## 🔑 Key Concepts

### 1. **ROOT System**
- Each member can have multiple ROOTs per product
- Each ROOT = 1 sponsor + 2 direct positions (left + right)
- When Level 1 is complete (2 positions filled), new ROOT is created
- Maximum capacity per ROOT: 2 members (excluding ROOT member)

### 2. **ALML Steps**
Each ROOT has 5 achievement steps based on total member count:

| Step | Required Members | Bonus Amount | Description |
|------|-----------------|--------------|-------------|
| 1    | 2               | ₹600         | Level 1 complete |
| 2    | 4               | ₹600         | 4 members in tree |
| 3    | 8               | ₹800         | 8 members in tree |
| 4    | 16              | ₹800         | 16 members in tree |
| 5    | 32              | ₹1600        | ROOT fully complete |

**Total Bonus per ROOT: ₹4400**

### 3. **Claim Rules** ⚠️

**CRITICAL: All-or-Nothing Claim**
- ✅ **Can claim ONLY when ALL 5 steps are complete**
- ❌ **Cannot claim individual steps**
- ❌ **Cannot claim partial progress**
- ✅ **One-time claim of ₹4400 when ROOT has 32 members**

---

## 🔄 Complete Flow

### **Step 1: Order Creation**
```
User places order → Order created → Product purchased
```

### **Step 2: Binary Tree Placement**
```
If first purchase:
  → Create/Get product tree
  → Place in referrer's ROOT
  → Update ROOT member count
```

### **Step 3: ALML Initialization**
```
When ROOT is created:
  → Initialize 5 achievement steps
  → Set all steps to pending
  → Initialize summary (0 complete, ₹4400 pending)
```

### **Step 4: ALML Progress Update**
```
When member joins ROOT:
  → Update currentMembers for all steps
  → Check if any step completed (currentMembers >= requiredMembers)
  → Update summary (completedSteps, canClaim)
  → canClaim = true ONLY when ALL 5 steps complete
```

### **Step 5: Claim Process**
```
User clicks "Claim" button:
  → Validate: All 5 steps must be complete
  → Validate: Not already claimed
  → Credit ₹4400 to wallet
  → Mark all steps as claimed
  → Update summary
```

---

## 🗄️ Database Structure

### **Member Model - ROOT Structure**
```javascript
productBinaryTrees: [{
  productId: ObjectId,
  roots: [{
    rootNumber: Number,
    totalMembers: Number,
    
    // ALML Achievements
    achievements: [{
      step: Number,              // 1-5
      requiredMembers: Number,   // 2, 4, 8, 16, 32
      currentMembers: Number,    // Current count
      bonusAmount: Number,       // 600, 600, 800, 800, 1600
      isComplete: Boolean,       // Step reached?
      completedAt: Date,
      isClaimed: Boolean,        // Claimed?
      claimedAt: Date,
      claimedAmount: Number
    }],
    
    // ALML Summary
    almlSummary: {
      totalSteps: 5,
      completedSteps: Number,    // 0-5
      claimedSteps: Number,      // 0 or 5 (all-or-nothing)
      totalBonusAvailable: 4400,
      totalBonusClaimed: Number, // 0 or 4400
      totalBonusPending: Number, // 4400 or 0
      allStepsComplete: Boolean, // All 5 complete?
      canClaim: Boolean,         // Can claim now?
      lastUpdated: Date
    }
  }]
}]
```

---

## 🔌 API Endpoints

### **1. Get Achievement Chart**
```
GET /api/v1/alml/:memberId/chart/:productId/:rootNumber
```
**Response:**
```json
{
  "success": true,
  "data": {
    "rootNumber": 1,
    "achievements": [
      {
        "step": 1,
        "requiredMembers": 2,
        "currentMembers": 2,
        "bonusAmount": 600,
        "isComplete": true,
        "isClaimed": false
      }
      // ... more steps
    ],
    "summary": {
      "completedSteps": 2,
      "canClaim": false,
      "totalBonusPending": 4400
    }
  }
}
```

### **2. Get All ROOT Achievements**
```
GET /api/v1/alml/:memberId/all/:productId
```

### **3. Claim Achievements**
```
POST /api/v1/alml/:memberId/claim
Body: { productId, rootNumber }
```
**Success Response:**
```json
{
  "success": true,
  "data": {
    "claimedAmount": 4400,
    "newWalletBalance": 10000,
    "message": "Successfully claimed ₹4400 from ROOT 1"
  }
}
```

**Error Response (Not all steps complete):**
```json
{
  "success": false,
  "message": "Cannot claim: All steps must be completed first"
}
```

### **4. Get ALML Summary (Dashboard)**
```
GET /api/v1/alml/:memberId/summary
```

---

## 🎨 Frontend UI Flow

### **Dashboard View**
```
┌─────────────────────────────────────┐
│  My Achievements                    │
├─────────────────────────────────────┤
│  ROOT 1: [View Chart] [Claim ₹4400]│  ← All steps complete
│  ROOT 2: [View Chart] [Locked 🔒]  │  ← Steps incomplete
│  ROOT 3: [View Chart] [Claimed ✓]  │  ← Already claimed
└─────────────────────────────────────┘
```

### **Achievement Chart Modal**
```
┌──────────────────────────────────────────┐
│  ROOT 1 - Achievement Progress           │
├──────────────────────────────────────────┤
│  ✅ Step 1: 2/2 Members   → ₹600         │
│  ✅ Step 2: 4/4 Members   → ₹600         │
│  ✅ Step 3: 8/8 Members   → ₹800         │
│  ✅ Step 4: 16/16 Members → ₹800         │
│  ✅ Step 5: 32/32 Members → ₹1600        │
├──────────────────────────────────────────┤
│  Total Claimable: ₹4400                  │
│  [CLAIM ALL] [Close]                     │
└──────────────────────────────────────────┘
```

**Incomplete State:**
```
┌──────────────────────────────────────────┐
│  ROOT 2 - Achievement Progress           │
├──────────────────────────────────────────┤
│  ✅ Step 1: 2/2 Members   → ₹600         │
│  ✅ Step 2: 4/4 Members   → ₹600         │
│  ⏳ Step 3: 5/8 Members   → ₹800 (62%)   │
│  🔒 Step 4: 0/16 Members  → ₹800 (Locked)│
│  🔒 Step 5: 0/32 Members  → ₹1600 (Locked)│
├──────────────────────────────────────────┤
│  Progress: 2/5 steps complete            │
│  Cannot claim until all steps complete   │
│  [Close]                                 │
└──────────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### **Claim Validation**
1. ✅ All 5 steps MUST be complete
2. ✅ ROOT must have exactly 32 members
3. ✅ Not already claimed
4. ✅ User must be authenticated

### **Error Handling**
- If claim attempted with incomplete steps → Error message
- If already claimed → Show "Already Claimed" status
- If network error → Retry mechanism

### **Performance**
- ALML updates happen asynchronously
- Don't block order placement if ALML update fails
- Log errors for debugging

---

## 🧪 Testing

### **Test Script**
```bash
cd server
node test/testALMLFlow.js
```

### **Manual Testing Steps**
1. Create order with referral link
2. Check if ALML initialized for ROOT
3. Add more members to ROOT
4. Verify step completion
5. When all 5 steps complete, test claim
6. Verify wallet updated

---

## 🔐 Security

1. **Authorization**: Only member can claim their own achievements
2. **Validation**: Server-side validation for all steps complete
3. **Transaction**: Claim uses MongoDB transaction (atomic)
4. **Idempotency**: Cannot claim twice for same ROOT

---

## 📊 Admin Features (Future)

- View all members' ALML status
- Manual adjustment of achievements
- ALML analytics dashboard
- Claim history reports

---

## 🚀 Deployment Checklist

- [ ] Database schema updated
- [ ] ALML service deployed
- [ ] API routes configured
- [ ] Frontend UI integrated
- [ ] Testing completed
- [ ] Documentation updated
- [ ] Admin notified

---

## 📞 Support

For issues or questions:
- Check logs: `server/logs/alml.log`
- Test script: `server/test/testALMLFlow.js`
- Contact: Dev Team

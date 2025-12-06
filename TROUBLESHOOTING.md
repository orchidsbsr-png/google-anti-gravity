# Quick Firestore Check

## If you're having trouble updating inventory:

### 1. Open Browser Console (F12)
Press F12 in your browser and look for these messages:

**Good Signs:**
- ✅ `Inventory snapshot received`
- ✅ `Loaded inventory from Firestore`
- ✅ `Inventory updated successfully!`

**Bad Signs:**
- ❌ `permission-denied`
- ❌ `PERMISSION DENIED: You need to set up Firestore security rules!`

### 2. If You See Permission Errors

You need to enable Firestore! Follow these steps:

1. Go to https://console.firebase.google.com/
2. Select project: **farm-fresh-96c9f**
3. Click **"Firestore Database"** in left menu
4. If it says "Get started" → Click it
5. Choose **"Start in test mode"**
6. Click **"Enable"**

### 3. Test After Enabling

1. Reload your app
2. Go to Admin panel
3. Try changing a stock number
4. Check console - should see ✅ messages

### 4. If Still Not Working

The inputs might be working but you're not seeing updates. Try:
1. Type a number in the stock field
2. Press TAB or click outside the input
3. Check the browser console for success/error messages
4. Refresh the page - does your change persist?

---

**Most Common Issue**: Firestore Database not enabled yet. It's a separate step from Firebase Authentication!

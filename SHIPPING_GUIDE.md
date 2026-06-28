# 🚚 Shipping Management Guide

## आपके Order Shipping के तीन तरीके हैं:

### **1. Admin Panel से Ship करना (सबसे आसान) ✅**

#### **Step 1: Order को Processing में करें**
- Admin panel में order list में जाएं
- Order status को "Processing" में change करें
- यह order को shipping के लिए ready करता है

#### **Step 2: Ship Now Button दबाएं**
- Order list में "Ship Now" button दिखेगा
- इस button को click करें
- Automatically Shiprocket में shipment create हो जाएगा

#### **Step 3: Order Details में Shipping Management**
- Order पर click करके details खोलें
- "Shipping Management" section में:
  - **Update Tracking**: Real-time status update करने के लिए
  - **Generate Label**: Shipping label download करने के लिए
  - **Cancel Shipment**: Shipment cancel करने के लिए

---

### **2. Manual Backend API से Ship करना**

#### **API Endpoints:**

```bash
# Create Shipment
POST /api/shipping/create-shipment/:orderId
Headers: Authorization: Bearer <admin_token>

# Generate Label
POST /api/shipping/generate-label/:orderId
Headers: Authorization: Bearer <admin_token>

# Track Order
GET /api/shipping/order/:orderId
Headers: Authorization: Bearer <admin_token>

# Cancel Shipment
DELETE /api/shipping/cancel-shipment/:orderId
Headers: Authorization: Bearer <admin_token>
```

---

### **3. Shiprocket Panel से Ship करना**

#### **Shiprocket Dashboard में:**
1. https://shiprocket.co/ पर login करें
2. "Orders" section में जाएं
3. आपका order automatically sync हो जाएगा
4. "Ship Now" button से ship करें

---

## 🔄 Automatic Process Flow:

### **जब Order Place होता है:**
```
Order Created → Payment Verified → Shiprocket Order Created → Ready to Ship
```

### **जब Admin Ship करता है:**
```
Ship Now → AWB Generated → Courier Assigned → Tracking Active → Customer Notified
```

---

## 📊 Order Status Mapping:

| Order Status | Shiprocket Status | Description |
|-------------|------------------|-------------|
| Pending | - | Payment pending |
| Processing | NEW | Ready to ship |
| Shipped | PICKED_UP | Package picked up |
| Shipped | IN_TRANSIT | Package in transit |
| Shipped | OUT_FOR_DELIVERY | Out for delivery |
| Delivered | DELIVERED | Package delivered |
| Cancelled | CANCELLED | Order cancelled |

---

## 🎯 Best Practices:

### **For Quick Shipping:**
1. ✅ Order status को "Processing" में रखें
2. ✅ Admin panel से "Ship Now" button use करें
3. ✅ Regular tracking updates check करें

### **For Bulk Orders:**
1. ✅ Bulk update tracking API use करें
2. ✅ Shiprocket dashboard से bulk actions करें
3. ✅ Automated webhooks setup करें

---

## 🚨 Troubleshooting:

### **Ship Now Button नहीं दिख रहा?**
- Order status "Processing" में है?
- Payment status "Paid" है?
- Shipment पहले से create तो नहीं?

### **Tracking Update नहीं हो रहा?**
- AWB code generate हुआ है?
- Courier ने pickup किया है?
- Shiprocket API working है?

### **Label Generate नहीं हो रहा?**
- Shipment create हुआ है?
- AWB code available है?
- Admin permissions हैं?

---

## 📞 Support:

**Technical Issues:**
- Check browser console for errors
- Verify API endpoints are working
- Check Shiprocket API status

**Shipping Issues:**
- Contact Shiprocket support
- Check courier partner status
- Verify pickup address details

---

## 🔧 Configuration:

### **Shiprocket Settings:**
```javascript
// In backend .env file
SHIPROCKET_EMAIL=your_email
SHIPROCKET_PASSWORD=your_password
SHIPROCKET_PICKUP_LOCATION=your_pickup_location
```

### **Default Package Settings:**
```javascript
// In shiprocket.config.js
defaults: {
  weight: 0.5, // kg
  dimensions: {
    length: 10, // cm
    breadth: 10, // cm  
    height: 10 // cm
  }
}
```

---

## ✨ Features Available:

- ✅ **One-click shipping** from admin panel
- ✅ **Real-time tracking** updates
- ✅ **Automatic AWB generation**
- ✅ **Shipping label download**
- ✅ **Customer notifications**
- ✅ **Bulk order management**
- ✅ **Courier partner selection**
- ✅ **Delivery estimation**
- ✅ **Return/RTO handling**
- ✅ **Analytics and reports**

---

**सबसे आसान तरीका: Admin Panel → Order List → Ship Now Button! 🚀**
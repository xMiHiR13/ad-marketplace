# 🚀 Ad Marketplace – Telegram Mini App

A **Telegram Mini App** for managing ad deals between **Advertisers** and **Publishers**.

**Repository:**  
https://github.com/xMiHiR13/ad-marketplace  

**License:** GNU General Public License (GPL)

---

# 📱 Overview

Telegram WebApp interface for the Ad Marketplace system.

## ✨ Features

- Channel listing
- Campaign creation
- Deal lifecycle tracking
- Timeline-based progress UI

---

# 🗂 Pages

## 🏪 Market
- Browse channels and campaigns
- Apply specific filters
- View channel or campaign details
- Start a new deal by applying on campaign or channel

## 👤 Profile
- Basic profile stats
- Manage your channels
- Manage your campaigns
- List new channel or create new campaign
- Manage wallet and view payment history

## 🤝 Deals
- Active & completed deals
- Detailed deal view
- Status badge
- Timeline tracking

---

# 🔄 Deal Lifecycle

### 1️⃣ Negotiation
`negotiating`  
`price_proposed`  

Price discussion between advertiser and publisher.

---

### 2️⃣ Ad Submission
`awaiting_ad_submission`  

Advertiser submits ad creative.

---

### 3️⃣ Review
`ad_under_review`  
`ad_rejected`  

Publisher reviews and approves or rejects the ad.

---

### 4️⃣ Payment
`awaiting_payment`  

Advertiser completes TON payment to escrow.

---

### 5️⃣ Posting
`scheduled`  
`posted`  

Ad is scheduled and will be automatically published.

---

### 6️⃣ Verification
`verified`  

Post verified successfully.

---

### 7️⃣ Terminal
`completed`  
`posting_failed`  
`refunded_edit`  
`refunded_delete`  
`cancelled`  

Deal is finalized, failed, refunded, or cancelled.

---

# 📊 Timeline

## Steps

1. Negotiation  
2. Ad Submit  
3. Review  
4. Payment  
5. Posting  
6. Verification  

---

# ⚙️ Environment Variables

Create a `.env.local` file in the root directory.

---

## 🔑 Telegram

| Variable | Description |
|----------|------------|
| `TG_API_ID` | Telegram API ID |
| `TG_API_HASH` | Telegram API Hash |
| `BOT_TOKEN` | Bot token from @BotFather |
| `USER_SESSION_STRING` | GramJS StringSession value for user authentication |

---

## 🗄 Database

| Variable | Description |
|----------|------------|
| `MONGODB_URI` | MongoDB connection string |
| `DATABASE_NAME` | Database name (default: `TgAdMarketplace`) |

---

## 🔐 Authentication

| Variable | Description |
|----------|------------|
| `JWT_SECRET` | JWT signing secret |
| `PYTHON_APP_SECRET` | Backend internal auth secret |

---

## 🌐 Public App Config

| Variable | Description |
|----------|------------|
| `NEXT_PUBLIC_DOMAIN` | Public Mini App domain (HTTPS required) |
| `NEXT_PUBLIC_BOT_USERNAME` | Telegram bot username |
| `NEXT_PUBLIC_SUPPORT_CHAT` | Support chat username |

---

## 🖼 Media Upload

| Variable | Description |
|----------|------------|
| `IMGBB_API_KEY` | Image upload API key |

---

## 💎 TON

| Variable | Description |
|----------|------------|
| `ESCROW_ADDRESS` | TON escrow wallet address |
| `TONAPI_KEY` | TON API key for transaction verification |

---

# 🔑 Generating GramJS Session String

This project uses **GramJS StringSession** for Telegram user authentication.

## Script Location

```
scripts/generateUserSession.ts
```

## Run

```bash
npx ts-node scripts/generateUserSession.ts
```

---

# 🛠 Installation & Setup

## 1️⃣ Clone the Repository

```bash
git clone https://github.com/xMiHiR13/ad-marketplace.git
cd ad-marketplace
```

---

## 2️⃣ Install Dependencies

```bash
npm install
```

Or:

```bash
yarn install
# or
pnpm install
# or
bun install
```

---

## 3️⃣ Configure Environment Variables

Create a `.env.local` file and add all required environment variables listed above.

---

## 4️⃣ Run the Development Server

```bash
npm run dev
```

Or:

```bash
yarn dev
# or
pnpm dev
# or
bun dev
```

---

## 5️⃣ Open in Browser

Visit:

```
http://localhost:3000
```

The page auto-updates when you edit files such as:

```
app/page.tsx
```

---

# 📚 Learn More

- https://nextjs.org/docs
- https://nextjs.org/learn
- https://github.com/vercel/next.js

Feedback and contributions are welcome!

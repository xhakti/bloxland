1. **All available routes** (user + partner + service)
2. **Method + Path**
3. **Request body / params / query** (based on the services you showed)
4. **Sample response (success + error)**
5. **Unified format (data, message, error)** — since all services follow that

Here’s an updated **README.md** that covers **every route your services support** 👇

---

# 🚀 Quest API v2

Express.js + TypeScript backend powering **Users, Partners, Social Quests, Rewards, and Submissions**.

---

## 📦 Features

- User registration, profile update, leaderboard
- Quest creation, submission, winner assignment
- Reward claiming & tracking
- Partner APIs with access control
- Pagination for list endpoints
- Unified JSON response format

---

## ⚙️ Setup

```bash
git clone https://github.com/your-org/quest-api.git
cd quest-api
npm install
cp .env.example .env
npm run dev
```

**Server:** <http://localhost:3000>

---

## 🛠️ API Documentation

### ✅ Service Routes

#### Health Check

**GET** `/health`

**Response:**

```json
{ "status": "ok" }
```

---

### 👤 User Routes

Base path: `/user`

---

#### Register User

**POST** `/user/register`

**Body:**

```json
{
  "address": "0x123",
  "username": "alice",
  "email": "alice@example.com"
}
```

**Response:**

```json
{
  "data": {
    "user": { "id": "u1", "username": "alice" },
    "referrerRewardGranted": true
  },
  "message": "User created successfully",
  "error": null
}
```

---

#### Get User by ID

**GET** `/user/:id`

**Response:**

```json
{
  "data": { "id": "u1", "username": "alice" },
  "message": "User fetched successfully",
  "error": null
}
```

#### Get User by Address

**GET** `/user/:address`

**Response:**

```json
{
  "data": {
    /* user object */
  },
  "message": "User retrieved successfully",
  "error": null
}
```

---

#### Update User

**PUT** `/user/:address`

**Body:**

```json
{ "username": "alice_updated", "email": "alice_updated@example.com" }
```

**Response:**

```json
{
  "data": { "id": "u1", "username": "alice_updated" },
  "message": "User updated successfully",
  "error": null
}
```

---

#### Leaderboard

**GET** `/user/leaderboard?page={page}&limit={limit}`

**Response:**

```json
{
  "data": {
    "users": [{ "id": "u1", "points": 500 }],
    "pagination": { "page": 1, "limit": 10, "totalCount": 50, "totalPages": 5 }
  },
  "message": "Leaderboard fetched successfully",
  "error": null
}
```

---

#### Submit Quest

**POST** `/user/submit-quest/:questId`

**Body:**

```json
{ "userAddress": "0x123", "submissionLink": "https://example-twitter.com/post" }
```

**Response:**

```json
{
  "data": {
    "questId": "q1",
    "submissionLink": "https://example-twitter.com/post"
  },
  "message": "Quest submission created successfully",
  "error": null
}
```

---

#### Add Claimed Rewards

**POST** `/user/add-claimed-rewards`

**Body:**

```json
{
  "userAddress": "0x123",
  "tokenAddress": "0xTOKEN",
  "tokenSymbol": "TKN",
  "tokenAmount": "100",
  "eventType": "SOCIAL_QUEST"
}
```

**Response:**

```json
{
  "data": { "id": "r1", "tokenSymbol": "TKN", "tokenAmount": "100" },
  "message": "Reward added successfully",
  "error": null
}
```

---

### 🤝 Partner Routes

Base path: `/partner`

---

#### Create Social Quest

**POST** `/partner/add-social-quest`

**Body:**

```json
{
  "partnerAddress": "0xPARTNER",
  "rewardToken": "0xTOKEN",
  "rewardAmount": "100",
  "rewardSymbol": "TKN",
  "questLocation": "twitter",
  "energyToBeBurned": "10",
  "questName": "Follow Project",
  "questDescription": "Follow us on Twitter",
  "partnerName": "Partner Inc"
}
```

**Response:**

```json
{
  "data": { "questId": "q1", "questName": "Follow Project" },
  "message": "Social quest created successfully",
  "error": null
}
```

---

#### Get Partner Quests

**GET** `/partner/quests/:partnerAddress?page={page}&limit={limit}`

**Response:**

```json
{
  "data": {
    "quests": [{ "questId": "q1", "questName": "Follow Project" }],
    "pagination": { "page": 1, "limit": 10, "totalPages": 2 }
  },
  "message": "Partner quests fetched successfully",
  "error": null
}
```

---

#### Get Quest Submissions

GET /partner/submissions/:questId?page&limit&partnerAddress=0xPARTNER

Response

```

```

# InstaLite

A minimal Instagram-like REST API built with Express and Prisma.

## Setup

```bash
npm install
```

Create a `.env` file:

```
DATABASE_URL="postgres://taranveersingh@localhost:5432/instalite"
```

Run migrations and seed:

```bash
npx prisma migrate dev
npx prisma generate
npm run seed
```

Start the server:

```bash
npm start
```

Server runs on `http://localhost:3000`.

## Endpoints

### Users

| Method   | Route                      | Description              |
| -------- | -------------------------- | ------------------------ |
| POST     | /users                     | Create a user            |
| GET      | /users                     | List users (paginated)   |
| GET      | /users/:id                 | Get one user             |
| PATCH    | /users/:id                 | Update a user            |
| DELETE   | /users/:id                 | Delete a user            |
| GET      | /users/:id/posts           | Get user's posts         |
| GET      | /users/:id/liked-posts     | Get posts user has liked |

### Posts

| Method   | Route                      | Description          |
| -------- | -------------------------- | -------------------- |
| POST     | /posts                     | Create a post        |
| GET      | /posts                     | List posts (paginated)|
| GET      | /posts/:id                 | Get one post         |
| PATCH    | /posts/:id                 | Update a post        |
| DELETE   | /posts/:id                 | Delete a post        |
| GET      | /posts/:id/likes           | Who liked this post  |
| POST     | /posts/:id/likes           | Like a post          |
| DELETE   | /posts/:id/likes/:userId   | Unlike a post        |

### Query Parameters

**Pagination** (all list endpoints): `page`, `limit` (max 50)

**Sorting:**
- Users: `sortBy` (createdAt, username, fullname), `order` (asc, desc)
- Posts: `sortBy` (createdAt, updatedAt, likes), `order` (asc, desc)

**Filtering:**
- Users: `isPrivate`, `search`, `hasPosts`
- Posts: `location`, `search`, `from`, `to`

## Tech Stack

- Node.js
- Express
- PostgreSQL
- Prisma 7


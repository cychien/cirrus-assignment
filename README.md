# Cirrus Assignment

[Demo](https://cirrus-hw.fly.dev/login)

Admin account: `admin@eureka.co` / `admin12345`  
Employee account: `employee@eureka.co` / `employee12345`

## System Overview

An internal company management system focusing on people management and performance review feedback features.

### Role-Based Access Control

The system defines two roles: `admin` and `employee`. Each role corresponds to a set of permissions used to validate requests for viewing and making changes.

### Registration and Login

Supports user registration and login. Newly registered users are assigned the `employee` role by default.

### People Management

Admins can add, update, or delete employees. Newly added employees are automatically assigned the `employee` role.

### Performance Reviews Management

Admins can create performance reviews for employees, edit these reviews, and assign other employees to provide feedback.

### Review Requests Management

Employees can provide feedback on performance reviews assigned to them by Admins. Employees can view the reviews they have been assigned and their own feedback. However, feedback from other employees remains hidden.

## Tech Stack

### Frontend & Backend

**Remix + Server-side Rendering**  
- Considering there is no need for supporting multi-platform, colocating frontend and backend is faster for development.
- Leverages Remix's `react-router` nested routes to reduce fetch waterfalls, allowing parallel data fetching on the server side.
- Supports progressive enhancement, ensuring core functionality even in poor network conditions.
- Server-side Rendering reduces JavaScript load, achieving faster FCP (First Contentful Paint) and TTI (Time To Interactive).

The `<AutoComplete />` component demonstrates communication via RESTful APIs, typically used for pages requiring real-time updates. Depending on update frequency, `react-query` or WebSocket can be used. Advantages of `react-query` include:
- Built-in app-wide memory cache to avoid redundant fetches.
- Deduplication of same requests at a time , reducing server load.

`react-query` integrates seamlessly with Server-side Rendering, enabling server-side data to populate the memory cache during React hydration for a better user experience.

### Database

**PostgreSQL (via Supabase)**  
- Relational Database chosen due to low-frequency writes and modest data storage needs.
- ACID compliance ensures data consistency and prevents concurrency issues (lock).
- I assumed the user base would initially be small and that we wouldn't need a distributed system to handle high availability. If scaling becomes necessary, we can integrate database replicas and explore distributed deployments.

**Prisma**  
- Acts as an ORM, enabling flexibility in case of database changes without altering application code.
- Includes migration tools for schema version control.

### Auth

**Cookie Session + CSRF**  
- Stateless session management since there is no requirement for the server to actively log users out.

### Types

**TypeScript + Zod**  
- TypeScript enables static type checking.
- Zod validates and enforces types on external data, such as form data, API responses, or environment variables.

### Styling

**tailwindcss**  
- Enables fast UI development.

### Deployment

**fly.io**  
- Supports distributed deployments and edge computing to reduce latency.
- Dockerfile-based deployments allow seamless integration with additional services.

## Relational Database Schema

![CleanShot 2025-01-12 at 19 28 37@2x](https://github.com/user-attachments/assets/87acacfb-c2b3-402c-9a7a-766f6317a267)

- A User owns one Performance Review (one-to-one).  
- A User can write multiple Performance Reviews (one-to-many).  
- A User can provide feedback on multiple Performance Reviews, and each Performance Review can receive feedback from multiple Users (many-to-many). So ther is a `Assignment` table links `User ID` and `Performance Review ID`.  
- `Assignment` links to a `Feedback` table (one-to-one).

## Run Application Locally

### Steps

1. Rename the `prisma-for-sqlite` folder to `prisma` and replace the existing `prisma` folder.

2. Rename `.env.example` to `.env`.

3. Run database migration & seed:
   ```bash
   npx prisma migrate dev
   ```

4. Start the application
    ```bash
    yarn dev
    ```

5. Access the application:
   - `http://localhost:5173`

6. Login Credentials for Testing:
   - Admin: `admin@eureka.co` / `admin12345`

# Student Progress Tracker

## Local setup

1. Copy `.env.example` to `.env` and fill in your Atlas connection string.
2. Set the database user and Atlas IP whitelist in MongoDB Atlas.
3. Ensure the database is `api_marketplace`.
4. Run the seed script:
   - Windows: `seed.bat`
   - macOS/Linux: `./seed.sh`
5. Start the backend:
   - `./mvnw spring-boot:run`
6. Start the frontend:
   - `cd frontend && npm install && npm run dev`

## Required environment variables

Create a root `.env` file with values like:

```dotenv
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.<cluster>.mongodb.net/api_marketplace?retryWrites=true&w=majority
MONGODB_DATABASE=api_marketplace
JWT_SECRET=replace-with-a-secure-secret
SMTP_USERNAME=your-email@example.com
SMTP_PASSWORD=your-app-password
```

Do not commit real credentials. Use your own Atlas database user and allow your machine's IP in Atlas Network Access.
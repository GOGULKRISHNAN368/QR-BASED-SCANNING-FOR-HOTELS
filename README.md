# MenuMagic Dashboard

A modern full-stack web dashboard for menu and order management, connected to MongoDB Atlas.

## Getting Started

Follow these steps to run the application on your machine.

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (Version 18 or above)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster (already configured in `.env`)

### 2. Installation
Normally, you only need to do this once:
```bash
# In the root folder (frontend)
npm install

# In the backend folder
cd backend
npm install
cd ..
```

### 3. Environment Setup
Check the `.env` file in the root and ensure the `MONGODB_URI` is present.
(Current URI is: `mongodb+srv://storeorder:admin123@cluster0.gzmuwmk.mongodb.net/menumagic`)

### 4. Running the Backend
In one terminal, run:
```bash
npm run start:backend
```
Wait for: `✅ MongoDB Atlas Connected`.

### 5. Running the Frontend
In another terminal, run:
```bash
npm run dev
```
Open [http://localhost:8080](http://localhost:8080) in your browser.

---

## Common Issues & Troubleshooting

- **Port 5000 already in use**: If the backend fails to start, kill all previous node processes.
- **Connection Error**: Check your internet connection for MongoDB Atlas access.
- **Empty Menu**: Run `node backend/seed.js` to populate sample dishes into Atlas.

## License
MIT

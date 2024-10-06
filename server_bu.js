require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json()); // for parsing application/json

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected");
  })
  .catch(err => {
    console.error("MongoDB connection error:", err);
  });


// Example API endpoint
app.get('/api/cards', (req, res) => {
  res.json({ message: "Get all cards" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

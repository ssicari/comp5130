require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log("MongoDB connected");
})
.catch(err => {
  console.error("MongoDB connection error:", err);
});

// API endpoint to search for cards
app.get('/api/cards', async (req, res) => {
  const { search } = req.query; // Get the search term from the query

  try {
    const response = await axios.get('https://api.magicthegathering.io/v1/cards', {
      params: { name: search } // Query the API with the search term
    });
    
    if (response.data.cards.length > 0) {
      res.json(response.data); // Return the cards found
    } else {
      res.status(404).json({ message: 'Card not found' }); // No cards found
    }
  } catch (error) {
    console.error("Error fetching cards:", error);
    res.status(500).json({ error: 'Failed to fetch cards' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

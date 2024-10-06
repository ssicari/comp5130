import React, { useState } from 'react';

function App() {
  const [cardName, setCardName] = useState('');
  const [cardData, setCardData] = useState(null);

  const fetchCard = async () => {
    const response = await fetch(`https://api.magicthegathering.io/v1/cards?name=${cardName}`);
    const data = await response.json();
    setCardData(data.cards[0]); // Assuming you want the first card that matches
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCard();
  };

  return (
    <div className="App">
      <h1>Magic: The Gathering Card Search</h1>
      <form onSubmit={handleSearch}>
        <input
          type="text"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="Enter card name"
        />
        <button type="submit">Search</button>
      </form>
      {cardData && (
        <div>
          <h2>{cardData.name}</h2>
          <img src={cardData.imageUrl} alt={cardData.name} />
          <p>{cardData.text}</p>
        </div>
      )}
    </div>
  );
}

export default App;


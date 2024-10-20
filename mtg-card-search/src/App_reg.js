import React, { useEffect, useState } from 'react';
import './styles.css';

// Importing color symbols
import whiteSymbol from './white.png';
import blueSymbol from './blue.png';
import blackSymbol from './black.png';
import redSymbol from './red.png';
import greenSymbol from './green.png';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cards, setCards] = useState([]);
  const [error, setError] = useState('');
  const [isSubmenuOpen, setSubmenuOpen] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const fetchCards = async () => {
    if (searchTerm.trim() === '') {
      setCards([]);
      setError('');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/cards?search=${searchTerm}`);
      const data = await response.json();

      if (!data.cards || data.cards.length === 0) {
        setError('Card not found');
        setCards([]);
      } else {
        const filteredCards = data.cards.filter(card => card.imageUrl);
        setCards(filteredCards);
        setError('');
      }
    } catch (error) {
      console.error('Error fetching cards:', error);
      setError('An error occurred. Please try again.');
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = () => {
    fetchCards();
    setSubmenuOpen(true);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleEscKey = (e) => {
    if (e.key === 'Escape') {
      setSubmenuOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  // Registration logic
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      setMessage(data.message || 'Registration successful!');
    } catch (error) {
      console.error('Registration error:', error);
      setMessage('Registration failed. Please try again.');
    }
  };

  return (
    <div className="app">
      <h1>Magic: The Gathering Cards</h1>
      <div className="color-symbols-container">
        <div className="color-symbols">
          <img src={whiteSymbol} alt="White" />
          <img src={blueSymbol} alt="Blue" />
          <img src={blackSymbol} alt="Black" />
          <img src={redSymbol} alt="Red" />
          <img src={greenSymbol} alt="Green" />
        </div>
        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyPress={handleKeyPress}
            placeholder="Search for a card..."
            className="search-input"
          />
          <button onClick={handleSearch} className="search-button">Search</button>
        </div>
        <div className="color-symbols">
          <img src={whiteSymbol} alt="White" />
          <img src={blueSymbol} alt="Blue" />
          <img src={blackSymbol} alt="Black" />
          <img src={redSymbol} alt="Red" />
          <img src={greenSymbol} alt="Green" />
        </div>
      </div>

      {isSubmenuOpen && (
        <div className="results-container">
          {error && <p className="error">{error}</p>}
          <ul>
            {cards.map(card => (
              <li key={card.id} className="card">
                <h2>{card.name}</h2>
                <img src={card.imageUrl} alt={card.name} />
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="registration-container">
        <h2>Register</h2>
        <form onSubmit={handleRegister}>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            required
          />
          <button type="submit">Register</button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import './styles.css';
import whiteSymbol from './white.png';
import blueSymbol from './blue.png';
import blackSymbol from './black.png';
import redSymbol from './red.png';
import greenSymbol from './green.png';

function App() {
    const [searchTerm, setSearchTerm] = useState('');
    const [cards, setCards] = useState([]);
    const [error, setError] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [color, setColor] = useState('');
    const [rarity, setRarity] = useState('');
    const [creatureType, setCreatureType] = useState('');
    const [keywords, setKeywords] = useState('');
    const [showOwned, setShowOwned] = useState(false);
    const [showGood, setShowGood] = useState(false);
    const [showBad, setShowBad] = useState(false);
    const [ownedCardIds, setOwnedCardIds] = useState([]);
    const [goodCardIds, setGoodCardIds] = useState([]);
    const [badCardIds, setBadCardIds] = useState([]);
    const userId = '67560c1d6ecf8faf1ab75e4d';
    const navigate = useNavigate();

    const fetchCards = async () => {
      try {
          // Check if no search term or filters are provided
          const noFilters =
              !searchTerm.trim() && !color && !rarity && !creatureType && !keywords;
  
          // Build query parameters based on available filters
          const query = new URLSearchParams({
              search: searchTerm.trim() || '', // Include search term if provided
              color: color || '',              // Include color if selected
              rarity: rarity || '',            // Include rarity if selected
              creatureType: creatureType || '',// Include creature type if specified
              keywords: keywords || '',        // Include keywords if specified
              userId,                          // Include user ID for owned cards
              fetchAll: noFilters ? 'true' : 'false', // Fetch all cards if no filters/search
          });
  
          console.log(`Query sent to backend: ${query.toString()}`);
  
          // Fetch cards from the backend
          const response = await fetch(`http://localhost:5000/api/cards?${query}`);
          const data = await response.json();
  
          // Handle response data
          if (!data.cards || data.cards.length === 0) {
              setError('No cards found');
              setCards([]);
          } else {
              setCards(data.cards.filter((card) => card.imageUrl)); // Filter out cards with no images
              setError('');
          }
      } catch (error) {
          console.error('Error fetching cards:', error);
          setError('An error occurred. Please try again.');
      }
  };
  

    const fetchOwnedCards = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/cards/owned?userId=${userId}`);
            const data = await response.json();
            console.log('Owned cards fetched from backend:', data.ownedCardIds);
            setOwnedCardIds(data.ownedCardIds || []);
        } catch (error) {
            console.error('Error fetching owned cards:', error);
        }
    };

    const fetchGoodAndBadCards = async () => {
        try {
            const response = await fetch(`http://localhost:5000/api/cards/ratings?userId=${userId}`);
            const data = await response.json();
            console.log('Good and bad cards fetched from backend:', data);
            setGoodCardIds(data.goodCardIds || []);
            setBadCardIds(data.badCardIds || []);
        } catch (error) {
            console.error('Error fetching good and bad cards:', error);
        }
    };

    useEffect(() => {
        fetchOwnedCards();
        fetchGoodAndBadCards();
    }, []);

    const markAsOwned = async (cardId) => {
        try {
            const response = await fetch('http://localhost:5000/api/cards/own', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, cardId }),
            });
            const data = await response.json();
            console.log(data.message);
            fetchOwnedCards();
        } catch (error) {
            console.error('Error marking card as owned:', error);
        }
    };

    const markAsUnowned = async (cardId) => {
        try {
            const response = await fetch('http://localhost:5000/api/cards/unown', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, cardId }),
            });
            const data = await response.json();
            console.log(data.message);
            fetchOwnedCards();
        } catch (error) {
            console.error('Error unmarking card as owned:', error);
        }
    };

    const markAsGood = async (cardId) => {
      try {
          // Check if the card is already marked as good
          if (goodCardIds.includes(cardId)) {
              // Unmark as good
              const response = await fetch('http://localhost:5000/api/cards/unmark-good', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, cardId }),
              });
              const data = await response.json();
              console.log(data.message);
  
              // Remove from goodCardIds
              setGoodCardIds((prev) => prev.filter((id) => id !== cardId));
          } else {
              // Mark as good
              const response = await fetch('http://localhost:5000/api/cards/thumbs-up', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ userId, cardId }),
              });
              const data = await response.json();
              console.log(data.message);
  
              // Add to goodCardIds and ensure it's removed from badCardIds
              setGoodCardIds((prev) => [...prev, cardId]);
              setBadCardIds((prev) => prev.filter((id) => id !== cardId));
          }
      } catch (error) {
          console.error('Error toggling good status:', error);
      }
  };
  
  
  
  const markAsBad = async (cardId) => {
    try {
        // Check if the card is already marked as bad
        if (badCardIds.includes(cardId)) {
            // Unmark as bad
            const response = await fetch('http://localhost:5000/api/cards/unmark-bad', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, cardId }),
            });
            const data = await response.json();
            console.log(data.message);

            // Remove from badCardIds
            setBadCardIds((prev) => prev.filter((id) => id !== cardId));
        } else {
            // Mark as bad
            const response = await fetch('http://localhost:5000/api/cards/thumbs-down', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, cardId }),
            });
            const data = await response.json();
            console.log(data.message);

            // Add to badCardIds and ensure it's removed from goodCardIds
            setBadCardIds((prev) => [...prev, cardId]);
            setGoodCardIds((prev) => prev.filter((id) => id !== cardId));
        }
    } catch (error) {
        console.error('Error toggling bad status:', error);
    }
};


  

    const handleRegister = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            setMessage(data.message || 'Registration successful');
            if (response.ok) {
              navigate('/login'); // Redirect to login page after successful registration
          }
        } catch (error) {
            console.error('Error during registration:', error);
            setMessage('Registration failed. Please try again.');
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });
            const data = await response.json();
            if (data.token) {
                localStorage.setItem('token', data.token);
                setToken(data.token);
                setMessage('Login successful');
                navigate('/');
            } else {
                setMessage(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Error during login:', error);
            setMessage('Login failed. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        setMessage('Logged out successfully');
    };

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') fetchCards();
        else if (e.key === 'Escape') {
            setSearchTerm('');
            setCards([]);
            setError('');
        }
    };

    const handleClearFilters = () => {
      setSearchTerm('');
      setColor('');
      setRarity('');
      setCreatureType('');
      setKeywords('');
      setCards([]);
      setError('');
      };

    const filteredCards = cards
        .filter(card => !showOwned || ownedCardIds.includes(card.id))
        .filter(card => !showGood || goodCardIds.includes(card.id))
        .filter(card => !showBad || badCardIds.includes(card.id));

      

        return (
          <div className="app">
              <h1 className="app-title">Magic: The Gathering Cards</h1>
              <div className="color-symbols-container">
                  <div className="color-symbols">
                      <img src={whiteSymbol} alt="White" />
                      <img src={blueSymbol} alt="Blue" />
                      <img src={blackSymbol} alt="Black" />
                      <img src={redSymbol} alt="Red" />
                      <img src={greenSymbol} alt="Green" />
                  </div>
                  {/* Conditionally display search bar and filters if token exists */}
                  {token && (
                    <div className="search-container">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for a card..."
                        className="search-input"
                      />
                      <div className="filters">
                        <select onChange={(e) => setColor(e.target.value)} value={color}>
                          <option value="">Any Color</option>
                          <option value="Red">Red</option>
                          <option value="Blue">Blue</option>
                          <option value="Green">Green</option>
                          <option value="White">White</option>
                          <option value="Black">Black</option>
                        </select>
                        <select onChange={(e) => setRarity(e.target.value)} value={rarity}>
                          <option value="">Any Rarity</option>
                          <option value="Common">Common</option>
                          <option value="Uncommon">Uncommon</option>
                          <option value="Rare">Rare</option>
                          <option value="Mythic Rare">Mythic Rare</option>
                        </select>
                        <input
                          type="text"
                          placeholder="Creature Type (e.g., Dragon)"
                          value={creatureType}
                          onChange={(e) => setCreatureType(e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="Keywords (e.g., Haste, Flying)"
                          value={keywords}
                          onChange={(e) => setKeywords(e.target.value)}
                        />
                        <button onClick={handleClearFilters} className="clear-button">
                          Clear Filters
                        </button>
                      </div>
                      <button onClick={fetchCards} className="search-button">Search</button>
                    </div>
                  )}
              </div>
              {token && (
              <div className="toggle-container">
                  <button onClick={() => { setShowOwned(!showOwned); setShowGood(false); setShowBad(false); }} className="toggle-button">
                      {showOwned ? 'Show All Cards' : 'Show Owned Cards'}
                  </button>
                  <button onClick={() => { setShowGood(!showGood); setShowOwned(false); setShowBad(false); }} className="toggle-button">
                      {showGood ? 'Show All Cards' : 'Show Good Cards'}
                  </button>
                  <button onClick={() => { setShowBad(!showBad); setShowOwned(false); setShowGood(false); }} className="toggle-button">
                      {showBad ? 'Show All Cards' : 'Show Bad Cards'}
                  </button>
              </div>
              )}
              <div className="results-container">
                  {error && <p className="error">{error}</p>}
                  <ul>
                      {filteredCards.map(card => (
                          <li key={card.id} className="card">
                              <h2>{card.name}</h2>
                              <div className="card-buttons">
                                  <div className="ownership-buttons">
                                      <button onClick={() => markAsOwned(card.id)} className="own-button">Mark as Owned</button>
                                      <button onClick={() => markAsUnowned(card.id)} className="unown-button">Unmark as Owned</button>
                                  </div>
                                  <div className="rating-buttons">
                                      <button onClick={() => markAsGood(card.id)} className="good-button">👍</button>
                                      <button onClick={() => markAsBad(card.id)} className="bad-button">👎</button>
                                  </div>
                              </div>
                              <img src={card.imageUrl} alt={card.name} />
                          </li>
                      ))}
                  </ul>
              </div>
              <Routes>
                  <Route path="/register" element={
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
                  } />
                  <Route path="/login" element={
                      <div className="login-container">
                          <h2>Login</h2>
                          <form onSubmit={handleLogin}>
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
                              <button type="submit">Login</button>
                          </form>
                          {message && <p>{message}</p>}
                      </div>
                  } />
                  <Route path="/" element={token ? (
                      <>
                          <button onClick={handleLogout} className="logout-button">Logout</button>
                      </>
                  ) : (
                      <Navigate to="/login" />
                  )} />
              </Routes>
          </div>
      );
      
}

export default App;

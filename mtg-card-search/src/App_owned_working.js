import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
    const [ownedCardIds, setOwnedCardIds] = useState([]);
    const userId = '67560c1d6ecf8faf1ab75e4d'; // Replace with the logic to retrieve the logged-in user's ID

    const fetchCards = async () => {
        if (!searchTerm.trim() && !color && !rarity && !creatureType && !keywords) {
            setCards([]);
            setError('');
            return;
        }

        try {
            const query = new URLSearchParams({
                search: searchTerm,
                color,
                rarity,
                creatureType,
                keywords,
                owned: showOwned ? 'true' : '',
                userId,
            });

            console.log(`Query sent to backend: ${query.toString()}`);

            const response = await fetch(`http://localhost:5000/api/cards?${query}`);
            const data = await response.json();

            if (!data.cards || data.cards.length === 0) {
                setError('No cards found');
                setCards([]);
            } else {
                setCards(data.cards.filter(card => card.imageUrl));
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

    useEffect(() => {
        fetchOwnedCards();
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

    const handleSearchChange = (e) => setSearchTerm(e.target.value);
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') fetchCards();
        else if (e.key === 'Escape') {
            setSearchTerm('');
            setCards([]);
            setError('');
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
            setMessage(data.message || 'Registration successful!');
        } catch (error) {
            console.error('Registration error:', error);
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
                setMessage('Login successful!');
            } else {
                setMessage(data.message || 'Login failed. Please try again.');
            }
        } catch (error) {
            console.error('Login error:', error);
            setMessage('Login failed. Please try again.');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        setToken('');
        setMessage('Logged out successfully.');
    };

    const filteredCards = showOwned ? cards.filter(card => ownedCardIds.includes(card.id)) : cards;

    return (
        <Router>
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
                        </div>
                        <button onClick={fetchCards} className="search-button">Search</button>
                    </div>
                </div>
                <button onClick={() => setShowOwned(!showOwned)} className="toggle-button">
                    {showOwned ? 'Show All Cards' : 'Show Owned Cards'}
                </button>
                <div className="results-container">
                    {error && <p className="error">{error}</p>}
                    <ul>
                        {filteredCards.map(card => (
                            <li key={card.id} className="card">
                                <h2>{card.name}</h2>
                                <div className="card-buttons">
                                    <button onClick={() => markAsOwned(card.id)}>Mark as Owned</button>
                                    <button onClick={() => markAsUnowned(card.id)}>Unmark as Owned</button>
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
        </Router>
    );
}

export default App;

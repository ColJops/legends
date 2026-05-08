import { useEffect, useState } from 'react';
import api from './services/api';
import './App.css';

function App() {
    const [message, setMessage] = useState('Łączenie z backendem...');
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/test')
            .then((response) => setMessage(response.data))
            .catch(() => {
                setError('Nie udało się połączyć z backendem. Sprawdź, czy Spring Boot działa na porcie 8080.');
            });
    }, []);

    return (
        <main className="app">
            <section className="hero-card">
                <img src="/favicon.svg" alt="Legendy" className="hero-icon" />
                <p className="eyebrow">Aplikacja Legendy</p>
                <h1>Regionalne mity i legendy</h1>
                <p className="subtitle">
                    Startowy projekt full-stack: Spring Boot API + React/Vite frontend.
                </p>

                {error ? (
                    <p className="status error">{error}</p>
                ) : (
                    <p className="status success">{message}</p>
                )}
            </section>
        </main>
    );
}

export default App;
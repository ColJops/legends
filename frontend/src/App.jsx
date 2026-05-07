import { useEffect, useState } from 'react'
import './App.css'

function App() {

  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:8080/api/test")
        .then(res => res.text())
        .then(data => {
          console.log(data);
          setMessage(data);
        });
  }, []);

  return (
      <div>
        <h1>React działa 🚀</h1>
        <h2>{message}</h2>
      </div>
  );
}

export default App;
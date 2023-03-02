import './App.css'
import { Link, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import Match from './components/Match';

function App() {
    return (
        <div className="App">
            <nav>
                <div className="menu">
                  <Link to="/">Home</Link>
                  <Link to="/match">Match</Link>
                </div>
            </nav>
            <Routes>
              <Route path="/match" element={<Match/>}/>
              <Route path="/" element={<Home/>}/>
            </Routes>
        </div>
    )
}

export default App

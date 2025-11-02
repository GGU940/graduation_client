import './css/common.css'
import { Routes, Route } from "react-router-dom";
//components
import TotalPage from "./pages/TotalPage";
import InitialPage from './pages/InitialPage';
import NewPlayPage from './pages/NewPlayPage';

import CanvasCon from "./components/CanvasCon";
import Login from "./components/Login";
import AreU from './components/AreU';
import FaceChecker from './components/FaceCheckerLive';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<InitialPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/face" element={<FaceChecker />} />

        <Route path="/areyou" element={<AreU />} />
        <Route path="/play" element={<CanvasCon />} />
        <Route path="/newplay" element={<NewPlayPage />} />
        <Route path="/total" element={<TotalPage />} />
      </Routes>

    </div>
  );
}

export default App;

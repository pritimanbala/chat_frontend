import Portal from "./components/portal";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login";
import Create from "./components/create";
function App() {
  return (
    <>
      <Routes>
        <Route path="/portal" element={<Portal />} />
        <Route path="/" element={<Login />} />
        <Route path="/create" element={<Create />} />
      </Routes>
    </>
  );
}

export default App;

/**
 * Application principale Transport Minimum
 */

import { Canvas, Sidebar } from "./components";
import "./App.css";

function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="canvas-container">
        <Canvas width={900} height={700} />
      </main>
    </div>
  );
}

export default App;

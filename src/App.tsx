import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import BuilderView from "./components/views/BuilderView";
import ImportView from "./components/views/ImportView";
import ExportView from "./components/views/ExportView";

function App() {
  return (
    <Router>
      <div className="workflow-builder">
        <Header />

        <Routes>
          <Route path="/" element={<BuilderView />} />
          <Route path="/import" element={<ImportView />} />
          <Route path="/export" element={<ExportView />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

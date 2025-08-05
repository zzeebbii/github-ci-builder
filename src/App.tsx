import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/layout/Header";
import BuilderView from "./components/views/BuilderView";
import ImportView from "./components/views/ImportView";
import { ToastManager } from "./components/ui/Toast";
import { useWorkflowStore } from "./store/workflow";

function App() {
  const { toasts, removeToast } = useWorkflowStore();

  // Get the base path for routing (for GitHub Pages deployment)
  const basename = import.meta.env.BASE_URL;

  return (
    <Router basename={basename}>
      <div className="workflow-builder">
        <Header />

        <Routes>
          <Route path="/" element={<BuilderView />} />
          <Route path="/import" element={<ImportView />} />
        </Routes>

        <ToastManager toasts={toasts} onClose={removeToast} />
      </div>
    </Router>
  );
}

export default App;

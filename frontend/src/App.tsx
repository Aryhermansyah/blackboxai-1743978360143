import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SystemConfig from './pages/SystemConfig';
import CommandProcess from './pages/CommandProcess';
import Training from './pages/Training';

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        {/* Navigation */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <span className="text-xl font-bold text-gray-800">
                    <i className="fas fa-camera-retro mr-2"></i>
                    Lightroom AI Assistant
                  </span>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                  <Link
                    to="/"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <i className="fas fa-cog mr-2"></i>
                    System Config
                  </Link>
                  <Link
                    to="/command"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <i className="fas fa-terminal mr-2"></i>
                    Command Center
                  </Link>
                  <Link
                    to="/training"
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    <i className="fas fa-graduation-cap mr-2"></i>
                    Training
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu */}
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              <Link
                to="/"
                className="bg-gray-50 border-gray-300 text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                <i className="fas fa-cog mr-2"></i>
                System Config
              </Link>
              <Link
                to="/command"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                <i className="fas fa-terminal mr-2"></i>
                Command Center
              </Link>
              <Link
                to="/training"
                className="border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 block pl-3 pr-4 py-2 border-l-4 text-base font-medium"
              >
                <i className="fas fa-graduation-cap mr-2"></i>
                Training
              </Link>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main>
          <Routes>
            <Route path="/" element={<SystemConfig />} />
            <Route path="/command" element={<CommandProcess />} />
            <Route path="/training" element={<Training />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-white shadow-lg mt-8">
          <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <div className="text-center text-sm text-gray-500">
              <p>© 2023 Lightroom AI Assistant. All rights reserved.</p>
              <div className="mt-2">
                <a
                  href="#"
                  className="text-gray-400 hover:text-gray-500 mx-2"
                >
                  <i className="fab fa-github"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-gray-500 mx-2"
                >
                  <i className="fab fa-twitter"></i>
                </a>
                <a
                  href="#"
                  className="text-gray-400 hover:text-gray-500 mx-2"
                >
                  <i className="fab fa-linkedin"></i>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
};

export default App;
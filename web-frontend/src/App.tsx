import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './providers/WalletProvider';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import ServersPage from './pages/ServersPage';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/servers" element={<ServersPage />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'rgba(0, 0, 0, 0.8)',
                color: '#fff',
                border: '1px solid rgba(153, 69, 255, 0.3)',
              },
            }}
          />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;

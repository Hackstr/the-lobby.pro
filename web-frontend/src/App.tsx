import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { WalletProvider } from './providers/WalletProvider';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ServersPage from './pages/ServersPage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';

function App() {
  return (
    <WalletProvider>
      <Router>
        <div className="App">
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/servers" element={<ServersPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/leaderboard" element={<LeaderboardPage />} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: 'var(--brand-text)',
                border: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 10px 24px rgba(0,0,0,0.08)',
                zIndex: 9999,
              },
              success: {
                iconTheme: {
                  primary: '#6D4AFA',
                  secondary: '#fff',
                },
                style: {
                  borderColor: 'rgba(109,74,250,0.3)',
                }
              },
              error: {
                iconTheme: {
                  primary: '#E11D48',
                  secondary: '#fff',
                },
                style: {
                  borderColor: 'rgba(225,29,72,0.25)'
                }
              }
            }}
          />
        </div>
      </Router>
    </WalletProvider>
  );
}

export default App;

import { useState, useEffect, createContext, useContext } from 'react';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import StudyPlan from './pages/StudyPlan';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import AdminOverview from './pages/AdminOverview';
import AdminStudents from './pages/AdminStudents';
import AdminStudentDetail from './pages/AdminStudentDetail';
import ModelInfo from './pages/ModelInfo';

export const AppContext = createContext();
export function useApp() { return useContext(AppContext); }

export function showToast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

export default function App() {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('xai_user')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('xai_token'));
  const [page, setPage] = useState('predict');
  const [showAuth, setShowAuth] = useState(false);
  const [analysisData, setAnalysisData] = useState({ predict: null, explain: null, plan: null });
  const [detailUserId, setDetailUserId] = useState(null);
  const [detailUserName, setDetailUserName] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (user && isAdmin && page === 'predict') setPage('admin-overview');
  }, [user]);

  async function login(userData, tokenStr) {
    localStorage.setItem('xai_token', tokenStr);
    // Fetch full profile (includes profilePicture) using the new token
    try {
      const res = await fetch('/api/auth/me', { headers: { 'Authorization': 'Bearer ' + tokenStr } });
      if (res.ok) {
        const full = await res.json();
        userData = { ...userData, profilePicture: full.profilePicture, university: full.university, yearOfStudy: full.yearOfStudy, bio: full.bio };
      }
    } catch {}
    localStorage.setItem('xai_user', JSON.stringify(userData));
    setUser(userData);
    setToken(tokenStr);
    setShowAuth(false);
    setPage(userData.role === 'ADMIN' ? 'admin-overview' : 'predict');
  }

  function logout() {
    localStorage.removeItem('xai_user');
    localStorage.removeItem('xai_token');
    setUser(null);
    setToken(null);
    setShowAuth(false);
    setPage('predict');
    setAnalysisData({ predict: null, explain: null, plan: null });
  }

  function viewStudent(id, name) {
    setDetailUserId(id);
    setDetailUserName(name);
    setPage('admin-student');
  }

  const ctx = { user, setUser, token, page, setPage, login, logout, analysisData, setAnalysisData, isAdmin, viewStudent, detailUserId, detailUserName };

  // Not logged in → show landing or auth
  if (!user) {
    if (showAuth) {
      return (
        <AppContext.Provider value={ctx}>
          <AuthModal onClose={() => setShowAuth(false)} />
        </AppContext.Provider>
      );
    }
    return <LandingPage onGetStarted={() => setShowAuth(true)} />;
  }

  const pages = {
    'predict': <Dashboard />,
    'explain': <Analysis />,
    'plan': <StudyPlan />,
    'chat': <Chat />,
    'profile': <Profile />,
    'model': <ModelInfo />,
    'admin-overview': <AdminOverview />,
    'admin-atrisk': <AdminStudents mode="atrisk" />,
    'admin-all': <AdminStudents mode="all" />,
    'admin-student': <AdminStudentDetail />,
  };

  return (
    <AppContext.Provider value={ctx}>
      <Navbar />
      <div className="main-content">
        {pages[page] || <Dashboard />}
      </div>
      <footer className="footer">
        <div>© 2026 XAI StudyMate — Explainable AI Placement Readiness Platform</div>
        <div className="footer-tech">
          <span>🐍 FastAPI</span><span>☕ Spring Boot</span><span>⚛️ React</span><span>🤖 SHAP</span>
        </div>
      </footer>
    </AppContext.Provider>
  );
}

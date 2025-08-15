import { Routes, Route, Link, useLocation } from 'react-router-dom';
import ComplaintsPage from './ComplaintsPage';
import UsersPage from './UsersPage';

function DashboardPage() {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className="dashboard-container">
      <nav className="sidenav">
        <ul>
          <li>
            <Link 
              to="/dashboard" 
              className={isActive('/dashboard') ? 'active' : ''}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link 
              to="/dashboard/complaints" 
              className={isActive('/dashboard/complaints') ? 'active' : ''}
            >
              Complaints
            </Link>
          </li>
          <li>
            <Link 
              to="/dashboard/users"
              className={isActive('/dashboard/users') ? 'active' : ''}
            >Users</Link>
          </li>
          <li>
            <Link to="/dashboard/settings">Settings</Link>
          </li>
        </ul>
      </nav>
      <div className="main-content">
        <Routes>
          <Route path="/" element={
            <div>
              <h1>Welcome to the Dashboard!</h1>
              <p>This is your administrative dashboard.</p>
            </div>
          } />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/settings" element={
            <div>
              <h1>Settings</h1>
              <p>Configure system settings and preferences.</p>
            </div>
          } />
        </Routes>
      </div>
    </div>
  );
}

export default DashboardPage;
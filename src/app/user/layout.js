"use client";

import { usePathname, useRouter } from 'next/navigation';
import './layout.css'

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const isUserPage = pathname === '/user';

  const user = {
    name: "Username",
    avatar: "/default-avatar.jpg",
  };

  const handleBackClick = () => {
    router.replace('/user');
  };

  const handleLogout = () => {
    localStorage.setItem('userData', JSON.stringify({
      userId: 0,
      isAuthenticated: false,
      status: 0,
    }));
    router.replace('/auth/user');
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="dashboard-header">
          <div className="header-content">
            <div className="header-left">
              {/* Back button - only visible when not on /user */}
              <div 
                className={`back-button ${!isUserPage ? 'visible' : ''}`}
                onClick={handleBackClick}
              >
                <img 
                  src='https://img.icons8.com/?size=100&id=85498&format=png&color=ffffff' 
                  style={{ width: '1.5rem' }} 
                  alt="Back to user"
                />
              </div>
              
              <div className="user-info">
                <img
                  src={user.avatar}
                  alt="User profile"
                  className="user-avatar"
                />
                <span className="username">{user.name}</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <img 
                src='https://img.icons8.com/?size=100&id=59995&format=png&color=ffffff' 
                style={{ width: '1.8rem' }} 
                alt="Logout"
              />
            </button>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </body>
    </html>
  );
}
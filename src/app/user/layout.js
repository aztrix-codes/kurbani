"use client";

import './layout.css'

export default function DashboardLayout({ children }) {
  const user = {
    name: "Username",
    avatar: "/default-avatar.jpg",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header className="dashboard-header">
          <div className="header-content">
            <div className="user-info">
              <img
                src={user.avatar}
                alt="User profile"
                className="user-avatar"
              />
              <span className="username">{user.name}</span>
            </div>
            <button className="logout-button"> <img src='https://img.icons8.com/?size=100&id=59995&format=png&color=ffffff' style={{width: '1.8rem'}} /></button>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </body>
    </html>
  );
}

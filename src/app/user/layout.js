"use client";

export default function DashboardLayout({ children }) {
  const user = {
    name: "Username",
    avatar: "/default-avatar.jpg",
  };

  return (
    <html lang="en">
      <style jsx>
        {`
          :root {
            --header-bg: #046307;
            --header-border: #e5e7eb;
            --text-color: #fff;
            --primary-color: #046307;
            --hover-color: #047857;
            --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
          }

          body {
            margin: 0;
            padding: 0;
            font-family: "Inter", -apple-system, system-ui, sans-serif;
            color: var(--text-color);
            display: flex;
            flex-direction: column;
            min-height: 100vh;
          }

          .dashboard-header {
            background-color: var(--header-bg);
            border-bottom: 1px solid var(--header-border);
            box-shadow: var(--shadow-sm);
            position: sticky;
            top: 0;
            z-index: 50;
          }

          .header-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem 2rem;
            max-width: 100%;
            margin: 0 auto;
          }

          .user-info {
            display: flex;
            align-items: center;
            gap: 0.75rem;
          }

          .user-avatar {
            width: 32px;
            height: 32px;
            border-radius: 9999px;
            object-fit: cover;
            background-color: #e5e7eb;
          }

          .username {
            font-weight: 500;
            font-size: 1rem;
            letter-spacing: 0.05rem;
          }

          .logout-button {
            background-color: var(--primary-color);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 0.375rem;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
          }

          .logout-button:hover {
            background-color: var(--hover-color);
            transform: translateY(-1px);
          }

          .dashboard-main {
            flex: 1;
            width: 100%;
            background-color: #f9fafb;
          }

          @media (max-width: 768px) {
            .header-content {
              padding: 0.75rem 1rem;
            }

            .logout-button {
              padding: 0.375rem 0.75rem;
              font-size: 0.8125rem;
            }
          }
        `}
      </style>
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
            <button className="logout-button">Logout</button>
          </div>
        </header>
        <main className="dashboard-main">{children}</main>
      </body>
    </html>
  );
}

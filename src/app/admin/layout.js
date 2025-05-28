'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import './navStyle.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const router = useRouter()

  const links = [
    {title: "Manage Zones", path: 'zones'},
    {title: "Manage Areas", path: 'areas'},
    {title: "Manage Users", path: 'users'},
    {title: "Feedbacks", path: 'feedback'},
  ]

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen)
  }

  const logout = () => {
    localStorage.setItem('adminLoggedIn', 'false');
    router.replace('/auth/admin');
  }

  return (
    <div className="admin-container" suppressHydrationWarning>
      <nav className="wide-nav">
        <div className="nav-header">
          <h1>Admin Panel</h1>
        </div>
        
        <div className='nav-items'>
          {links.map((link, index) => (
            <Link 
              key={index} 
              href={`/admin/${link.path}`} 
              className={`nav-item ${pathname?.includes(link.path) ? 'active' : ''}`}
            >
              {link.title}
            </Link>
          ))}
        </div>
        
        <div className="nav-footer">
          <button onClick={logout} className="logout-button">
            <img src='https://img.icons8.com/?size=100&id=59995&format=png&color=ffffff' alt="Logout" />
          </button>
        </div>
      </nav>

      {/* Mobile Header - Same as before */}
      <header className="mobile-header">
        <button className="hamburger" onClick={toggleMobileNav}>
          <img src='https://img.icons8.com/?size=100&id=36389&format=png&color=ffffff' style={{width: '2rem', height: '1.8rem'}} />
        </button>
          <h1>Admin Panel</h1>   
      </header>

      {/* Rest of the components remain the same */}
      <div className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: "1rem", borderBottom: '1px solid rgba(255,255,255, .4)', position: 'relative', padding: '0rem 2rem 1rem 2rem', alignItems: 'center'}}>
          <h1>Admin Panel</h1>
          <div onClick={logout}> 
            <img src='https://img.icons8.com/?size=100&id=59995&format=png&color=ffffff' style={{width: '1.8rem'}} /> 
          </div>
        </div>
        <div className='nav-items'>
          {links.map((link, index) => (
            <Link onClick={() => setMobileNavOpen(false)}
              key={index} 
              href={`/admin/${link.path}`} 
              className={`nav-item ${pathname?.includes(link.path) ? 'active' : ''}`}
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>

      <div 
        className={`overlay ${mobileNavOpen ? 'open' : ''}`} 
        onClick={() => setMobileNavOpen(false)}
      ></div>

      <main className="admin-main-content">{children}</main>
    </div>
  )
}
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
  ]

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen)
  }

  const logout = () => {
    localStorage.setItem('adminLoggedIn', 'false');
    router.replace('/auth/admin');
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <nav className="wide-nav">
          <h1>Admin Panel</h1>
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
          <div onClick={logout} className='main-nav-log-out'>Log out</div>
        </nav>

        <header className="mobile-header">
          <button className="hamburger" onClick={toggleMobileNav}>
            <img src='https://img.icons8.com/?size=100&id=36389&format=png&color=ffffff' style={{width: '2rem', height: '1.8rem'}} />
          </button>
          <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '35vw', alignItems: 'center'}}>
            <h1>Admin Panel</h1>
            <div onClick={logout}> <img src='https://img.icons8.com/?size=100&id=59995&format=png&color=ffffff' style={{width: '1.8rem'}} /> </div>
          </div>
        </header>

        <div className={`mobile-nav ${mobileNavOpen ? 'open' : ''}`}>
          <h1>Admin Panel</h1>
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

        <div className="main">{children}</div>
      </body>
    </html>
  )
}
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import './navStyle.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  const links = [
    {title: "Manage Zones", path: 'zones'},
    {title: "Manage Areas", path: 'areas'},
    {title: "Manage Users", path: 'users'},
  ]

  const toggleMobileNav = () => {
    setMobileNavOpen(!mobileNavOpen)
  }

  return (
    <html lang="en">
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
        </nav>

        <header className="mobile-header">
          <button className="hamburger" onClick={toggleMobileNav}>
            ☰
          </button>
          <h1>Admin Panel</h1>
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
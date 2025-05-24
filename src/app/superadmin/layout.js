'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import './navStyle.css'

export default function AdminLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()

  const links = [
    {title: "Home", path: 'dashboard'},
    {title: "Generate Receipt (Mumbai)", path: 'receipt-mumbai'},
    {title: "Generate Receipt (Out of Mumbai)", path: 'receipt-oom'},
     {title: "Export Excel (Mumbai)", path: 'export-excel-mumbai'},
    {title: "Export Excel (Out of Mumbai)", path: 'export-excel-oom'},
    {title: "Payment Status (Mumbai)", path: 'payment-status-mumbai'},
    {title: "Payment Status (Out of Mumbai)", path: 'payment-status-oom'},
  ]


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
              href={`/superadmin/${link.path}`} 
              className={`nav-item ${pathname?.includes(link.path) ? 'active' : ''}`}
            >
              {link.title}
            </Link>
          ))}
        </div>
        
        <div className="nav-footer">
          <button className="logout-button">
            <img src='https://img.icons8.com/?size=100&id=59995&format=png&color=ffffff' alt="Logout" />
          </button>
        </div>
      </nav>

      <main className="admin-main-content">{children}</main>
    </div>
  )
}
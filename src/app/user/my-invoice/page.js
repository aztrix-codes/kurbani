'use client'

import { useRouter } from 'next/navigation';
import React from 'react'

function page() {

  const router = useRouter() 
  
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (
        userData &&
        userData.userId === 0 &&
        userData.isAuthenticated === false &&
        userData.status === 0
      ) {
        router.replace('/auth/user');
      }
    }, [router]);

  return (
    <div>
      
    </div>
  )
}

export default page

'use client'

import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react'

function page() {

  const router = useRouter() 
  
    useEffect(() => {
      const userData = JSON.parse(localStorage.getItem('userData'));
      if (
        userData.userId === 0 &&
        userData.isAuthenticated === false &&
        userData.status === 0
      ) {
        router.replace('/auth/user');
      }
    }, [router]);

  return (
    <div>
      about us
    </div>
  )
}

export default page

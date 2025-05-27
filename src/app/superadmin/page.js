'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
const router = useRouter()

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('superAdminLoggedIn') === 'true';
    if (!isLoggedIn) {
      router.replace('/auth/superadmin');
    }
  }, [router]);

  useEffect(() => {
    router.replace('/superadmin/dashboard');
  }, [router]);

  return null; 
}
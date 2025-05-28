'use client'
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, PlusCircle, CreditCard, Clock, FileText, Users, MessageCircle, Info } from "lucide-react";
import "./userPage.css";
import { useRouter } from "next/navigation";
import axios from "axios"; 
import DashboardShimmer from "./DashboardShimmer";

function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const [regionFilter, setRegionFilter] = useState(['oom']); // Initialize as array

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData?.userId;

      if (userData.m && userData.oom) {
        setRegionFilter(['oom', 'm']);
      } else if (userData.m) {
        setRegionFilter(['m']);
      } else {
        setRegionFilter(['oom']);
      }
      
      if (!userId) {
        throw new Error('User ID not found');
      }

      const response = await axios.get(`/api/customers?user_id=${userId}`);
      setData(response.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData || (userData.userId === 0 && userData.isAuthenticated === false && userData.status === 0)) {
      router.replace('/');
    } else {
      fetchData();
    }
  }, [router]);

  const mumbaiData = data.filter(i => i.zone === 'Mumbai' && i.status === 1)
  const mumbaiTotal = mumbaiData.length
  const mumbaiPaid = mumbaiData.filter(i => i.payment_status === 1).length
  const mumbaiPending = mumbaiData.filter(i => i.payment_status === 0).length
  const outOfMumbaiData = data.filter(i => i.zone === 'Out of Mumbai' && i.status === 1)
  const outOfMumbaiTotal = outOfMumbaiData.length
  const OutOfmumbaiPaid = outOfMumbaiData.filter(i => i.payment_status === 1).length
  const OutOfmumbaiPending = outOfMumbaiData.filter(i => i.payment_status === 0).length

  console.log(data)


  const menuItems = [
    { title: "Add new share", icon: <PlusCircle className="tile-icon" />, href: "/user/new-share" },
    { title: "My shares", icon: <Briefcase className="tile-icon" />, href: "/user/my-shares" },
    { title: "Total shares (Mumbai)", icon: <Users className="tile-icon" />, href: "#", amount: `(₹${100000})`, count: mumbaiTotal, region: 'm' },
    { title: "Total paid (Mumbai)", icon: <CreditCard className="tile-icon" />, href: "#", amount: `(₹${40000})`, count: mumbaiPaid, region: 'm' },
    { title: "Total pending (Mumbai)", icon: <Clock className="tile-icon" />, href: "#", amount: `(₹${60000})`, count: mumbaiPending, region: 'm' },
    { title: "Total shares (OOM)", icon: <Users className="tile-icon" />, href: "#", amount: `(₹${100000})`, count: outOfMumbaiTotal, region: 'oom' },
    { title: "Total paid (OOM)", icon: <CreditCard className="tile-icon" />, href: "#", amount: `(₹${40000})`, count: OutOfmumbaiPaid, region: 'oom' },
    { title: "Total pending (OOM)", icon: <Clock className="tile-icon" />, href: "#", amount: `(₹${60000})`, count: OutOfmumbaiPending, region: 'oom' },
    { title: "My invoice", icon: <FileText className="tile-icon" />, href: "/user/my-invoice" },
    { title: "User Guidelines", icon: <Info className="tile-icon" />, href: "/user/guidelines" },
    { title: "Contact us", icon: <MessageCircle className="tile-icon" />, href: "/user/contact-us" }
  ];

  if (loading) {
    return <DashboardShimmer />;
  }

  return (
    <div className="page-container">      
      <div className="tiles-grid">
        {menuItems.filter(item => {
          return !item.region || regionFilter.includes(item.region);
        }).map((item, index) => (
          <Link key={index} href={item.href} className="tile-link">
            <div className="tile">
              {item.icon}
              <h3 className="tile-title">{item.title}</h3>
              {item.count !== undefined && <h3 className="tile-count">{item.count}</h3>}
              {item.amount && <h3 className="tile-amount">{item.amount}</h3>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Page;
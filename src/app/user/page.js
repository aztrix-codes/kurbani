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

  const fetchData = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('userData'));
      const userId = userData?.userId;
      
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
      router.replace('/auth/user');
    } else {
      fetchData();
    }
  }, [router]);

  const menuItems = [
    { title: "Add new share", icon: <PlusCircle className="tile-icon" />, href: "/user/new-share" },
    { title: "My shares", icon: <Briefcase className="tile-icon" />, href: "/user/my-shares" },
    { title: "Total shares", icon: <Users className="tile-icon" />, href: "#", amount: `(₹${100000})`, count: data.length },
    { title: "Total paid", icon: <CreditCard className="tile-icon" />, href: "#", amount: `(₹${40000})`, count: 0 },
    { title: "Total pending", icon: <Clock className="tile-icon" />, href: "#", amount: `(₹${60000})`, count: 0 },
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
        {menuItems.map((item, index) => (
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
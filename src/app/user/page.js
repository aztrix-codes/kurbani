'use client'
import React, { useEffect } from "react";
import Link from "next/link";
import { Briefcase, PlusCircle, CreditCard, Clock, FileText, Users, MessageCircle, Info } from "lucide-react";
import "./userPage.css";
import { useRouter } from "next/navigation";

function Page() {
  const menuItems = [
    { title: "Add new share", icon: <PlusCircle className="tile-icon" />, href: "/user/new-share" },
    { title: "My shares", icon: <Briefcase className="tile-icon" />, href: "/user/my-shares" },
    { title: "Total shares", icon: <Users className="tile-icon" />, href: "#", amount: `₹${100000}` },
    { title: "Total paid", icon: <CreditCard className="tile-icon" />, href: "#", amount: `₹${40000}` },
    { title: "Total pending", icon: <Clock className="tile-icon" />, href: "#", amount: `₹${60000}` },
    { title: "My invoice", icon: <FileText className="tile-icon" />, href: "/user/my-invoice" },
    { title: "About us", icon: <Info className="tile-icon" />, href: "/user/about-us" },
    { title: "Contact us", icon: <MessageCircle className="tile-icon" />, href: "/user/contact-us" }
  ];

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
    <div className="page-container">      
      <div className="tiles-grid">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href} className="tile-link">
            <div className="tile">
              {item.icon}
              <h3 className="tile-title">{item.title}</h3>
              <h3 className="tile-title">{item?.amount}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Page;
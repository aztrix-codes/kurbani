'use client'
import React from "react";
import Link from "next/link";
import { Briefcase, PlusCircle, CreditCard, Clock, FileText, Users, MessageCircle, Info } from "lucide-react";
import "./userPage.css";

function Page() {
  const menuItems = [
    { title: "Add new share", icon: <PlusCircle className="tile-icon" />, href: "/user/new-share" },
    { title: "My shares", icon: <Briefcase className="tile-icon" />, href: "/user/my-shares" },
    { title: "Total shares", icon: <Users className="tile-icon" />, href: "#" },
    { title: "Total paid", icon: <CreditCard className="tile-icon" />, href: "#" },
    { title: "Total pending", icon: <Clock className="tile-icon" />, href: "#" },
    { title: "My invoice", icon: <FileText className="tile-icon" />, href: "#" },
    { title: "About us", icon: <Info className="tile-icon" />, href: "#" },
    { title: "Contact us", icon: <MessageCircle className="tile-icon" />, href: "/user/contact-us" }
  ];

  return (
    <div className="page-container">
      {/* Decorative elements are handled in CSS */}
      {/* <h1 className="page-title">Dashboard</h1> */}
      
      <div className="tiles-grid">
        {menuItems.map((item, index) => (
          <Link key={index} href={item.href} className="tile-link">
            <div className="tile">
              {item.icon}
              <h3 className="tile-title">{item.title}</h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default Page;
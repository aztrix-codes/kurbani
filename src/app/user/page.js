'use client'
import React from "react";
import { Briefcase, PlusCircle, CreditCard, Clock, FileText, Users, MessageCircle, Info } from "lucide-react";
import "./userPage.css";

function Page() {
  const menuItems = [
    { title: "Add new share", icon: <PlusCircle className="tile-icon" /> },
    { title: "My shares", icon: <Briefcase className="tile-icon" /> },
    { title: "Total shares", icon: <Users className="tile-icon" /> },
    { title: "Total paid", icon: <CreditCard className="tile-icon" /> },
    { title: "Total pending", icon: <Clock className="tile-icon" /> },
    { title: "My invoice", icon: <FileText className="tile-icon" /> },
    { title: "About us", icon: <Info className="tile-icon" /> },
    { title: "Contact us", icon: <MessageCircle className="tile-icon" /> }
  ];

  return (
    <div className="page-container">
      {/* <h1 className="page-title">Dashboard</h1> */}
      
      <div className="tiles-grid">
        {menuItems.map((item, index) => (
          <div key={index} className="tile">
            {item.icon}
            <h3 className="tile-title">{item.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;
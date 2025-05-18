'use client'
import React from "react";
import "./userPage.css";

function Page() {
  const tiles = [
    { id: 1, title: "Dashboard", icon: "📊", color: "bg-blue-100" },
    { id: 2, title: "Projects", icon: "📂", color: "bg-green-100" },
    { id: 3, title: "Calendar", icon: "📅", color: "bg-yellow-100" },
    { id: 4, title: "Messages", icon: "💬", color: "bg-purple-100" },
    { id: 5, title: "Analytics", icon: "📈", color: "bg-red-100" },
    { id: 6, title: "Settings", icon: "⚙️", color: "bg-indigo-100" },
    { id: 7, title: "Team", icon: "👥", color: "bg-pink-100" },
    { id: 8, title: "Help", icon: "❓", color: "bg-gray-100" },
  ];

  return (
    <div className="page-container">
      <div className="tiles-grid">
        {tiles.map((tile) => (
          <div key={tile.id} className="tile">
            <h3 className="tile-title">{tile.title}</h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Page;

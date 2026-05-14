"use client";

import React from "react";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import StatsSection from "@/components/StatsSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ClientSlider from "@/components/ClientSlider";

export default function HomePage() {
  // Mock data for the Hero section notice boards
  const tenderNotices = [
    { id: "1", title: "Local Government Engineering Department (LGED) - Road Construction", date: "15 May", filePath: "#" },
    { id: "2", title: "Public Works Department (PWD) - Building Renovation", date: "12 May", filePath: "#" },
    { id: "3", title: "Roads and Highways Department (RHD) - Bridge Maintenance", date: "10 May", filePath: "#" },
    { id: "4", title: "Water Development Board (WDB) - Embankment Repair", date: "08 May", filePath: "#" },
    { id: "5", title: "Education Engineering Department (EED) - School Building", date: "05 May", filePath: "#" },
  ];

  const winnerNotices = [
    { id: "w1", title: "BTC awarded Project for Multi-storied Building at Pabna", date: "14 May", filePath: "#" },
    { id: "w2", title: "Winner Announcement: Highway Extension Project, Phase 2", date: "11 May", filePath: "#" },
    { id: "w3", title: "Bridge Construction Contract Signed with LGED", date: "09 May", filePath: "#" },
    { id: "w4", title: "Medical College Renovation Tender Awarded to BTC", date: "07 May", filePath: "#" },
  ];

  return (
    <div className="home-page">
      <Hero 
        tenderNotices={tenderNotices} 
        winnerNotices={winnerNotices} 
      />
      <Services />
      <StatsSection />
      <AboutSection />
      <ProjectsSection />
      <ClientSlider />
    </div>
  );
}

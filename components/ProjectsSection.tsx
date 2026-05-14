"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

// Assets
import ProjectImg1 from "@/assets/img/home/project-img1.png";
import ProjectImg2 from "@/assets/img/home/project-img2.png";
import ProjectImg3 from "@/assets/img/home/project-img3.png";
import ProjectImg4 from "@/assets/img/home/project-img4.png";
import ProjectImg5 from "@/assets/img/home/project-img5.png";
import ProjectImg6 from "@/assets/img/home/project-img6.png";
import ProjectImg7 from "@/assets/img/home/project-img7.png";
import ProjectImg8 from "@/assets/img/home/project-img8.png";
import ProjectImg9 from "@/assets/img/home/project-img9.png";

const projects = [
  {
    id: 1,
    title: "West End Business Center, Dhaka",
    category: "SHOPPING MALL",
    duration: "2023-2024",
    image: ProjectImg1,
  },
  {
    id: 2,
    title: "UNIVERSITY OF CONNECTICUL, Sylhet",
    category: "EDUCATIONAL INSTITUTE",
    duration: "2023-2024",
    image: ProjectImg2,
  },
  {
    id: 3,
    title: "VIVALA MENSION, SYLHET",
    category: "HOME",
    duration: "2023-2024",
    image: ProjectImg3,
  },
  {
    id: 4,
    title: "CENTER OF ROYAL, Dhaka",
    category: "OFFICE",
    duration: "2022-2023",
    image: ProjectImg4,
  },
  {
    id: 5,
    title: "ABDALI MALL, RAJSHAHI",
    category: "SHOPPING MALL",
    duration: "2023-2024",
    image: ProjectImg5,
  },
  {
    id: 6,
    title: "FINHA HOSPITAL, Dhaka",
    category: "HOSPITAL",
    duration: "2023-2024",
    image: ProjectImg6,
  },
  {
    id: 7,
    title: "ALEXA COMPLAX, RAJSHAHI",
    category: "COMMERCIAL",
    duration: "2023-2024",
    image: ProjectImg7,
  },
  {
    id: 8,
    title: "ORIENT STADIUM, RONGPUR",
    category: "COMMERCIAL",
    duration: "2023-2024",
    image: ProjectImg8,
  },
  {
    id: 9,
    title: "AURA VILLA, Dhaka",
    category: "HOME",
    duration: "2023-2024",
    image: ProjectImg9,
  },
];

const ProjectsSection: React.FC = () => {
  return (
    <section
      id="projects"
      className="Our_project bg-[var(--secondary-color)] mt-[80px] lg:mt-[140px]"
    >
      <div className="custom-container mx-auto px-4">
        <div className="top_section flex justify-between items-end max-md:flex-col max-md:items-start">
          <div className="heading_wrap text-left">
            <span className="tag bg-[var(--primary-color)] text-[var(--secondary-color)] font-primary font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
              OUR BEST PROJECTS
            </span>
            <h2 className="title text-[var(--text-1)] font-primary font-medium text-[38px] max-w-[490px] pt-[20px] uppercase max-md:max-w-full lg:text-[32px]">
              Showcasing excellence in every build.
            </h2>
          </div>
          <div className="button max-md:mt-[30px]">
            <button className="browse_btn bg-[var(--primary-color)] relative inline-block py-[10px] px-[30px] rounded-tl-none rounded-tr-[12px] rounded-br-[12px] rounded-bl-[12px] border-none cursor-pointer overflow-hidden z-[1] group transition-all duration-400">
              <span className="text-[var(--secondary-color)] transition-all duration-400 font-[var(--secondary-font)] text-[16px] font-semibold">
                BROWSE ALL PROJECTS
              </span>
              <span className="absolute bottom-0 left-0 w-full h-0 rounded-tl-[6px] rounded-tr-[6px] bg-[var(--text-1)] transition-all duration-400 -z-[1] group-hover:h-full group-hover:rounded-tl-none"></span>
            </button>
          </div>
        </div>

        <div className="projects mt-[40px]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <div key={project.id} className="flex items-stretch">
                <div className="project_item w-full transition duration-400 group">
                  <div className="image relative w-full aspect-[16/11] rounded-[24px] overflow-hidden">
                    <Image
                      src={project.image}
                      alt={project.title}
                      fill
                      className="object-cover transition duration-400 group-hover:scale-[1.08]"
                    />
                    <span className="tag absolute bottom-[14px] left-[14px] bg-[var(--shade-1)] text-[var(--text-1)] font-primary font-medium text-[16px] rounded-[30px] py-[5px] px-[20px]">
                      {project.category}
                    </span>
                  </div>
                  <Link href="#">
                    <h3 className="header text-[var(--text-1)] font-primary font-medium text-[18px] uppercase py-[12px] hover:text-[var(--primary-color)] transition-colors">
                      {project.title}
                    </h3>
                  </Link>
                  <div className="calender flex items-center gap-[10px]">
                    <div className="icon flex items-center justify-center w-[40px] h-[40px] rounded-full bg-[var(--shade-1)]">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 32 32"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 19.9998H20M28 10.6665H4M21.3333 2.6665V6.6665M10.6667 2.6665V6.6665M10.4 29.3332H21.6C23.8402 29.3332 24.9603 29.3332 25.816 28.8972C26.5686 28.5137 27.1805 27.9018 27.564 27.1491C28 26.2935 28 25.1734 28 22.9332V11.7332C28 9.49296 28 8.37286 27.564 7.51721C27.1805 6.76456 26.5686 6.15264 25.816 5.76914C24.9603 5.33317 23.8402 5.33317 21.6 5.33317H10.4C8.15979 5.33317 7.03969 5.33317 6.18404 5.76914C5.43139 6.15264 4.81947 6.76456 4.43597 7.51721C4 8.37286 4 9.49296 4 11.7332V22.9332C4 25.1734 4 26.2935 4.43597 27.1491C4.81947 27.9018 5.43139 28.5137 6.18404 28.8972C7.03969 29.3332 8.15979 29.3332 10.4 29.3332Z"
                          stroke="#5AA469"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div className="duration">
                      <h4 className="name text-[var(--primary-color)] font-primary font-medium text-[16px] mb-[4px]">
                        Project Duration
                      </h4>
                      <span className="date font-secondary text-[16px]">
                        {project.duration}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProjectsSection;

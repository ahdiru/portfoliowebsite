import { useState, useEffect } from "react";

export const normalizeIconPath = (icon) => {
  if (!icon) return "/html.svg";
  if (icon.includes("tableau-original.svg")) {
    return "/tableau.svg";
  }
  if (icon.startsWith("http://") || icon.startsWith("https://") || icon.startsWith("data:")) {
    return icon;
  }
  return icon.startsWith("/") ? icon : `/${icon}`;
};

export const PRESET_TECH_ICONS = [
  { name: "Python", icon: "/python.svg" },
  { name: "PostgreSQL", icon: "/postgresql.svg" },
  { name: "Supabase", icon: "/supabase.svg" },
  { name: "Tableau", icon: "/tableau.svg" },
  { name: "ReactJS", icon: "/reactjs.svg" },
  { name: "Vue.js", icon: "/vuejs.svg" },
  { name: "JavaScript", icon: "/javascript.svg" },
  { name: "TypeScript", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
  { name: "Node JS", icon: "/nodejs.svg" },
  { name: "Tailwind CSS", icon: "/tailwind.svg" },
  { name: "Next.js", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
  { name: "HTML", icon: "/html.svg" },
  { name: "CSS", icon: "/css.svg" },
  { name: "Vite", icon: "/vite.svg" },
  { name: "Docker", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
  { name: "Git", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
  { name: "MySQL", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
  { name: "MongoDB", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
  { name: "Firebase", icon: "/firebase.svg" },
  { name: "Material UI", icon: "/MUI.svg" },
  { name: "Bootstrap", icon: "/bootstrap.svg" },
  { name: "Figma", icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
  { name: "Vercel", icon: "/vercel.svg" },
  { name: "SweetAlert2", icon: "/SweetAlert.svg" },
];

export const DEFAULT_TECH_STACKS = [
  { id: "python", language: "Python", icon: "/python.svg" },
  { id: "postgresql", language: "PostgreSQL", icon: "/postgresql.svg" },
  { id: "supabase", language: "Supabase", icon: "/supabase.svg" },
  { id: "react", language: "ReactJS", icon: "/reactjs.svg" },
  { id: "javascript", language: "JavaScript", icon: "/javascript.svg" },
  { id: "vuejs", language: "Vue.js", icon: "/vuejs.svg" },
  { id: "tailwind", language: "Tailwind CSS", icon: "/tailwind.svg" },
  { id: "nodejs", language: "Node JS", icon: "/nodejs.svg" },
  { id: "tableau", language: "Tableau", icon: "/tableau.svg" },
  { id: "html", language: "HTML", icon: "/html.svg" },
  { id: "css", language: "CSS", icon: "/css.svg" },
  { id: "vite", language: "Vite", icon: "/vite.svg" },
];

export const getTechStacks = () => {
  try {
    const stored = localStorage.getItem("portfolio_tech_stacks");
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((item) => ({
          ...item,
          icon: normalizeIconPath(item.icon),
        }));
      }
    }
  } catch (err) {}
  return DEFAULT_TECH_STACKS;
};

export const saveTechStacks = (stacks) => {
  const normalized = stacks.map((item) => ({
    ...item,
    icon: normalizeIconPath(item.icon),
  }));
  localStorage.setItem("portfolio_tech_stacks", JSON.stringify(normalized));
  window.dispatchEvent(new Event("portfolioDataUpdated"));
  window.dispatchEvent(new Event("storage"));
  return normalized;
};

export const resetTechStacks = () => {
  localStorage.removeItem("portfolio_tech_stacks");
  window.dispatchEvent(new Event("portfolioDataUpdated"));
  window.dispatchEvent(new Event("storage"));
  return DEFAULT_TECH_STACKS;
};

export const useTechStacks = () => {
  const [techStacks, setTechStacks] = useState(getTechStacks);

  useEffect(() => {
    const handleUpdate = () => {
      setTechStacks(getTechStacks());
    };

    window.addEventListener("portfolioDataUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("portfolioDataUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return techStacks;
};

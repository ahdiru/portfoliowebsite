import { useState, useEffect } from "react";

export const DEFAULT_PROFILE = {
  name: "Ahmad Jordan",
  caption: "Web Developer & Data Analyst • Bridging Systems & Intelligence",
  roleTitle: "Web Developer & Data Analyst",
  bio: "Versatile Web Developer & Data Analyst berbasis di Jakarta, berpengalaman dalam merancang platform web end-to-end, arsitektur database relasional PostgreSQL (Supabase), serta otomasi data pipeline menggunakan Python dan Tableau.",
  quote: "Bridging strategic business objectives and technical execution with scalable architecture and data clarity.",
  affiliation: "TVRI Pusat Data Strategi",
  education: "BINUS CS (IPK 3.79 / 4.00)",
  location: "Jakarta, ID",
  resumeUrl: "https://bit.ly/Jordansportfolio",
  resumeFileName: "Ahmad_Jordan_CV.pdf",
  photo: "/Photo.jpeg",
  heroHeadline: "Engineering end-to-end web platforms & data pipelines.",
  heroSubdescription: "Versatile Web Developer & Data Analyst with proven experience engineering executive monitoring dashboards, optimizing relational database architectures, and deploying reliable business intelligence solutions.",
  heroTechStack: "React.js, Python, PostgreSQL, Supabase, Tailwind CSS, Tableau, Vue.js, SQL",
  heroImage: "",
};

export const getProfileData = () => {
  try {
    const stored = localStorage.getItem("portfolio_profile");
    const photo = localStorage.getItem("profile_photo");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ...DEFAULT_PROFILE,
        ...parsed,
        photo: photo || parsed.photo || DEFAULT_PROFILE.photo,
      };
    }
    return {
      ...DEFAULT_PROFILE,
      photo: photo || DEFAULT_PROFILE.photo,
    };
  } catch (e) {
    return DEFAULT_PROFILE;
  }
};

export const saveProfileData = (updatedProfile) => {
  const merged = { ...getProfileData(), ...updatedProfile };
  localStorage.setItem("portfolio_profile", JSON.stringify(merged));
  if (merged.photo) {
    localStorage.setItem("profile_photo", merged.photo);
  }
  window.dispatchEvent(new Event("portfolioDataUpdated"));
  window.dispatchEvent(new Event("storage"));
  return merged;
};

export const deleteResumePermanently = () => {
  const current = getProfileData();
  const updated = {
    ...current,
    resumeUrl: "",
    resumeFileName: "",
  };
  localStorage.setItem("portfolio_profile", JSON.stringify(updated));
  localStorage.removeItem("portfolio_resume_file");
  window.dispatchEvent(new Event("portfolioDataUpdated"));
  window.dispatchEvent(new Event("storage"));
  return updated;
};

export const resetProfileData = () => {
  localStorage.removeItem("portfolio_profile");
  localStorage.removeItem("profile_photo");
  localStorage.removeItem("portfolio_resume_file");
  window.dispatchEvent(new Event("portfolioDataUpdated"));
  window.dispatchEvent(new Event("storage"));
  return DEFAULT_PROFILE;
};

export const useProfile = () => {
  const [profile, setProfile] = useState(getProfileData);

  useEffect(() => {
    const handleUpdate = () => {
      setProfile(getProfileData());
    };

    window.addEventListener("portfolioDataUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("portfolioDataUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return profile;
};

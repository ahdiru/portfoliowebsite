import React, { useEffect, useState, useCallback } from "react";
import { supabase } from "../supabase"; 
import PropTypes from "prop-types";
import SwipeableViews from "react-swipeable-views";
import { useTheme } from "@mui/material/styles";
import AppBar from "@mui/material/AppBar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CardProject from "../components/CardProject";
import TechStackIcon from "../components/TechStackIcon";
import AOS from "aos";
import "aos/dist/aos.css";
import Certificate from "../components/Certificate";
import { Code, Award, Boxes, ChevronDown, ChevronUp } from "lucide-react";
import { useTechStacks } from "../utils/techStackData";
import { safeSetLocalStorage } from "../utils/storageCleaner";

const ToggleButton = ({ onClick, isShowingMore }) => (
  <button
    onClick={onClick}
    className="
      px-4 py-2
      text-[#1E3B2F]
      hover:text-[#F5F0E6]
      hover:bg-[#1E3B2F]
      text-xs font-mono font-medium
      transition-all duration-200
      flex items-center gap-2
      bg-[#EDE7DA]
      rounded-lg
      border border-[#D8CFBE]
      shadow-2xs
    "
  >
    <span>{isShowingMore ? "Show Less" : "Show All"}</span>
    {isShowingMore ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
  </button>
);

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: { xs: 1, sm: 3 } }}>
          <Typography component="div">{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    "aria-controls": `full-width-tabpanel-${index}`,
  };
}

export default function FullWidthTabs() {
  const theme = useTheme();
  const techStacks = useTechStacks();
  const [value, setValue] = useState(0);
  const [projects, setProjects] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllCertificates, setShowAllCertificates] = useState(false);
  const isMobile = window.innerWidth < 768;
  const initialItems = isMobile ? 4 : 6;

  useEffect(() => {
    AOS.init({ once: false });
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const [projectsResponse, certificatesResponse] = await Promise.all([
        supabase.from("projects").select("*").order('id', { ascending: false }),
        supabase.from("certificates").select("*").order('id', { ascending: false }), 
      ]);

      if (projectsResponse.error) throw projectsResponse.error;
      if (certificatesResponse.error) throw certificatesResponse.error;

      let projectData = projectsResponse.data || [];
      let certificateData = certificatesResponse.data || [];

      // Merge local fallback projects
      try {
        const localProjs = localStorage.getItem('portfolio_local_projects');
        if (localProjs) {
          const parsed = JSON.parse(localProjs);
          projectData = [...projectData, ...parsed.filter(p => !projectData.some(c => c.id === p.id))];
        }
      } catch (e) {}

      // Merge local fallback certificates
      try {
        const localCerts = localStorage.getItem('portfolio_local_certificates');
        if (localCerts) {
          const parsed = JSON.parse(localCerts);
          certificateData = [...certificateData, ...parsed.filter(p => !certificateData.some(c => c.id === p.id))];
        }
      } catch (e) {}

      setProjects(projectData);
      setCertificates(certificateData);

      safeSetLocalStorage("projects", projectData);
      safeSetLocalStorage("certificates", certificateData);
    } catch (error) {
      console.error("Error fetching data:", error);
      try {
        const localProjs = localStorage.getItem('portfolio_local_projects');
        if (localProjs) setProjects(JSON.parse(localProjs));
        const localCerts = localStorage.getItem('portfolio_local_certificates');
        if (localCerts) setCertificates(JSON.parse(localCerts));
      } catch (e) {}
    }
  }, []);

  useEffect(() => {
    fetchData();
    window.addEventListener('portfolioCertificatesUpdated', fetchData);
    window.addEventListener('portfolioProjectsUpdated', fetchData);
    return () => {
      window.removeEventListener('portfolioCertificatesUpdated', fetchData);
      window.removeEventListener('portfolioProjectsUpdated', fetchData);
    };
  }, [fetchData]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const toggleShowMore = useCallback((type) => {
    if (type === 'projects') {
      setShowAllProjects(prev => !prev);
    } else {
      setShowAllCertificates(prev => !prev);
    }
  }, []);

  const displayedProjects = showAllProjects ? projects : projects.slice(0, initialItems);
  const displayedCertificates = showAllCertificates ? certificates : certificates.slice(0, initialItems);

  return (
    <div className="md:px-[10%] px-[5%] w-full sm:mt-0 mt-12 bg-transparent overflow-hidden pb-16" id="Portofolio">
      {/* Header section */}
      <div className="text-center pb-10" data-aos="fade-up" data-aos-duration="1000">
        <h2 className="inline-block text-3xl md:text-5xl font-bold tracking-tight text-[#1E3B2F]">
          Portfolio Showcase
        </h2>
        <p className="text-[#5A6650] max-w-2xl mx-auto text-sm md:text-base mt-2">
          A curated collection of production web applications, cross-platform mobile solutions, and verified certifications.
        </p>
      </div>

      <Box sx={{ width: "100%" }}>
        {/* AppBar and Tabs section */}
        <AppBar
          position="static"
          elevation={0}
          sx={{
            bgcolor: "#FFFFFF",
            border: "1px solid #D8CFBE",
            borderRadius: "16px",
            boxShadow: "0 4px 20px rgba(30,59,47,0.04)",
            overflow: "hidden",
          }}
          className="md:px-2"
        >
          <Tabs
            value={value}
            onChange={handleChange}
            variant="fullWidth"
            sx={{
              minHeight: "64px",
              "& .MuiTab-root": {
                fontSize: { xs: "0.85rem", md: "0.95rem" },
                fontWeight: "600",
                color: "#5A6650",
                textTransform: "none",
                transition: "all 0.25s ease",
                padding: "12px 0",
                zIndex: 1,
                margin: "6px",
                borderRadius: "10px",
                "&:hover": {
                  color: "#1E3B2F",
                  backgroundColor: "#EDE7DA",
                },
                "&.Mui-selected": {
                  color: "#F5F0E6 !important",
                  backgroundColor: "#1E3B2F !important",
                  boxShadow: "0 4px 12px rgba(30,59,47,0.15)",
                  "& .lucide": {
                    color: "#C8B48A",
                  },
                },
              },
              "& .MuiTabs-indicator": {
                display: "none",
              },
              "& .MuiTabs-flexContainer": {
                gap: "4px",
              },
            }}
          >
            <Tab
              icon={<Code className="mb-1 w-4 h-4 transition-all duration-300" />}
              label="Projects"
              {...a11yProps(0)}
            />
            <Tab
              icon={<Award className="mb-1 w-4 h-4 transition-all duration-300" />}
              label="Certificates"
              {...a11yProps(1)}
            />
            <Tab
              icon={<Boxes className="mb-1 w-4 h-4 transition-all duration-300" />}
              label="Tech Stack"
              {...a11yProps(2)}
            />
          </Tabs>
        </AppBar>

        <SwipeableViews
          axis={theme.direction === "rtl" ? "x-reverse" : "x"}
          index={value}
          onChangeIndex={setValue}
        >
          {/* Projects Panel */}
          <TabPanel value={value} index={0} dir={theme.direction}>
            <div className="container mx-auto flex justify-center items-center overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3 gap-6 w-full">
                {displayedProjects.map((project, index) => (
                  <div
                    key={project.id || index}
                    data-aos={index % 2 === 0 ? "fade-up" : "fade-up"}
                    data-aos-duration="800"
                  >
                    <CardProject
                      Img={project.Img}
                      Title={project.Title}
                      Description={project.Description}
                      Link={project.Link}
                      id={project.id}
                      PdfUrl={
                        project.PdfUrl ||
                        (Array.isArray(project.Features) &&
                          project.Features.find((f) => typeof f === "string" && f.startsWith("__pdf:"))
                            ?.replace("__pdf:", "")
                            ?.replace(/__$/, "")) ||
                        null
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
            {projects.length > initialItems && (
              <div className="mt-8 w-full flex justify-center">
                <ToggleButton
                  onClick={() => toggleShowMore('projects')}
                  isShowingMore={showAllProjects}
                />
              </div>
            )}
          </TabPanel>

          {/* Certificates Panel */}
          <TabPanel value={value} index={1} dir={theme.direction}>
            <div className="container mx-auto flex justify-center items-center overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                {displayedCertificates.map((certificate, index) => (
                  <div
                    key={certificate.id || index}
                    data-aos="fade-up"
                    data-aos-duration="800"
                  >
                    <Certificate ImgSertif={certificate.Img} />
                  </div>
                ))}
              </div>
            </div>
            {certificates.length > initialItems && (
              <div className="mt-8 w-full flex justify-center">
                <ToggleButton
                  onClick={() => toggleShowMore('certificates')}
                  isShowingMore={showAllCertificates}
                />
              </div>
            )}
          </TabPanel>

          {/* Tech Stack Panel */}
          <TabPanel value={value} index={2} dir={theme.direction}>
            <div className="container mx-auto flex justify-center items-center overflow-hidden pb-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5 w-full">
                {techStacks.map((stack, index) => (
                  <div
                    key={index}
                    data-aos="fade-up"
                    data-aos-duration="700"
                  >
                    <TechStackIcon TechStackIcon={stack.icon} Language={stack.language} />
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>
        </SwipeableViews>
      </Box>
    </div>
  );
}

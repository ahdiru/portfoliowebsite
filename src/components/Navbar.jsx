import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { useProfile } from "../utils/profileData";

const Navbar = () => {
    const profile = useProfile();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [activeSection, setActiveSection] = useState("Home");
    
    const navItems = [
        { href: "#Home", label: "Home" },
        { href: "#About", label: "About" },
        { href: "#Portofolio", label: "Portofolio" },
        { href: "#Contact", label: "Contact" },
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
            const sections = navItems.map(item => {
                const section = document.querySelector(item.href);
                if (section) {
                    return {
                        id: item.href.replace("#", ""),
                        offset: section.offsetTop - 550,
                        height: section.offsetHeight
                    };
                }
                return null;
            }).filter(Boolean);

            const currentPosition = window.scrollY;
            const active = sections.find(section => 
                currentPosition >= section.offset && 
                currentPosition < section.offset + section.height
            );

            if (active) {
                setActiveSection(active.id);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
    }, [isOpen]);

    const scrollToSection = (e, href) => {
        e.preventDefault();
        const section = document.querySelector(href);
        if (section) {
            const top = section.offsetTop - 100;
            window.scrollTo({
                top: top,
                behavior: "smooth"
            });
        }
        setIsOpen(false);
    };

    return (
        <nav
            className={`fixed w-full top-0 z-50 transition-all duration-300 ${
                isOpen
                    ? "bg-[#F5F0E6] border-b border-[#D8CFBE]"
                    : scrolled
                    ? "bg-[#F5F0E6]/90 backdrop-blur-md border-b border-[#D8CFBE] shadow-xs"
                    : "bg-transparent"
            }`}
        >
            <div className="mx-auto px-[5%] sm:px-[5%] lg:px-[10%]">
                <div className="flex items-center justify-between h-16">
                    {/* Brand Monogram */}
                    <div className="flex-shrink-0">
                        <a
                            href="#Home"
                            onClick={(e) => scrollToSection(e, "#Home")}
                            className="text-lg sm:text-xl font-bold tracking-tight text-[#1E3B2F] flex items-center gap-1.5 font-mono"
                        >
                            <span>{profile?.name || "Ahmad Jordan"}</span>
                            <span className="w-1.5 h-1.5 rounded-full bg-[#7F8C6A] inline-block"></span>
                        </a>
                    </div>
        
                    {/* Desktop Navigation */}
                    <div className="hidden md:block">
                        <div className="ml-8 flex items-center space-x-8">
                            {navItems.map((item) => {
                                const isActive = activeSection === item.href.substring(1);
                                return (
                                    <a
                                        key={item.label}
                                        href={item.href}
                                        onClick={(e) => scrollToSection(e, item.href)}
                                        className="group relative px-1 py-2 text-sm font-medium transition-colors"
                                    >
                                        <span
                                            className={`relative z-10 transition-colors duration-200 ${
                                                isActive
                                                    ? "text-[#1E3B2F] font-semibold"
                                                    : "text-[#5A6650] hover:text-[#1E3B2F]"
                                            }`}
                                        >
                                            {item.label}
                                        </span>
                                        <span
                                            className={`absolute bottom-0 left-0 w-full h-[2px] bg-[#1E3B2F] transform origin-left transition-transform duration-200 ${
                                                isActive
                                                    ? "scale-x-100"
                                                    : "scale-x-0 group-hover:scale-x-100"
                                            }`}
                                        />
                                    </a>
                                );
                            })}
                        </div>
                    </div>
        
                    {/* Mobile Menu Button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="p-2 text-[#1E3B2F] hover:bg-[#EDE7DA] rounded-lg transition-colors"
                            aria-label="Toggle navigation menu"
                        >
                            {isOpen ? (
                                <X className="w-6 h-6" />
                            ) : (
                                <Menu className="w-6 h-6" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        
            {/* Mobile Menu */}
            <div
                className={`md:hidden transition-all duration-300 ease-in-out ${
                    isOpen
                        ? "max-h-screen opacity-100 bg-[#F5F0E6] border-b border-[#D8CFBE]"
                        : "max-h-0 opacity-0 overflow-hidden"
                }`}
            >
                <div className="px-6 py-6 space-y-3">
                    {navItems.map((item, index) => {
                        const isActive = activeSection === item.href.substring(1);
                        return (
                            <a
                                key={item.label}
                                href={item.href}
                                onClick={(e) => scrollToSection(e, item.href)}
                                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                                    isActive
                                        ? "bg-[#EDE7DA] text-[#1E3B2F] font-semibold"
                                        : "text-[#5A6650] hover:bg-[#EDE7DA]/60 hover:text-[#1E3B2F]"
                                }`}
                                style={{
                                    transitionDelay: `${index * 50}ms`,
                                }}
                            >
                                {item.label}
                            </a>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

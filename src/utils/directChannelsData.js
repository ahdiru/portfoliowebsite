import { useState, useEffect } from "react";
import {
  Linkedin,
  Mail,
  Phone,
  Globe,
  Github,
  Instagram,
  Twitter,
  Youtube,
  Send,
  MessageCircle,
  Share2,
  FileText,
  Code,
  Link as LinkIcon
} from "lucide-react";

export const CHANNEL_ICON_MAP = {
  Linkedin: Linkedin,
  Mail: Mail,
  Phone: Phone,
  Globe: Globe,
  Github: Github,
  Instagram: Instagram,
  Twitter: Twitter,
  Youtube: Youtube,
  Send: Send,
  MessageCircle: MessageCircle,
  Share2: Share2,
  FileText: FileText,
  Code: Code,
  Link: LinkIcon
};

export const PRESET_CHANNELS = [
  {
    name: "LinkedIn",
    displayName: "LinkedIn",
    subText: "linkedin.com/in/ahmadjordan",
    icon: "Linkedin",
    url: "https://www.linkedin.com/in/ahmadjordan",
    placeholderUrl: "https://www.linkedin.com/in/username",
  },
  {
    name: "Email",
    displayName: "Email Inbox",
    subText: "ahmadjordan186@gmail.com",
    icon: "Mail",
    url: "mailto:ahmadjordan186@gmail.com",
    placeholderUrl: "mailto:your-email@gmail.com",
  },
  {
    name: "WhatsApp",
    displayName: "Direct Contact",
    subText: "+62 899-7493-736",
    icon: "Phone",
    url: "https://wa.me/628997493736",
    placeholderUrl: "https://wa.me/628...",
  },
  {
    name: "GitHub",
    displayName: "GitHub Profile",
    subText: "github.com/ahdiru",
    icon: "Github",
    url: "https://github.com/ahdiru",
    placeholderUrl: "https://github.com/username",
  },
  {
    name: "Portfolio",
    displayName: "Live Portfolio",
    subText: "bit.ly/Jordansportfolio",
    icon: "Globe",
    url: "https://bit.ly/Jordansportfolio",
    placeholderUrl: "https://yourwebsite.com",
  },
  {
    name: "Instagram",
    displayName: "Instagram",
    subText: "@ahmadjordan",
    icon: "Instagram",
    url: "https://instagram.com",
    placeholderUrl: "https://instagram.com/username",
  },
  {
    name: "Twitter / X",
    displayName: "Twitter / X",
    subText: "@ahmadjordan",
    icon: "Twitter",
    url: "https://x.com",
    placeholderUrl: "https://x.com/username",
  },
  {
    name: "YouTube",
    displayName: "YouTube Channel",
    subText: "youtube.com/@channel",
    icon: "Youtube",
    url: "https://youtube.com",
    placeholderUrl: "https://youtube.com/@channel",
  },
  {
    name: "Telegram",
    displayName: "Telegram Direct",
    subText: "t.me/username",
    icon: "Send",
    url: "https://t.me",
    placeholderUrl: "https://t.me/username",
  },
];

export const DEFAULT_DIRECT_CHANNELS = [
  {
    id: "linkedin",
    name: "LinkedIn",
    displayName: "LinkedIn",
    subText: "linkedin.com/in/ahmadjordan",
    icon: "Linkedin",
    url: "https://www.linkedin.com/in/ahmadjordan",
    isPrimary: true,
    isEnabled: true,
  },
  {
    id: "email",
    name: "Email",
    displayName: "Email Inbox",
    subText: "ahmadjordan186@gmail.com",
    icon: "Mail",
    url: "mailto:ahmadjordan186@gmail.com",
    isPrimary: false,
    isEnabled: true,
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    displayName: "Direct Contact",
    subText: "+62 899-7493-736",
    icon: "Phone",
    url: "https://wa.me/628997493736",
    isPrimary: false,
    isEnabled: true,
  },
  {
    id: "portfolio",
    name: "Portfolio",
    displayName: "Live Portfolio",
    subText: "bit.ly/Jordansportfolio",
    icon: "Globe",
    url: "https://bit.ly/Jordansportfolio",
    isPrimary: false,
    isEnabled: true,
  },
];

export const getDirectChannels = () => {
  try {
    const raw = localStorage.getItem("portfolio_direct_channels");
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to read direct channels:", e);
  }
  return DEFAULT_DIRECT_CHANNELS;
};

export const saveDirectChannels = (channels) => {
  try {
    localStorage.setItem("portfolio_direct_channels", JSON.stringify(channels));
    window.dispatchEvent(new Event("portfolioDirectChannelsUpdated"));
    window.dispatchEvent(new Event("storage"));
    return true;
  } catch (e) {
    console.error("Failed to save direct channels:", e);
    return false;
  }
};

export const resetDirectChannels = () => {
  try {
    localStorage.removeItem("portfolio_direct_channels");
    window.dispatchEvent(new Event("portfolioDirectChannelsUpdated"));
    window.dispatchEvent(new Event("storage"));
    return DEFAULT_DIRECT_CHANNELS;
  } catch (e) {
    console.error("Failed to reset direct channels:", e);
    return DEFAULT_DIRECT_CHANNELS;
  }
};

export const useDirectChannels = () => {
  const [channels, setChannels] = useState(getDirectChannels);

  useEffect(() => {
    const handleUpdate = () => {
      setChannels(getDirectChannels());
    };

    window.addEventListener("portfolioDirectChannelsUpdated", handleUpdate);
    window.addEventListener("storage", handleUpdate);
    return () => {
      window.removeEventListener("portfolioDirectChannelsUpdated", handleUpdate);
      window.removeEventListener("storage", handleUpdate);
    };
  }, []);

  return channels;
};

import { Mail, MapPin, Phone } from "lucide-react";
import { ROUTES } from "./appConstants";

export const PUBLIC_NAV_LINKS = [
  { label: "Home", path: ROUTES.HOME },
  { label: "About", path: ROUTES.ABOUT },
  { label: "Success Stories", path: ROUTES.SUCCESS_STORIES },
];

export const FOOTER_QUICK_LINKS = [
  { label: "About Us", path: "#" },
  { label: "Alumni Directory", path: "#" },
  { label: "Events Calendar", path: "#" },
  { label: "Job Board", path: "#" },
];

export const FOOTER_RESOURCE_LINKS = [
  { label: "Mentorship Program", path: "#" },
  { label: "Career Coaching", path: "#" },
  { label: "Webinars & Courses", path: "#" },
  { label: "Alumni Benefits", path: "#" },
];

export const FOOTER_CONTACT_ITEMS = [
  { icon: Mail, label: "support@alumninexus.edu" },
  { icon: Phone, label: "+1 (800) 123-4567" },
  { icon: MapPin, label: "123 University Ave, NY 10001" },
];

export const FOOTER_LEGAL_LINKS = [
  { label: "Privacy Policy", path: "#" },
  { label: "Terms of Service", path: "#" },
  { label: "Cookie Policy", path: "#" },
];

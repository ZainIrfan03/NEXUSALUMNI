import React from "react";
import { Link2, Share2, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">Alumni Nexus</h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Connecting graduates globally. Fostering lifelong relationships and
            professional growth.
          </p>


          <div className="flex items-center gap-4 text-gray-500">
            <Link2 size={18} className="cursor-pointer hover:text-primary transition-colors" />
            <Share2 size={18} className="cursor-pointer hover:text-primary transition-colors" />
            <Mail size={18} className="cursor-pointer hover:text-primary transition-colors" />
          </div>
        </div>

     
        <div>
          <h4 className="text-sm font-semibold text-dark mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary transition-colors">About Us</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Alumni Directory</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Events Calendar</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Job Board</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-dark mb-4">Resources</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            <li><a href="#" className="hover:text-primary transition-colors">Mentorship Program</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Career Coaching</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Webinars & Courses</a></li>
            <li><a href="#" className="hover:text-primary transition-colors">Alumni Benefits</a></li>
          </ul>
        </div>

        
        <div>
          <h4 className="text-sm font-semibold text-dark mb-4">Contact</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            <li className="flex items-center gap-2">
              <Mail size={15} /> support@alumninexus.edu
            </li>
            <li className="flex items-center gap-2">
              <Phone size={15} /> +1 (800) 123-4567
            </li>
            <li className="flex items-center gap-2">
              <MapPin size={15} /> 123 University Ave, NY 10001
            </li>
          </ul>
        </div>
      </div>

     
      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© 2024 Alumni Nexus University. All rights reserved.</span>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}



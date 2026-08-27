import { Link2, Share2, Mail } from "lucide-react";
import { Link } from "react-router-dom";
import {
  FOOTER_CONTACT_ITEMS,
  FOOTER_LEGAL_LINKS,
  FOOTER_QUICK_LINKS,
  FOOTER_RESOURCE_LINKS,
} from "../../consts/publicNavigation";

export default function Footer() {
  return (
    <footer className="w-full bg-white border-t border-gray-100">
      <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <h3 className="text-lg font-semibold text-primary mb-3">
            Alumni Nexus
          </h3>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            Connecting graduates globally. Fostering lifelong relationships and
            professional growth.
          </p>

          <div className="flex items-center gap-4 text-gray-500">
            <Link2
              size={18}
              className="cursor-pointer hover:text-primary transition-colors"
            />
            <Share2
              size={18}
              className="cursor-pointer hover:text-primary transition-colors"
            />
            <Mail
              size={18}
              className="cursor-pointer hover:text-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-dark mb-4">Quick Links</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            {FOOTER_QUICK_LINKS.map(({ label, path }) => (
              <li key={label}>
                <Link to={path} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-dark mb-4">Resources</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            {FOOTER_RESOURCE_LINKS.map(({ label, path }) => (
              <li key={label}>
                <Link to={path} className="hover:text-primary transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-dark mb-4">Contact</h4>
          <ul className="flex flex-col gap-3 text-sm text-gray-500">
            {FOOTER_CONTACT_ITEMS.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2">
                <Icon size={15} /> {label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-100">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <span>© 2024 Alumni Nexus University. All rights reserved.</span>
          <div className="flex items-center gap-6">
            {FOOTER_LEGAL_LINKS.map(({ label, path }) => (
              <Link
                key={label}
                to={path}
                className="hover:text-primary transition-colors"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

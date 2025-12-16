import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { useTranslation } from "react-i18next"; 
import KashtaLogo from "../../assets/Kashtalogo.png";

// --- Constants & Data ---

// Social media links can stay outside as they don't usually need translation
const SOCIAL_LINKS = [
  { icon: FaFacebook, href: "#", label: "Facebook" },
  { icon: FaTwitter, href: "#", label: "Twitter" },
  { icon: FaInstagram, href: "#", label: "Instagram" },
];

// --- Sub-Components ---

const FooterLinksList = ({ links }) => (
  <ul className="space-y-2">
    {links.map((link, index) => (
      <li key={index}>
        <Link
          to={link.path}
          className="text-main-text/90 hover:text-main-accent transition-colors duration-200 block w-fit"
        >
          {link.label}
        </Link>
      </li>
    ))}
  </ul>
);

const SocialIcon = ({ icon: Icon, href, label }) => (
  <a
    href={href}
    aria-label={label}
    className="text-main-text/90 hover:text-main-accent transition-colors duration-200 p-2 hover:bg-main-text/5 rounded-full"
  >
    <Icon size={24} />
  </a>
);

// --- Main Component ---

function Footer() {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  const QUICK_LINKS = [
    { label: t('footer.home'), path: "/" },
    { label: t('footer.about'), path: "/about-us" },
  ];

  const PROVIDER_LINKS = [
    { label: t('footer.add_service'), path: "/add-service" },
    { label: t('footer.manage_bookings'), path: "/manage-bookings" },
  ];

  return (
    <footer className="bg-second-bg text-main-text py-12 mt-auto shadow-inner ">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* 1. Brand & About Section */}
        <div className="flex flex-col items-start">
          <img 
            src={KashtaLogo} 
            alt="KASHTA Logo" 
            className="h-24 w-24 mb-4 object-contain" 
            loading="lazy"
          />
          <p className="text-main-text/90 leading-relaxed max-w-xs">
            {t('footer.description')} 
          </p>
        </div>

        {/* 2. Quick Links Section */}
        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-main-bg pb-2 w-fit">
            {t('footer.quick_links')} 
          </h3>
          <FooterLinksList links={QUICK_LINKS} />
        </div>

        {/* 3. Provider Links Section */}
        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-main-bg pb-2 w-fit">
            {t('footer.for_providers')} 
          </h3>
          <FooterLinksList links={PROVIDER_LINKS} />
        </div>

        {/* 4. Contact & Social Section */}
        <div>
          <h3 className="text-xl font-bold mb-4 border-b-2 border-main-bg pb-2 w-fit">
            {t('footer.contact_us')} 
          </h3>
          <div className="flex gap-2">
            {SOCIAL_LINKS.map((social, index) => (
              <SocialIcon 
                key={index} 
                icon={social.icon} 
                href={social.href} 
                label={social.label} 
              />
            ))}
          </div>
        </div>

      </div>

      {/* Copyrights Section */}
      <div className="border-t border-main-bg mt-10 pt-8 text-center text-main-text/60 text-sm">
        <p>&copy; {currentYear} {t('footer.copyrights')}</p>
      </div>
    </footer>
  );
}

export default Footer;
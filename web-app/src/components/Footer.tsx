'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Github, 
  Linkedin, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  FileText,
  Globe,
  Users,
  Award
} from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Twitter', href: 'https://x.com/zebradotsol', icon: Twitter },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/satyendra-yadav-8b0140323/', icon: Linkedin },
    { name: 'GitHub', href: 'https://github.com/zebra0307/blue-carbon-registry', icon: Github },
    { name: 'YouTube', href: 'https://www.youtube.com/watch?v=p-SEGb1DN_c', icon: Youtube },
  ];

  const companyLinks = [
    { name: 'About', href: 'https://www.nccr.gov.in/' },
    { name: 'Contact', href: 'https://www.nccr.gov.in/' },
    { name: 'Case Studies', href: 'https://www.nccr.gov.in/' },
    { name: 'Privacy Policy', href: 'https://www.nccr.gov.in/' },
    { name: 'Terms & Conditions', href: 'https://www.nccr.gov.in/' },
  ];

  const programsLinks = [
    { name: 'Blue Carbon Institute', href: 'https://www.nccr.gov.in/' },
    { name: 'Carbon Credit Engine', href: 'https://www.nccr.gov.in/' },
    { name: 'Research Portal', href: 'https://www.nccr.gov.in/' },
    { name: 'Verification Training', href: 'https://www.nccr.gov.in/' },
    { name: 'Developer Resources', href: 'https://www.nccr.gov.in/' },
    { name: 'Partnership Program', href: 'https://www.nccr.gov.in/' },
  ];

  const resourcesLinks = [
    { name: 'MRV Documentation', href: 'https://www.nccr.gov.in/' },
    { name: 'Methodology Library', href: 'https://www.nccr.gov.in/' },
    { name: 'Verification Standards', href: 'https://www.nccr.gov.in/' },
    { name: 'Project Success Stories', href: 'https://www.nccr.gov.in/' },
    { name: 'Carbon Market Reports', href: 'https://www.nccr.gov.in/' },
  ];

  const portalLinks = [
    { name: 'NCCR Portal', href: 'https://www.nccr.gov.in/', icon: Globe },
    { name: 'Carbon MRV System', href: 'https://www.nccr.gov.in/', icon: FileText },
    { name: 'Verification Hub', href: 'https://www.nccr.gov.in/', icon: Award },
    { name: 'Community Forum', href: 'https://www.nccr.gov.in/', icon: Users },
  ];

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 mb-6">
          {/* Brand & Contact */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-3 mb-3 sm:mb-4">
              <div className="relative w-7 h-7 rounded-lg overflow-hidden bg-white/10 backdrop-blur-sm">
                <Image 
                  src="/OceanaVerse.png" 
                  alt="OceanaVerse Logo" 
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <span className="text-lg font-bold text-white">OceanaVerse</span>
            </div>
            
            <p className="text-gray-400 text-xs sm:text-sm mb-4 leading-relaxed">
              Revolutionizing blue carbon markets through blockchain technology.
            </p>

            {/* Contact Information - Compact */}
            <div className="space-y-2 mb-4 text-xs">
              <div className="flex items-center space-x-2 text-gray-400">
                <Mail className="h-3 w-3 text-blue-400 flex-shrink-0" />
                <span>contact@oceanaverse.org</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-400">
                <Phone className="h-3 w-3 text-blue-400 flex-shrink-0" />
                <span>+1 (555) 123-4567</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="text-gray-400 hover:text-white transition-colors duration-200"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Company
            </h3>
            <ul className="space-y-2">
              {companyLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-xs transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Programs Links */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Programs
            </h3>
            <ul className="space-y-2">
              {programsLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-xs transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              Resources
            </h3>
            <ul className="space-y-2">
              {resourcesLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-xs transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Portal Links */}
          <div>
            <h3 className="text-white font-semibold text-xs uppercase tracking-wider mb-3">
              External Portals
            </h3>
            <ul className="space-y-2">
              {portalLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-white text-xs transition-colors duration-200 flex items-center group"
                  >
                    <link.icon className="h-3 w-3 mr-2 flex-shrink-0" />
                    <span className="flex-1">{link.name}</span>
                    <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 pt-4">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
            {/* Copyright & Location */}
            <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4 text-gray-400 text-xs">
              <span>© {currentYear} OceanaVerse. All rights reserved.</span>
              <div className="hidden sm:block w-px h-3 bg-gray-600"></div>
              <div className="flex items-center space-x-1">
                <MapPin className="h-3 w-3 text-blue-400" />
                <span>Global Carbon Solutions Hub</span>
              </div>
            </div>

            {/* Tech Info */}
            <div className="flex items-center space-x-4 text-xs text-gray-400">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Built on Solana</span>
              </div>
              <div className="hidden sm:block w-px h-3 bg-gray-600"></div>
              <span>v1.98.0</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
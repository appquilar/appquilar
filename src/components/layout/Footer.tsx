
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-secondary py-12 px-6 md:px-8 mt-20">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and description */}
          <div className="space-y-4 md:col-span-2">
            <Link to="/" className="text-xl font-display font-semibold tracking-tight">
              RentTools
            </Link>
            <p className="text-muted-foreground max-w-md">
              The easiest way to rent high-quality tools and equipment. Save money, reduce waste, and get your job done right.
            </p>
          </div>
          
          {/* Quick links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase text-muted-foreground">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-sm hover:underline">About Us</Link>
              </li>
              <li>
                <Link to="/become-partner" className="text-sm hover:underline">Become a Partner</Link>
              </li>
              <li>
                <Link to="/blog" className="text-sm hover:underline">Blog</Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm hover:underline">Contact</Link>
              </li>
            </ul>
          </div>
          
          {/* Social links */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium uppercase text-muted-foreground">Connect</h3>
            <div className="flex space-x-4">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
              <a 
                href="https://linkedin.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin size={18} />
              </a>
            </div>
            <div className="pt-4">
              <p className="text-sm text-muted-foreground">
                Sign up for our newsletter to receive updates and special offers.
              </p>
              <div className="mt-2 flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="flex-1 px-3 py-2 text-sm border border-border rounded-l-md"
                />
                <button className="bg-primary text-primary-foreground px-4 py-2 text-sm rounded-r-md hover:bg-primary/90 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 pt-6 border-t border-border flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} RentTools. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/terms" className="text-xs text-muted-foreground hover:underline">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-xs text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link to="/cookies" className="text-xs text-muted-foreground hover:underline">
              Cookie Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

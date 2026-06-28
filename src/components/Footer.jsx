import React from "react";
import { Facebook, Twitter, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-200 py-6 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-semibold text-zinc-500">
          
          <div>
            © {new Date().getFullYear()}{" "}
            <span className="text-zinc-800 font-bold">JD InfoTech</span>. All rights reserved.
          </div>

          {/* Center Links */}
          <div className="flex gap-6">
            <a href="#" className="hover:text-zinc-800 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-zinc-800 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-zinc-800 transition-colors">Contact Support</a>
          </div>

          {/* Right Socials */}
          <div className="flex gap-4">
            <a href="#" className="hover:text-zinc-800 transition-colors">
              <Facebook size={15} />
            </a>
            <a href="#" className="hover:text-zinc-800 transition-colors">
              <Twitter size={15} />
            </a>
            <a href="#" className="hover:text-zinc-800 transition-colors">
              <Linkedin size={15} />
            </a>
          </div>

        </div>
      </div>
    </footer>
  );
}

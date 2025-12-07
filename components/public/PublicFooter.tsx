import Link from "next/link";

export default function PublicFooter() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    platform: [
      { label: "Tournaments", href: "/tournaments" },
      { label: "Matches", href: "/matches" },
      { label: "Players", href: "/players" },
      { label: "Clubs", href: "/clubs" },
    ],
    company: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
    ],
    social: [
      { label: "Twitter", href: "#", icon: "twitter" },
      { label: "Facebook", href: "#", icon: "facebook" },
      { label: "Instagram", href: "#", icon: "instagram" },
      { label: "YouTube", href: "#", icon: "youtube" },
    ],
  };

  return (
    <footer className="bg-[#1A1A1A] border-t-2 border-[#FFB700] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-white/10 rounded-lg border border-[#FFB700]/30 flex items-center justify-center hover:bg-white/20 transition-colors">
                <img
                  src="/logo.png"
                  alt="Eskimos Logo"
                  className="w-full h-full object-contain p-1"
                />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-[#FFB700] to-[#FF6600] bg-clip-text text-transparent">
                Eskimos
              </span>
            </Link>
            <p className="text-sm text-[#E4E5E7] mb-4">
              Experience sports data like never before. Immersive visualizations, real-time statistics, and engaging storytelling.
            </p>
            <div className="flex gap-3">
              {footerLinks.social.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="w-9 h-9 rounded-lg bg-[#FF6600]/20 hover:bg-[#FF6600] flex items-center justify-center transition-colors group border border-[#FFB700]/30"
                  aria-label={social.label}
                >
                  <svg
                    className="w-4 h-4 text-[#FFB700] group-hover:text-white transition-colors"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {social.icon === "twitter" && (
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    )}
                    {social.icon === "facebook" && (
                      <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                    )}
                    {social.icon === "instagram" && (
                      <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M7.5 2h9A5.5 5.5 0 0122 7.5v9a5.5 5.5 0 01-5.5 5.5h-9A5.5 5.5 0 012 16.5v-9A5.5 5.5 0 017.5 2z" />
                    )}
                    {social.icon === "youtube" && (
                      <path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29 29 0 001 11.75a29 29 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29 29 0 00.46-5.25 29 29 0 00-.46-5.33z" />
                    )}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 border-b border-[#FFB700]/30 pb-2">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#E4E5E7] hover:text-[#FFB700] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 border-b border-[#FFB700]/30 pb-2">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#E4E5E7] hover:text-[#FFB700] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 border-b border-[#FFB700]/30 pb-2">Stay Updated</h3>
            <p className="text-sm text-[#E4E5E7] mb-4">
              Get the latest tournament updates and highlights.
            </p>
            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-4 py-2 rounded-lg border border-[#FFB700]/30 bg-[#1A1A1A] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF6600] focus:border-[#FFB700] text-sm"
                aria-label="Email address"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#FF6600] hover:bg-[#CC2900] text-white text-sm font-medium transition-colors border-t-2 border-[#FFB700]"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#FFB700]/30">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-[#E4E5E7]">
              © {currentYear} Eskimos Sports Platform. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-[#E4E5E7] hover:text-[#FFB700] transition-colors"
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-[#E4E5E7] hover:text-[#FFB700] transition-colors"
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-[#E4E5E7] hover:text-[#FFB700] transition-colors"
              >
                Cookies
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

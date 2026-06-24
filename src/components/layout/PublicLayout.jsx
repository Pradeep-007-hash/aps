import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';

export default function PublicLayout() {
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  // Toggle dark class on HTML element
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
    }
  }, [isDarkMode]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const activeLinkClass = "text-primary-600 dark:text-primary-400 border-b-2 border-primary-600 dark:border-primary-400 pb-1";
  const inactiveLinkClass = "text-gray-500 dark:text-gray-400 pb-1 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200";

  return (
    <div className="bg-gray-50 dark:bg-gray-950 font-sans text-gray-900 dark:text-white antialiased min-h-screen transition-colors duration-300 flex flex-col">
      {/* TopNavBar Implementation */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="flex justify-between items-center max-w-7xl mx-auto px-8 h-20 w-full">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-primary-500/30 text-white font-bold">
              UN
            </div>
            <span className="text-2xl font-extrabold tracking-tighter text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
              UrbanNest
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-10 font-semibold tracking-tight text-sm">
            <Link 
              to="/#features" 
              className={location.hash === '#features' ? activeLinkClass : inactiveLinkClass}
              onClick={() => {
                if (location.pathname === '/') {
                  document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Features
            </Link>
            <Link 
              to="/pricing" 
              className={location.pathname === '/pricing' ? activeLinkClass : inactiveLinkClass}
            >
              Pricing
            </Link>
            <Link 
              to="/about" 
              className={location.pathname === '/about' ? activeLinkClass : inactiveLinkClass}
            >
              About
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors mr-2 focus:outline-none"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <Link to="/login" className="text-gray-600 dark:text-gray-300 font-semibold text-sm hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">
              Login
            </Link>
            <Link to="/register" className="bg-gradient-to-br from-primary-600 to-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary-500/30 transition-all scale-95 hover:scale-100">
              Sign up
            </Link>
          </div>
        </div>
      </nav>

      <main className="pt-20 flex-grow">
        <Outlet />
      </main>

      {/* Footer Implementation */}
      <footer className="bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900 transition-colors mt-auto">
        <div className="max-w-7xl mx-auto px-8 py-20 flex flex-col md:flex-row justify-between items-start gap-16">
          <div className="max-w-xs">
            <span className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tighter mb-6 block bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-indigo-600">
              UrbanNest Portal
            </span>
            <p className="text-sm leading-relaxed text-gray-500 dark:text-gray-400 font-medium">
              Architecting digital foundations for modern communities. We provide the stability for your growth.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-12 md:gap-24">
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-6 uppercase tracking-wider">Company</h5>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li><Link className="hover:text-primary-600 transition-colors" to="/about">About Us</Link></li>
                <li><a className="hover:text-primary-600 transition-colors" href="#">Careers</a></li>
                <li><a className="hover:text-primary-600 transition-colors" href="#">Blog</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-6 uppercase tracking-wider">Resources</h5>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li><a className="hover:text-primary-600 transition-colors" href="#">Help Center</a></li>
                <li><a className="hover:text-primary-600 transition-colors" href="#">Community Guidelines</a></li>
                <li><a className="hover:text-primary-600 transition-colors" href="#">Contact</a></li>
              </ul>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-6 uppercase tracking-wider">Legal</h5>
              <ul className="space-y-4 text-sm text-gray-500 dark:text-gray-400 font-medium">
                <li><a className="hover:text-primary-600 transition-colors" href="#">Privacy Policy</a></li>
                <li><a className="hover:text-primary-600 transition-colors" href="#">Terms of Service</a></li>
                <li><a className="hover:text-primary-600 transition-colors" href="#">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-8 py-8 border-t border-gray-100 dark:border-gray-900 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
          <p className="text-sm text-gray-400 font-medium text-center md:text-left">
            © 2024 UrbanNest Systems. Architecting digital foundations.
          </p>
          <div className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
            </div>
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-900 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors flex items-center justify-center cursor-pointer">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

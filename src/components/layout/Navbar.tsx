import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, User, LogOut, Menu, X, Compass, Users, Settings, MessageCircle, Music } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useVideoStore } from '../../store/videoStore';
import { motion, AnimatePresence } from 'framer-motion';
import NotificationBell from '../notifications/NotificationBell';
import ChatButton from '../chat/ChatButton';
import SettingsPanel from '../settings/SettingsPanel';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { user, signOut } = useAuthStore();
  const { feedType, setFeedType } = useVideoStore();
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-gray-850 border-r border-gray-800 z-50 flex flex-col items-center py-4">
        <Link to="/" className="mb-8">
          <img src="/logo (2).png" alt="OmniPlay" className="w-12 h-12" />
        </Link>

        <div className="flex-1 flex flex-col items-center space-y-4">
          <NavItem
            to="/"
            icon={<Home size={24} />}
            label="Home"
            isActive={location.pathname === '/'}
          />
          
          <NavItem
            to="/search"
            icon={<Search size={24} />}
            label="Search"
            isActive={location.pathname === '/search'}
          />
          
          <NavItem
            to="/upload"
            icon={<PlusSquare size={24} />}
            label="Upload"
            isActive={location.pathname === '/upload'}
          />
          
          <NavItem
            to="/audio"
            icon={<Music size={24} />}
            label="Audio"
            isActive={location.pathname === '/audio'}
          />
          
          {user && (
            <NavItem
              to={`/profile/${user.id}`}
              icon={<User size={24} />}
              label="Profile"
              isActive={location.pathname === `/profile/${user.id}`}
            />
          )}
        </div>

        <div className="mt-auto flex flex-col items-center space-y-4">
          <NotificationBell />
          <ChatButton />
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 hover:bg-gray-800 rounded-full transition-colors"
          >
            <Settings size={24} />
          </button>
          <button
            onClick={signOut}
            className="p-2 text-red-500 hover:bg-gray-800 rounded-full transition-colors"
          >
            <LogOut size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {showSettings && (
          <SettingsPanel onClose={() => setShowSettings(false)} />
        )}
      </AnimatePresence>
    </>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label, isActive }) => {
  return (
    <Link
      to={to}
      className={`relative p-2 rounded-xl transition-all duration-200 group ${
        isActive ? 'text-white' : 'text-gray-400 hover:text-white'
      }`}
    >
      {isActive && (
        <motion.div
          layoutId="active-nav"
          className="absolute inset-0 bg-gradient-brand opacity-20 rounded-xl"
          transition={{ type: "spring", duration: 0.5 }}
        />
      )}
      <div className="relative z-10">
        {icon}
      </div>
      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-800 rounded-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
        {label}
      </div>
    </Link>
  );
};

export default Navbar;
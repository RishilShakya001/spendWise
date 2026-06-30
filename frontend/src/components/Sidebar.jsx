/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { Home, ArrowUp, ArrowDown, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { sidebarStyles, cn } from '../assets/dummyStyles';

const MENU_ITEMS = [
  { text: "Dashboard", path: "/", icon: <Home size={20} /> },
  { text: "Income", path: "/income", icon: <ArrowUp size={20} /> },
  { text: "Expenses", path: "/expense", icon: <ArrowDown size={20} /> },
  { text: "Profile", path: "/profile", icon: <User size={20} /> },
];

const Sidebar = ({ mobileOpen, setMobileOpen, isCollapsed }) => {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const pathname = location.pathname;
  const [activeHover, setActiveHover] = useState(null);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto" };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileOpen && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileOpen, setMobileOpen]);

  const renderMenuItem = ({ text, path, icon }) => {
    const isActive = pathname === path;
    return (
      <motion.li key={text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Link
          to={path}
          className={cn(
            sidebarStyles.menuItem.base,
            isActive ? sidebarStyles.menuItem.active : sidebarStyles.menuItem.inactive,
            isCollapsed ? sidebarStyles.menuItem.collapsed : sidebarStyles.menuItem.expanded
          )}
          onMouseEnter={() => setActiveHover(text)}
          onMouseLeave={() => setActiveHover(null)}
        >
          <span className={isActive ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
            {icon}
          </span>
          {!isCollapsed && (
            <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}>
              {text}
            </motion.span>
          )}
          {activeHover === text && !isActive && !isCollapsed && (
            <span className={sidebarStyles.activeIndicator}></span>
          )}
        </Link>
      </motion.li>
    );
  };

  return (
    <div>
      <div className="hidden lg:block">
        <ul>{MENU_ITEMS.map(renderMenuItem)}</ul>
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: isCollapsed ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points={isCollapsed ? "9 18 15 12 9 6" : "15 18 9 12 15 6"}></polyline>
          </svg>
        </motion.div>
      </div>
      
      {mobileOpen && (
        <motion.div
          className={sidebarStyles.mobileOverlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className={sidebarStyles.mobileBackdrop}
            onClick={() => setMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          
          <motion.div
            ref={sidebarRef}
            className={sidebarStyles.mobileSidebar.base}
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
          >
           <ul className={sidebarStyles.mobileMenuList}>
              {MENU_ITEMS.map(({ text, path, icon }) => (
                <motion.li key={text} whileTap={{ scale: 0.98 }}>
                  <Link
                    to={path}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      sidebarStyles.mobileMenuItem.base,
                      pathname === path 
                        ? sidebarStyles.mobileMenuItem.active 
                        : sidebarStyles.mobileMenuItem.inactive
                    )}
                  >
                    <span className={pathname === path ? sidebarStyles.menuIcon.active : sidebarStyles.menuIcon.inactive}>
                      {icon}
                    </span>
                    <span>{text}</span>
                  </Link>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Sidebar;

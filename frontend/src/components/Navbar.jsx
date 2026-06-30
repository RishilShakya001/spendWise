import React, { useEffect } from 'react';

const Navbar = ({ menuRef, setMenuOpen }) => {
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef?.current && !menuRef.current.contains(e.target)) {
        setMenuOpen?.(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef, setMenuOpen]);

  return <nav>Navbar</nav>;
};

export default Navbar;
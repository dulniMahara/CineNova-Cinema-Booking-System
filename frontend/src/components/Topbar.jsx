import React, { useState, useRef, useEffect, useContext } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";
import { toast } from 'react-toastify';
import {
  MdMovie,
  MdMenu,
  MdNotifications,
  MdSchedule,
  MdTheaters,
  MdPayments,
  MdConfirmationNumber,
  MdSearch,
  MdPeople,
  MdLogin,
  MdHome,
  MdInfo
} from "react-icons/md";
import { SearchContext } from "../context/SearchContext";
import { getMovies } from "../services/movieService";
import ProfileDropdown from "./ProfileDropdown";
import "./Topbar.css";

const Topbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { searchQuery, setSearchQuery } = useContext(SearchContext);
  const [searchResults, setSearchResults] = useState([]);
  const [notFound, setNotFound] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const searchRef = useRef(null);

  const isHomePage = location.pathname === "/home" || location.pathname === "/";

  const role = localStorage.getItem("role"); // 'admin' | 'customer'

  // Scroll listener for transparent navbar
  useEffect(() => {
    const handleScroll = () => {
      if (isHomePage && window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isHomePage]);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, [location]);

  // 2. Fetch Notification Count (New)
  useEffect(() => {
    const fetchUnreadCount = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/notifications/unread-count`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUnreadCount(res.data.count);
      } catch (error) {
        // Silent error handling
      }
    };

    fetchUnreadCount();
    
    // Poll every 30s to keep sync
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, location.pathname]); 

  // 3. Socket Connection (New)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    const userId = user ? (user.id || user._id) : null; 

    // Stop if no valid user ID
    if (!token || !userId) return; 

    const socket = io(process.env.REACT_APP_API_URL.replace(/\/api$/, ''));

    socket.on("connect", () => {
        socket.emit("register", userId);
    });

    socket.on("receive_notification", (newNotif) => {
      setUnreadCount((prev) => prev + 1);
      toast.info(`🔔 ${newNotif.message}`);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated]);

  // 4. Click Outside Logic (Old)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 900) setMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setNotFound(false);
        return;
      }
      try {
        const movies = await getMovies({ title: searchQuery.trim() });
        if (movies.length > 0) {
          setSearchResults(movies);
          setNotFound(false);
        } else {
          setSearchResults([]);
          setNotFound(true);
        }
      } catch (error) {
        console.error("Error searching movie:", error);
        setSearchResults([]);
        setNotFound(true);
      }
    };
    const delayDebounce = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleResultClick = (id) => {
    navigate(`/movies/${id}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    setIsAuthenticated(false);
    navigate("/home");
  };

  const adminLinks = (
    <>
      <NavLink to="/home" onClick={() => setMobileOpen(false)}>
        <MdHome /> Home
      </NavLink>
      <NavLink to="/admin/movies" onClick={() => setMobileOpen(false)}>
        <MdMovie /> Movies
      </NavLink>
      <NavLink to="/admin/users" onClick={() => setMobileOpen(false)}>
        <MdPeople /> Users
      </NavLink>
      <NavLink to="/admin/showtimes" onClick={() => setMobileOpen(false)}>
        <MdSchedule /> Showtimes
      </NavLink>
      <NavLink to="/admin/halls" onClick={() => setMobileOpen(false)}>
        <MdTheaters /> Halls
      </NavLink>

      <NavLink to="/admin/bookings" onClick={() => setMobileOpen(false)}>
        <MdConfirmationNumber /> Bookings
      </NavLink>
      <NavLink to="/payments" onClick={() => setMobileOpen(false)}>
        <MdPayments /> Payments
      </NavLink>
    </>
  );

  const handleNavClick = (target) => {
    setMobileOpen(false);
    if (isHomePage) {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }
    navigate(`/home#${target}`);
  };

  const customerLinks = (
    <>
      <NavLink 
        to="/home" 
        onClick={(e) => {
          if (isHomePage) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
          setMobileOpen(false);
        }}
      >
        <MdHome /> Home
      </NavLink>
      <NavLink to="/movies" end onClick={() => setMobileOpen(false)}>
        <MdMovie /> Movies
      </NavLink>
      <a 
        href="#coming-soon" 
        onClick={(e) => {
          e.preventDefault();
          handleNavClick("coming-soon");
        }}
      >
        <MdSchedule /> Coming Soon
      </a>
      <NavLink to="/about" onClick={() => setMobileOpen(false)}>
        <MdInfo /> About
      </NavLink>
      <a 
        href="#footer" 
        onClick={(e) => {
          e.preventDefault();
          handleNavClick("footer");
        }}
      >
        <MdPeople /> Contact
      </a>
    </>
  );

  const isNotificationsPage = location.pathname === "/notifications";

  return (
    <nav className={`topbar ${isHomePage ? "home-topbar" : ""} ${isScrolled ? "scrolled" : ""}`}>
      <div className="logo">
        <NavLink 
          to="/home" 
          onClick={(e) => {
            if (isHomePage) {
              e.preventDefault();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }
            setMobileOpen(false);
          }}
        >
          <div className="logo-container">
            <span className="logo-text">
              <span className="logo-cine">Cine</span>
              <span className="logo-nova">Nova</span>
            </span>
            <span className="logo-tagline">Where Stories Come Alive</span>
          </div>
        </NavLink>
      </div>

      <div className="hamburger" onClick={() => setMobileOpen(!mobileOpen)}>
        <MdMenu size={28} />
      </div>

      <div className={`nav-links ${mobileOpen ? "active" : ""}`}>
        {role === "admin" && adminLinks}
        {(role === "customer" || !isAuthenticated) && customerLinks}
        {mobileOpen && (
          <>
            <div className="mobile-menu-divider" />
            {isAuthenticated && (
              <NavLink
                to="/notifications"
                className="mobile-menu-item"
                style={{ color: isNotificationsPage ? "#ff3d00" : "#fff" }}
                onClick={() => setMobileOpen(false)}
              >
                <MdNotifications /> Notifications
                {/* Mobile Badge */}
                {unreadCount > 0 && <span style={{marginLeft:'5px', color:'red'}}>({unreadCount})</span>}
              </NavLink>
            )}

            {!isAuthenticated && (
              <NavLink
                to="/login"
                className="mobile-menu-item"
                onClick={() => setMobileOpen(false)}
              >
                <MdLogin /> Login
              </NavLink>
            )}
          </>
        )}
      </div>

      <div className="topbar-right">
        <div className="search-container" ref={searchRef}>
          <MdSearch
            size={22}
            className="search-icon"
            onClick={() => setSearchOpen(!searchOpen)}
          />
          {searchOpen && (
            <div className="search-dropdown-wrapper">
              <input
                type="text"
                className="search-input"
                placeholder="Search movies..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              <div className="search-dropdown">
                {searchResults.map((movie) => (
                  <div
                    key={movie._id}
                    className="search-result-item"
                    onClick={() => handleResultClick(movie._id)}
                  >
                    {movie.title}
                  </div>
                ))}
                {notFound && (
                  <div className="search-result-item not-found">
                    Movie not found
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {isAuthenticated && (
          <NavLink
            to="/notifications"
            className="notifications"
            style={{ color: isNotificationsPage ? "#ff3d00" : "#fff" }}
          >
            <MdNotifications size={22} />
            {/* --- Desktop Badge --- */}
            {unreadCount > 0 && (
                <span className="badge">{unreadCount}</span>
            )}
          </NavLink>
        )}

        {isAuthenticated ? (
          <ProfileDropdown onLogout={handleLogout} />
        ) : (
          <NavLink to="/login" className="login-btn-premium">
            <MdLogin size={18} /> <span>Login</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

export default Topbar;
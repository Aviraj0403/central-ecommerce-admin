import React, { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  // Auto redirect after 10 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/admin/dashboard");
    }, 5000); // Adjusted to redirect after 5 seconds for quicker user feedback
    return () => clearTimeout(timer); // cleanup
  }, [navigate]);

  return (
    <div style={styles.container}>
      {/* Dark overlay for readability */}
      <div style={styles.overlay}></div>
      <div style={styles.content}>
        <h1 style={styles.title}>404 - Page Not Found</h1>
        <p style={styles.message}>
          Oops! Looks like this page is a bit out of stock. 🌸
          <br />
          No worries, we’ll get you back to our fabulous collection in a few seconds…
        </p>
        <Link to="/admin/dashboard" style={styles.button}>
          Back to Store
        </Link>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    textAlign: "center",
    backgroundImage: "url('/gurmeet-kaur-beauty-background.jpg')", // Custom background for the beauty store
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    position: "relative",
    padding: "20px",
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay for readability
    zIndex: 1,
  },
  content: {
    position: "relative",
    zIndex: 2,
    color: "#fff", // White text for contrast
    padding: "20px",
    borderRadius: "8px",
    boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
    maxWidth: "600px",
    width: "100%",
  },
  title: {
    fontSize: "2.4rem", // Slightly larger for emphasis
    fontWeight: "700",
    marginBottom: "10px",
    fontFamily: "'Segoe UI', sans-serif",
  },
  message: {
    fontSize: "1.1rem",
    maxWidth: "400px",
    margin: "0 auto 20px auto",
  },
  button: {
    display: "inline-block",
    padding: "10px 20px",
    background: "#ad1457", // Brand color for button
    color: "#fff",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "600",
    transition: "background 0.3s ease",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
};

// Export the component as default
export default NotFoundPage;

import React, { useEffect, useState } from "react";
import "./HomePage.css";
import { useNavigate } from "react-router-dom";
import linkedinIcon from "../components/icon/linkedin2.png";
import instagramIcon from "../components/icon/instagram.png";
import twitterIcon from "../components/icon/twitter.png";
import lightIcon from "../components/icon/lighttt.png";
import darkIcon from "../components/icon/dark.png";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";

const HomePage = () => {
  const [input, setInput] = useState("");
  const [theme, setTheme] = useState("light");
  const navigate = useNavigate();
  const { loaded, user } = useAuth();
  const { setEmitOnJoin } = useSocket();

  useEffect(() => {
    console.log(loaded, user)
    if (loaded && !user) {
      navigate("/authenticate");
    } 
  }, [user, loaded, navigate])

  const submitHandler = () => {
    if (input.trim()) {
      setEmitOnJoin(false);
      navigate(`/room/${input}`);
    } else {
      alert("please enter your name");
    }
  };

  const openLinkedIn = () => {
    window.open(
      "https://www.linkedin.com/in/anjali-jaiswal-a1228b242/",
      "_blank"
    );
  };

  const openInstagram = () => {
    window.open("https://www.instagram.com/anjali__363/", "_blank");
  };
  const openTwitter = () => {
    window.open("https://twitter.com/home", "_blank");
  };
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
  };

  return (
    <div className={`container ${theme}`}>
      <div
        className="theme-toggle"
        onClick={toggleTheme}
        data-tooltip={theme === "light" ? "Dark Mode" : "Light Mode"}
      >
        <img
          src={theme === "light" ? darkIcon : lightIcon}
          alt={theme === "light" ? "Dark Mode" : "Light Mode"}
          className="theme-icon"
        />
      </div>
      <h1>Welcome to App</h1>
      <p>join the One to One Conference App</p>
      <div className="input-group">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your name"
          type="text"
        />
        <button onClick={submitHandler}>Join</button>
      </div>
      <div className="features">
        <h2>Features:</h2>
        <div className="feature-cards">
          <div className="feature-card">
            <img
              src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAviavnLGLYpgV1tVrDynpVFM81607HJScRxtEQM65lw&s"
              alt="Feature 1"
              className="feature-image"
            />
            <h3>High-quality Video Conferencing</h3>
            <p>
              Experience crystal-clear video calls with advanced video quality.
            </p>
          </div>

          <div className="feature-card">
            <video controls>
              <source
                src="https://www.admiralcloud.com/wp-content/uploads/2021/07/Collaboration-Tool.gif"
                type="video/mp4"
              />
              Your browser does not support the video tag.
            </video>
            <h3>Screen Sharing and Collaboration Tools</h3>
            <p>Share your screen and collaborate seamlessly with your team.</p>
          </div>

          <div className="feature-card">
            <img
              src="https://mootup.com/wp-content/uploads/2020/11/Hand_Shake_Gif.gif"
              alt="Feature 3"
              className="feature-image"
            />
            <h3>Customizable Meeting Rooms</h3>
            <p>Customize your meeting environment to suit your team's needs.</p>
          </div>
          <div className="feature-card">
            <img
              src="https://www.cybermagonline.com/img/sayfa/tenor1.gif"
              alt="Feature 4"
              className="feature-image"
            />
            <h3>Easy-to-Use Interface</h3>
            <p>
              Intuitive interface that makes hosting and joining meetings
              effortless.
            </p>
          </div>
        </div>
      </div>

      <div className="footer">
        <p>Connect with Team Web Fighters</p>
        <div className="social-icons">
          <img
            src={instagramIcon}
            onClick={openInstagram}
            data_tooltip="Instagram"
            alt="instagram"
          />
          <img
            src={linkedinIcon}
            onClick={openLinkedIn}
            data_tooltip="Linkedin"
            alt="Linkedin"
          />
          <img
            src={twitterIcon}
            onClick={openTwitter}
            data_tooltip="Twitter"
            alt="Twitter"
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;

import { useState } from 'react';
import './HomePage.css'; // You can define your own CSS file for styling
import linkedinIcon from './icon/linkedin2.png';
import twitterIcon from './icon/twitter.png';
import instagramIcon from './icon/instagram.png';
import sunIcon from './icon/light.png';
import moonIcon from './icon/dark.png';
import { useRoomAndUserContext } from '../contexts/ManageRoomAndUser';
import { Link } from 'react-router-dom';

import { v4 } from "uuid";

const HomePage = () => {
  const [darkMode, setDarkMode] = useState(false);
  const { setUserName, setRoomId, setJoining, setUID: setContextUID, roomId } = useRoomAndUserContext();
  const [usernameInput, setUsernameInput] = useState("");
  const [conferenceURL, setConferenceURL] = useState<string | null>(null);

  const toggleTheme = () => {
    const body = document.body;
    setDarkMode(!darkMode);
    body.classList.toggle('dark-mode', !darkMode);
  };

  const openLinkedIn = () => {
    window.open('https://www.linkedin.com/in/anjali-jaiswal-a1228b242/', '_blank');
  };

  const openTwitter = () => {
    window.open('https://twitter.com/home', '_blank');
  };

  const openInstagram = () => {
    window.open('https://www.instagram.com/anjali__363/', '_blank');
  };

  async function getRoomID() {
    const userID = v4();
    const body = JSON.stringify({ uid: userID, username: usernameInput });
    console.log(body);
    const response = await fetch("https://kubernetes.glxymesh.com/create-room", {
        method: "POST",
        body,
        headers: {
            "content-type": "application/json"
        }
    });
    
    const { roomId }: { roomId: string } = await response.json();
    setUserName!(usernameInput);
    setRoomId!(roomId);
    setConferenceURL("https://ai-chat-745be.web.app/room/join/"+roomId);
    setContextUID!(userID);
    setJoining!(false);
  }

  return (
    <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
      <div className="left-container">
        <h2 className="features-heading">Features</h2>
        <div className="features-container">
          <div className="scrollable-content">
            <div className="card">
              <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQAviavnLGLYpgV1tVrDynpVFM81607HJScRxtEQM65lw&s" alt="Feature 1" />
              <h3>High-quality Video Conferencing</h3>
              <p>Experience crystal-clear video calls with advanced video quality.</p>
            </div>
            <div className="card">
              <img src="https://www.admiralcloud.com/wp-content/uploads/2021/07/Collaboration-Tool.gif" alt="Feature 2" />
              <h3>Screen Sharing and Collaboration Tools</h3>
              <p>Share your screen and collaborate seamlessly with your team.</p>
            </div>
            <div className="card">
              <img src="https://mootup.com/wp-content/uploads/2020/11/Hand_Shake_Gif.gif" alt="Feature 3" />
              <h3>Customizable Meeting Rooms</h3>
              <p>Customize your meeting environment to suit your team's needs.</p>
            </div>
            <div className="card">
              <img src="https://www.cybermagonline.com/img/sayfa/tenor1.gif" alt="Feature 4" />
              <h3>Easy-to-Use Interface</h3>
              <p>Intuitive interface that makes hosting and joining meetings effortless.</p>
            </div>
          </div>
        </div>
        <footer className="footer">
          <p>Connect with Web Fights Team:</p>
          <div className="social-icons">
            <img src={instagramIcon} alt="Instagram" onClick={openInstagram} />
            <img src={twitterIcon} alt="Twitter" onClick={openTwitter} />
            <img src={linkedinIcon} alt="LinkedIn" onClick={openLinkedIn} />
          </div>
        </footer>
        <div className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? (
            <img src={sunIcon} alt="Light Theme" />
          ) : (
            <img src={moonIcon} alt="Dark Theme" />
          )}
        </div>
      </div>
      <div className="right-container">
        <div className="centered-content">
          { conferenceURL?
          <>
            <div style={{ display: 'flex', alignItems: "center", justifyContent: "center", flexDirection: "column"}}>
              <span>{conferenceURL}</span>
              <Link to={"/room/"+ roomId} className='create-conference-btn' style={{ textDecoration: "none" }}>Go To Room</Link>
            </div>
          </> 
          :
            <>
            <h1>Welcome to API</h1>
            <h2>Join the One to One Conference</h2>
              
            <form onSubmit={async (e) => {
              e.preventDefault();
              await getRoomID();
            }}>
              <input type="text" placeholder='Enter your name' value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} />

              <button className="create-conference-btn">Create Conference Room</button>
            </form>
            </>
          }

        </div>
        <div className="theme-toggle" onClick={toggleTheme}>
          {darkMode ? (
            <img src={sunIcon} alt="Light Theme" />
          ) : (
            <img src={moonIcon} alt="Dark Theme" />
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
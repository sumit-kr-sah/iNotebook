import "./App.css";
import About from "./components/About";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import NoteState from "./context/notes/NoteState";
import ImageState from "./context/images/ImageState";
import UserState from "./context/user/UserState";
import ThemeState from "./context/theme/ThemeState";
import MessageState from "./context/messages/MessageState";
import Alert from "./components/Alert";
import Login from "./components/Login";
import SignUp from "./components/SignUp";
import Images from "./components/Images";
import Notes from "./components/Notes";
import Profile from "./components/Profile";
import Messenger from "./components/Messaging/Messenger";
import { useState } from "react";

function App() {
  const [alert, setAlert] = useState(null);

  const showAlert = (message, type) => {
    setAlert({
      msg: message,
      type: type,
    });
    setTimeout(() => {
      setAlert(null);
    }, 2000);
  };
  return (
    <>
      {/* Context API providers */}
      <ThemeState>
        <NoteState>
          <ImageState>
            <UserState>
              <MessageState>
                <Router>
                  {/* This is Navbar */}
                  <Navbar showAlert={showAlert}/>
                  <Alert alert={alert} />

                  <div className="container">
                    <Routes>
                      <Route exact path="/" element={<Home showAlert={showAlert}/>} />
                      <Route exact path="/about" element={<About />} />
                      <Route exact path="/login" element={<Login showAlert={showAlert}/>} />
                      <Route exact path="/signup" element={<SignUp showAlert={showAlert}/>} />
                      <Route exact path="/images" element={<Images showAlert={showAlert}/>} />
                      <Route exact path="/notes" element={<Notes showAlert={showAlert}/>} />
                      <Route exact path="/profile" element={<Profile showAlert={showAlert}/>} />
                      <Route exact path="/messages" element={<Messenger />} />
                    </Routes>
                  </div>
                </Router>
              </MessageState>
            </UserState>
          </ImageState>
        </NoteState>
      </ThemeState>
    </>
  );
}

export default App;

import { React, useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { initJanusSession } from './janusService.js';

import GuideHomePage from './Pages/Guide/GuideHomePage.js';
import GuideGroupPage from './Pages/Guide/GuideGroupPage.js';
import AudienceHomePage from './Pages/Audience/AudienceHomePage.js';
import AudienceGroupPage from './Pages/Audience/AudienceGroupPage.js';

function App() {
  const hasJanusInit = useRef(false);
  const [session, setSession] = useState(null);
  const [plugin, setPlugin] = useState(null);

  const startJanus = async () => {
    hasJanusInit.current = true;
    const initSession = await initJanusSession();
    if (initSession) {
      const { session, plugin } = initSession;
      setSession(session);
      setPlugin(plugin);
      console.log('Janus is ready');
    } else {
      hasJanusInit.current = false;
    }
  };

  useEffect(() => {
    if (!hasJanusInit.current) {
      console.log('Configuring Janus session & plugin');
      startJanus();
    }
  	
  	return () => {
      if (session) {
        session.destroy();
  		  setSession(null);
        setPlugin(null);
  		  console.log('Janus session destroyed');
  	  }
    };
  }, []);
  
  return (
    <Router>
      <Routes>
        <Route path="/letour" element={<AudienceHomePage plugin={plugin}/>} />
        <Route path="/letour/:groupname" element={<AudienceGroupPage plugin={plugin}/>} />
        <Route path="/letour/guide" element={<GuideHomePage plugin={plugin}/>} />
        <Route path="/letour/guide/:groupname" element={<GuideGroupPage plugin={plugin}/>} />
        <Route path="*" element={<Navigate to="/letour" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
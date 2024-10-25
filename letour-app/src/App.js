import { React, useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { initJanusSession } from './janusService.js';

import GuideHomePage from './Pages/Guide/GuideHomePage.js';
import GuideGroupPage from './Pages/Guide/GuideGroupPage.js';
import AudienceHomePage from './Pages/Audience/AudienceHomePage.js';
import AudienceGroupPage from './Pages/Audience/AudienceGroupPage.js';

function App() {
  const [janusSession, setJanusSession] = useState(null);
	
  useEffect(() => {
    const startJanus = async () => {
	  const initSession = await initJanusSession();
      if (initSession) {
        const { session, plugin } = initSession;
		setJanusSession({ session, plugin });
        console.log('Janus is ready with session and plugin:', session, plugin);
      } else {
        console.error('Failed to initialize Janus session');
      }
    };
    startJanus();
	
	return () => {
      if (janusSession?.session){
		  janusSession.session.destroy();
		  setJanusSession(null);
		  console.log('session.destroy()');
	  }
    };
  }, []);
  return (
    <Router>
      <Routes>
        <Route path="/letour" element={<AudienceHomePage session={janusSession}/>} />
        <Route path="/letour/:groupname" element={<AudienceGroupPage session={janusSession}/>} />
        <Route path="/letour/guide" element={<GuideHomePage session={janusSession}/>} />
        <Route path="/letour/guide/:groupname" element={<GuideGroupPage session={janusSession}/>} />
        <Route path="*" element={<Navigate to="/letour" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
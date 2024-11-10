import { React, useRef, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { initService } from './wrtcservice.js'; // AudioBridge from janode

import GuideHomePage from './Pages/Guide/GuideHomePage.js';
import GuideGroupPage from './Pages/Guide/GuideGroupPage.js';
import AudienceHomePage from './Pages/Audience/AudienceHomePage.js';
import AudienceGroupPage from './Pages/Audience/AudienceGroupPage.js';

function App() {
  const hasService = useRef(false);
  const [service, setService] = useState(null);

  const makeService = async () => {
    hasService.current = true;
    const service = await initService();
    if (service) {
      setService(service);
      console.log('Successfully initialized Janode');
    }
    else {
      hasService.current = false;
      console.log('Failed to initialize Janode');
    }
  }

  useEffect(() => {
    if (!hasService.current) {
      makeService();
    }

    return () => {
      service.destroySession();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/letour" element={<AudienceHomePage />} />
        <Route path="/letour/:groupname" element={<AudienceGroupPage />} />
        <Route path="/letour/guide" element={<GuideHomePage />} />
        <Route path="/letour/guide/:groupname" element={<GuideGroupPage />} />
        <Route path="*" element={<Navigate to="/letour" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

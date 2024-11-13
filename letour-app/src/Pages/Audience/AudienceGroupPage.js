import React, { useState, useEffect, useRef } from 'react';
import { Button, Stack, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const AudienceGroupPage = (props) => {
  const plugin = props.plugin;
  const { groupname } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGroupKey } = location.state || {};
  const [remoteStream, setRemoteStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [dialogState, setDialogState] = useState(false);
  const inRoom = useRef(false);
  const [userDisplay, setUserDisplay] = useState(uuidv4());

  const backgroundstyle = {
    background: 'linear-gradient(45deg, #9892f2, #f5f999)',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
  };

  const silentStream = () => {
    const audioContext = new AudioContext();
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 0;
    const oscillator = audioContext.createOscillator();
    oscillator.frequency.value = 440;
    const destination = audioContext.createMediaStreamDestination();
    oscillator.connect(gainNode).connect(destination);
    oscillator.start();
    gainNode.connect(destination);

    return destination.stream;
  };

  const joinRoom = async () => {
    if (plugin) {
      try {
        // join room
        console.log("Attempting connection to room ", selectedGroupKey)
        let response = await plugin.join(selectedGroupKey, { display: userDisplay });
        // const userStream = await plugin.getUserMedia();
        response = await plugin.offerStream(silentStream(), { offerToReceiveAudio: true }, { muted: true });
        const pc = plugin.getPeerConnection();
        let config = pc.getConfiguration();
        config.iceServers = [{'url': 'stun:' + window.location.host}];
        console.log(config);
        pc.setConfiguration(config);
        // pc.addEventListener('connectionstatechange', async (event) => {
        //   console.log('Connection state changed', event);
        // });
        // pc.addEventListener('datachannel', async (event) => {
        //   console.log('Data channel message', event);
        // });
        pc.addEventListener('icecandidate', async (event) => {
          console.log('Ice candidate', event.candidate);
        });
        // pc.addEventListener('iceconnectionstatechange', async (event) => {
        //   console.log('Ice connection state change', event);
        // });
        // pc.addEventListener('negotiationneeded', async (event) => {
        //   console.log('Negotiation needed', event);
        // });
        // pc.addEventListener('signalingstatechange', async (event) => {
        //   console.log('Signaling state change', event);
        // });
        pc.addEventListener('track', async (event) => {
          if (event.streams.length < 1) {
            console.log('No remote stream');
          }
          else {
            setRemoteStream(event.streams[0]);
            console.log('Captured remote stream');
          }
        });
        console.log('Successfully joined room', selectedGroupKey);
      } catch (error) {
        console.error('Error connecting to room', error);
      }

      // get participants
      try {
        const response = await plugin.listParticipants(selectedGroupKey);
        const participantsList = response.getPlainMessage().plugindata.data.participants;
        setParticipants(participantsList || []);
        console.log('Got participants list');
      } catch (error) {
        console.error('Error getting participants list', error);
      }
    }
    else {
      console.error("Plugin is null");
    }
  };

  const captureAudio = async () => {
    console.log('audio');
    if (plugin) {
    }
    else {
      console.error("Plugin is null");
    }
  };

  useEffect(() => {
    if (!inRoom.current) {
      inRoom.current = true;
      joinRoom();
    }

    // Cleanup on component unmount
    return () => {
      const leaveRoom = async () => {
        if (plugin) {
          if (inRoom.current)
          {
            inRoom.current = false;
            await plugin.leave();
            plugin.getPeerConnection().close();
            console.log("Left the room on cleanup");
          }
          else {
            console.log("Unmount without leaving room");
          }
        }
      };
      leaveRoom().catch(error => console.error("Error leaving the room on cleanup:", error));
    };
  }, [selectedGroupKey]);

  const openDialog = () => setDialogState(true);
  const closeDialog = () => setDialogState(false);

  const returnHome = () => {
    navigate('/letour', { state: { groupname } });
  };

  return (
    <div style={backgroundstyle}>
      <Stack alignItems="center" marginTop="50px">
        <h1 style={{ fontSize: '36px', fontWeight: 'bold' }}>LeTour Guide</h1>
        <p>You are in the {groupname} Group</p>
        
        {/* List participants */}
        <ul>
          {participants.map((participant, index) => (
            <li key={index}>{participant.display || "Participant"}</li>
          ))}
        </ul>
        <p>Number of audio tracks: {remoteStream?.getAudioTracks().length} </p>
        {/* Audio element for the remote stream */}
        {remoteStream && (
          <audio
            autoPlay
            controls
            ref={(audioElement) => {
              if (audioElement) audioElement.srcObject = remoteStream;
            }}
          />
        )}
        
        <Button variant="contained" onClick={openDialog}>Leave Group</Button>
      </Stack>
      <Dialog
        open={dialogState}
        onClose={closeDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Leave your Group?</DialogTitle>
        <DialogActions>
          <Button onClick={closeDialog}>No</Button>
          <Button onClick={returnHome}>Yes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AudienceGroupPage;


import { React, useState, useEffect, useRef } from 'react';
import { Button, Stack, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

const GuideGroupPage = (props) => {
  const plugin = props.plugin;
  let { groupname } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const inRoom = useRef(false);
  //const { selectedGroupKey } = location.state || {};
  const [selectedGroupKey, setSelectedGroupKey] = useState(null);
  const [dialogState, setDialogState] = useState(false);
  const [userDisplay, setUserDisplay] = useState(uuidv4());
  const [remoteStream, setRemoteStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [micStream, setMicStream] = useState(null);
  
  const joinRoom = async (createdRoom) => {
    if (plugin) {
      try {
        // join room
        console.log("Attempting connection to room ", createdRoom)
        let response = await plugin.join(createdRoom, { display: userDisplay });
        const userStream = await plugin.getUserMedia({audio: true, video: false});
		setMicStream(userStream);
		console.log(userStream); //micStream.getTracks().forEach((track) => track.stop())
        response = await plugin.offerStream(userStream, { offerToReceiveAudio: true }, { muted: false });
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
        console.log('Successfully joined room', createdRoom);
      } catch (error) {
        console.error('Error connecting to room', error);
      }

      // get participants
      try {
        const response = await plugin.listParticipants(createdRoom);
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
  
  const createRoom = async () => {
    if (plugin) {
	  const createdRoomKey = Math.floor(Math.random() * 2147483647)
	  setSelectedGroupKey(createdRoomKey);
	  console.log("Attempting connection to room ", createdRoomKey);
	  const createdRoom = await plugin.create(createdRoomKey,{"description":groupname});
	  console.log("room", createdRoom);
	  joinRoom(createdRoomKey);
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

  const backgroundstyle = {
    background: 'linear-gradient(45deg, #9892f2, #f5f999)',
    backgroundSize: 'cover', 
    backgroundRepeat: 'no-repeat', 
    backgroundPosition: 'center', 
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    justifyContent: 'center', 
  };

  const OpenDialog = () => {
    setDialogState(true);
  };
  const CloseDialog = () => {
    setDialogState(false);
  };
  const ReturnHome = () => {
	if(micStream){
		micStream.getTracks().forEach((track) => track.stop())
		console.log("User media stopped");
		setMicStream(null);
	}
	plugin.destroy(selectedGroupKey);
    navigate('/letour/guide', { groupname: groupname })
  };
  
  useEffect(() => {
    if (!inRoom.current) {
      inRoom.current = true;
	  createRoom();
    }

    // Cleanup on component unmount
    return () => {
      const leaveRoom = async () => {
        if (plugin) {
          if (inRoom.current)
          {
            if(micStream){
				micStream.getAudioTracks().forEach((track) => track.stop());
				console.log("User media stopped");
				setMicStream(null);
			}
			inRoom.current = false;
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
  }, []);

  return (
    <div style={backgroundstyle}>
      <Stack alignItems={'center'} marginTop={'50px'}>
        <h1 style={{fontSize: '36px', fontWeight: 'bold'}}>LeTour Guide</h1>
        <p>You are leading the {groupname} Group</p>
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
        <Button variant="contained" onClick={OpenDialog}>End Group</Button>
      </Stack>
      <Dialog
        open={dialogState}
        onClose={CloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>End Group '{groupname}'?</DialogTitle>
        <DialogActions>
          <Button onClick={CloseDialog}>No</Button>
          <Button onClick={ReturnHome}>Yes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default GuideGroupPage;

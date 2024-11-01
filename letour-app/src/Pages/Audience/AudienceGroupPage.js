import React, { useState, useEffect } from 'react';
import { Button, Stack, Dialog, DialogTitle, DialogActions } from '@mui/material';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const AudienceGroupPage = ({ session }) => {
  const { groupname } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { selectedGroupKey } = location.state || {};
  const [remoteStream, setRemoteStream] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [dialogState, setDialogState] = useState(false);
  const [inRoom, setInRoom] = useState(false);

  const backgroundstyle = {
    background: 'linear-gradient(45deg, #9892f2, #f5f999)',
    height: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
  };

  useEffect(() => {
	console.log(session.plugin);
    const connectAudio = async () => {
      if (session && session.plugin && selectedGroupKey) {
        try {
          // If already in a room, change to the new room
		  console.log(session.plugin._currentEntityId, selectedGroupKey);
          if (session.plugin._currentEntityId == selectedGroupKey) {
            console.log(`test: ${selectedGroupKey}`);
          } else if (session.plugin._currentEntityId) {
		    await session.plugin.change(selectedGroupKey, { display: "User" });
            setInRoom(true);
            console.log(`Joined room ${selectedGroupKey}`);
		  } else {
            // Join the new room
            await session.plugin.join(selectedGroupKey, { display: "User" });
            setInRoom(true);
            console.log(`Joined room ${selectedGroupKey}`);
          }

          // List participants in the room
          const response = await session.plugin.listParticipants(selectedGroupKey);
          setParticipants(response._plainMessage.plugindata.data.participants || []);
          console.log("Participants:", participants.length);

          // Handle the remote stream
		  console.log(session.plugin.onremotestream);
          session.plugin.onremotestream = (stream) => {
            setRemoteStream(stream);
            console.log("Remote stream received:", stream);
          };
        } catch (error) {
          console.error("Error connecting to Audiobridge:", error);
        }
      }
    };

    connectAudio();

    // Cleanup on component unmount
    return () => {
      const leaveRoom = async () => {
        if (session.plugin && session.plugin._currentEntityId) {
          await session.plugin.leave();
          console.log("Left the room on cleanup");
          setInRoom(false);
        }
      };
      leaveRoom().catch(error => console.error("Error leaving the room on cleanup:", error));
    };
  }, [session, selectedGroupKey]);

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


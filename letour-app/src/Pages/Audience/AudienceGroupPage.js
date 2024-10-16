import React, { useState } from 'react';
import { Button, Stack, Slider, Dialog, DialogTitle, DialogActions } from '@mui/material';
import VolumeUp from '@mui/icons-material/VolumeUp';
import VolumeOff from '@mui/icons-material/VolumeOff';
import { useParams, useNavigate } from 'react-router-dom';

const AudienceGroupPage = () => {
  let { groupname } = useParams();
  const navigate = useNavigate();
  const [dialogState, setDialogState] = useState(false);
  const [volume, setVolume] = React.useState(100);

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

  const handleVolumeChange = (event: Event, newVolume: number | number[]) => {
    setVolume(newVolume);
  };
  const handleVolumeMute = () => {
    volume? setVolume(0) : setVolume(100)
  };
  
  const OpenDialog = () => {
    setDialogState(true);
  };
  const CloseDialog = () => {
    setDialogState(false);
  };
  const ReturnHome = () => {
    navigate('/letour', { groupname: groupname })
  };

  return (
    <div style={backgroundstyle}>
      <Stack alignItems={'center'} marginTop={'50px'}>
        <h1 style={{fontSize: '36px', fontWeight: 'bold'}}>LeTour Guide</h1>
        <p>You are in the {groupname} Group</p>
        <Stack direction="row">
          <Button
            onClick={handleVolumeMute}
          >
            {volume? <VolumeUp/> : <VolumeOff/>}
          </Button>
          <Slider
            value={typeof volume === 'number' ? volume : 0}
            onChange={handleVolumeChange}
            sx={{width: '100px'}}
          />
        </Stack>
        <Button variant="contained" onClick={OpenDialog}>Leave Group</Button>
      </Stack>
      <Dialog
        open={dialogState}
        onClose={CloseDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle>Leave your Group?</DialogTitle>
        <DialogActions>
          <Button onClick={CloseDialog}>No</Button>
          <Button onClick={ReturnHome}>Yes</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default AudienceGroupPage;

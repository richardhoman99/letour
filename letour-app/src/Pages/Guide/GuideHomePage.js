import { React, useState } from 'react';
import { Button, Stack, Snackbar, TextField } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const GuideHomePage = (props) => {
  let { groupname } = useParams();
  const navigate = useNavigate();
  const [newGroupName, setNewGroupName] = useState('');

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

  const newGroupChange = (event: SelectChangeEvent) => {
    setNewGroupName(event.target.value);
  };
  const createGroup = () => {
    navigate(`/letour/guide/${newGroupName}`)
  };

  return (
    <div style={backgroundstyle}>
      <Stack alignItems={'center'} marginTop={'50px'}>
        <h1 style={{fontSize: '36px', fontWeight: 'bold'}}>LeTour Guide</h1>
        <Stack direction="row">
          <TextField 
            label="Group Name" 
            variant="outlined"
            value={newGroupName}
            onChange={newGroupChange}
            InputProps={{ sx: { fontWeight: 'bold' } }}
            InputLabelProps={{ sx: { fontWeight: 'bold' } }}
          />
          <Button variant="contained" onClick={createGroup}>Create</Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default GuideHomePage;

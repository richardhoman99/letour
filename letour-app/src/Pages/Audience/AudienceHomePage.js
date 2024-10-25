import { React, useState, useEffect } from 'react';
import { Button, Stack, Select, FormControl, InputLabel, MenuItem, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const AudienceHomePage = (props) => {
  const { session, plugin } = props;
  let { groupname } = useParams();
  const navigate = useNavigate();
  const groups = ['Red','Green','Blue']
  const [selectedGroup, setSelectedGroup] = useState('Red');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const temp = await session.plugin.list();
        console.log(temp);
      } catch (error) {
        console.error("Error fetching plugin list:", error);
      }
    };
	  
	  fetchData();
	}, [session, plugin]);

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

  const selectGroup = (event: SelectChangeEvent) => {
    setSelectedGroup(event.target.value);
  };
  const joinGroup = () => {
    navigate(`/letour/${selectedGroup}`)
  };

  return (
    <div style={backgroundstyle}>
      <Stack alignItems={'center'} marginTop={'50px'}>
        <h1 style={{fontSize: '36px', fontWeight: 'bold'}}>LeTour Guide</h1>
        <Stack direction="row">
          <FormControl sx={{ m: 1, minWidth: 180 }}>
            <InputLabel sx={{ fontWeight: 'bold'}} >Group Name</InputLabel>
            <Select 
              label="Group Name" 
              autoWidth
              value={selectedGroup}
              onChange={selectGroup}
              sx={{ fontWeight: 'bold' }}
              MenuProps={{ PaperProps: { sx: { minWidth: 180 } } }}
            >
              {groups.map((name) => (
                <MenuItem value={name} sx={{ fontWeight: 'bold' }}>
                  {name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="contained" onClick={joinGroup}>Join</Button>
        </Stack>
      </Stack>
    </div>
  );
};

export default AudienceHomePage;


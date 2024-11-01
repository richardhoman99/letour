import { React, useState, useEffect } from 'react';
import { Button, Stack, Select, FormControl, InputLabel, MenuItem, Snackbar } from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';

const AudienceHomePage = (props) => {
  const { session, plugin } = props;
  let { groupname } = useParams();
  const navigate = useNavigate();
  const [openGroups, setOpenGroups] = useState(['Red','Green','Blue']);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [selectedGroupKey, setSelectedGroupKey] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
	  if (session && session.plugin) {
        try {
          let message = await session.plugin.list();
		  console.log(session.plugin);
		  const listData = message._plainMessage.plugindata.data.list;
		  const roomDescriptions = listData.map(item => item.description);
		  setOpenGroups(listData.map(item => ({roomName: item.description, roomNumber: item.room})));
		  await console.log('fectched plugin.list');
        } catch (error) {
          console.error("Error fetching plugin list:", error);
        }
      };
	}
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
	const group = openGroups.find(group => group.roomName === event.target.value);
    setSelectedGroupKey(group ? group.roomNumber : null);
  };
  const joinGroup = () => {
    navigate(`/letour/${selectedGroup}`, {state: {selectedGroupKey}})
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
              {openGroups.map((group) => (
                <MenuItem key={group.roomNumber} value={group.roomName} sx={{ fontWeight: 'bold' }}>
                  {group.roomName}
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


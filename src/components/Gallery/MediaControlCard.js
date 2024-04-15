import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import ReactPlayer from 'react-player';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import {deleteFileByUrl} from '../../api/api';

export default function MediaControlCard(props) {

  function extractFilenameFromURL(url) {
    const parts = url.split('?');
    const path = parts[0]; // Get the part before the question mark
    const pathParts = path.split('/');
    const filename = decodeURIComponent(pathParts[pathParts.length - 1]);
    return filename;
  }

  const handleClickOpen = () => {
    console.log("clicked", props.url)
    props.setAudio(props.url);
    // props.handleOpen(props.url);
    props.sethandleClose(false);
  };

  const handleDelete = () => {
    console.log("clicked", props.url)
    deleteFileByUrl(props.url)
    props.sethandleClose(false);
  };

  return (
    <Card sx={{ width: 350 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <CardContent sx={{ flex: '1 0 auto' }}>
          <Typography component="div" variant="h5">
            Audio
            {/* {extractFilenameFromURL(props.url)} */}
          </Typography>
          <Typography variant="body2" color="text.secondary">
          {extractFilenameFromURL(props.url)}
          {/* {(props.url)} */}
          </Typography>
        </CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', pl: 1, pb: 1 }}>
          <ReactPlayer
              url={props.url}
              width='95%'
              height='50px'
              playing={false}
              controls={true}
            />
            <DialogActions>
        <Button onClick={handleDelete}>Delete</Button>
        <Button onClick={handleClickOpen}>Select</Button>
      </DialogActions>
        </Box>
        
      </Box>
      
      {/* <CardMedia
        component="img"
        sx={{ width: 151 }}
        image="/static/images/cards/live-from-space.jpg"
        alt="Live from space album cover"
      /> */}
    </Card>
  );
}
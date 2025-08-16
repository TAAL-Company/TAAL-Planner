import React, { useState } from 'react';
import { Card, CardContent, Typography, Box, IconButton, Link as MuiLink } from '@mui/material';
import { styled } from '@mui/system';
import { AiOutlinePlus } from 'react-icons/ai';
import { useHistory } from 'react-router-dom';

const StyledCard = styled(Card)(({ isHover, color }) => ({
  width: 300,
  height: 125,
  borderBottom: '1px solid #fafafa',
  background: '#ffffff',
  boxShadow: isHover ? `0 6px 20px 0 ${color}` : '0px 1px 4px #15223233',
  transition: 'all 0.3s ease',
  border: isHover ? `5px solid ${color}` : 'none',
  position: 'relative',
  opacity: 1,
}));

const Headline = styled(Typography)({
  position: 'absolute',
  top: '35%',
  width: '100%',
  fontSize: '20px',
  fontWeight: 'bold',
  textAlign: 'center',
  fontFamily: 'Arial',
  color: '#707070',
  opacity: 1,
});

const AddLink = styled(MuiLink)({
  display: 'flex',
  flexDirection: 'row',
  position: 'absolute',
  bottom: 8,
  left: 16,
  fontSize: '18px',
  fontWeight: 'bold',
  fontFamily: 'Arial',
  color: '#a3a3a3',
  textDecoration: 'none',
  alignItems: 'center',
  cursor: 'pointer',
});

const ImageBackground = styled(Box)(({ bgcolor }) => ({
  borderRadius: '50%',
  position: 'absolute',
  backgroundColor: bgcolor || '#0d4264',
  top: '15%',
  left: '70%',
  width: 65,
  height: 65,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
}));

const CardDash = ({ cards }) => {
  const [isHover, setIsHover] = useState(false);
  const history = useHistory();

  const handleAddLink = (id) => {
    if (id === 1) history.replace('/places');
    else if (id === 2) history.replace('/Users');
    else if (id === 3) history.replace('/planner');
    else if (id === 4) window.location('/subjects');
  };

  const handleHeadlineLink = (id) => {
    if (id === 1) history.replace('/places');
    else if (id === 2) history.replace('/Users');
    else if (id === 3) history.replace('/routes_cards');
    else if (id === 4) history.replace('/subjects');
    else if (id === 5) history.replace('/gallery');
    else if (id === 6) history.replace('/coaches');
    else if (id === 8) history.replace('/community');
    else if (id === 9) history.replace('/planner');
    else if (id === 10) history.replace('/editor');
  };

  return (
    <StyledCard
      isHover={isHover}
      color={cards.color}
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <Box
        sx={{ width: '100%', height: '100%', cursor: 'pointer' }}
        onClick={() => handleHeadlineLink(cards.id)}
      >
        <Headline>{cards.headline}</Headline>
        <ImageBackground bgcolor={cards.color}>
          <Box
            component="img"
            src={cards.image}
            alt="Card Logo"
            sx={{ width: 65, height: 65 }}
          />
        </ImageBackground>
      </Box>

      {cards.addLabel && (
        <AddLink onClick={() => handleAddLink(cards.id)}>
          {cards.addLabel}
          <AiOutlinePlus style={{ color: '#0d4264', marginLeft: 4 }} />
        </AddLink>
      )}
    </StyledCard>
  );
};

export default CardDash;

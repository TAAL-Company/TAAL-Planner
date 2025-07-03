import React, { useState, useEffect } from 'react';
// import { useTranslator } from '../../Utility/TranslationProvider';
import { FormControl, InputLabel, Select, MenuItem } from '@mui/material';

const PlacesDropdown = props => {
  // const { translate } = useTranslator();
  const [translatedPlaces, setTranslatedPlaces] = useState([]);
  const [selectedSite, setSelectedSite] = useState(null);

  useEffect(() => {
    const translatePlaces = async () => {
      const translations = await Promise.all(
        props.allPlaces.map(async place => ({
          ...place,
          // originalName: place.name, // Store the original name
          // translatedname: await translate(place.name, props.currentLanguage),
        }))
      );
      setTranslatedPlaces(translations);
    };

    translatePlaces();
  }, [props.allPlaces, props.currentLanguage]); // Runs when places list or language changes


  return (
    <div>
      <div className='placesTitle'>{props.siteQuestionLanguage}</div>
      <FormControl fullWidth sx={{ minWidth: 200, mb: 2 }}>
        <InputLabel id='site-select-label'>בחר אתר</InputLabel>
        <Select
          labelId='site-select-label'
          id='site-select'
          value={selectedSite ? selectedSite.id : ''}
          label='בחר אתר'
          onChange={e => {
            const site = props.allPlaces.find(s => s.id === e.target.value);
            setSelectedSite(site);
            props.handleSelectedSiteChange(site);
            // props.setSelectedSite(site);
          }}
        >
          {translatedPlaces.map((place, index) => (
            <MenuItem key={place.id} value={place.id}>
              {props.showDataTranslate === 'original'
                ? place.name
                : props.showDataTranslate === 'translated'
                ? place.translatedname
                : props.showDataTranslate === 'Mixed'
                ? `${place.name} (${place.translatedname})`
                : place.name}{' '}
              {/* Default to original name */}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </div>
  );
};

export default PlacesDropdown;

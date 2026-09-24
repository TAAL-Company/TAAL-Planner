import React, { useState, useEffect } from 'react';
import { useTranslator } from '../../../Utility/TranslationProvider';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';

const PlacesDropdown = (props) => {
  const { translate,  } = useTranslator();
  const [translatedPlaces, setTranslatedPlaces] = useState([]);

  useEffect(() => {
    const translatePlaces = async () => {
      const translations = await Promise.all(
        (props.allPlaces || []).map(async (place) => ({
          ...place,
          // originalName: place.name, // Store the original name
          translatedname: await translate(place.name, props.currentLanguage),
        }))
      );
      setTranslatedPlaces(translations);
    };

    translatePlaces();
  }, [props.allPlaces, props.currentLanguage]); // Runs when places list or language changes

  return (
    <div>
      <div className='placesTitle'>
        {props.siteQuestionLanguageKey ? (
          <I18nHoverText translationKey={props.siteQuestionLanguageKey}>
            {props.siteQuestionLanguage}
          </I18nHoverText>
        ) : (
          props.siteQuestionLanguage
        )}
      </div>
      <select
        className='selectPlace'
        onChange={props.handleSiteSelectChange}
        value={props.value}
        // {props.selectedSite ? JSON.stringify(props.selectedSite) : 'DEFAULT'}
      >
        {/* native <option> only renders plain text — hover popover not supported here */}
        <option value='DEFAULT' >
          {props.siteLanguage}
        </option>

        {translatedPlaces.map((place, index) => (
           <option key={index} value={props.selectedValuewithjsons ? JSON.stringify(place) : place.name}> 
            {/* {props.selectedValuewithjson ? JSON.stringify(place) : place.name}> */}
            {place.name}
         </option>
        ))}
      </select>
    </div>
  );
};

export default PlacesDropdown;

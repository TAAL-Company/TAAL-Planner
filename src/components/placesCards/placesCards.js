import React, { useState, useEffect } from "react";
import { getingDataPlaces } from "../../api/api";
import "./placesCards.css";
import defualtSiteImg from "../../Pictures/defualtSiteImg.svg";

const PlacesCards = () => {
  const [places, setPlaces] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const placesData = await getingDataPlaces();
      setPlaces(placesData);
    };

    fetchData();
    console.log("places", places);
  }, []);

  return (
    <div className="place_cards_warpper">
      {places.map((place) => (
        <div key={place.id} className="place_card">
          <img
            src={
              place.acf.image ? place.acf.image.sizes.thumbnail : defualtSiteImg
            }
            alt="Avatar"
            style={{ width: "100%" }}
          />
          <div className="places_cards_container" key={place.name}>
            <h5>{place.name}</h5>
            <p>{place.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlacesCards;

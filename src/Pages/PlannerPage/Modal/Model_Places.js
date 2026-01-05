import React, { useState } from 'react';
import './Modal.css';
import { FcMultipleInputs } from 'react-icons/fc';
import { RiAsterisk } from 'react-icons/ri';
import Modal_Loading from './Modal_Loading';
import { baseUrl } from '../../config';
import { useTranslation } from 'react-i18next';

//--------------------------
let getPicture, getSound;
let parentNum = 0;
let file = {};
let flagClickOK = false;
//--------------------------
function Modal_Plases({ setOpenModalPlaces }) {
  const [get_title, setTitle] = useState('');
  const [getDescription, setDescription] = useState('');
  const [, setSound] = useState(null);
  const [, setPicture] = useState(null);
  const [, setFile] = useState({});
  const [, setFlagClickOK] = useState(false);
  const { t } = useTranslation();

  //----------------------------------
  const handleTitleInput = (e) => {
    setTitle(e.target.value);
  };
  //----------------------------------
  const handleDescriptionInput = (e) => {
    setDescription(e.target.value);
  };
  //----------------------------------
  const handleFileInput = (e) => {
    setFile((file = e.target.files[0]));
    if (file.type.includes('image')) {
      setPicture((getPicture = file));
    }
    if (file.type.includes('audio')) {
      setSound((getSound = file));
      alert('file:', getPicture);
    }
  };
  //----------------------------------
  function Post_Place() {
    if (get_title === '' || getDescription === '') {
      alert(t('plannerPage.You_must_fill_in_the_required_fields_marked_with_an_asterisk'));
    } else {
      setFlagClickOK((flagClickOK = true));
      let url_post = `https://taal.tech/wp-json/wp/v2/places/`;
      fetch(url_post, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${sessionStorage.getItem('jwt')}`,
        },
        body: JSON.stringify({
          name: get_title,
          description: getDescription,
          parent: parentNum,
          fields: [
            {
              qr: false,
              defaultPath: 'str',
              image: file,
              audio: getSound,
            },
          ],
        }),
      })
        .then(function (response) {
          return response.json();
        })
        .then(function (post) {
          if (post.message === 'כבר יש מונח עם אותו שם ועם אותו הורה.')
            alert(t('plannerPage.There_is_already_a_place_with_the_same_name_choose_a_different_name'));
          else {
            setFlagClickOK((flagClickOK = false));
            window.location.replace('/planner');
          }
        });
    }
  }
  return (
    <>
      <div className='modalContainerPlases'>
        <div className='headerAddPlases'>
          <div className='title'>
            <div className='newRoutTitle'>{t('plannerPage.Save_Place')}</div>
          </div>
          <button
            className='closeModal'
            onClick={() => {
              setOpenModalPlaces(false);
            }}
          >
            X
          </button>
        </div>

        <div className='body'>
          <form id='IPU' className='w3-container'>
            <h6 style={{ textAlign: 'right' }}>
              {t('plannerPage.Enter_the_name_of_the_place')} <RiAsterisk style={{ color: 'red' }} />
            </h6>
            <p>
              <input
                required={true}
                type='text'
                onChange={handleTitleInput}
                style={{
                  textAlign: 'right',
                  width: '420px',
                }}
              ></input>
            </p>
          </form>
          <form id='IPU' className='w3-container'>
            <h6 style={{ textAlign: 'right' }}>
              {' '}
              {t('plannerPage.Describe_the_place_in_a_sentence')}
              <RiAsterisk style={{ color: 'red' }} />{' '}
            </h6>
            <p>
              <input
                type='text'
                onChange={handleDescriptionInput}
                style={{
                  textAlign: 'right',
                  width: '420px',
                }}
              ></input>
            </p>
          </form>
          <form id='IPU' className='w3-container'>
            <h6 style={{ textAlign: 'right' }}>
              {t('plannerPage.Attach_an_image_of_the_place')}
              <FcMultipleInputs />
            </h6>
            <div className='input-group mb-3'>
              <input
                required={true}
                accept='.png, .jpg, .jpeg'
                className='form-control'
                type='file'
                onChange={handleFileInput}
                style={{
                  textAlign: 'right',
                  width: '100%',
                }}
              ></input>
            </div>
          </form>
          <form id='IPU' className='w3-container'>
            <h6 style={{ textAlign: 'right' }}>
              {t('plannerPage.Attach_an_audio_clip_describing_the_place')}
              <FcMultipleInputs />{' '}
            </h6>
            <p>
              <input
                required={true}
                accept='.mp3'
                type='file'
                className='form-control'
                onChange={handleFileInput}
                style={{
                  textAlign: 'right',
                  width: '96%',
                }}
              ></input>
            </p>
          </form>
        </div>
        <div className='footer'>
          <input
            type='submit'
            className='OK'
            value={t('plannerPage.Save_Place')}
            onClick={Post_Place}
          />
        </div>
        {flagClickOK ? (
          <>
            <Modal_Loading props={false} />
          </>
        ) : (
          <></>
        )}
      </div>
    </>
  );
}
export default Modal_Plases;

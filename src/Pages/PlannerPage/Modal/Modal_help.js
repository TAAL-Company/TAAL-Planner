import React, { useState, useEffect } from 'react';
import './Modal.css';
import { baseUrl } from '../../../config';
import { useTranslation } from 'react-i18next';
// import Dot from '../Dot/Dot';
//--------------------------
let getPicture, getSound;
let ichour = 'אישור';
let flagClickOK = false;
let flag_token = false;
//--------------------------
const Modal_Help = ({ setModalOpen, idTasks }) => {
  const { t } = useTranslation();
  const [, login_token] = useState('');
  const [complete_name, setcomplete_name] = useState('');
  useEffect(() => {
    setcomplete_name(JSON.parse(sessionStorage.getItem('jwt')).name);
  });
  const [, setDone] = useState(false);
  const [get_title, settitle] = useState('');
  const [, setPicture] = useState(null);
  const [, setSound] = useState(null);
  const [getDescription, setDescription] = useState('');
  const [, setFlagClickOK] = useState(false);
  //----------------------------------

  return (
    <>
      <div className='modalContainerHelp'>
        <div className='titleCloseBtnPlases'>
          <button
            className='cancelCovar'
            onClick={() => {
              setModalOpen(false);
            }}
          >
            <div className='closeModal'>x</div>
          </button>
        </div>

        <div className='HelpTxt'>{t('plannerPage.A_request_was_sent_to_the_assistant')} {complete_name}</div>
      </div>
    </>
  );
};
export default Modal_Help;

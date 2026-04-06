import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Modal.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';

//--------------------------

//--------------------------
function Modal_Dropdown(props) {
  const menuRef = useRef(null);
  const { t } = useTranslation();

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        props.setOpenThreeDotsVertical(-1);
        // props.setRequestForEditing('');
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={menuRef}>
      <div
        // style={{ position: 'absolute', top: '0', left: '100%' }} 
        style={{ position: 'absolute', top: '0', left: props.language === 'English' ? '100%' : '', right: props.language !== 'English' ? '100%' : '' }}
        id='dropdown' className='button-dropdown-content'>
        {props.editable ? (
          <Link onClick={() => props.setRequestForEditing('edit')}>
            {t('plannerPage.Edit')}
          </Link>
        ) : (
          <></>
        )}
        {props.Reproducible ? (
          <Link onClick={() => props.setRequestForEditing('duplication')}>
            {t('plannerPage.Duplicate')}
          </Link>
        ) : (
          <></>
        )}
        {props.details ? (
          <Link onClick={() => props.setRequestForEditing('details')}>
            {t('plannerPage.Details')}
          </Link>
        ) : (
          <></>
        )}
        {props.erasable ? (
          <Link onClick={() => props.setRequestForEditing('delete')}>
            {t('plannerPage.Delete')}
          </Link>
        ) : (
          <></>
        )}
        {props.uploadfromsheet ? (
          <Link onClick={() => props.setRequestForEditing('uploadfromsheet')}>
            {t('plannerPage.Sheet_Edit')}
          </Link>
        ) : (
          <></>
        )}
        {props.loop ? (
          <Link onClick={() => props.setRequestForEditing('loop')}>
            {t('plannerPage.Loop')}
          </Link>
        ) : (
          <></>
        )}
        {props.video ? (
          <Link onClick={() => props.setRequestForEditing('video')}>
            {t('VideoGenerate.createVideo') || 'Create Video'}
          </Link>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
export default Modal_Dropdown;

import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './Modal.css';
import { Link } from 'react-router-dom/cjs/react-router-dom.min';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';

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
            <I18nHoverText translationKey="plannerPage.Edit">{t('plannerPage.Edit')}</I18nHoverText>
          </Link>
        ) : (
          <></>
        )}
        {props.Reproducible ? (
          <Link onClick={() => props.setRequestForEditing('duplication')}>
            <I18nHoverText translationKey="plannerPage.Duplicate">{t('plannerPage.Duplicate')}</I18nHoverText>
          </Link>
        ) : (
          <></>
        )}
        {props.details ? (
          <Link onClick={() => props.setRequestForEditing('details')}>
            <I18nHoverText translationKey="plannerPage.Details">{t('plannerPage.Details')}</I18nHoverText>
          </Link>
        ) : (
          <></>
        )}
        {props.erasable ? (
          <Link onClick={() => props.setRequestForEditing('delete')}>
            <I18nHoverText translationKey="plannerPage.Delete">{t('plannerPage.Delete')}</I18nHoverText>
          </Link>
        ) : (
          <></>
        )}
        {props.uploadfromsheet ? (
          <Link onClick={() => props.setRequestForEditing('uploadfromsheet')}>
            <I18nHoverText translationKey="plannerPage.Sheet_Edit">{t('plannerPage.Sheet_Edit')}</I18nHoverText>
          </Link>
        ) : (
          <></>
        )}
        {props.loop ? (
          <Link onClick={() => props.setRequestForEditing('loop')}>
            <I18nHoverText translationKey="plannerPage.Loop">{t('plannerPage.Loop')}</I18nHoverText>
          </Link>
        ) : (
          <></>
        )}
        {props.video ? (
          <Link onClick={() => props.setRequestForEditing('video')}>
            <I18nHoverText translationKey="VideoGenerate.createVideo">{t('VideoGenerate.createVideo') || 'Create Video'}</I18nHoverText>
          </Link>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
export default Modal_Dropdown;

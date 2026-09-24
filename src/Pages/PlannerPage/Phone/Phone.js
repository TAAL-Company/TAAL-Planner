import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';
import Dot from '../Dot/Dot';
import Tag from '../Tag/Tag.js';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md';
import ModalHelp from '../Modal/Modal_help';
import Clock from '../../../components/junk/Clock/Clock.js';
import I18nHoverText from '../../../components/I18nHoverText/I18nHoverText';
let flagStress = false;
const Phone = (props) => {
  const { t } = useTranslation();
  const [, setFlagStress] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const stressFun = () => {
    setFlagStress((flagStress = true));
  };
  const backup = () => {
    setFlagStress((flagStress = false));
  };

  return (
    <>
      {props.flagPhone ? (
        <>
          {!flagStress ? (
            <>
              <div className='phoneCover'>
                <div className='phoneHeaderCover'>
                  <div className='hederPhone'>
                    <button
                      className='stress'
                      onClick={() => stressFun()}
                    ></button>
                    <div className='cellInfo'></div>
                    <Dot className='Dotcamera' color='#2f2f2f' />
                    <div className='clock'>
                      <Clock />
                    </div>
                  </div>
                </div>
                <div className='stap2'>
                  {props.board.map((tag, keyCount) => {
                    return (
                      <Tag
                        modalFlagTablet={props.modalFlagTablet}
                        title={tag.title}
                        subtitle={tag.subtitle}
                        id={tag.id}
                        picture_url={tag.picture_url}
                        audio_url={tag.audio_url}
                        dataAudio={tag.dataAudio}
                        key={keyCount}
                        flagBoard={true}
                        myLastStation={props.myStation.name}
                        myStation={tag.myStation}
                        myMarginTop={'-68px'}
                        count={props.count}
                        data={props.myStation.data}
                        flag={tag.flag}
                        width={tag.width}
                        borderLeft={tag.borderLeft}
                        height={tag.height}
                        setKavTaskTopMarginTop={tag.setKavTaskTopMarginTop}
                        bottom={tag.bottom}
                        kavTopWidth={tag.kavTopWidth}
                        newkavTaskTop={tag.newkavTaskTop}
                        nameStation={tag.nameStation}
                        flagPhone={props.flagPhone}
                        language={props.language}
                      />
                    );
                  })}
                </div>
                <div className='stap3'></div>
              </div>
            </>
          ) : (
            <>
              {/* stress */}
              <div className='phoneCoverStress'>
                <div className='phoneHeaderCover'>
                  <div className='hederPhone'>
                    <div className='grayStress'></div>
                    <div className='cellInfo'></div>
                    <Dot className='Dotcamera' color='#2f2f2f' />
                    <div className='clock'>
                      <Clock />
                    </div>
                  </div>
                  {modalOpen ? (
                    <>
                      <div className='pleaseName' style={{ color: '#45350a' }}>
                        <I18nHoverText translationKey="plannerPage.please">{t('plannerPage.please')}</I18nHoverText>
                      </div>
                      <div className='pleaseListenIconCover'></div>
                    </>
                  ) : (
                    <>
                      <div className='pleaseName'><I18nHoverText translationKey="plannerPage.please">{t('plannerPage.please')}</I18nHoverText></div>
                      <button className='pleaseListenIcon'></button>
                    </>
                  )}
                </div>
                <div className='positionTextStress'>
                  <div className='textStress'><I18nHoverText translationKey="plannerPage.I_had_difficulty_completing_my_tasks">{t('plannerPage.I_had_difficulty_completing_my_tasks')}</I18nHoverText></div>
                  <div className='textStress'>
                    <I18nHoverText translationKey="plannerPage.I_would_appreciate_assistance_and_thank_you_for_your_willingness_to_help">
                      {t('plannerPage.I_would_appreciate_assistance_and_thank_you_for_your_willingness_to_help')}
                    </I18nHoverText>
                  </div>
                </div>
                <div className='whiteCoverPhoneStress'>
                  <div className='currentLocation'><I18nHoverText translationKey="plannerPage.My_Mycurrent_location">{t('plannerPage.My_Mycurrent_location')}</I18nHoverText></div>
                  {props.mySite.name ? (
                    <>
                      {' '}
                      <div className='currentLocationName'>
                        {' '}
                        {props.mySite.name}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='currentLocationName'><I18nHoverText translationKey="plannerPage.No_location">{t('plannerPage.No_location')}</I18nHoverText></div>
                    </>
                  )}
                </div>
                <div>
                  {modalOpen ? (
                    <>
                      <div
                        className='redCoverPhoneStress'
                        style={{ backgroundColor: '#400910' }}
                      >
                        <div className='needHelp'></div>
                        <div
                          className='helpContinue'
                          style={{ color: '#3d453e' }}
                        >
                          <I18nHoverText translationKey="plannerPage.Continue_to_request_help">{t('plannerPage.Continue_to_request_help')}</I18nHoverText>
                        </div>
                      </div>
                      <div
                        className='greenCoverPhoneStress'
                        style={{ backgroundColor: '#053705' }}
                      >
                        <div style={{ border: 'none', background: '#11B911' }}>
                          {/* <MdOutlineSettingsBackupRestore className='TempBackup' /> */}
                        </div>

                        <div className='backup' style={{ color: '#3d453e' }}>
                          <I18nHoverText translationKey="plannerPage.Return_to_my_tasks">{t('plannerPage.Return_to_my_tasks')}</I18nHoverText>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className='redCoverPhoneStress'>
                        <button
                          className='needHelp'
                          onClick={() => {
                            setModalOpen(true);
                          }}
                        ></button>
                        <div className='helpContinue'><I18nHoverText translationKey="plannerPage.Continue_to_request_help">{t('plannerPage.Continue_to_request_help')}</I18nHoverText></div>
                      </div>
                      <div className='greenCoverPhoneStress'>
                        <button
                          style={{ border: 'none', background: '#11B911' }}
                          onClick={() => backup()}
                        >
                          <MdOutlineSettingsBackupRestore className='TempBackup' />
                        </button>

                        <div className='backup'><I18nHoverText translationKey="plannerPage.Return_to_my_tasks">{t('plannerPage.Return_to_my_tasks')}</I18nHoverText></div>
                      </div>
                    </>
                  )}
                </div>
                <div className='stap31'></div>
                {modalOpen && <ModalHelp setModalOpen={setModalOpen} />}
              </div>
            </>
          )}
        </>
      ) : (
        <></>
      )}
    </>
  );
};

export default Phone;

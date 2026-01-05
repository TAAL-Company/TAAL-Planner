import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './style.css';
import Dot from '../Dot/Dot';
import Tag from '../Tag/Tag.js';
import { MdOutlineSettingsBackupRestore } from 'react-icons/md';
import ModalHelp from '../Modal/Modal_help';
import Clock from '../../../components/junk/Clock/Clock.js';
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
                        {t('plannerPage.please')}
                      </div>
                      <div className='pleaseListenIconCover'></div>
                    </>
                  ) : (
                    <>
                      <div className='pleaseName'>{t('plannerPage.please')}</div>
                      <button className='pleaseListenIcon'></button>
                    </>
                  )}
                </div>
                <div className='positionTextStress'>
                  <div className='textStress'>{t('plannerPage.I_had_difficulty_completing_my_tasks')}</div>
                  <div className='textStress'>
                    {t('plannerPage.I_would_appreciate_assistance_and_thank_you_for_your_willingness_to_help')}
                  </div>
                </div>
                <div className='whiteCoverPhoneStress'>
                  <div className='currentLocation'>{t('plannerPage.My_Mycurrent_location')}</div>
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
                      <div className='currentLocationName'>{t('plannerPage.No_location')}</div>
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
                          {t('plannerPage.Continue_to_request_help')}
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
                          {t('plannerPage.Return_to_my_tasks')}
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
                        <div className='helpContinue'>{t('plannerPage.Continue_to_request_help')}</div>
                      </div>
                      <div className='greenCoverPhoneStress'>
                        <button
                          style={{ border: 'none', background: '#11B911' }}
                          onClick={() => backup()}
                        >
                          <MdOutlineSettingsBackupRestore className='TempBackup' />
                        </button>

                        <div className='backup'>{t('plannerPage.Return_to_my_tasks')}</div>
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

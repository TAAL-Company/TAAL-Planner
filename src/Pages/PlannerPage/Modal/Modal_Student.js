import './Modal.css';
import React, { forwardRef, useRef } from 'react';
import { Button } from 'react-bootstrap';
import ReactToPrint, { PrintContextConsumer } from 'react-to-print';
import Image from 'react-bootstrap/Image';
import logo from '../../../Pictures/logo.jpeg';
import { FcPrint } from 'react-icons/fc';
import { useTranslation } from 'react-i18next';

const Modal_Student = ({ thisGetMyUsers, setOpenModal }) => {
  const { t } = useTranslation();
  const ComponentToPrint = forwardRef((props, ref) => {
    return (
      <div ref={ref}>
        <div className='modalContainerStudentPrint'>
          {thisGetMyUsers.acf.image.url ? (
            <>
              <Image
                style={{ height: 237, width: '97%', marginLeft: '20%' }}
                src={thisGetMyUsers.acf.image.url}
                alt='new'
              />
            </>
          ) : (
            <></>
          )}

          <h3 style={{ marginLeft: '50%' }}>{thisGetMyUsers.name} </h3>

          <div className='body' style={{ textAlign: 'right' }}>
            {thisGetMyUsers.description === '' ? (
              <>
                <h6 style={{ marginLeft: '220px', color: 'red' }}>
                  !{t('plannerPage.No_information_describing_this_employee')}
                </h6>
              </>
            ) : (
              <>
                <h5>{thisGetMyUsers.description}</h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.short_term_memory ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.short_term_memory}
                  </samp>{' '}
                  :{t('plannerPage.Short_term_memory_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.Short_term_memory_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.middle_term_memory ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.middle_term_memory}
                  </samp>{' '}
                  :{t('plannerPage.Middle_term_memory_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.Middle_term_memory_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.long_term_memory ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.long_term_memory}
                  </samp>{' '}
                  :{t('plannerPage.Long_term_memory_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp>:{t('plannerPage.Long_term_memory_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.concentration_and_focus_in_actions ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.concentration_and_focus_in_actions}
                  </samp>{' '}
                  :{t('plannerPage.Concentration_and_focus_in_actions_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.Concentration_and_focus_in_actions_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.hearing_level ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.hearing_level}
                  </samp>{' '}
                  :{t('plannerPage.General_hearing_level_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.General_hearing_level_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.vision_level ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.vision_level}
                  </samp>{' '}
                  :{t('plannerPage.General_vision_level_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.General_vision_level_from_1_to_50')} -
                </h5>
              </>
            )}
          </div>
          <Image
            style={{
              height: 87,
              width: '37%',
              marginRight: '20%',

              bottom: '0.001px',
            }}
            src={logo}
            alt='new'
          />
        </div>
      </div>
    );
  });
  const ref = useRef();
  return (
    <>
      <div className='Background'>
        <div className='modalContainerStudent'>
          <div className='titleCloseBtn'>
            <button
              onClick={() => {
                setOpenModal(false);
              }}
            >
              {' '}
              X
            </button>
          </div>
          <h3>{thisGetMyUsers.name} </h3>

          <div className='body' style={{ textAlign: 'right' }}>
            {thisGetMyUsers.description === '' ? (
              <>
                <h6 style={{ marginLeft: '220px', color: 'red' }}>
                  !{t('plannerPage.No_information_describing_this_employee')}
                </h6>
              </>
            ) : (
              <>
                <h5>{thisGetMyUsers.description}</h5>
              </>
            )}

            <br></br>
            {thisGetMyUsers.acf.short_term_memory ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.short_term_memory}
                  </samp>{' '}
                  :{t('plannerPage.Short_term_memory_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.Short_term_memory_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.middle_term_memory ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.middle_term_memory}
                  </samp>{' '}
                  :{t('plannerPage.Middle_term_memory_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.Middle_term_memory_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.long_term_memory ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.long_term_memory}
                  </samp>{' '}
                  :{t('plannerPage.Long_term_memory_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp>:{t('plannerPage.Long_term_memory_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.concentration_and_focus_in_actions ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.concentration_and_focus_in_actions}
                  </samp>{' '}
                  :{t('plannerPage.Concentration_and_focus_in_actions_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.Concentration_and_focus_in_actions_from_1_to_50')} -
                </h5>
              </>
            )}

            <br></br>
            {thisGetMyUsers.acf.hearing_level ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.hearing_level}
                  </samp>{' '}
                  :{t('plannerPage.General_hearing_level_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.General_hearing_level_from_1_to_50')} -
                </h5>
              </>
            )}
            <br></br>
            {thisGetMyUsers.acf.vision_level ? (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}>
                    {thisGetMyUsers.acf.vision_level}
                  </samp>{' '}
                  :{t('plannerPage.General_vision_level_from_1_to_50')} -
                </h5>
              </>
            ) : (
              <>
                <h5 style={{ marginLeft: '220px', color: 'red' }}>
                  <samp style={{ color: 'black' }}> {t('plannerPage.No')} </samp> :{t('plannerPage.General_vision_level_from_1_to_50')} -
                </h5>
              </>
            )}
          </div>
          <ReactToPrint content={() => ref.current}>
            <PrintContextConsumer>
              {({ handlePrint }) => (
                <button className='printStudent' onClick={handlePrint}>
                  {' '}
                  הדפסה
                  {/* הדפס את הנתונים אודות {thisGetMyUsers.name} */}
                  <FcPrint style={{ fontSize: '30px' }} />
                </button>
              )}
            </PrintContextConsumer>
          </ReactToPrint>
          <ComponentToPrint ref={ref} />
        </div>
      </div>
    </>
  );
};
export default Modal_Student;

import React, { useState, useEffect } from 'react';
import './style.css';
import TaskImage from '../../Pictures/TaskImage.png';
import { BsThreeDotsVertical } from 'react-icons/bs';
import Images from '../Images/Images';
import Audios from '../Audios/Audios';
import Modal_dropdown from '../Modal/Modal_Dropdown';

function Tag({
  title,
  subtitle,
  id,
  flagBoard,
  myMarginTop,
  myLastStation,
  width,
  height,
  kavTopWidth,
  bottom,
  nameStation,
  borderLeft,
  flagPhone,
  picture_url,
  audio_url,
  data,
  modalFlagTablet,
  dragFromCover,
  taskButtonColor,
  language,
  openThreeDotsVertical,
  setOpenThreeDotsVertical,
  setRequestForEditing,
  openThreeDotsVerticalBoard,
  setOpenThreeDotsVerticalBoard,
}) {
  localStorage.setItem('myLastStation', JSON.stringify(myLastStation));
  const [idListen, setIdListen] = useState(0);
  const [dataListen, setDataListen] = useState({});

  const clickOnThreeDotsVerticaIcontBoard = (value) => {
    if (openThreeDotsVerticalBoard === value) setOpenThreeDotsVerticalBoard(-1);
    else setOpenThreeDotsVerticalBoard(value);
  };

  const clickOnThreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };

  const listen = () => {
    setIdListen(id);
    setDataListen(picture_url);
  };
  const listenMyStation = () => {
    data.forEach((val) => {
      if (nameStation === val.name) setIdListen(val.id);
    });
    setDataListen(data);
  };
  return (
    <>
      {flagBoard && !flagPhone && !modalFlagTablet ? (
        <>
          {/* {myLastStation !== myStation && flagBoard ? <>  <div className='kavTask3'></div></> : <></>} */}

          <div
            className={`kav ${language !== 'English' ? 'english' : ''}`}
          ></div>
          <div
            className={`kavTop ${language !== 'English' ? 'english' : ''}`}
            style={{ width: kavTopWidth }}
          >
            <div
              className={`titleStat ${language !== 'English' ? 'english' : ''}`}
            >
              {nameStation}
            </div>
            <div
              className={`kavTask ${language !== 'English' ? 'english' : ''}`}
              style={{ borderLeft: borderLeft }}
            >
              {/* <div className='kavB'></div> */}
            </div>
            <div
              className={`kavTask2 ${language !== 'English' ? 'english' : ''}`}
              style={{ height: height, bottom: bottom }}
            ></div>
            <div
              className={`kavTaskTop ${
                language !== 'English' ? 'english' : ''
              }`}
              style={{ marginTop: width }}
            ></div>
            <div
              className={`nameStationBoard ${
                language !== 'English' ? 'english' : ''
              }`}
            >
              {nameStation}
            </div>
          </div>
        </>
      ) : (
        <>{/* <Dot color="#C4CE9C" /> */}</>
      )}
      {flagBoard && flagPhone && !modalFlagTablet ? (
        <>
          <div className='margin'></div>
          {nameStation !== '' ? (
            <>
              <div className='stap1'>
                <div className='nameStationBoardPhone'>{nameStation}</div>
                <button
                  className='listenIconStation'
                  onClick={() => listenMyStation()}
                ></button>
                <div className='kavPhoneStationBoard'></div>
              </div>
            </>
          ) : (
            <></>
          )}
          <BsThreeDotsVertical className='threeDotsVerticalTasks' />
          <div className='borderTask'>
            <div className='nameOfTaskPhone'>
              <Images id={id} url={picture_url || TaskImage} />
              {title}
              <div className='phoneTagDesc'>{subtitle}</div>
            </div>
          </div>
          <button className='listenIcon' onClick={() => listen()}></button>
          {/* <Audios id={idListen} data={audio_url} /> */}
          <div className='kavPhone'></div>
        </>
      ) : (
        <>
          {/* משימות */}
          {!modalFlagTablet ? (
            <>
              <div
                className='buttons'
                style={{
                  background:
                    // dragFromCover === 'reorderBoard'
                    //   ? `linear-gradient(270deg, #000dff 7%, #ffffff 1%)`
                    //   : 'linear-gradient(270deg, #000dff 7%, #ffffff 1%)',
                    language === 'English'
                      ? `linear-gradient(270deg,${taskButtonColor} 7%, #ffffff 1%)`
                      : `linear-gradient(90deg, ${taskButtonColor} 7%, #ffffff 1%)`,
                  marginTop: myMarginTop,
                  flexDirection: language === 'English' ? 'row' : 'row-reverse',
                  textAlignLast: language === 'English' ? 'end' : 'left',
                  marginLeft:
                    language !== 'English' && dragFromCover === 'border'
                      ? '56px'
                      : '',
                  // width: dragFromCover === "border" ? "85%" : "90%",
                }}
                // ref={drag}
                src={title}
              >
                <div className='dropdownThreeDots'>
                  <button
                    className='threeDotsVerticalEng'
                    onClick={() => {
                      dragFromCover === 'TasksNew'
                        ? clickOnThreeDotsVerticaIcont(id)
                        : clickOnThreeDotsVerticaIcontBoard(id);
                    }}
                  >
                    <BsThreeDotsVertical />
                  </button>

                  {openThreeDotsVertical !== id ? (
                    <></>
                  ) : dragFromCover === 'TasksNew' ? (
                    <Modal_dropdown
                      setRequestForEditing={setRequestForEditing}
                      setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                      editable={true}
                      Reproducible={true}
                      details={true}
                      erasable={true}
                    />
                  ) : (
                    <></>
                  )}

                  {openThreeDotsVerticalBoard !== id ? (
                    <></>
                  ) : dragFromCover === 'border' ? (
                    <Modal_dropdown
                      setRequestForEditing={setRequestForEditing}
                      setOpenThreeDotsVertical={setOpenThreeDotsVertical}
                      editable={true}
                      Reproducible={true}
                      details={true}
                      erasable={true}
                    />
                  ) : (
                    <></>
                  )}
                </div>
                <div style={{ marginRight: '15px' }} className='nameOfTask'>
                  {' '}
                  {title}
                </div>
              </div>
            </>
          ) : (
            <></>
          )}

          {/* <Dot color="#C4CE9C" /> */}
        </>
      )}

      {flagBoard && modalFlagTablet && !flagPhone ? (
        <>
          <div className='ItemStyle'>
            <Images id={id} url={picture_url} flag={true} />
          </div>
        </>
      ) : (
        <></>
      )}
      {/* {!flagPhone ? <>      <div className='Tasks' style={{ marginTop: myMarginTop }} ref={drag} src={title}>

                <BsThreeDotsVertical className='threeDotsVerticalTasks' />

                <div className={'nameOfTask'}> {title}</div>
            </div></> : <>

            </>} */}
    </>
  );
}
export default Tag;

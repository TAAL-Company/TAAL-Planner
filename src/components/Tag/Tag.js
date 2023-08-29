import React, { useState, useEffect } from 'react';
// import { useDrag } from "react-dnd";
// import { RiDragMove2Line } from "react-icons/ri";
import './style.css';
import TaskImage from '../../Pictures/TaskImage.png';
// import Dot from "../Dot/Dot"
import { BsThreeDotsVertical } from 'react-icons/bs';
import Images from '../Images/Images';
import Audios from '../Audios/Audios';
import Modal_dropdown from '../Modal/Modal_dropdown';
import { CgOpenCollective } from 'react-icons/cg';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

let idListen = 0;
let dataListen = {};

// import { useState, } from 'react';
function Tag({
  title,
  id,
  flagBoard,
  myStation,
  myMarginTop,
  count,
  myLastStation,
  width,
  height,
  kavTopWidth,
  bottom,
  nameStation,
  kavTaskTopMarginTop,
  borderLeft,
  flagPhone,
  // idImg,
  dataImg,
  data,
  modalFlagTablet,
  dragFromCover,
  stationColor,
  language,
  openThreeDotsVertical,
  setOpenThreeDotsVertical,
  requestForEditing,
  setRequestForEditing,
  openThreeDotsVerticalBoard,
  setOpenThreeDotsVerticalBoard,
  requestForEditingBoard,
  setRequestForEditingBoard,
}) {
  console.log('khalid - tag - stationColor : ' + stationColor);
  console.log('khalid - title in Tag:', title);
  localStorage.setItem('myLastStation', JSON.stringify(myLastStation));
  // console.log("title in Tag:", title);
  // console.log("myLastStation:", myLastStation);
  // console.log("width width width widthwidthwidth:", kavTaskTopMarginTop);
  // console.log("myStation:", myStation);
  // console.log("countcountcountcount:", count);
  // console.log("id:", id);
  // console.log("image data tag: ", dataImg);

  // console.log("flagBoard:", flagBoard);
  // console.log("nameStation:", nameStation);
  // console.log("borderLeft:", borderLeft);
  // console.log("data:", data);
  // // console.log("idImg: ", idImg)

  const [idListen, setIdListen] = useState(0);
  const [dataListen, setDataListen] = useState({});
  // const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);
  // const [requestForEditing, setRequestForEditing] = useState("");

  // console.log("flag Tag", flag)

  // const [{ isDragging }, drag] = useDrag(() => ({
  //   type: "image",
  //   item: { id: id, boardName: dragFromCover },
  //   collect: (monitor) => ({
  //     isDragging: !!monitor.isDragging(),
  //   }),
  // }));
  console.log('dragFromCover: ', dragFromCover);
  // useEffect(() => {
  //   console.log("isDragging: ", isDragging);
  // }, [isDragging]);

  const clickOnhreeDotsVerticaIcontBoard = (value) => {
    console.log('value', value);
    if (openThreeDotsVerticalBoard === value) setOpenThreeDotsVerticalBoard(-1);
    else setOpenThreeDotsVerticalBoard(value);
  };

  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical === value) setOpenThreeDotsVertical(-1);
    else setOpenThreeDotsVertical(value);
  };
  useEffect(() => {
    console.log('openThree' + openThreeDotsVertical);
  }, [openThreeDotsVertical]);

  const listen = () => {
    setIdListen(id);
    setDataListen(dataImg);
    console.log('dataListen:', dataListen);
  };
  const listenMyStation = () => {
    data.forEach((val) => {
      if (nameStation === val.name) setIdListen(val.id);
    });
    setDataListen(data);
    console.log('idListen:', idListen);
    console.log('dataListen', dataListen);
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
              className={`stationDot ${
                language !== 'English' ? 'english' : ''
              }`}
              style={{ background: stationColor }}
            ></div>
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
              {console.log('flagPhone:', flagPhone)}

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
              <Images id={id} url={dataImg || TaskImage} />
              {title}
            </div>
          </div>
          <button className='listenIcon' onClick={() => listen()}></button>
          <Audios id={idListen} data={dataListen} />
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
                      ? `linear-gradient(270deg,${stationColor} 7%, #ffffff 1%)`
                      : `linear-gradient(90deg, ${stationColor} 7%, #ffffff 1%)`,
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
                        ? clickOnhreeDotsVerticaIcont(id)
                        : clickOnhreeDotsVerticaIcontBoard(id);
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
            <Images id={id} url={dataImg} flag={true} />
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

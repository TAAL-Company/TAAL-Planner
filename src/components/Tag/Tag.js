import React, { useState, useEffect } from "react";
import { useDrag } from "react-dnd";
// import { RiDragMove2Line } from "react-icons/ri";
import "./style.css";
// import Dot from "../Dot/Dot"
import { BsThreeDotsVertical } from "react-icons/bs";
import Images from "../Images/Images";
import Audios from "../Audios/Audios";
import Modal_dropdown from "../Modal/Modal_dropdown";
import { CgOpenCollective } from "react-icons/cg";

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
  language
}) {
  localStorage.setItem("myLastStation", JSON.stringify(myLastStation));
  console.log("title in Tag:", title);
  console.log("myLastStation:", myLastStation);
  console.log("width width width widthwidthwidth:", kavTaskTopMarginTop);
  console.log("myStation:", myStation);
  console.log("countcountcountcount:", count);
  console.log("id:", id);
  console.log("image data tag: ", dataImg)

  console.log("flagBoard:", flagBoard);
  console.log("nameStation:", nameStation);
  console.log("borderLeft:", borderLeft);
  console.log("data:", data);
  // console.log("idImg: ", idImg)

  const [, setIdListen] = useState(0);
  const [, setDataListen] = useState({});
  const [openThreeDotsVertical, setOpenThreeDotsVertical] = useState(-1);


  // console.log("flag Tag", flag)

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "image",
    item: { id: id, boardName: dragFromCover },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));
  console.log("dragFromCover: ", dragFromCover);
  useEffect(() => {
    console.log('isDragging: ', isDragging);
  }, [isDragging])


  const clickOnhreeDotsVerticaIcont = (value) => {
    if (openThreeDotsVertical == value)
      setOpenThreeDotsVertical(-1)
    else
      setOpenThreeDotsVertical(value)

  }
  useEffect(() => {
    console.log("openThree" + openThreeDotsVertical)

  }, [openThreeDotsVertical])



  const listen = () => {
    setIdListen((idListen = id));
    setDataListen((dataListen = dataImg));
    console.log("dataListen:", dataListen)
  };
  const listenMyStation = () => {
    data.forEach((val) => {
      if (nameStation === val.name) setIdListen((idListen = val.id));
    });
    setDataListen((dataListen = data));
    console.log("idListen:", idListen);
    console.log("dataListen", dataListen);
  };
  return (
    <>
      {flagBoard && !flagPhone && !modalFlagTablet ? (
        <>
          {/* {myLastStation !== myStation && flagBoard ? <>  <div className='kavTask3'></div></> : <></>} */}

          <div className={`kav ${language !== 'English' ? 'english' : ''}`}></div>
          <div className={`kavTop ${language !== 'English' ? 'english' : ''}`} style={{ width: kavTopWidth }}>
            <div className={`titleStat ${language !== 'English' ? 'english' : ''}`}>{nameStation}</div>
            <div className={`kavTask ${language !== 'English' ? 'english' : ''}`} style={{ borderLeft: borderLeft }}>
              {/* <div className='kavB'></div> */}
            </div>
            <div
            className={`kavTask2 ${language !== 'English' ? 'english' : ''}`}
              style={{ height: height, bottom: bottom }}
            ></div>
            <div className={`kavTaskTop ${language !== 'English' ? 'english' : ''}`} style={{ marginTop: width }}></div>
            <div className={`nameStationBoard ${language !== 'English' ? 'english' : ''}`}>{nameStation}</div>
          </div>
        </>
      ) : (
        <>{/* <Dot color="#C4CE9C" /> */}</>
      )}
      {flagBoard && flagPhone && !modalFlagTablet ? (
        <>
          <div className="margin"></div>
          {nameStation !== "" ? (
            <>
              {console.log("flagPhone:", flagPhone)}

              <div className="stap1">
                <div className="nameStationBoardPhone">{nameStation}</div>
                <button
                  className="listenIconStation"
                  onClick={() => listenMyStation()}
                ></button>
                <div className="kavPhoneStationBoard"></div>
              </div>
            </>
          ) : (
            <></>
          )}
          <BsThreeDotsVertical className="threeDotsVerticalTasks" />
          <div className="borderTask">
            <div className="nameOfTaskPhone">
              {" "}
              {title}
              <Images id={id} url={dataImg} />
            </div>
          </div>
          <button className="listenIcon" onClick={() => listen()}></button>
          <Audios id={idListen} data={dataListen} />
          <div className="kavPhone"></div>
        </>
      ) : (
        <>
          {/* משימות */}
          {!modalFlagTablet ? (
            <>
              <div
                className="buttons"
              
                style={
                  {
                    background: (dragFromCover === "reorderBoard") ? `linear-gradient(270deg, ${stationColor} 7%)` : "",
                    marginTop: myMarginTop,
                    flexDirection: language === 'English' ? "row" : "row-reverse",
                    textAlignLast: language === 'English' ? "end" : "left",
                    marginLeft: language === 'English' ? "" : "56px"
                  }
                }
                ref={drag}
                src={title}
              >
                {/* {dragFromCover !== "reorderBoard" ?
                  <BsThreeDotsVertical className="threeDotsVerticalTasks" /> :
                  <BsList className="threeDotsVerticalTasks" />
                } */}
                <div className="dropdownThreeDots">

                  <button className="threeDotsVerticalEng"
                    onClick={() => clickOnhreeDotsVerticaIcont(id)} >
                    <BsThreeDotsVertical />
                  </button>

                  {openThreeDotsVertical !== id ?
                    <></>: <Modal_dropdown /> 

                  }
                </div>
                <div className="nameOfTask"> {title}</div>
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
          <div className="ItemStyle">
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

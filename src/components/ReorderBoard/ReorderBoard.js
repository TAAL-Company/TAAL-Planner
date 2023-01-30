import React, { useState, useEffect } from "react";
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import Tag from "../Tag/Tag.js";
import "./reorderBoard.css"

const ReorderBoard = (props) => {
    const [tasks, setTasks] = useState(props.board);

    useEffect(() => {
        for (let i = 0; i < tasks.length; i++) {
            if (tasks[i].nameStation == "") {
                if (i === 0) {
                    tasks[i].nameStation = tasks[i].myStation;
                    tasks[i].borderLeft = "0x solid #c2bfbf";
                    tasks[i].width = "-13px";
                    tasks[i].height = "70px";
                    tasks[i].bottom = "-27px";
                    tasks[i].kavTopWidth = "25px";
                    tasks[i].newkavTaskTop = "0px";
                    tasks[i].kavTaskTopMarginTop = "-7px";
                }
                else if (tasks[i].myStation !== tasks[i - 1].myStation) {
                    tasks[i].nameStation = tasks[i].myStation;
                    tasks[i].borderLeft = "0x solid #c2bfbf";
                    tasks[i].width = "-13px";
                    tasks[i].height = "70px";
                    tasks[i].bottom = "-27px";
                    tasks[i].kavTopWidth = "25px";
                    tasks[i].newkavTaskTop = "0px";
                    tasks[i].kavTaskTopMarginTop = "-7px";
                }
            }
            else {
                if (i !== 0 && tasks[i].myStation === tasks[i - 1].myStation) {
                    tasks[i].nameStation = "";
                    tasks[i].width = "-84px";
                    tasks[i].borderLeft = "2x solid #c2bfbf";
                    tasks[i].height = "86px";
                    tasks[i].bottom = "45px";
                    tasks[i].kavTopWidth = "0px";
                    tasks[i].newkavTaskTop = "100px";
                    tasks[i].kavTaskTopMarginTop = "-27px";

                }
            }
        }
        console.log("boarddd", tasks);
        props.setBoard(tasks)
    }, [tasks])


    function handleOnDragEnd(result) {
        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1)
        console.log("result.source.index", result.source.index);
        items.splice(result.destination.index, 0, reorderedItem);
        setTasks(items);
    }

    return (
        <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="tasksRorder">
                {(provided) => (
                    <div className="tasksRorder" {...provided.droppableProps} ref={provided.innerRef}>
                        {tasks.map((task, index) => {
                            return (
                                <Draggable key={task.id} draggableId={'' + task.id} index={index}>
                                    {(provided) => (
                                        <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} >
                                            <div className="nameStationReorder"> {task.nameStation}</div>
                                            {/* <Tag
                                                title={task.title}
                                                data={task.data}
                                                dataImg={task.dataImg}
                                                id={task.id}
                                                key={index}
                                                dragFromCover={"reorderBoard"}
                                                stationColor={task.color}
                                            /> */}
                                            <>
                                                <div
                                                    className="buttons"
                                                    style={{
                                                        background: `linear-gradient(270deg, ${task.color} 7%, #fff 1%)`,
                                                        justifyContent: "flex-end", padding: "22px" }
                                                    }
                                                >

                                                <div className="nameOfTask"> {task.title}</div>
                                            </div>
                                        </>
                                        </div>
                            )
                        }
                                </Draggable>
                );
                        })}
                {provided.placeholder}
            </div>
                )}
        </Droppable>
        </DragDropContext >
    )
}
export default ReorderBoard;

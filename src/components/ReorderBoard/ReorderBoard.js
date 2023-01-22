import React, { useState } from "react";
import { Droppable, Draggable, DragDropContext } from 'react-beautiful-dnd';
import Tag from "../Tag/Tag.js";
import "./reorderBoard.css"

const ReorderBoard = (props) => {
    const [tasks, setTasks] = useState(props.board);
    console.log("boarddd", tasks);

    function handleOnDragEnd(result) {
        const items = Array.from(tasks);
        const [reorderedItem] = items.splice(result.source.index, 1);
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
                                            <Tag
                                                title={task.title}
                                                data={task.data}
                                                dataImg={task.dataImg}
                                                id={task.id}
                                                key={index}
                                                dragFromCover={"reorderBoard"}
                                            />
                                        </div>
                                    )}
                                </Draggable>
                            );
                        })}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    )
}
export default ReorderBoard;

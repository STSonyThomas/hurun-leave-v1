"use client";

import { useBoardStore } from "@/store/BoardStore";
import React, { useEffect } from "react";
import { DragDropContext, DropResult, Droppable, resetServerContext } from "react-beautiful-dnd";
import Column from "@/components/Column";

const Board = () => {
  const [board, getBoard,setBoardState,updateTodoInDB] = useBoardStore((state) => [
    state.board,
    state.getBoard,
    state.setBoardState,
    state.updateTodoInDB,
  ]);
  console.log(board);
  
  useEffect(() => {
    getBoard();
    
  }, [getBoard]);

  const handleOnDragEnd= (result:DropResult)=>{
    const {destination,source,type} = result;

    if(!destination) return;
    //handle column drag
    if(type==="column"){
      const entries = Array.from(board.columns.entries());
      const [removed] = entries.splice(source.index,1);
      // console.log(entries);
      // console.log(removed);
      
      
      entries.splice(destination.index,0,removed);
      const rearrangedColumns = new Map(entries);
      setBoardState({
        ...board,
        columns:rearrangedColumns,
      })
    }
    //the cards have the id as numbers
    const columns =Array.from(board.columns);
    const startColIndex = columns[Number(source.droppableId)];
    const finishColIndex =  columns[Number(destination.droppableId)]
  

    
    const startCol ={
      id:startColIndex[0],
      todos:startColIndex[1].todos,
    }

    const finishCol= {
      id:finishColIndex[0],
      todos:finishColIndex[1].todos,
    }

    if(!startCol || !finishCol) return;
    if(source.index === destination.index && startCol ===finishCol) return;

    const newTodos = startCol.todos;
    const [todoMoved] =  newTodos.splice(source.index,1);

    if(startCol.id===finishCol.id){
      //same col task drag
      newTodos.splice(destination.index,0,todoMoved);
      const newCol:Column = {
        id:startCol.id,
        todos:newTodos,
      };
      const newColumns = new Map(board.columns);
      newColumns.set(startCol.id,newCol);
      setBoardState({...board,columns:newColumns})

    }else{
      //different col
      const finishTodos =  Array.from(finishCol.todos);
      finishTodos.splice(destination.index,0,todoMoved);
      const newCol:Column = {
        id:startCol.id,
        todos:newTodos,
      };
      const newColumns = new Map(board.columns);
      newColumns.set(startCol.id,newCol);
      newColumns.set(finishCol.id,{
        id:finishCol.id,
        todos:finishTodos,
      });

      setBoardState({...board,columns:newColumns})
      //update in db
      updateTodoInDB(todoMoved,finishCol.id)

    }
  }

  return (
    <DragDropContext onDragEnd={handleOnDragEnd}>
      <Droppable droppableId="board" direction="horizontal" type="column">
        {(provided) => (
          <div
          className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-7xl mx-auto"
          {...provided.droppableProps}
          ref={provided.innerRef}
          >
            {Array.from(board.columns.entries()).map(([id, column], index) => (
              <Column key={id} id={id} todos={column.todos} index={index} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default Board;



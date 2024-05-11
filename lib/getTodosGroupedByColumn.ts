import { title } from "process";
import { databases } from "../appwrite";

export const getTodosGroupedByColumn = async()=>{
    const data = await databases.listDocuments(
        process.env.NEXT_PUBLIC_DATABASE_ID!,
        process.env.NEXT_PUBLIC_TODOS_COLLECTION_ID!
    );
    

    const todos = data.documents;
    const columns = todos.reduce((acc,todo)=>{
        if(!acc.get(todo.status)){
            acc.set(todo.status,{
                id:todo.status,
                todos:[]
            })
        };
        acc.get(todo.status)!.todos.push({
            $id:todo.$id,
            $createdAt:todo.$createdAt,
            title:todo.title,
            status:todo.status,
            ...(todo.image && {image:JSON.parse(todo.image)})
        });
        
        return acc;
    },new Map<TypedColumn,Column>)
    

    const ColumnTypes:TypedColumn[] =["todo","inprogress","done"];
    for(const ColumnType of ColumnTypes){
        if(!columns.get(ColumnType)){
            columns.set(ColumnType,{
                id:ColumnType,
                todos:[],
            })
        }
    }

    const sortedColumns = new Map(
        Array.from(columns.entries()).sort((a,b)=>(
            ColumnTypes.indexOf(a[0])-ColumnTypes.indexOf(b[0]))
        )
    );

    const board:Board={
        columns:sortedColumns,
    }

    return board;
    
};
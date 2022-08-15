import { addAttachmentToTodoItem, createTodoItem, deleteTodoItem, getTodoItems, updatedTodoItem} from './todosAcess'
// import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate'
import { getAttachmentUrl, getSignedUploadUrl } from './attachmentUtils'

// Implement businessLogic
const logger = createLogger('Todos Business Logic')
//logic to get todos
export async function getTodosForUser(userId:string):Promise<TodoItem[]> {
    try{
        const result = await getTodoItems(userId)
        logger.info(`Todo items for user fetched.. logs: ${userId}`, JSON.stringify(result))
        return result;
    }catch(error){
        logger.error(`fetch error: ${error}`)
        throw new Error (error)
       
    }
}

//logic to create todos
export const createTodo = async (userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> => {
    const todoId = uuid.v4()
    
    const todoItem: TodoItem = {
        userId,
        todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...createTodoRequest //spread factor to copy the object to createtodo
    }
    try{
        await createTodoItem(todoItem)
        logger.info('Todo item by user created successfully.. logs', {
            todoId,userId,todoItem
        })
        return todoItem;
    }catch(error){
        logger.error(`create error: ${error}`)
        throw new Error(error)
    }
}

//logic to update our todo item
export const updateTodo = async (userId:string, todoId:string,updateTodoRequest:UpdateTodoRequest):Promise<TodoItem> => {
    try{
        const todoItem = await updatedTodoItem(userId,todoId, updateTodoRequest as TodoUpdate)
        logger.info('Todo item successfully updated', {userId,todoId,todoUpdate: updateTodoRequest})
        return todoItem
    }catch(error){
        logger.error(`update todo item error: ${error}`)
        throw new Error(error)
    }

}

//logic to delete our todo item
export const deleteTodo = async (userId:string,todoId:string):Promise<TodoItem> => {
        try{
            const todoItem = await deleteTodoItem(userId, todoId)
            logger.info('Todo item successfully deleted', {userId,todoId})
            return todoItem;
        }catch(error){
            logger.error(`delete todo item error: ${error}`)
            throw new Error(error)
        }
}

//logic to add an attachment to our todo item
export const addAttachmentUrl =async (userId:string, todoId:string,attachmentId:string):Promise<void> => {
   try{
        const attachmentUrl = getAttachmentUrl(attachmentId)
        await addAttachmentToTodoItem(userId,todoId,attachmentUrl)
        logger.info('AttachmentUrl added successfully',{userId,todoId})
    }catch(error){
        logger.error(error)
        throw new Error(error)
    }
}

//logic to generate our signed url from aws
export const generateSignedUrl =async (attachmentId:string):Promise<string> => {
    logger.info('Generating signedUrl')
    try{
        const signedUploadUrl = await getSignedUploadUrl(attachmentId)
        logger.info('Signed Url Generated Successfully')
        return signedUploadUrl;
    }catch(error){
        logger.error(`signed url generation error: ${error}`)
        throw new Error(error)
    }
}
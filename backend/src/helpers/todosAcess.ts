import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'

const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess');

//using awsxray enables us trace issues if any from requests
const docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient();
const todosTable = process.env.TODOS_TABLE;
const todosOnUserIndex = process.env.TODOS_CREATED_AT_INDEX;


// dataLayer logic

//Logic for getting todo items using userId
export const getTodoItems = async (userId:string):Promise<TodoItem[]> => {
    logger.info('Accessing Database to fetch todo items')
    try{
        const result = await docClient
            .query({
                TableName: todosTable,
                IndexName: todosOnUserIndex,
                KeyConditionExpression: 'userId = :userId',
                ExpressionAttributeValues: {':userId': userId}
            }).promise()
        return result.Items as TodoItem[];
    }catch(error){
        logger.error(`get todo item error: ${error}`)
        return error;
    }
}

//Logic for creating todo items
export const createTodoItem = async (item: TodoItem): Promise<void> => {
    logger.info('Accessing Database to create todo items')
    await docClient.put({TableName: todosTable, Item: item}).promise()
}

//we need a way to update our todos in our db hence we build this function
export const  updatedTodoItem = async (userId:string, todoId: string, todoUpdate:TodoUpdate): Promise<TodoItem> =>{
    logger.info('Accessing Database to update todo items')
    try{
        const result = await docClient
            .update({
                TableName: todosTable,
                Key: {userId, todoId},
                UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
                ExpressionAttributeNames:{
                    '#name': 'name'
                },
                ExpressionAttributeValues: {
                    ':name': todoUpdate.name,
                    ':dueDate' : todoUpdate.dueDate,
                    ':done': todoUpdate.done
                },
                ReturnValues: "ALL_NEW"
            }).promise()
            return result.Attributes as TodoItem
    }catch(error){
        logger.error(`update todo item error: ${error}`)
        throw new Error(error);
    }
}
//logic to delete a todo item
export const deleteTodoItem = async (userId:string, todoId:string): Promise<TodoItem> =>{
    logger.info('Accessing Database to delete todo items')
    try{
        const result = await docClient
            .delete({
                TableName: todosTable,
                Key: {userId, todoId},
                ReturnValues: 'ALL_OLD'
            }).promise()
            return result.Attributes as TodoItem
    }catch(error){
        logger.error(`delete todo item error: ${error}`)
        throw new Error(error)
    }
}

//logic to add an attachment to our todo items
export const addAttachmentToTodoItem = async (userId:string,todoId:string,attachmentUrl: string):Promise<void> => {
    logger.info('Accessing Database to add attachment to todo items')
    try   {
        await docClient
            .update({
                TableName: todosTable,
                Key: {userId, todoId},
                UpdateExpression: 'set attachmentUrl = :attachmentUrl',
                ExpressionAttributeValues:{':attachmentUrl': attachmentUrl}
            }).promise()
    }catch(error){
        logger.error(`adding attachment to todo item error: ${error}`)
        throw new Error(error)
    } 
}
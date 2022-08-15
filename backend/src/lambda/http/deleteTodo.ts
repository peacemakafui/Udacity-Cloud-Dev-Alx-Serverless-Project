import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { deleteTodo } from '../../helpers/todos'
import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'

const logger = createLogger('DeleteTodo Item')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Deleting Todo Item', {event})
    try{
        const userId = getUserId(event)
        const todoId = event.pathParameters.todoId

        const todoItem = await deleteTodo(userId, todoId)
        return {
            statusCode: 204,
            headers:{
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({todoItem,'message':"item deleted successfully"})
          }
    }catch(error){
        return {
            statusCode: 500,
            body: JSON.stringify({error})
          }
    }
   
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )

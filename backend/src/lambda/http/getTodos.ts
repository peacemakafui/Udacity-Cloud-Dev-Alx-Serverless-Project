import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'

import { getTodosForUser as getTodos} from '../../helpers/todos'
import { getUserId } from '../utils';
import {createLogger} from '../../utils/logger';


const logger = createLogger('GetTodoLogs');
// Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('fetching TODO item', {event})
    try{
      const userId = getUserId(event)
      const todoItems = await getTodos(userId)
      return {
        statusCode: 200,
        headers:{
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({todoItems})
      }
    }catch(error){
      logger.info(`GetTodo Lambda Function Error ${error}`)
      return {
        statusCode: 500,
        body: JSON.stringify(error)
      }
    }
  }
)
handler.use(
  cors({
    credentials: true
  })
)

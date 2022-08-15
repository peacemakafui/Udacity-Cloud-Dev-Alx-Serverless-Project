import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { getUserId } from '../utils';
import { createTodo } from '../../helpers/todos'
import { createLogger } from '../../utils/logger'

const logger = createLogger('CreateTodoLogs')

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Creating new TODO item', {event})

    try{
      const userId = getUserId(event)
      const newTodo: CreateTodoRequest = JSON.parse(event.body)

      const todoItem = await createTodo(userId, newTodo)
      return {
        statusCode: 201,
        headers:{
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true
        },
        body: JSON.stringify({todoItem})
      }
    }catch(error){
      logger.info(`createTodo lambda function error ${error}`)
      return{
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

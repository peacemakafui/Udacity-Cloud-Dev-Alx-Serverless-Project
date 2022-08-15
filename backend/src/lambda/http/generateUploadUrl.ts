import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import * as uuid from 'uuid'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { getUserId } from '../utils'
import { createLogger } from '../../utils/logger'
import { addAttachmentUrl, generateSignedUrl } from '../../helpers/todos'

const logger = createLogger('Generate Attachment Url')
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    logger.info('Generating Upload Url', {event})
    try{
        const userId = getUserId(event)
        const attachmentId = uuid.v4()
        const todoId = event.pathParameters.todoId

        const uploadUrl = await generateSignedUrl(attachmentId)
        await addAttachmentUrl(userId,todoId, attachmentId)
        return {
            statusCode: 201,
            headers:{
              "Access-Control-Allow-Origin": "*",
              "Access-Control-Allow-Credentials": true
            },
            body: JSON.stringify({uploadUrl})
          }
        }catch(error){
            logger.error(`Attachment Url Generation error: ${error}`)
            return{
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

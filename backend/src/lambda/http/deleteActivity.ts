import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from "@middy/core"
import cors from "@middy/http-cors"
import httpErrorHandler from '@middy/http-error-handler'

import { deleteActivityItem } from '../../businessLogic/activities'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId
    const userId = getUserId(event);
    try {
      const response = await deleteActivityItem(userId,postId);
      return {
        statusCode: response.httpCode,
        body: JSON.stringify(`item ${postId} deleted.`)
      }
    } catch (error) {
      return {
        statusCode: error.httpCode,
        body: JSON.stringify(error.name)
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

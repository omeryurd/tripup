import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import middy from "@middy/core"
import cors from "@middy/http-cors"
import httpErrorHandler from '@middy/http-error-handler'
import { updateActivityItem } from '../../businessLogic/activities'
import { UpdateActivityRequest } from '../../requests/UpdateActivityRequest'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const postId = event.pathParameters.postId;
    const updatedActivity: UpdateActivityRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    try {
      const response = await updateActivityItem(userId, updatedActivity,postId);
      return {
        statusCode: response.httpCode,
        body: JSON.stringify({
          item: response.updatedActivity
        })
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

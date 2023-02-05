import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import 'source-map-support/register'
//import * as middy from 'middy'
import middy from "@middy/core"
import cors from "@middy/http-cors"

//import { cors } from 'middy/middlewares'
import { CreateActivityRequest } from '../../requests/CreateActivityRequest'
import { getUserId } from '../utils';
import { createActivity } from '../../businessLogic/activities'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const parsedBody: CreateActivityRequest = JSON.parse(event.body);
    const userId = getUserId(event);
    try {
      const response = await createActivity(userId, parsedBody);
      return {
        statusCode: response.httpCode,
        body: JSON.stringify({
          item: response.item
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

handler.use(
  cors({
    credentials: true
  })
)
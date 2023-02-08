import { DynamoDBClient} from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand
} from "@aws-sdk/lib-dynamodb";
import { UpdateActivityRequest } from '../requests/UpdateActivityRequest'
import xray from "aws-xray-sdk-core"
import {PutObjectCommand, S3} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
const s3 = xray.captureAWSv3Client(new S3({}));
const docClient:DynamoDBClient = xray.captureAWSv3Client(new DynamoDBClient({region: process.env.REGION}));
const dynamo = DynamoDBDocumentClient.from(docClient);
const tableName = process.env.ACTIVITIES_TABLE;

export async function putItemToDb(item: any) {
    console.log("Item to be added: ", item)
    return await dynamo.send(new PutCommand( {TableName:tableName, Item:item as any}));
}

export async function sendUpdateRequestToDB(userId: string, updatedActivity: UpdateActivityRequest, postId: string) {
  return await dynamo.send(new UpdateCommand({
      TableName: tableName,
      Key: {postId, userId},
      UpdateExpression:"set #title = :title, #description=:description, #activityType=:activityType",
      ConditionExpression:"userId = :userId",
      ExpressionAttributeNames:{
        "#name":"name",
        "#dueDate":"dueDate",
        "#activityType":"activityType"

      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":title": updatedActivity.title,
        ":description": updatedActivity.description,
        ":activityType": updatedActivity.activityType
      }
      
    }))
}

export async function sendDeleteRequestToDB(userId: string, postId: string) {
    return await dynamo.send(new DeleteCommand({
        TableName: tableName,
        Key: {postId, userId},
        ConditionExpression:"userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId
        } 
      }))
}

// From https://rdavis.io/articles/large-dynamodb-queries
export async function * queryGenerator (userId: string) {

    let LastEvaluatedKey;

    do {

        const command = new QueryCommand({
          TableName: tableName,
          IndexName: process.env.ACTIVITIES_CREATED_AT_INDEX,
          KeyConditionExpression: 'userId = :userId',
          ExpressionAttributeValues: {
            ':userId': userId as any},
          Limit: 50,
          ExclusiveStartKey: LastEvaluatedKey
        })

        const response = await dynamo.send(command)
        LastEvaluatedKey = response.LastEvaluatedKey

        const items = response.Items
        yield items

    } while (LastEvaluatedKey)

}

export async function * queryGeneratorAll () {

  let LastEvaluatedKey;
  let date=new Date()
  date.setDate(date.getDate()-14)
  const createdAt = date.toISOString()
  do {

      const command = new ScanCommand({
        TableName: tableName,
        IndexName: process.env.ACTIVITIES_CREATED_AT_INDEX,
        Limit: 50,
        FilterExpression: "#createdAt>:createdAt",
        ExpressionAttributeNames:{
          "#createdAt":"createdAt",
        },
        ExpressionAttributeValues: {
          ":createdAt": createdAt
        },
        ExclusiveStartKey: LastEvaluatedKey
      })

      const response = await dynamo.send(command)
      LastEvaluatedKey = response.LastEvaluatedKey

      const items = response.Items
      yield items

  } while (LastEvaluatedKey)

}

export async function getSignedURL(postId: string) {
    const uploadUrl = await getSignedUrl(s3,new PutObjectCommand(
      {Bucket:process.env.ATTACHMENT_S3_BUCKET, Key:postId}),
      {expiresIn: Number(process.env.SIGNED_URL_EXPIRATION)}
      )
  
      return uploadUrl;
  }
  
  export async function updateAttachment(postId: string, userId: string) {
    const attachmentUrl =`https://${process.env.ATTACHMENT_S3_BUCKET}.s3.amazonaws.com/${postId}`; 
    const response = await dynamo.send(new UpdateCommand({
      TableName: tableName,
      Key: {postId, userId},
      UpdateExpression:"set #attachmentUrl = :attachmentUrl",
      ConditionExpression:"userId = :userId",
      ExpressionAttributeNames:{
        "#attachmentUrl":"attachmentUrl",
      },
      ExpressionAttributeValues: {
        ":userId": userId,
        ":attachmentUrl": attachmentUrl
      }
      
    }))
    return response
  }
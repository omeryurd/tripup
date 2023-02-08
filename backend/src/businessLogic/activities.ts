import { v4 as uuidV4 } from 'uuid';
import { Activity } from '../models/Activity';
import { CreateActivityRequest } from '../requests/CreateActivityRequest'
import { UpdateActivityRequest } from '../requests/UpdateActivityRequest'
import { 
    putItemToDb,
    sendDeleteRequestToDB,
    queryGenerator,
    getSignedURL,
    updateAttachment,
    sendUpdateRequestToDB,
    queryGeneratorAll

} from '../dataLayer/activityAccess';

export async function createActivity(userId: string, postRequest: CreateActivityRequest){  
    const postId = uuidV4();
    const newItem: Activity = {
      userId: userId,
      postId: postId,
      createdAt: new Date().toISOString(),
      ...postRequest, 
    }

    try {
        const response = await putItemToDb(newItem);
        return {
            httpCode: response.$metadata.httpStatusCode,
            item: newItem
        }
    } catch (error) {
        console.error(error)
        throw {
            name: error.name,
            httpCode: error.$metadata.httpStatusCode,
        }
        

    }

}

export async function updateActivityItem(userId: string, updatedActivity: UpdateActivityRequest, postId: string ){
    try {
        const response = await sendUpdateRequestToDB(userId,updatedActivity, postId);
        console.log("Item updated: ", postId)
        return {
            httpCode: response.$metadata.httpStatusCode,
            updatedActivity: updatedActivity
        }
    } catch (error) {
        console.error(error)
        throw {
            name: error.name,
            httpCode: error.$metadata.httpStatusCode,
        }
    }
}

export async function deleteActivityItem(userId: string, postId: string ){

    try {
        const response = await sendDeleteRequestToDB(userId, postId);
        console.log("Item deleted: ", postId)
        return {
            httpCode: response.$metadata.httpStatusCode,
        }
    } catch (error) {
        console.error(error)
        throw {
            name: error.name,
            httpCode: error.$metadata.httpStatusCode,
        }
    }
}

export async function getTodosByUserPaginated(userId: string){
    let results = []
    let generator = queryGenerator(userId)
    
        for await (const items of generator) {
            results = results.concat(items)
        }
        return {
            httpCode: 200,
            items: results
        }
 
}

export async function getFeedItems(){
    let results = []
    let generator = queryGeneratorAll()
    
        for await (const items of generator) {
            results = results.concat(items)
        }
        return {
            httpCode: 200,
            items: results
        }
 
}

export async function requestUploadURL(userId: string, postId: string ){

    try {
        
        const uploadUrl = await getSignedURL(postId);
        console.log("URL generated: ", uploadUrl)
        const response = await updateAttachment(postId, userId)
        return {
            httpCode: response.$metadata.httpStatusCode,
            uploadUrl: uploadUrl 
        }
    } catch (error) {
        console.error(error)
        throw {
            name: error.name,
            httpCode: error.$metadata.httpStatusCode,
        }
    }
}
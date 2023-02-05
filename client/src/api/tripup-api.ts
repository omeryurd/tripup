import { apiEndpoint } from '../config'
import { Activity } from '../types/Activity';
import { CreateActivityRequest } from '../types/CreateActivityRequest';
import Axios from 'axios'
import { UpdateActivityRequest } from '../types/UpdateActivityRequest';

export async function getActivities(idToken: string): Promise<Activity[]> {
  console.log('Fetching todos')

  const response = await Axios.get(`${apiEndpoint}/activities`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Activities:', response.data)
  return response.data.items
}

export async function createActivity(
  idToken: string,
  newActivity: CreateActivityRequest
): Promise<Activity> {
  const response = await Axios.post(`${apiEndpoint}/activities`,  JSON.stringify(newActivity), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchActivity(
  idToken: string,
  postId: string,
  updatedActivity: UpdateActivityRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/activities/${postId}`, JSON.stringify(updatedActivity), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteActivity(
  idToken: string,
  postId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/activities/${postId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  postId: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/activities/${postId}/attachment`, '', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

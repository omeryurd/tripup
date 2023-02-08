import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form,
  Dropdown,
  Feed,
  DropdownProps,
  Select
} from 'semantic-ui-react'

import { createActivity, deleteActivity, getActivities, patchActivity } from '../api/tripup-api'
import Auth from '../auth/Auth'
import { Activity } from '../types/Activity'
import { Todo } from '../types/Todo'

const activityOptions = [
    {
      key: 'Hike',
      text: 'Hike',
      value: 'Hike',
      
    },
    {
      key: 'Run',
      text: 'Run',
      value: 'Run',
      
    },
    {
      key: 'Walk',
      text: 'Walk',
      value: 'Walk',
      
    }
  ]

interface ActivitiesProps {
  auth: Auth
  history: History
}

interface ActivitiesState {
  activities: Activity[]
  title: string
  description: string
  activity: string
  loading: boolean
}

export class YourPosts extends React.PureComponent<ActivitiesProps, ActivitiesState> {
  state: ActivitiesState = {
    activities: [],
    title: '',
    description: "",
    activity:"",
    loading: true
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    
    this.setState({ title: event.target.value })
  }

  handleDescriptionChange = (event: any) => {
    event.preventDefault()
    this.setState({ description: event.target.value })
  }
  handleActivityChange = (event: any, data: any) => {
    event.preventDefault()
    this.setState({ activity: data.value })
  }

  onEditButtonClick = (postId: string, title: string, description: string, activity: string) => {
    
    this.props.history.push(`/activities/${postId}/edit`,{description: description,activity: activity,title: title})
  }
  onAddPhotoButtonClick = (postId: string) => {
    this.props.history.push(`/activities/${postId}/add-photo`)
  }

  onTodoCreate = async (event:  React.SyntheticEvent) => {
    event.preventDefault()
    try {
        if (!this.state.title|| !this.state.description) {
            alert('Title, description and activity type should be provided')
            return
        }

        const newPost = await createActivity(this.props.auth.getIdToken(), {
        title: this.state.title,
        description:this.state.description,
        activityType: this.state.activity,
      })
      this.setState({
        activities: [...this.state.activities, newPost],
      })
    } catch(e) {
      console.log(e)
      alert('New post creation failed')
    }finally{
        alert('New post created!')
    }
  }

  onTodoDelete = async (postId: string) => {
    try {
      const res = window.confirm("Are you sure?")
      if (res){await deleteActivity(this.props.auth.getIdToken(), postId)
      this.setState({
        activities: this.state.activities.filter(activity => activity.postId !== postId)
      })} else{
        return
      }

    } catch {
      alert('Deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const activity = this.state.activities[pos]
      await patchActivity(this.props.auth.getIdToken(), activity.postId, {
        title: activity.title,
        description: activity.description,
        activityType: activity.activityType
      })
      this.setState({
        activities: this.state.activities
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  async componentDidMount() {
    try {
      const activities = await getActivities(this.props.auth.getIdToken())
      this.setState({
        activities,
        loading: false
      })
    } catch (e) {
      alert(`Failed to fetch posts: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        
        <Header as="h1">Create a new post</Header>
        {this.renderCreateActivityForm()}
        <Header as="h1">Feed</Header>

        {this.renderPosts()}
      </div>
    )
    
  }
  renderCreateActivityForm(){
    return(
    <Form onSubmit={this.onTodoCreate}>
    <Form.Field>
      <label>Title</label>
      <input placeholder='Give a descriptive title...' name="title" 
      onChange={this.handleTitleChange}
      />
    </Form.Field>
    <Form.Field>
      <label>Description</label>
      <textarea placeholder='Tell others how fun it was...' name="description"
      onChange={this.handleDescriptionChange}
      />
    </Form.Field>
    
    <Form.Field>
    <Select
    placeholder='Select Activity Type'
    options={activityOptions} 
    defaultValue={this.state.activity}
    onChange= {this.handleActivityChange}
    />
   </Form.Field>
        
    
    <Form.Button content='Submit' />
  </Form>
    )
  }


  renderPosts() {
    if (this.state.loading) {
      return this.renderLoading()
    }

    return this.renderActList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading posts
        </Loader>
      </Grid.Row>
    )
  }

  renderActList() {
    const acts = [...this.state.activities];
    return (
      <Feed size="large">
        {acts.reverse().map((act, pos) => {
          return (
            <Feed.Event>
      <Feed.Label>
        <Icon name='pencil' />
      </Feed.Label>
      <Feed.Content>
        <Feed.Summary>
          <a>User</a> posted
          <Feed.Date>{act.createdAt}</Feed.Date>
          
          <Button
                  icon
                  circular
                  color="blue"
                  onClick={() => this.onEditButtonClick(act.postId, act.title, act.description, act.activityType)}
                  size="small"
                >
                  <Icon name="pencil" />
                </Button>
                <Button
                  icon
                  circular
                  onClick={() => this.onAddPhotoButtonClick(act.postId)}
                  size="small"
                >
                  <Icon name="file image" />
                </Button>
                <Button
                  icon
                  circular
                  color="red"
                  onClick={() => this.onTodoDelete(act.postId)}
                  size="small"
                >
                  <Icon name="delete" />
                </Button>
          <Feed.Extra text>
          {act.title}
          </Feed.Extra>
        <Feed.Extra>
            
        {act.attachmentUrl && (
                <Image src={act.attachmentUrl} size="medium" wrapped />
        )}
          
        </Feed.Extra>
          
        </Feed.Summary>
        <Feed.Extra text>
          {act.description}
        </Feed.Extra>
        <Feed.Extra text>
          <b>{act.activityType}</b>
        </Feed.Extra>
      </Feed.Content>
    </Feed.Event>

      
      
          )
        })}
      </Feed>
    )
  }

}

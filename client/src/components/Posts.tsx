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
  Feed
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

export class Posts extends React.PureComponent<ActivitiesProps, ActivitiesState> {
  state: ActivitiesState = {
    activities: [],
    title: '',
    description: "",
    activity:"",
    loading: true
  }

  handleTameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ title: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: event.target.value })
  }
  handleActivityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ activity: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event:  React.SyntheticEvent) => {
    event.preventDefault()
    try {
        if (!this.state.title|| !this.state.description || !this.state.activity) {
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
        title: "",
        description: "",
        activity:""
      })
    } catch {
      alert('New post creation failed')
    }
  }

  onTodoDelete = async (postId: string) => {
    try {
      await deleteActivity(this.props.auth.getIdToken(), postId)
      this.setState({
        activities: this.state.activities.filter(activity => activity.postId !== postId)
      })
    } catch {
      alert('Todo deletion failed')
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
        <Header as="h1">Feed</Header>

        {this.renderCreateActivityForm()}

        {this.renderPosts()}
      </div>
    )
  }
  renderCreateActivityForm(){
    return(
    <Form onSubmit={this.onTodoCreate}>
    <Form.Field>
      <label>Title</label>
      <input placeholder='Give a descriptive title...' name="title" />
    </Form.Field>
    <Form.Field>
      <label>Description</label>
      <textarea placeholder='Tell others how fun it was...' name="description"/>
    </Form.Field>
    <Form.Field>
      <Dropdown
        placeholder='Activity Type'
        fluid
        selection
        options={activityOptions}
        name="activity"
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
    return (
      <Feed>
        {this.state.activities.map((act, pos) => {
          return (
            <Feed.Event>
      <Feed.Label>
        <Icon name='pencil' />
      </Feed.Label>
      <Feed.Content>
        <Feed.Summary>
          <a>User</a> posted on his page
          {act.title}
          <Feed.Date>{act.createdAt}</Feed.Date>
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

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}

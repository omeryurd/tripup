import * as React from 'react'
import { Form, Button, Select } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import { patchActivity } from '../api/tripup-api'
import { History } from 'history'
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

enum UploadState {
  NoUpload,
  FetchingPresignedUrl,
  UploadingFile,
}

interface EditTodoProps {
  match: {
    params: {
      postId: string
    }

  }
  history: History
  auth: Auth
}

interface EditTodoState {
  title: string
  description: string
  activity: string
  file: any
  uploadState: UploadState
}

export class EditPost extends React.PureComponent<
  EditTodoProps,
  EditTodoState
> {
  state: EditTodoState = {
    
      file: undefined,
      uploadState: UploadState.NoUpload,
      activity: this.props.location.state.activity,
      title: this.props.location.state.title,
      description: this.props.location.state.description
  }
  
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return
    
    this.setState({
      file: files[0]
    })
  }
  onTodoUpdate = async (event:  React.SyntheticEvent) => {
    event.preventDefault()
    try {
        if (!this.state.title|| !this.state.description) {
            alert('Title, description and activity type should be provided')
            return
        }

        const newPost = await patchActivity(this.props.auth.getIdToken(),this.props.match.params.postId ,{
        title: this.state.title,
        description:this.state.description,
        activityType: this.state.activity,
      })
    } catch(e) {
      console.log(e)
      alert('Update failed')
    }finally{
        this.props.history.push("/your-posts")
        alert('Post updated!')
        
    }
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


  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  renderUpdateActivityForm(){
    return(
    <Form onSubmit={this.onTodoUpdate}>
    <Form.Field>
      <label>Title</label>
      <input value={this.state.title} name="title" 
      onChange={this.handleTitleChange}
      />
    </Form.Field>
    <Form.Field>
      <label>Description</label>
      <textarea value={this.state.description} name="description"
      onChange={this.handleDescriptionChange}
      />
    </Form.Field>
    
    <Form.Field>
    <Select
    placeholder='Select Activity Type'
    options={activityOptions} 
    value={this.state.activity}
    onChange= {this.handleActivityChange}
    />
   </Form.Field>
        
    
    <Form.Button content='Submit'> Update </Form.Button>
  </Form>
    )
  }

  render() {
    return (
        this.renderUpdateActivityForm()
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.FetchingPresignedUrl && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit"
        >
          Upload
        </Button>
      </div>
    )
  }
}

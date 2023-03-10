import React, { Component } from 'react'
import { Link, Route, Router, Switch } from 'react-router-dom'
import { Grid, Menu, Segment,Icon } from 'semantic-ui-react'

import Auth from './auth/Auth'
import { YourPosts} from './components/YourPosts'
import { AddPhoto } from './components/AddPhoto'
import { EditPost } from './components/EditYourPost'
import { LogIn } from './components/LogIn'
import { NotFound } from './components/NotFound'
import { Posts } from './components/Posts'

export interface AppProps {}

export interface AppProps {
  auth: Auth
  history: any
}

export interface AppState {}

export default class App extends Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props)

    this.handleLogin = this.handleLogin.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
  }

  handleLogin() {
    this.props.auth.login()
  }

  handleLogout() {
    this.props.auth.logout()
  }

  render() {
    return (
      <div>
        <Segment style={{ padding: '8em 0em' }} vertical>
          <Grid container stackable verticalAlign="middle">
            <Grid.Row>
              <Grid.Column width={16}>
                <Router history={this.props.history}>
                  {this.generateMenu()}

                  {this.generateCurrentPage()}
                </Router>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        </Segment>
      </div>
    )
  }

  generateMenu() {
    return (
      <Menu>
        <Menu.Item as='a' header>
          <Icon name="angle double right" />
          <Link to="/">TripUp</Link>
        </Menu.Item>
        <Menu.Item name="home">
          <Link to="/">Home</Link>
        </Menu.Item>
        
        {this.yourPostsButton()}
        

        <Menu.Menu position="right">{this.logInLogOutButton()}</Menu.Menu>
      </Menu>
    )
  }
  yourPostsButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="your-posts" >
          <Link to="/your-posts">Your Posts</Link>
        </Menu.Item>
      )
    } else {
      return (
        null
      )
    }
  }

  logInLogOutButton() {
    if (this.props.auth.isAuthenticated()) {
      return (
        <Menu.Item name="logout" onClick={this.handleLogout}>
          Log Out
        </Menu.Item>
      )
    } else {
      return (
        <Menu.Item name="login" onClick={this.handleLogin}>
          Log In
        </Menu.Item>
      )
    }
  }

  generateCurrentPage() {
    if (!this.props.auth.isAuthenticated()) {
      return <LogIn auth={this.props.auth} />
    }

    return (
      <Switch>
        <Route
          path="/"
          exact
          render={props => {
            return <Posts {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/activities/:postId/add-photo"
          exact
          render={props => {
            return <AddPhoto {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/activities/:postId/edit"
          exact
          render={props => {
            return <EditPost {...props} auth={this.props.auth} />
          }}
        />

        <Route
          path="/your-posts"
          exact
          render={props => {
            return <YourPosts {...props} auth={this.props.auth} />
          }}
        />

        <Route component={NotFound} />
      </Switch>
    )
  }
}

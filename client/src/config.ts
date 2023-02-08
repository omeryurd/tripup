// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'psoatxwpm6'
export const apiEndpoint = `https://${apiId}.execute-api.us-west-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map. For example:
  // domain: 'dev-nd9990-p4.us.auth0.com',
  domain: 'dev-0dreid14ny0rwnse.us.auth0.com',            // Auth0 domain
  clientId: '9Naj1XXk0I3slW8GD66j3zr9JKFc0LkI',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}

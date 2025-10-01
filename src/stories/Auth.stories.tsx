import ApplicationProvider from 'src/components/ApplicationProvider'
import LogInComponent from './LogIn'
import SignUpComponent from './SignUp'

export default {
  title: 'Example/Auth',
}

const LogInTemplate = (args) => (
  <ApplicationProvider app="root">
    <LogInComponent {...args} />
  </ApplicationProvider>
)

export const LogIn = LogInTemplate.bind({})
LogIn.args = {}

/////////////

const SignUpTemplate = (args) => (
  <ApplicationProvider app="root">
    <SignUpComponent {...args} />
  </ApplicationProvider>
)

export const SignUp = SignUpTemplate.bind({})
LogIn.args = {}

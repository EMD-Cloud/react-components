import * as React from 'react'
import Uploader from './Uploader'

export default {
  title: 'Example/Uploader',
  component: Uploader
}

const Template = (args) => <Uploader {...args} />

export const Default = Template.bind({})
Default.args = {
  options: {
    apiUrl: '<domain>',
    app: '<appId>'
  },
  headers: {
    Authorization: 'token <token>'
  },
  disabled: false,
  maxNumberOfFiles: 0,
  accept: { "*": [] }
};
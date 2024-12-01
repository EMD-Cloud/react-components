import * as React from 'react'
import Uploader from './Uploader'

export default {
  title: 'Example/Uploader',
  component: Uploader
}

const Template = (args) => <Uploader {...args} />

export const Default = Template.bind({})
Default.args = {
  chunkSize: 64 * 1024 * 1024,
  options: {
    apiUrl: process.env.TEST_PLATFORM_API_URL || '<domain>',
    app: process.env.TEST_PLATFORM_APP_ID || '<appId>'
  },
  headers: {
    Authorization: `token ${process.env.TEST_PLATFORM_API_TOKEN || '<token>'}`
  },
  disabled: false,
  maxNumberOfFiles: 0,
  accept: { "*": [] }
};
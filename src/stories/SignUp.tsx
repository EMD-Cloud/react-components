import * as React from 'react'
import { useAuth } from '..'

const SignUp = () => {
  const { signUpUser } = useAuth()

  const [login, setLogin] = React.useState('')
  const [password, setPassword] = React.useState('')

  const handleSubmit = React.useCallback(
    async (e) => {
      e.preventDefault()

      const data = await signUpUser({
        login,
        password,
      })

      alert(JSON.stringify(data))
    },
    [login, password],
  )

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="login"
          value={login}
          onChange={(e) => {
            setLogin(e.target.value)
          }}
        />
      </div>
      <div>
        <input
          type="password"
          name="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
          }}
        />
      </div>
      <div>
        <input type="submit" value="Sign up" />
      </div>
    </form>
  )
}

export default SignUp

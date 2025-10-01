import { useState, useCallback } from 'react'
import { useAuth } from '..'

const LogIn = () => {
  const { logInUser } = useAuth()

  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault()

      const data = await logInUser({
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
        <input type="submit" value="Log in" />
      </div>
    </form>
  )
}

export default LogIn

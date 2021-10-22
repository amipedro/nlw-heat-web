import { createContext, ReactNode, useEffect, useState } from "react";
import { api } from "../services/api";

type User = {
  id: string;
  name: string;
  login: string;
  avatar_url: string;
}

type AuthContextData = {
  // User will be User if logged in or null if else
  user: User | null;
  signInUrl: string;
  // SignOut function doens't return anything.
  signOut: () => void;
}

export const AuthContext = createContext({} as AuthContextData)

// type children because of Typescript
type AuthProvider = {
  children: ReactNode;
}

type AuthResponse = {
  token: string;
  user: {
    id: string;
    avatar_url: string;
    name: string;
    login: string;
  }
}

// All react components have properties
export function AuthProvider(props: AuthProvider) {
  const [user, setUser] = useState<User | null>(null)

  // Login on github
  const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=11767e3858bd09f94649`

  // Sign in function
  async function signIn(githubCode: string) {
    const response = await api.post<AuthResponse>('authenticate', {
      code: githubCode,
    })

    const { token, user } = response.data;

    // Save login info on user browser
    localStorage.setItem('@dowhile:token', token);
    api.defaults.headers.common.authorization = `Bearer ${token}`;

    setUser(user)
  }

  // Sign out function
  function signOut() {
    setUser(null);
    localStorage.removeItem('@dowhile:token');
  }

  useEffect(() => {
    const token = localStorage.getItem('@dowhile:token')

    if (token) {
      // Keep user logged in
      api.defaults.headers.common.authorization = `Bearer ${token}`;

      api.get<User>('profile').then(response => {
        setUser(response.data)
      })
    }
  }, [])

  // Check if user is logged through Github when loading component
  useEffect(() => {
    const url = window.location.href;
    const hasGithubCode = url.includes('?code=');

    if (hasGithubCode) {
      // clear url from code
      const [urlWithoutCode, githubCode] = url.split('?code=')
      window.history.pushState({}, '', urlWithoutCode);

      console.log({ urlWithoutCode, githubCode })

      signIn(githubCode)
    }
  }, [])

  return (
    // All users will have access to the context info, independently if logged in or not
    // AuthProvider will have to wrap the whole application on main.tsx
    <AuthContext.Provider value={{ signInUrl, user, signOut }}>
      {props.children}
    </AuthContext.Provider>
  );
}
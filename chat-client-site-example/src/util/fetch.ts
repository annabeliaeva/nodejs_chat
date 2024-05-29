import axios, { AxiosRequestConfig } from 'axios'
import Cookies from 'js-cookie'

export const fetchApi = (method: 'GET' | 'POST', backend: 'user' | 'internal',
  route: string, params?: any) => {
  let backendUrl
  switch (backend) {
    case 'user':
      backendUrl = process.env.NEXT_PUBLIC_API_USER_URL
      break
    case 'internal':
      backendUrl = process.env.API_INTERNAL_URL
  }
  let headers = {}
  if(backend == 'user') headers['Authorization'] = 'Bearer ' + Cookies.get('-auth')
  else if(backend == 'internal') headers['Server'] = true
  if (method == 'GET')
    return axios.get(backendUrl + route, {
      headers,
      withCredentials: true
    })
  else if (method == 'POST')
    return axios.post(backendUrl + route, params, {
      headers,
      withCredentials: true
    })
}
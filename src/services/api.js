
import axios from 'axios'

export const sendToWebhook = async (url, data) => {
  return axios.post(url, data, { headers: { 'Content-Type': 'application/json' } })
}

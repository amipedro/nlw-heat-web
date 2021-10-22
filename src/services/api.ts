// Setup of information between backend and frontend

import axios from 'axios';

// Communication with backend
export const api = axios.create({
  baseURL: 'http://localhost:4000',
})
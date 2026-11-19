import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
});

// Dataset endpoints
export const getDatasetStats = () => api.get('/dataset/stats').then(r => r.data);
export const getDatasetSample = () => api.get('/dataset/sample').then(r => r.data);
export const getDistributions = () => api.get('/dataset/distributions').then(r => r.data);
export const getCorrelation = () => api.get('/dataset/correlation').then(r => r.data);
export const getFeatures = () => api.get('/dataset/features').then(r => r.data);

// Model endpoints
export const getModelComparison = () => api.get('/models/comparison').then(r => r.data);
export const getConfusionMatrices = () => api.get('/models/confusion-matrices').then(r => r.data);
export const getRocCurves = () => api.get('/models/roc-curves').then(r => r.data);
export const getFeatureImportances = () => api.get('/models/feature-importances').then(r => r.data);

// Prediction
export const predict = (data) => api.post('/predict', data).then(r => r.data);

export default api;

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Add a logging middleware to see all incoming requests
app.use((req, res, next) => {
  console.log(`[Backend] Received request: ${req.method} ${req.url}`);
  next();
});

// 服务静态文件（生产环境）
app.use(express.static(path.join(__dirname, 'dist')));

const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY;
const VOLCANO_BASE_URL = 'https://ark.cn-beijing.volces.com';
const TEXT_TO_IMAGE_MODEL = process.env.VITE_TEXT_TO_IMAGE_MODEL || 'doubao-seedream-4.0-250828';
const IMAGE_TO_TEXT_MODEL = process.env.VITE_IMAGE_TO_TEXT_MODEL || 'doubao-seed-1.6-vision';

app.post('/api/text-to-image', async (req, res) => {
  try {
    console.log('Received text-to-image request:', {
      ...req.body,
      model: TEXT_TO_IMAGE_MODEL
    });

    const response = await axios.post(`${VOLCANO_BASE_URL}/api/v3/images/generations`, {
      ...req.body,
      model: TEXT_TO_IMAGE_MODEL
    }, {
      headers: {
        Authorization: `Bearer ${VOLCANO_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    
    console.log('Text-to-image response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Text-to-image proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Failed to generate image',
      details: error.response?.data
    });
  }
});

app.post('/api/image-to-text', async (req, res) => {
  try {
    console.log('Received image-to-text request:', {
      ...req.body,
      model: IMAGE_TO_TEXT_MODEL
    });

    const response = await axios.post(`${VOLCANO_BASE_URL}/api/v3/chat/completions`, {
      ...req.body,
      model: IMAGE_TO_TEXT_MODEL
    }, {
      headers: {
        Authorization: `Bearer ${VOLCANO_API_KEY}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
    });
    
    console.log('Image-to-text response:', response.data);
    res.json(response.data);
  } catch (error) {
    console.error('Image-to-text proxy error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({
      error: error.response?.data?.error || 'Failed to analyze image',
      details: error.response?.data
    });
  }
});

// 所有其他 GET 请求返回 index.html（用于 SPA 路由）
// 必须放在所有其他路由之后
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server listening at http://0.0.0.0:${port}`);
  console.log('Environment:', {
    nodeEnv: process.env.NODE_ENV || 'development',
    textToImageModel: TEXT_TO_IMAGE_MODEL || 'doubao-seedream-4.0-250828',
    imageToTextModel: IMAGE_TO_TEXT_MODEL || 'doubao-seed-1.6-vision',
    hasApiKey: !!VOLCANO_API_KEY
  });
});
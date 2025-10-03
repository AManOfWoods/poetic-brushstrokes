require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const port = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

const VOLCANO_API_KEY = process.env.VOLCANO_API_KEY;
const VOLCANO_BASE_URL = 'https://ark.cn-beijing.volces.com';
const TEXT_TO_IMAGE_MODEL = process.env.VITE_TEXT_TO_IMAGE_MODEL;
const IMAGE_TO_TEXT_MODEL = process.env.VITE_IMAGE_TO_TEXT_MODEL;

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

app.listen(port, () => {
  console.log(`Backend proxy server listening at http://localhost:${port}`);
  console.log('Environment loaded:', {
    textToImageModel: TEXT_TO_IMAGE_MODEL,
    imageToTextModel: IMAGE_TO_TEXT_MODEL,
    hasApiKey: !!VOLCANO_API_KEY
  });
});
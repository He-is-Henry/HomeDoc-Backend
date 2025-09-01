const axios = require("axios");

const cohere = axios.create({
  baseURL: "https://api.cohere.ai/v1",
  headers: {
    Authorization: `Bearer ${process.env.COHERE_API_KEY}`,
    "Content-Type": "application/json",
  },
});

module.exports = cohere;

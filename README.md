# Scissors URL Shortener

Scissors is a powerful URL shortening service that allows users to create shortened URLs, generate QR codes, and track analytics for their links.

## Features

- URL shortening with optional custom domains
- QR code generation for shortened URLs
- Analytics tracking for link clicks
- User authentication and link history

## Technologies Used

- Node.js
- Express.js
- TypeScript
- MongoDB
- Redis
- EJS (for server-side rendering)

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- MongoDB
- Redis

### Installation

1. Clone the repository:
```sh
git clone https://github.com/adetolaa99/scissors-capstone-project
cd scissors-capstone-project
```
2. Install dependencies:
```sh
npm install
```
3. Create a `.env` file in the root directory and add the following environment variables:
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
REDIS_URL=your_redis_url
BASE_URL=http://localhost:5000
JWT_SECRET=your_jwt_secret
SESSION_SECRET=your_session_secret
```
4. Build the project:
```sh
npm run build
```
5. Start the server:
```sh
npm start
```
The application should now be running on `http://localhost:5000`.

## API Documentation

For detailed API documentation, please refer to the [API Documentation](https://your-api-docs-url.spotlight.io) hosted on Spotlight.io.

## Deployment

This application is configured for deployment on Render. To deploy:

1. Push your code to a GitHub repository.
2. Create a new Web Service on Render.
3. Connect your GitHub repository to Render.
4. Set the build command to `npm install && npm run build`.
5. Set the start command to `npm start`.
6. Add the environment variables from your `.env` file to Render's environment variables section.
7. Deploy the application.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

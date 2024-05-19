FROM node:20.10.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json /app/

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . /app

# Build TypeScript
RUN npm run build

# Copy the rest of the application code
COPY . /app

# Expose the port your app runs on
EXPOSE 5000
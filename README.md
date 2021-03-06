# DevConnector

Basic application for connecting developers with each other

## Heroku live app

https://hidden-atoll-98611.herokuapp.com/

## Installation

Clone this repository with:
```bash
git clone https://github.com/rvVcNk2p/DevConnector.git
```

Initialize the Server and Client:
- Server
```bash
cd DevConnector
npm install
```
- Client
```bash
cd DevConnector/client
npm install
```
## Database

Before you can run your DevConnector, needs to create an environment (.env) file in root source, with a MONGO_URI variable.
I used a free MongoDB Atlas Database. After the registration, you need to create you own free project.
```bash
Connect > Connect your application > Copy your connection sting
```
Example connection string:
```bash
mongodb+srv://<user>:<password>@cluster0.2nh09.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```
Example MONGO_URI variable in .env file:
```bash
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.2nh09.mongodb.net/myFirstDatabase?retryWrites=true&w=majority
```
## Usage

Run development env. with:
```bash
npm run dev
```
NOTE: The client will run on localhost:3000 and the backend on localhost:5000

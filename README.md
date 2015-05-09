# Soixante photos

A photo provider via an API.

## How to run the project ?
1. `git clone  && cd Soixantephotos`
2. `npm install`
3. `cp example.config.js config.js` and remplace with your informations
3. `cp public/js/example.config.js public/js/config.js` and remplace with your informations
4. `node bin/www`

## Config
### Config Back
In `config.js`:
* Server port in `server.port`. The server will run on the specified port

###Config Front
In `public/js/config.js`
* Google site ID in `ga.id` to have analytics


## Routes
### Index
Thoses routes origin is `url`
* `/` Home page of project
* `/random` Return one image from the database
* `/:category` Return one random image from the given category. Display 
For Random and category, you can add `?nsfw=true` to your request if you want to see nsfw images too

### Photos
Thoses routes origin is `url/photos`
* `/` Nothing here
* `/new` Url to add new photos
* `/all` Show all images stored in database
* `/:id` Return specific image
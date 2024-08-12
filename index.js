import express from 'express';
import fs from 'fs';
import bodyParser from 'body-parser';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import definition from './docs/openapi.json' with {type:"json"}

const options = {
    definition,
    apis: []
}

const specs = swaggerJsdoc(options);

const app = express();
const MOCKTOKEN = 'mockToken';

app.use('/swagger',swaggerUi.serve,swaggerUi.setup(specs));
app.use(bodyParser.json());

/**
 * Creates an error object with a specified code and message.
 * @param {number} code - HTTP status code.
 * @param {string} message - Error message.
 * @returns {Object} Error object with code and message.
 */
const createError = (code, message) => {
    return {
        code,
        message
    }
}

/**
 * Middleware to authenticate requests using a mock token.
 * Verifies the presence and validity of the token in the request headers.
 * If invalid, it responds with a 401 Unauthorized error.
 */
app.use((req,res,next) => {
    const token = req.headers?.authorization;
    if(!token || token !== `Bearer ${MOCKTOKEN}`){
        res.status(401);
        res.send(createError(401,'Invalid token'));
        return;
    }
    next();
});

/**
 * Pads a number with leading zeros to reach a specified length.
 * @param {number} num - The number to pad.
 * @param {number} numLength - Desired length of the resulting string.
 * @returns {string} Zero-padded number as a string.
 */
function zeroPad(num, numLength) {
    return num.toString().padStart(numLength, "0");
}

/**
 * Reads the users data from the JSON file.
 * @returns {Array} Array of user objects.
 */
const readUsers = () =>{
    try{
        const users = fs.readFileSync('./data/dbUsers.json');
        return JSON.parse(users).users;
    } catch (error){
        console.log(error);
    }
}

/**
 * Writes the users data to the JSON file.
 * @param {Array} users - Array of user objects to be written to the file.
 */
const writeUsers = (users) =>{
    try{
        fs.writeFileSync('./data/dbUsers.json', JSON.stringify({users}, null, 4));
    } catch (error){
        console.log(error);
    }
}

/**
 * Reads the houses data from the JSON file.
 * @returns {Array} Array of house objects.
 */
const readHouses = () =>{
    try{
        const houses = fs.readFileSync('./data/dbHouses.json');
        return JSON.parse(houses).houses;
    } catch (error){
        console.log(error);
    }
}

/**
 * Writes the houses data to the JSON file.
 * @param {Array} houses - Array of house objects to be written to the file.
 */
const writeHouses = (houses) =>{
    try{
        fs.writeFileSync('./data/dbHouses.json', JSON.stringify({houses}, null, 4));
    } catch (error){
        console.log(error);
    }
}

/**
 * Root endpoint that provides a welcome message.
 */
app.get('/',(req, res) => {
    res.send('Welcome to my UserHabitat API');
});

/**
 * Retrieves and returns a list of all users.
 */
app.get('/users',(req, res) => {
    const users = readUsers();
    res.send(users);
});

/**
 * Creates a new user with a unique ID, validates the input, and returns the created user.
 * @param {string} req.body.name - The name of the user.
 */
app.post('/users',(req, res) => {
    const users = readUsers();
    const body = req.body;
    if(!body.name || typeof body.name !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect NAME parameter'));
        return;
    }
    const newUser = {
        id: zeroPad(users.length + 1, 4),
        ...body
    }
    users.push(newUser);
    writeUsers(users);
    res.status(201);
    res.json(newUser);
});

/**
 * Retrieves and returns a user by their ID.
 * @param {string} req.params.id - The ID of the user.
 */
app.get('/users/:id',(req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const user = users.find(user => user.id === id);
    if(user)
        res.json(user);
    else{
        res.status(404);
        res.json(createError(404,`User ${id} not found`));
    }
});

/**
 * Updates an existing user by their ID, validates the input, and returns the updated user.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} req.body.name - The updated name of the user.
 */
app.put('/users/:id',(req, res) => {
    const users = readUsers();
    const body = req.body;
    if(!body.name || typeof body.name !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect NAME parameter'));
        return;
    }
    const id = req.params.id;
    const userIndex = users.findIndex(user => user.id === id);
    if(userIndex < 0){
        res.status(404);
        res.json(createError(404,`User ID: ${id} not found`));
        return;
    }
    users[userIndex] = {
        id,
        ...body
    }
    writeUsers(users)
    res.json(users[userIndex]);
});

/**
 * Partially updates an existing user by their ID, validates the input, and returns the updated user.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} req.body.name - The updated name of the user.
 */
app.patch('/users/:id',(req, res) => {
    const users = readUsers();
    const body = req.body;
    if(!body.name || typeof body.name !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect NAME parameter'));
        return;
    }
    const id = req.params.id;
    const userIndex = users.findIndex(user => user.id === id);
    if(userIndex < 0){
        res.status(404);
        res.json(createError(404,`User ID: ${id} not found`));
        return;
    }
    users[userIndex] = {
        ...users[userIndex],
        ...body
    }
    writeUsers(users)
    res.json(users[userIndex]);
});

/**
 * Deletes a user by their ID if they have no associated houses.
 * @param {string} req.params.id - The ID of the user.
 */
app.delete('/users/:id',(req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const userIndex = users.findIndex(user => user.id === id);
    if(userIndex < 0){
        res.status(404);
        res.json(createError(404,`User ID: ${id} not found`));
        return;
    }
    let houses = readHouses();
    houses = houses.filter(house => house.ownerId === id);
    if(houses.length){
        res.status(400);
        res.json(createError(400,`The user ${id} cannot be deleted because it has associated houses`));
        return;
    }
    users.splice(userIndex, 1);
    writeUsers(users);
    res.status(204).send();
});

/**
 * Retrieves and returns a list of houses associated with a user.
 * Allows filtering by city, address, and country through query parameters.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} [req.query.city] - The city filter.
 * @param {string} [req.query.address] - The address filter.
 * @param {string} [req.query.country] - The country filter.
 */
app.get('/users/:id/houses', (req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const user = users.find(user => user.id === id);
    if (!user) {
        res.status(404);
        res.json(createError(404, `User ID: ${id} not found`));
        return;
    }

    let houses = readHouses();
    houses = houses.filter(house => house.ownerId === id);

    const { city, address, country } = req.query;

    if (city) {
        houses = houses.filter(house => house.city === city);
    }
    if (address) {
        houses = houses.filter(house => house.address === address);
    }
    if (country) {
        houses = houses.filter(house => house.country === country);
    }

    res.json(houses);
});

/**
 * Creates a new house associated with a user, validates the input, and returns the created house.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} req.body.address - The address of the house.
 * @param {string} req.body.city - The city of the house.
 * @param {string} req.body.country - The country of the house.
 */
app.post('/users/:id/houses', (req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const user = users.find(user => user.id === id);

    if (!user) {
        res.status(404);
        res.json(createError(404, `User ID: ${id} not found`));
        return;
    }

    const body = req.body;
    if(!body.address || typeof body.address !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect ADDRESS parameter'));
        return;
    }
    if(!body.city || typeof body.city !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect CITY parameter'));
        return;
    }
    if(!body.country || typeof body.country !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect COUNTRY parameter'));
        return;
    }

    const houses = readHouses();
    const newHouse = {
        id: zeroPad((houses?.length || 0) + 1, 3),
        ownerId: id,
        ...body
    }

    houses.push(newHouse);
    writeHouses(houses);
    res.status(201);
    res.json(newHouse);
});

/**
 * Updates an existing house associated with a user, validates the input, and returns the updated house.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} req.params.houseId - The ID of the house.
 * @param {string} req.body.address - The updated address of the house.
 * @param {string} req.body.city - The updated city of the house.
 * @param {string} req.body.country - The updated country of the house.
 */
app.put('/users/:id/houses/:houseId', (req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const houseId = req.params.houseId;
    const user = users.find(user => user.id === id);

    if (!user) {
        res.status(404);
        res.json(createError(404, `User ID: ${id} not found`));
        return;
    }

    const houses = readHouses();
    const houseIndex = houses.findIndex(house => house.id === houseId && house.ownerId === id);
    if (houseIndex < 0) {
        res.status(404);
        res.json(createError(404, `House ID: ${houseId} not found for user ${id}`));
        return;
    }

    const body = req.body;
    if(!body.address || typeof body.address !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect ADDRESS parameter'));
        return;
    }
    if(!body.city || typeof body.city !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect CITY parameter'));
        return;
    }
    if(!body.country || typeof body.country !== 'string')
    {
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect COUNTRY parameter'));
        return;
    }
    houses[houseIndex] = {
        id: houseId,
        ownerId: id,
        ...body
    };
    writeHouses(houses);
    res.json(houses[houseIndex]);
});

/**
 * Partially updates an existing house associated with a user, validates the input, and returns the updated house.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} req.params.houseId - The ID of the house.
 * @param {string} [req.body.address] - The updated address of the house.
 * @param {string} [req.body.city] - The updated city of the house.
 * @param {string} [req.body.country] - The updated country of the house.
 */
app.patch('/users/:id/houses/:houseId', (req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const houseId = req.params.houseId;
    const user = users.find(user => user.id === id);

    if (!user) {
        res.status(404);
        res.json(createError(404, `User ID: ${id} not found`));
        return;
    }

    const houses = readHouses();
    const houseIndex = houses.findIndex(house => house.id === houseId && house.ownerId === id);
    if (houseIndex < 0) {
        res.status(404);
        res.json(createError(404, `House ID: ${houseId} not found for user ${id}`));
        return;
    }

    const body = req.body;
    if((body.address && typeof body.address === 'string') ||
    body.city && typeof body.city === 'string' ||
    body.country && typeof body.country === 'string')
    {
        houses[houseIndex] = {
            ...houses[houseIndex],
            ...body
        };
        writeHouses(houses);
        res.json(houses[houseIndex]);
    }
    else{
        res.status(400);
        res.json(createError(400,'Invalid request. Missing or incorrect parameter'));
        return;
    }
});

/**
 * Deletes a house associated with a user by its ID.
 * @param {string} req.params.id - The ID of the user.
 * @param {string} req.params.houseId - The ID of the house.
 */
app.delete('/users/:id/houses/:houseId', (req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const user = users.find(user => user.id === id);

    if (!user) {
        res.status(404);
        res.json(createError(404, `User ID: ${id} not found`));
        return;
    }

    const houses = readHouses();
    const houseId = req.params.houseId;
    const houseIndex = houses.findIndex(house => house.id === houseId &&  house.ownerId === id);

    if (houseIndex < 0) {
        res.status(404).json(createError(404, `House ID: ${houseId} for user ${id} not found`));
        return;
    }

    houses.splice(houseIndex, 1);
    writeHouses(houses);
    res.status(204).send();
});

/**
 * Starts the server and listens on port 3000.
 */
app.listen(3000, () => {
    console.log('Server listening on port 3000')
});
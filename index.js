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

const createError = (code, message) => {
    return {
        code,
        message
    }
}

app.use((req,res,next) => {
    const token = req.headers?.authorization;
    if(!token || token !== `Bearer ${MOCKTOKEN}`){
        res.status(401);
        res.send(createError(401,'Invalid token'));
        return;
    }
    next();
});

function zeroPad(num, numLength) {
    return num.toString().padStart(numLength, "0");
}

const readUsers = () =>{
    try{
        const users = fs.readFileSync('./data/dbUsers.json');
        return JSON.parse(users).users;
    } catch (error){
        console.log(error);
    }
}

const writeUsers = (users) =>{
    try{
        fs.writeFileSync('./data/dbUsers.json', JSON.stringify({users}, null, 4));
    } catch (error){
        console.log(error);
    }
}

const readHouses = () =>{
    try{
        const houses = fs.readFileSync('./data/dbHouses.json');
        return JSON.parse(houses).houses;
    } catch (error){
        console.log(error);
    }
}

const writeHouses = (houses) =>{
    try{
        fs.writeFileSync('./data/dbHouses.json', JSON.stringify({houses}, null, 4));
    } catch (error){
        console.log(error);
    }
}

app.get('/',(req, res) => {
    res.send('Welcome to my UserHabitat API');
});

app.get('/users',(req, res) => {
    const users = readUsers();
    res.send(users);
});

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

app.delete('/users/:id',(req, res) => {
    const users = readUsers();
    const id = req.params.id;
    const userIndex = users.findIndex(user => user.id === id);
    if(userIndex < 0){
        res.status(404);
        res.json(createError(404,`User ID: ${id} not found`));
        return;
    }
    users.splice(userIndex, 1);
    writeUsers(users)
    res.json({message: 'User deleted successfully'});
});

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

app.listen(3000, () => {
    console.log('Server listening on port 3000')
});
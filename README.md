# User Habitat API

## Description
User Habitat API is a RESTful API designed for managing users and their associated housing data. It allows for the creation, retrieval, update, and deletion (CRUD) of users and houses, providing an easy way to manage relationships between users and their properties.

## Features
- **User Management**: Create, retrieve, update, and delete users.
- **House Management**: Create, retrieve, update, and delete houses associated with specific users.
- **Filtering**: Retrieve houses filtered by city, address, or country.
- **Data Validation**: Basic input validation to ensure data integrity.

## Technologies Used
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Web framework for Node.js.
- **Nodemon**: Utility that automatically restarts the server upon code changes.
- **JSON Files**: Simple flat file databases (`dbUsers.json`, `dbHouses.json`).
- **OpenAPI**: Specification for defining API endpoints, request parameters, and response

## Installation
1. Clone the repository:
    ```bash
    git clone https://github.com/yourusername/user_habitat.git
    ```
2. Navigate to the project directory:
    ```bash
    cd user_habitat
    ```
3. Install the required dependencies:
    ```bash
    npm install
    ```

## Usage
1. Start the development server:
    ```bash
    npm run dev
    ```
2. The API will be available at `http://localhost:3000`.

### Example Requests
- Get all users:
    ```http
    GET http://localhost:3000/users
    ```
- Create a new user:
    ```http
    POST http://localhost:3000/users
    Content-Type: application/json

    {
        "name": "Gabriel Garcia"
    }
    ```

## Project Structure
```
user_habitat/  
│  
├── data/  
│ ├── dbUsers.json # Mock database for users  
│ └── dbHouses.json # Mock database for houses  
│  
├── docs/ # Documentation (if any)  
│  
├── index.js # Main entry point of the API  
│  
├── package.json # Project metadata and dependencies  
└── test/  
│ └── request.http # HTTP requests for testing the API   

```
## Documentation
This project includes an OpenAPI 3.0 specification (`openapi.json`) that describes the API endpoints, request parameters, and response formats. This file is essential for understanding the API's capabilities and intended usage.

## Testing
Testing can be done using the provided `request.http` file, which contains predefined HTTP requests to interact with the API. This file is compatible with tools like [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) for VSCode.

### Example Tests
- Retrieve a user by ID:
    ```http
    GET http://localhost:3000/users/0002
    Authorization: Bearer mockToken
    ```

- Update a user that doesn't exist:
    ```http
    PATCH http://localhost:3000/users/0009
    Authorization: Bearer mockToken
    Content-Type: application/json

    {
        "name": "Gabriel Garcia Gutierrez"
    }
    ```

## Contributing
Contributions are welcome! To contribute, please follow these steps:

1. Fork the repository.
2. Create a new branch:
    ```bash
    git checkout -b feature-branch
    ```
3. Make your changes.
4. Commit your changes:
    ```bash
    git commit -am 'Add new feature'
    ```
5. Push to the branch:
    ```bash
    git push origin feature-branch
    ```
6. Create a new Pull Request.

Make sure to follow the project's coding standards and thoroughly test your changes before submission.

## License
This project is licensed under the ISC License. See the [LICENSE](LICENSE) file for details.

## Contact
For any questions or inquiries, please contact the author:

**Daniela Zaffalon**  
- GitHub: [DanielaZaffalon](https://github.com/danielazaffalon)
- Email: [dannyzaffalon@hotmail.com](mailto:dannyzaffalon@hotmail.com)
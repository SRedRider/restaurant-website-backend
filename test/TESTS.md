## Running Tests

Follow these steps to run the tests for the **Burger Company** backend:

### Prerequisites
1. **Node.js**: Ensure you have Node.js installed on your system. You can download it from [Node.js Official Website](https://nodejs.org/).
2. **Dependencies**: Install the required dependencies by running:
   ```bash
   npm install
   ```

### Setting Up the Environment
1. **Create `.env.test` File**:
   - Create a file named `.env.test` in the root directory of the project.
   - Add the following environment variables to the file:
     ```dotenv
     NODE_TLS_REJECT_UNAUTHORIZED=0
     BASE_URL=https://10.120.32.59/api/v1/ 
     AUTH_TOKEN=Bearer <your-auth-token>  
     ADMIN_AUTH_TOKEN=<your-admin-auth-token>
     ```
   - Replace  `<your-auth-token>`(should be default user token), and `<your-admin-auth-token>` with the appropriate values. 

2. **Database Setup**:
   - Ensure the test database is properly configured and populated with the necessary data for the tests to run successfully.

### Running the Tests
1. Run the tests using the following command:
   ```bash
   npm test
   ```
   This will execute all the test cases in the `test` directory.

2. To run a specific test file, use:
   ```bash
   npx jest <path-to-test-file>
   ```
   Example:
   ```bash
   npx jest test/api.test.js
   ```

### Notes
- Ensure the API server is running before executing the tests.
- The `.env.test` file should not be committed to version control. It is already ignored in the `.gitignore` file.
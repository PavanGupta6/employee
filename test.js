const { expect } = require('chai');
const { getEmployee } = require('./app');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { marshall } = require("@aws-sdk/util-dynamodb");

describe('get employee by empId unit tests', () => {
    let originalDynamoDBClient;
    before(() => {
        // Store the original DynamoDBClient and replace it with the mock
        originalDynamoDBClient = DynamoDBClient.prototype.send;
    });

    after(() => {
        // Restore the original DynamoDBClient after tests
        DynamoDBClient.prototype.send = originalDynamoDBClient;
    });

    //valid empId test case
    it(`Should return employee details for valid empId`, async () => {
        // Mock event object
        DynamoDBClient.prototype.send = async function () {
            // Create a mock send function that returns mock data
            const mockItem = { empId: "1233" };
            return { Item: marshall(mockItem) };
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/employee/{empId}',
            path: '/employee/1001',
            httpMethod: 'GET',
            pathParameters: {
                empId: '1001',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Successfully retrieved employee details of empId : ${empId}.`
        );
    });

    //invalid empId test case
    it('Employee details not found error for invalid empId', async () => {
        // Create a mock send function that returns an empty response
        DynamoDBClient.prototype.send = async function () {
            return {};
        };
        //invalid empId
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/employee/{empId}',
            path: '/employee/10',
            httpMethod: 'GET',
            pathParameters: {
                empId: '10',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.equal(404);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Employee details not found for empId : ${empId}.`
        );
    });

    //unexpected error test case for get by empID
    it('unexpected error test case', async () => {
        // Mock an error by changing the DynamoDBClient behavior
        DynamoDBClient.prototype.send = async () => {
            throw new Error('Unexpected error occurred.');
        };
        //invalid empId
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/employee/{empId}',
            path: '/employee/10',
            httpMethod: 'GET',
            pathParameters: {
                empId: '10',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Failed to get employee details with empId : ${empId}.`
        );
    });
});

//successfully get all employeees
describe('get all employees unit tests', () => {
    let originalDynamoDBClient;

    before(() => {
        // Store the original send method
        originalDynamoDBClient = DynamoDBClient.prototype.send;
    });

    after(() => {
        // Restore the original send method after all tests
        DynamoDBClient.prototype.send = originalDynamoDBClient;
    });

    it('successfull scenario to get all employees', async () => {
        const mockItems = [
            // Declare mockItems here
            { empId: "1233" },
            { empId: "4567" }
        ];
        DynamoDBClient.prototype.send = async function () {
            // Simulate a successful scan operation with mock data
            return { Items: mockItems.map((item) => marshall(item)) };
        };

        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/employees',
            path: '/employees',
            httpMethod: 'GET',
            pathParameters: {
                empId: '10',
            },
        };
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            'Successfully retrieved all employees.'
        );
    });

    //Failed to get all employees test case
    it('expect 404 status when no items are found', async () => {
        // Mock the behavior of DynamoDBClient's send method ScanCommand
        DynamoDBClient.prototype.send = async () => {
            // Simulate a successful scan operation with mock data
            return { Items: [] };
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/employees',
            path: '/employees',
            httpMethod: 'GET',
            pathParameters: {
                empId: '10',
            },
        };
        const response = await getEmployee(event);
        expect(response.statusCode).to.equal(404);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal('Employees details are not found.');
    });
    //Unexpected error while get all employees test case
    it('Unexpected error while - get all employees API call', async () => {
        // Mock an error by changing the DynamoDBClient behavior
        DynamoDBClient.prototype.send = async () => {
            throw new Error('intentional error : Failed to get all employees.');
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/employees',
            path: '/employees',
            httpMethod: 'GET',
            pathParameters: {
                empId: '10',
            },
        };
        const response = await getEmployee(event);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal('Failed to retrieve all employees.');
        expect(responseBody.errorMsg).to.equal('intentional error : Failed to get all employees.');
    });
});

//wrong endpoint test
describe('wrong endpoint test', () => {
    it('Should get 404 error If wrogn endpoint is present', async () => {
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/employees/g',
            path: '/employees/g',
            httpMethod: 'GET',
            pathParameters: {
                empId: '10',
            },
        };
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(404);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `URL not found -  ${event.resource}`
        );
    });
});

describe('Delete employee performance details unit tests', () => {
    let originalDynamoDBClient;

    before(() => {
        // Store the original DynamoDBClient and replace it with the mock
        originalDynamoDBClient = DynamoDBClient;
    });

    after(() => {
        // Restore the original send method after all tests
        DynamoDBClient.prototype.send = originalDynamoDBClient;
    });

    //valid empId test case
    it(`Delete employee performance details for valid empId`, async () => {
        DynamoDBClient.prototype.send = () => ({
            '$metadata': {
                httpStatusCode: 200,
            },
        });
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/performanceInfo/{empId}',
            path: '/performanceInfo/1006',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '1006',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Successfully deleted performance Information details of empId : ${empId}.`
        );
    });

    it(`Invalid response from DB call should give error`, async () => {
        DynamoDBClient.prototype.send = () => ({
            '$metadata': {
                httpStatusCode: 400,
            },
        });
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/performanceInfo/{empId}',
            path: '/performanceInfo/1004',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '1004',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.errorMsg).to.equal(
            `Error occurred while deleting performance Information details of empId : ${empId}.`
        );
    });

    it(`Delete employee performance details for invalid empId`, async () => {
        DynamoDBClient.prototype.send = () => {
            throw new Error('Invalid empId / error occurred.');
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/performanceInfo/{empId}',
            path: '/performanceInfo/10',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '10',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Failed to delete employee performance Information details with empId : ${empId}.`
        );
    });

    it(`When unexpected error occurred while Deleting employee performance details`, async () => {
        DynamoDBClient.prototype.send = () => {
            throw new Error('Unexpected error occurred.');
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/performanceInfo/{empId}',
            path: '/performanceInfo/1006',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '1006',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Failed to delete employee performance Information details with empId : ${empId}.`
        );
    });

    it(`Delete employee performance details for invalid empId`, async () => {
        DynamoDBClient.prototype.send = () => {
            const error = new Error('The conditional request failed');
            error.name = 'ConditionalCheckFailedException';
            throw error;
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {},
            resource: '/performanceInfo/{empId}',
            path: '/performanceInfo/10',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '10',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Employee Details not found for empId : ${empId}.`
        );
    });
});

describe('Soft Delete employee performance details unit tests', () => {
    let originalDynamoDBClient;

    before(() => {
        // Store the original DynamoDBClient and replace it with the mock
        originalDynamoDBClient = DynamoDBClient;
    });

    after(() => {
        // Restore the original send method after all tests
        DynamoDBClient.prototype.send = originalDynamoDBClient;
    });

    //valid empId test case
    it(`Successfully soft delete employee performance details for valid empId`, async () => {
        DynamoDBClient.prototype.send = () => ({
            '$metadata': {
                httpStatusCode: 200,
            },
        });
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {
                "performanceInfo": {
                    "isActive": false
                }
            },
            resource: '/softdel/performanceInfo/{empId}',
            path: '/softdel/performanceInfo/1006',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '1006',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Successfully soft deleted performance Information details of empId : ${empId}.`
        );
    });

    it(`Invalid response from DB call should give error`, async () => {
        DynamoDBClient.prototype.send = () => ({
            '$metadata': {
                httpStatusCode: 400,
            },
        });
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {
                "performanceInfo": {
                    "isActive": false
                }
            },
            resource: '/softdel/performanceInfo/{empId}',
            path: '/softdel/performanceInfo/1008',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '1008',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.errorMsg).to.equal(
            `Error occurred while soft deleting performance Information details from DB of empId : ${empId}.`
        );
    });

    it(`When unexpected error occurred while Deleting employee performance details`, async () => {
        DynamoDBClient.prototype.send = () => {
            throw new Error('Unexpected error occurred.');
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {
                "performanceInfo": {
                    "isActive": false
                }
            },
            resource: '/softdel/performanceInfo/{empId}',
            path: '/softdel/performanceInfo/1006',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '1004',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Failed to soft delete employee performance Information details with empId : ${empId}.`
        );
    });

    it(`Soft delete employee performance details for invalid empId`, async () => {
        DynamoDBClient.prototype.send = () => {
            var error = new Error('The conditional request failed');
            error.name = 'ConditionalCheckFailedException';
            throw error;
        };
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {
                "performanceInfo": {
                    "isActive": false
                }
            },
            resource: '/softdel/performanceInfo/{empId}',
            path: '/softdel/performanceInfo/10',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '10',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            `Employee Details not found for empId : ${empId}.`
        );
    });

    it(`If isActive status is not boolean value for Soft deleting employee performance details`, async () => {
        const event = {
            headers: {
                Accept: '*/*',
            },
            body: {
                "performanceInfo": {
                    "isActive": 123
                }
            },
            resource: '/softdel/performanceInfo/{empId}',
            path: '/softdel/performanceInfo/1005',
            httpMethod: 'DELETE',
            pathParameters: {
                empId: '1005',
            },
        };
        const empId = event.pathParameters.empId;
        // calling the getEmployee from the app.js file
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(400);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.errorMsg).to.equal(
            `isActive attribute should be of boolean type!`
        );
    });
});
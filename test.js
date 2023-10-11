const { expect } = require('chai');
const { getEmployee, getAllEmployees } = require('./app');
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

});
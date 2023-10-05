const { expect } = require('chai');
const { getEmployee, getAllEmployees } = require('./app');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');

// Mock DynamoDBClient to avoid making actual AWS calls
const mockClient = {
    send: () => ({
        Attributes: {},
    }),
};

//successfully get all employeees
describe('get all employees unit tests', () => {
    let originalDynamoDBClient;

    before(() => {
        originalDynamoDBClient = DynamoDBClient;
        DynamoDBClient.prototype.send = () => mockClient.send();
    });

    after(() => {
        DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
    });

    it('successfull scenario to get all employees', async () => {
        const response = await getAllEmployees();
        console.log(response);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            'Successfully retrieved all employees.'
        );
    });

    //failed to get all employees test case
    it('failed to get all employees', async () => {
        // Mock an error by changing the DynamoDBClient behavior
        DynamoDBClient.prototype.send = () => {
            throw new Error('intentional error : Failed to get all employees.');
        };
        const response = await getAllEmployees();
        expect(response.statusCode).to.equal(500);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal('Failed to retrieve employees.');
        expect(responseBody.errorMsg).to.equal('intentional error : Failed to get all employees.');
    });
});

describe('get employee by empId unit tests', () => {
    let originalDynamoDBClient;
    before(() => {
        // Store the original DynamoDBClient and replace it with the mock
        originalDynamoDBClient = DynamoDBClient;
        DynamoDBClient.prototype.send = () => mockClient.send();
    });

    after(() => {
        // Restore the original DynamoDBClient after tests
        DynamoDBClient.prototype.send = originalDynamoDBClient.prototype.send;
    });

    //valid empId test case
    it(`successful invocation: for valid empId`, async () => {
        // Mock event object
        let event = {
            pathParameters: {
                empId: '1001',
            },
        };
        const response = await getEmployee(event);
        expect(response.statusCode).to.be.equals(200);
        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            'Successfully retrieved employee.'
        );
    });

    //invalid empId test case
    it('error for invalid empId', async () => {
        //invalid empId
        let event = {
            pathParameters: {
                empId: '10',
            },
        };
        // Mock an error by changing the DynamoDBClient behavior
        DynamoDBClient.prototype.send = () => {
            throw new Error('intentional error : Failed to get employee.');
        };

        const response = await getEmployee(event);

        expect(response.statusCode).to.equal(500);

        const responseBody = JSON.parse(response.body);
        expect(responseBody.message).to.equal(
            'Failed to get employee.'
        );
        expect(responseBody.errorMsg).to.equal('intentional error : Failed to get employee.');
        expect(responseBody.errorStack).to.exist;
    });
});
const {
    GetItemCommand,
    DynamoDBClient,
    PutItemCommand,
    DeleteItemCommand,
    ScanCommand,
    UpdateItemCommand,
  } = require('@aws-sdk/client-dynamodb');
const db = new DynamoDBClient();
const { marshall, unmarshall } = require ('@aws-sdk/util-dynamodb');

const getEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ employeeId: event.pathParameters.employeeId }),
        };
        const { Item } = await db.send(new GetItemCommand(params));
        console.log({ Item });
        response.body = JSON.stringify({
            message: "Successfully retrieved employee.",
            data: (Item) ? unmarshall(Item) : {},
            rawData: Item,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get employee.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    return response;
};

const createEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
        const body = JSON.parse(event.body);
        if(body.employeeId === undefined || body.employeeId === null || body.employeeId.length <= 4 ){
            throw new Error("Employee Id must be at least 4 characters!! ");
        }
        if(body.salary == undefined || body.salary == null || body.salary.length <= 6 ){
            throw new Error("Employee salary must be at least 6 characters!! ");
        }
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Item: marshall(body || {}),
        };

        const createResult = await db.send(new PutItemCommand(params));
        response.body = JSON.stringify({
            message: "Successfully created employee.",
            createResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to create employee.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    return response;
};

const updateEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
        const body = JSON.parse(event.body);
        const objKeys = Object.keys(body);
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ employeeId: event.pathParameters.employeeId }),
            UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
            ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`#key${index}`]: key,
            }), {}),
            ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
                ...acc,
                [`:value${index}`]: body[key],
            }), {})),
        };
        const updateResult = await db.send(new UpdateItemCommand(params));
        response.body = JSON.stringify({
            message: "Successfully updated employee.",
            updateResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to update employee.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    return response;
};

const deleteEmployee = async (event) => {
    const response = { statusCode: 200 };
    try {
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ employeeId: event.pathParameters.employeeId }),
        };
        const deleteResult = await db.send(new DeleteItemCommand(params));
        response.body = JSON.stringify({
            message: "Successfully deleted employee.",
            deleteResult,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to delete employee.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    return response;
};

const getAllEmployees = async () => {
    const response = { statusCode: 200 };
    try {
        const { Items } = await db.send(new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME }));
        response.body = JSON.stringify({
            message: "Successfully retrieved all employees.",
            data: Items.map((item) => unmarshall(item)),
            Items,
        });
    } catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve employees.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    return response;
};
module.exports = {
    getEmployee,
    createEmployee,
    updateEmployee,
    deleteEmployee,
    getAllEmployees,
};
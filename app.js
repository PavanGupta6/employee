// This program is for getting the employee details based http GET method.
const {
    GetItemCommand, // Retrieve data fron dynamoDb table
    DynamoDBClient, // Dynamodb instance
    ScanCommand, //Scan the table
} = require('@aws-sdk/client-dynamodb'); //aws-sdk is used to build rest APIs,
 //client-dynamodb library used to communicate with the 
//create new instance of DynamoDBClient to db, will use this constant across the program
const db = new DynamoDBClient(); 
//import util-dynamodb
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb'); // retrieve and save data

//this function will get employee details based on empId
//create function as async with event as argument
const getEmployee = async (event) => {
    //initialize status code 200 OK 
    const response = { statusCode: 200 };
    //try block code
    try {
        // define tablename and employeeId key with its value
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ empId: event.pathParameters.empId }),
        };
        //await response from db when sent getItem command with params 
        //containing tablename, key and only display empId and personalInfo
        const { Item } = await db.send(new GetItemCommand(params));
        // generate response message and body
        response.body = JSON.stringify({
            message: `Successfully retrieved employee with id = ${empId} `,
            data: (Item) ? unmarshall(Item) : {},
        });
    } // catch block to handle any errors
    catch (e) {
        console.error(e);
        response.body = JSON.stringify({
            message: `Failed to get employee with id = ${empId}.`,
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    //return response with status 500 if any error occured, or with status 200 and data. 
    return response;
};

//This function is used to retrieve all employees details
//create getAllEmployees function as async
const getAllEmployees = async () => {
    //initialize status code 200 OK
    const response = { statusCode: 200 };
    //try block code - this block evaluates the employee retrieve function, if true it gives employee details
    //or if false, it catches server response error and displayes at console
    try {
        const input = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
        };
        //await response from db when sent scan command with tablename
        const { Items } = await db.send(new ScanCommand(input));
        // generate response message and body
        response.body = JSON.stringify({
            message: "Successfully retrieved all employees.",
            data: Items?.map((item) => unmarshall(item)),
        });
    }
    // catch block to handle any server response errors
    catch (e) {
        console.error(e);
        response.body = JSON.stringify({
            message: "Failed to retrieve all employees.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    //return response with status 500 if any error occured, or with status 200 and data. 
    return response;
};

//exporting methods globally
module.exports = {
    getEmployee,
    getAllEmployees,
};
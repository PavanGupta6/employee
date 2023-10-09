// This program is for getting the employee details based http GET method.
const {
    GetItemCommand, // Retrieve data fron dynamoDb table
    DynamoDBClient, // Dynamodb instance
    ScanCommand, //Scan the table
} = require('@aws-sdk/client-dynamodb'); //aws-sdk is used to build rest APIs,
//client-dynamodb library used to communicate with the
//Create new instance of DynamoDBClient to db, will use this constant across the program
const db = new DynamoDBClient();
const { marshall, unmarshall } = require('@aws-sdk/util-dynamodb'); // Retrieve and save data

//This function will get employee details based on empId 
//Create function as async with event as argument
const getEmployee = async (event) => {
    //Initialize status code 200 OK 
    const response = { statusCode: 200 };
    //Try block code - this block evaluates the employee retrieve function based on empId,
    // If true it gives employee details or it catches server response error and displayes at console
    try {
        // Define tablename and employeeId key with its value
        const params = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
            Key: marshall({ empId: event.pathParameters.empId }),
        };
        //Await response from db when sent GetItemCommand 
        //With params as argument containing tablename and key
        const { Item } = await db.send(new GetItemCommand(params));
        console.log({ Item });
        if (Item) {
            response.body = JSON.stringify({
                message: "Successfully retrieved employee details.",
                data: unmarshall(Item)
            });
        } else if (Item === undefined) {
            response.statusCode = 404;
            response.body = JSON.stringify({
                message: 'Employee details not found.'
            });
        }
        else {
            response.statusCode = 500;
            throw new Error('Unexpected error occurred.');
        }
    } // Catch block to handle any errors
    catch (e) {
        console.error(e);
        response.body = JSON.stringify({
            statusCode: response.statusCode,
            message: "Failed to get employee details.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    //Return response with statusCode and data.
    return response;
};

//This function is used to retrieve all employees details
//Create getAllEmployees function as async
const getAllEmployees = async () => {
    const response = { statusCode: 200};
    //Try block code - this block evaluates the employee retrieve function, if true it gives employee details
    //or if false, it catches server response error and displayes at console
    try {
        const input = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
        };
        //Await response from db when sent scan command with tablename
        const { Items } = await db.send(new ScanCommand(input));
        if (Items.length === 0) { // If employees are not present
            response.statusCode = 404; // Setting the status code to 404
            response.body = JSON.stringify({
                message: "Employees details are not found.",
            });
        } else {
            // Generate response message and data
            response.body = JSON.stringify({
                message: "Successfully retrieved all employees.",
                data: Items?.map((item) => unmarshall(item)),
            });
        }
    }
    // Catch block to handle any server response errors
    catch (e) {
        console.error(e);
        response.body = JSON.stringify({
            message: "Failed to retrieve all employees.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    //Return response with statusCode and data. 
    return response;
};

//Exporting methods globally
module.exports = {
    getEmployee,
    getAllEmployees,
};
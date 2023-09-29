const {
    GetItemCommand,
    DynamoDBClient,
    ScanCommand,
  } = require('@aws-sdk/client-dynamodb'); //import functions from client-dynamodb library
  //create new instance of DynamoDBClient
const db = new DynamoDBClient(); 
//import util-dynamodb
const { marshall, unmarshall } = require ('@aws-sdk/util-dynamodb'); 
//create function as async with event as argument
const getEmployee = async (event) => {
    //initialize status code 200 OK 
    const response = { statusCode: 200 };       
 /*    if(role == "EMPLOYEE"){
        const {item } = await db.send(new GetItemCommand(params));
        if(empId != item.empId){
            throw new Error("Access denied!");
        }
    } */
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
            message: "Successfully retrieved employee.",
            data: (Item) ? unmarshall(Item) : {},
            // rawData: Item,
        });
    } // catch block to handle any errors
    catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to get employee.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    //return response with status 500 if any error occured, or with status 200 and data. 
    return response;
};

//create getAllEmployees function as async with event as argument
const getAllEmployees = async () => { 
     //initialize status code 200 OK
    const response = { statusCode: 200 };
/* let adminRole = "ADMIN";
    let hrRole = "HR";
    if(role != adminRole || role != hrRole){
        throw new Error("User does not have access!");
    } */
    //try block code
    try {
        const input = {
            TableName: process.env.DYNAMODB_TABLE_NAME,
          };
        //await response from db when sent scan command with tablename
        const { Items } = await db.send(new ScanCommand(input));
        // generate response message and body
        response.body = JSON.stringify({
            message: "Successfully retrieved all employees.",
            data: Items.map((item) => unmarshall(item)),
            // Items,
        });
    } 
    // catch block to handle any errors
    catch (e) {
        console.error(e);
        response.statusCode = 500;
        response.body = JSON.stringify({
            message: "Failed to retrieve employees.",
            errorMsg: e.message,
            errorStack: e.stack,
        });
    }
    //return response with status 500 if any error occured, or with status 200 and data. 
    return response;
};

//export functions so that it can be used elsewhere
module.exports = {
    getEmployee,
    getAllEmployees,
};
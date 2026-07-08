import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

let dynamoDbClientParams = {};

if (process.env.IS_OFFLINE) {
    dynamoDbClientParams = {
        region: "localhost",
        endpoint: "http://localhost:8000",
        credentials: {
            accessKeyId: "fakeMyKeyId",
            secretAccessKey: "fakeSecretAccessKey",
        },
    };
}

const client = new DynamoDBClient(dynamoDbClientParams);
const dynamoDb = DynamoDBDocumentClient.from(client);

export const updateUsers = async (event) => {
    const user_id = event.pathParameters.id;
    const userBody = JSON.parse(event.body);

    if (!userBody || Object.keys(userBody).length === 0) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                error: "No se proporcionaron campos para actualizar",
            }),
        };
    }

    let updateExpression = "SET";
    const expressionAttributeNames = {};
    const expressionAttributeValues = {};

    const allowedFields = ["name", "email", "age", "telefono", "address"];

    Object.keys(userBody).forEach((key, index) => {
        if (allowedFields.includes(key)) {
            if (index > 0) updateExpression += ",";

            updateExpression += ` #field${index} = :val${index}`;
            expressionAttributeNames[`#field${index}`] = key;
            expressionAttributeValues[`:val${index}`] = userBody[key];
        }
    });

    const params = {
        TableName: "usersTable",
        Key: { pk: user_id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
    };

    try {
        const command = new UpdateCommand(params);
        const response = await dynamoDb.send(command);

        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                user: response.Attributes,
                message: "User updated successfully",
            }),
        };
    } catch (error) {
        console.error("Error actualizando en DynamoDB:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                error: "Could not update user",
                details: error.message,
            }),
        };
    }
};

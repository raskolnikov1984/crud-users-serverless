import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

import randomUUID from "crypto";

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

export const createUsers = async (event) => {
    const user_id = randomUUID.randomUUID();
    let userBody = JSON.parse(event.body || "{}");

    const params = {
        TableName: "usersTable",
        Item: {
            pk: user_id,
            ...userBody,
        },
    };

    try {
        const command = new PutCommand(params);
        const data = await dynamoDb.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                user: params.Item,
                message: "User created successfully",
            }),
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not create user" }),
        };
    }
};

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { QueryCommand } from "@aws-sdk/lib-dynamodb";

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

export const getUsers = async (event) => {
    const user_id = event.pathParameters?.id;

    if (!user_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing user id" }),
        };
    }

    const params = {
        TableName: "usersTable",
        KeyConditionExpression: "pk = :pk",
        ExpressionAttributeValues: {
            ":pk": user_id,
        },
    };

    try {
        const command = new QueryCommand(params);
        const data = await dynamoDb.send(command);

        return {
            statusCode: 200,
            body: JSON.stringify({
                user: data,
            }),
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Could not fetch user" }),
        };
    }
};

import boto3, json, os

client = boto3.resource("dynamodb")

IS_OFFLINE = os.environ.get("IS_OFFLINE", False)

if IS_OFFLINE:
    boto3.Session(
        aws_access_key_id="test",
        aws_secret_access_key="test",
    )
    client = boto3.resource(
        "dynamodb",
        endpoint_url="http://localhost:8000",
    )

table = client.Table("usersTable")


def deleteUsers(event, context):
    try:
        user_id = event["pathParameters"].get("id")

        if not user_id:
            return {
                "statusCode": 400,
                "body": json.dumps({"message": "user_id is required"}),
            }

        response = table.delete_item(
            Key={
                "pk": user_id,
            }
        )

        return {
            "statusCode": 200,
            "body": json.dumps({"message": "User deleted successfully"}),
        }

    except Exception as e:
        return {
            "statusCode": 500,
            "body": json.dumps({"message": str(e)}),
        }

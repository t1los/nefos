
print("STARTED: Initializing MongoDB Data...");

db = db.getSiblingDB('pms_teams');
db.createCollection('teams');

db.teams.insertMany([
  {
    "_id": ObjectId("695eacbd055f861ce4a46ba0"),
    "name": "Panathinaikos BC",
    "description": "PAO BC",
    "leaderId": 1,
    "members": [1, 8, 9, 10],
    "createdAt": new Date("2026-01-07T18:58:05.577Z"),
    "__v": 3
  },
  {
    "_id": ObjectId("695eacc8055f861ce4a46ba3"),
    "name": "Panathinaikos FC",
    "description": "PAO FC",
    "leaderId": 1,
    "members": [1, 12, 11, 13],
    "createdAt": new Date("2026-01-07T18:58:16.900Z"),
    "__v": 3
  }
]);

print("SUCCESS: Teams initialized.");


db = db.getSiblingDB('pms_tasks');
db.createCollection('tasks');

db.tasks.insertMany([
  {
    "_id": ObjectId("695ead2c4f23d6e211cf2fd9"),
    "title": "Fix Defence",
    "description": "",
    "teamId": ObjectId("695eacbd055f861ce4a46ba0"), 
    "status": "IN_PROGRESS",
    "priority": "MEDIUM",
    "createdBy": 8,
    "assignedTo": 10,
    "comments": [
      {
        "text": "fix asap f4 is close!",
        "authorId": 1,
        "authorName": "superadmin",
        "_id": ObjectId("695eae744f23d6e211cf2ff2"),
        "createdAt": new Date("2026-01-07T19:05:24.566Z")
      }
    ],
    "createdAt": new Date("2026-01-07T18:59:56.896Z"),
    "__v": 1
  },
  {
    "_id": ObjectId("695ead6a4f23d6e211cf2fdd"),
    "title": "Fix pressing",
    "description": "",
    "teamId": ObjectId("695eacc8055f861ce4a46ba3"), 
    "status": "TODO",
    "priority": "HIGH",
    "createdBy": 11,
    "assignedTo": 12,
    "comments": [
      {
        "text": "Needs to be done before holiday break!!!!!",
        "authorId": 11,
        "authorName": "rbenitez",
        "_id": ObjectId("695eb2324f23d6e211cf300b"),
        "createdAt": new Date("2026-01-07T19:21:22.728Z")
      },
      {
        "text": "On it.",
        "authorId": 13,
        "authorName": "tbakasetas11",
        "_id": ObjectId("695eb2664f23d6e211cf3013"),
        "createdAt": new Date("2026-01-07T19:22:14.113Z")
      }
    ],
    "createdAt": new Date("2026-01-07T19:00:58.861Z"),
    "__v": 2
  }
]);

print("SUCCESS: Tasks initialized.");
print("FINISHED: All MongoDB data imported successfully.");

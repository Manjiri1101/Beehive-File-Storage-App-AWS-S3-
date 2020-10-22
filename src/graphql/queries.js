/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getObject = /* GraphQL */ `
  query GetObject($id: ID!) {
    getObject(id: $id) {
      id
      filename
      description
      email
      createdAt
      updatedAt
      owner
    }
  }
`;
export const listObjects = /* GraphQL */ `
  query ListObjects(
    $filter: ModelObjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listObjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        filename
        description
        email
        createdAt
        updatedAt
        owner
      }
      nextToken
    }
  }
`;

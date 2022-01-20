import { gql } from "@apollo/client";

export default class OperationDocsStore {
  static getAll() {
    return `query MyQuery {
      fruits {
        id
        name
        user_id
      }
    }
    `;
  }

  static addOne(name) {
    return `mutation MyMutation {
      insert_fruits_one(object: {name: "${name}"}) {
        id
        name
        user_id
      }
    }`;
  }

  static deleteById(id) {
    return `mutation MyMutation {
      delete_fruits(where: {id: {_eq: "${id}"}}) {
        affected_rows
      }
    }`;
  }

  static subscribeToAll() {
    return gql`
      subscription MySubscription {
        fruits {
          user_id
          name
          id
        }
      }
    `;
  }
}

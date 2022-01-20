import { requestCounter } from "./store";
class RequestHelper {
  constructor() {
    this.API_URL = URI;
  }

  async fetchGraphQL(operationsDoc, operationName, variables) {
    const result = await fetch(this.API_URL, {
      method: "POST",
      body: JSON.stringify({
        query: operationsDoc,
        variables: variables,
        operationName: operationName,
      }),
      headers: {
        "x-hasura-admin-secret": ADMIN,
      },
    });

    return result.json();
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    requestCounter.update((n) => n + 1);
    try {
      const { errors, data } = await this.fetchMyQuery(operationsDoc);
      if (errors) {
        console.error(errors);
        throw new Error(errors[0].message);
      }
      requestCounter.update((n) => n - 1);

      // do something great with this precious data
      console.log(data);
      return data;
    } catch (e) {
      requestCounter.update((n) => n - 1);
      console.error(e);
      throw e;
    }
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    requestCounter.update((n) => n + 1);
    try {
      const { errors, data } = await this.executeMyMutation(operationsDoc);
      if (errors) {
        console.error(errors);
        throw new Error(errors[0].message);
      }
      requestCounter.update((n) => n - 1);

      // do something great with this precious data
      console.log(data);
      return data;
    } catch (e) {
      requestCounter.update((n) => n - 1);
      console.error(e);
      throw e;
    }
  }
}

export default new RequestHelper();

import { error, requestCounter } from "./store";
class RequestHelper {
  constructor() {
    this.API_URL = URL;
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

    return await result.json();
  }
  fetchMyQuery(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyQuery", {});
  }

  async startFetchMyQuery(operationsDoc) {
    requestCounter.update((n) => n + 1);
    const { errors, data } = await this.fetchMyQuery(operationsDoc);
    requestCounter.update((n) => n - 1);

    if (errors) {
      console.error(errors);
      throw new Error(errors[0].message);
    }

    // do something great with this precious data
    console.log(data);
    return data;
  }

  executeMyMutation(operationsDoc) {
    return this.fetchGraphQL(operationsDoc, "MyMutation", {});
  }

  async startExecuteMyMutation(operationsDoc) {
    const { errors, data } = await this.executeMyMutation(operationsDoc);

    if (errors) {
      console.error(errors);
      throw new Error(errors[0].message);
    }

    // do something great with this precious data
    console.log(data);
    return data;
  }
}

export default new RequestHelper();

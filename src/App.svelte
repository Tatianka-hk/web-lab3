<script>
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";
  import { errors, requestCounter } from "./store";
  const inputValues = {};
  function createApolloClient() {
    const headers = {
      "x-hasura-admin-secret": ADMIN,
    };
    const httpLink = new HttpLink({
      uri: URI,
      headers,
    });
    const cache = new InMemoryCache({
      typePolicies: {
        Subscription: {
          fields: {
            fruits: {
              merge(_existing, incoming) {
                return incoming;
              },
            },
          },
        },
      },
    });
    const wsLink = new WebSocketLink({
      uri: WS,
      options: {
        reconnect: true,
        connectionParams: {
          headers,
        },
      },
    });
    const link = split(
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink,
    );
    return new ApolloClient({
      link,
      cache,
    });
  }

  const client = createApolloClient();
  setClient(client);
  const fruits = subscribe(OperationDocsStore.subscribeToAll());

  const addFruit = () => {
    const { name } = inputValues;
    http
      .startExecuteMyMutation(OperationDocsStore.addOne(name ?? ""))
      .catch((e) => {
        console.error(e);
        $errors = [e.message];
      });
  };

  const deleteFruit = (id) => {
    http
      .startExecuteMyMutation(OperationDocsStore.deleteById(id))
      .catch((e) => {
        console.error(e);
        $errors = [e.message];
      });
  };
</script>

<main>
  {#if $fruits.loading || $requestCounter}
    <h1>Loading...</h1>
  {:else if $fruits.error || $errors.length}
    <h1>{$fruits.error || $errors.join("\n")}</h1>
  {:else}
    <div>
      <input placeholder="Add fruit" bind:value={inputValues.name} />
      <button on:click={addFruit}>Add new fruit</button>
    </div>

    {#if $fruits?.data?.fruits?.length}
      {#each $fruits.data.fruits as fruit (fruit.id)}
        <div>
          <p>fruit name: {fruit.name}</p>
          <p>user id: {fruit.user_id}</p>
          <button on:click={() => deleteFruit(fruit.id)}>Delete fruit</button>
          <hr />
        </div>
      {/each}
    {:else}
      <h1>No fruits :(</h1>
    {/if}
    {#if $errors.length}
      <h2>{$errors[0]}</h2>
    {/if}
  {/if}
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
</style>

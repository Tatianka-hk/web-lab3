<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";
  import { errors, requestCounter } from "./store";
  const inputValues = {
    add: {},
    delete: {},
  };
  function createApolloClient() {
    const headers = {
      "x-hasura-admin-secret": ADMIN,
    };
    const httpLink = new HttpLink({
      uri: URI,
      headers,
    });
    const cache = new InMemoryCache();
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

  const addFruit = async () => {
    try {
      const name = inputValues.add.name;
      await http.startExecuteMyMutation(OperationDocsStore.addOne(name));
    } catch (e) {
      console.error;
      $errors = [e.message];
    }
  };

  const deleteFruit = async () => {
    const name = inputValues.add.name;
    if (name) {
      try {
        await http.startExecuteMyMutation(
          OperationDocsStore.deleteByName(name),
        );
      } catch (e) {
        console.error;
        $errors = [e.message];
      }
    }
  };
</script>

<main>
  {#if $fruits.loading}
    <h1>Loading...</h1>
  {:else if $fruits.error}
    <h1>{$fruits.error}</h1>
  {:else}
    <input placeholder="Fruit" bind:value={inputValues.add.name} />
    <button on:click={addFruit}>Add new fruit</button>
    <button on:click={deleteFruit}>Delete fruit</button>

    {#each $fruits.data.fruits as fruit (fruit.id)}
      <div>
        <p>fruit name: {fruit.name}</p>
        <p>user id: {fruit.user_id}</p>
        <hr />
      </div>
    {/each}
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

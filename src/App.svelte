<script>
  import { onMount } from "svelte";
  import http from "./request-helper";
  import OperationDocsStore from "./operationDocsStore";
  import { ApolloClient, InMemoryCache, HttpLink, split } from "@apollo/client";
  import { setClient, subscribe } from "svelte-apollo";
  import { WebSocketLink } from "@apollo/client/link/ws";
  import { getMainDefinition } from "@apollo/client/utilities";

  function createApolloClient() {
    const httpLink = new HttpLink({
      uri: "https://myweblabs.herokuapp.com/v1/graphql",
    });
    const cache = new InMemoryCache();
    const wsLink = new WebSocketLink({
      uri: "wss://myweblabs.herokuapp.com/v1/graphql",
      options: {
        reconnect: true,
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
      httpLink
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
    const name = prompt("name") || "";
    await http.startExecuteMyMutation(
      OperationDocsStore.addOne(name)
    );
  };

  const deleteFruit = async () => {
    const name = prompt("which fruit to delete?") || "";
    if (name) {
      await http.startExecuteMyMutation(OperationDocsStore.deleteByName(name));
      // heroes.update(n => n.filter(hero => hero.name!==name))
    }
  };
</script>

<main>
  {#if $fruits.loading}
    <h1>Loading...</h1>
  {:else if $fruits.error}
    <h1>{$fruits.error}</h1>
  {:else}
    <button on:click={addFruit}>Add new fruit</button>
    <button on:click={deleteFruit}>Delete fruit</button>

    {#each $fruits.data.fruits as fruit}
      <div>
        <p>fruit name: {fruit.name}</p>
        <p>user id: {fruit.user_id}</p>
        <hr />
      </div>
    {/each}
  {/if}
</main>

<style>
  main {
    margin: 0;
    padding: 0;
  }
</style>

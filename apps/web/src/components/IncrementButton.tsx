import { useMutation, gql } from "@apollo/client";

const INCREMENT_COUNTER = gql`
  mutation IncrementCounter {
    incrementCounter
  }
`;

export function IncrementButton() {
  const [incrementCounter] = useMutation(INCREMENT_COUNTER, {
    update(cache, { data }) {
      cache.writeQuery({
        query: gql`
          query Counter {
            counter
          }
        `,
        data: { counter: data.incrementCounter },
      });
    },
  });

  const handleIncrement = async () => {
    try {
      console.log("Incrementing counter...");
      const result = await incrementCounter();
      console.log("Counter increment result:", result);
    } catch (error) {
      console.error("Error incrementing counter:", error);
    }
  };

  return <button onClick={handleIncrement}>Increment</button>;
}

import { useQuery, gql } from "@apollo/client";

const COUNTER_QUERY = gql`
  query Counter {
    counter
  }
`;

export function CounterDisplay() {
  const { data: counterData, loading, error } = useQuery(COUNTER_QUERY);

  console.log(
    "Counter data:",
    counterData,
    "Loading:",
    loading,
    "Error:",
    error
  );

  return <span>Bid count is {counterData?.counter ?? 0}</span>;
}

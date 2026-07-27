import Badge from "./Badge";

function IntentBadge({ intent }) {
  const map = {
    informational: "blue",
    commercial: "orange",
    transactional: "green",
    navigational: "purple",
  };

  return <Badge color={map[intent] || "gray"}>{intent}</Badge>;
}

export default IntentBadge;
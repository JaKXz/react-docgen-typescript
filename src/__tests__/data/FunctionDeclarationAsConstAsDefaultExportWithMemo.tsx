import * as React from "react";

/** JumbotronProps props */
export interface JumbotronProps {
  /** prop1 description */
  prop1: string;
}

/**
 * Jumbotron description
 */
const Jumbotron = React.memo((props: JumbotronProps) => {
  return <div>Test</div>;
});

export default Jumbotron;

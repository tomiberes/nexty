export interface KnownProps {
  message: string;
}

export function Hello(props: KnownProps) {
  return <span>Hello, {props.message}</span>;
}

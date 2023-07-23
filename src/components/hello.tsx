export interface HelloProps {
  message: string;
}

export function Hello(props: HelloProps) {
  return <span>Hello, {props.message}</span>;
}

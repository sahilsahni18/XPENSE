import { formatINRFromCents } from "../utils/format";

type Props = {
  totalCents: number;
};

export default function TotalBar({ totalCents }: Props) {
  return (
    <div className="card total">
      Total: <strong>{formatINRFromCents(totalCents)}</strong>
    </div>
  );
}
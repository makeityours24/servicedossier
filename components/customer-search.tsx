import Link from "next/link";

type CustomerSearchProps = {
  initialQuery: string;
};

export function CustomerSearch({ initialQuery }: CustomerSearchProps) {
  return (
    <form className="kaart" style={{ padding: 22 }}>
      <div className="veld-groot">
        <label htmlFor="zoek">Zoek op naam of telefoonnummer</label>
        <input
          className="zoekveld"
          id="zoek"
          name="zoek"
          defaultValue={initialQuery}
          placeholder="Bijvoorbeeld Eva of 0612345678"
        />
      </div>
      <div className="acties" style={{ marginTop: 14 }}>
        <button type="submit" className="knop">
          Zoeken
        </button>
        <Link href="/klanten" className="knop-secundair">
          Reset
        </Link>
      </div>
    </form>
  );
}

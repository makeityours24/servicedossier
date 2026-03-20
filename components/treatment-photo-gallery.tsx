import { deleteTreatmentPhotoAction } from "@/app/(dashboard)/klanten/photo-actions";

type TreatmentPhotoGalleryProps = {
  customerId: number;
  treatmentId: number;
  photos: Array<{
    id: number;
    url: string;
    bestandNaam: string;
    soort: "VOOR" | "NA" | "ALGEMEEN";
    notitie?: string | null;
    createdAt: Date;
    uploadedByUser?: {
      naam: string;
    } | null;
  }>;
  showDelete?: boolean;
  dictionary?: {
    empty: string;
    before: string;
    after: string;
    general: string;
    altPhoto: string;
    delete: string;
    file: string;
    uploadedBy: string;
  };
};

const defaultDictionary = {
  empty: "Er zijn nog geen foto's aan deze behandeling gekoppeld.",
  before: "Voor",
  after: "Na",
  general: "Algemeen",
  altPhoto: "foto",
  delete: "Verwijderen",
  file: "Bestand",
  uploadedBy: "Geüpload door"
};

function humanPhotoTypeLabel(
  soort: "VOOR" | "NA" | "ALGEMEEN",
  dictionary: TreatmentPhotoGalleryProps["dictionary"] = defaultDictionary
) {
  if (soort === "VOOR") return dictionary.before;
  if (soort === "NA") return dictionary.after;
  return dictionary.general;
}

export function TreatmentPhotoGallery({
  customerId,
  treatmentId,
  photos,
  showDelete = false,
  dictionary = defaultDictionary
}: TreatmentPhotoGalleryProps) {
  if (photos.length === 0) {
    return <div className="leeg">{dictionary.empty}</div>;
  }

  return (
    <div className="treatment-photo-grid">
      {photos.map((photo) => (
        <article className="treatment-photo-card" key={photo.id}>
          <div className="treatment-photo-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/treatment-photos/${photo.id}`}
              alt={`${humanPhotoTypeLabel(photo.soort, dictionary)} ${dictionary.altPhoto}`}
            />
          </div>
          <div className="treatment-photo-meta">
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="status-badge">{humanPhotoTypeLabel(photo.soort, dictionary)}</span>
              {showDelete ? (
                <form action={deleteTreatmentPhotoAction}>
                  <input type="hidden" name="customerId" value={customerId} />
                  <input type="hidden" name="treatmentId" value={treatmentId} />
                  <input type="hidden" name="photoId" value={photo.id} />
                  <button type="submit" className="knop-secundair">
                    {dictionary.delete}
                  </button>
                </form>
              ) : null}
            </div>
            {photo.notitie ? <p className="meta">{photo.notitie}</p> : null}
            <p className="meta">
              <strong>{dictionary.file}:</strong> {photo.bestandNaam}
              {photo.uploadedByUser?.naam ? (
                <>
                  <br />
                  <strong>{dictionary.uploadedBy}:</strong> {photo.uploadedByUser.naam}
                </>
              ) : null}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

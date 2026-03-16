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
};

function humanPhotoTypeLabel(soort: "VOOR" | "NA" | "ALGEMEEN") {
  if (soort === "VOOR") return "Voor";
  if (soort === "NA") return "Na";
  return "Algemeen";
}

export function TreatmentPhotoGallery({
  customerId,
  treatmentId,
  photos,
  showDelete = false
}: TreatmentPhotoGalleryProps) {
  if (photos.length === 0) {
    return <div className="leeg">Er zijn nog geen foto&apos;s aan deze behandeling gekoppeld.</div>;
  }

  return (
    <div className="treatment-photo-grid">
      {photos.map((photo) => (
        <article className="treatment-photo-card" key={photo.id}>
          <div className="treatment-photo-frame">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/api/treatment-photos/${photo.id}`}
              alt={`${humanPhotoTypeLabel(photo.soort)} foto`}
            />
          </div>
          <div className="treatment-photo-meta">
            <div className="acties" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
              <span className="status-badge">{humanPhotoTypeLabel(photo.soort)}</span>
              {showDelete ? (
                <form action={deleteTreatmentPhotoAction}>
                  <input type="hidden" name="customerId" value={customerId} />
                  <input type="hidden" name="treatmentId" value={treatmentId} />
                  <input type="hidden" name="photoId" value={photo.id} />
                  <button type="submit" className="knop-secundair">
                    Verwijderen
                  </button>
                </form>
              ) : null}
            </div>
            {photo.notitie ? <p className="meta">{photo.notitie}</p> : null}
            <p className="meta">
              <strong>Bestand:</strong> {photo.bestandNaam}
              {photo.uploadedByUser?.naam ? (
                <>
                  <br />
                  <strong>Geüpload door:</strong> {photo.uploadedByUser.naam}
                </>
              ) : null}
            </p>
          </div>
        </article>
      ))}
    </div>
  );
}

package utils

import (
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

func PGToUUID(raw pgtype.UUID) uuid.UUID {
	return raw.Bytes
}

func TimeToPG(raw time.Time) pgtype.Timestamptz {
	return pgtype.Timestamptz{Time: raw, Valid: true}
}

// PGTextToPtr turns a nullable column into a pointer, so an absent value can be
// omitted from a JSON response rather than serialized as an empty string.
func PGTextToPtr(raw pgtype.Text) *string {
	if !raw.Valid {
		return nil
	}
	value := raw.String
	return &value
}

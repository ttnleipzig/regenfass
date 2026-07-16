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

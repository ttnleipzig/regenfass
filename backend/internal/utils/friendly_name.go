package utils

import (
	"fmt"
	"hash/fnv"
	"sync"
	"unicode"

	"github.com/Zedran/neng"
	"github.com/jackc/pgx/v5/pgtype"
)

// friendlyWords caches the adjective and noun lists from neng so we can pick
// names deterministically by hashing a device UUID into those slices. neng's
// own Adjective()/Noun() methods use a shared random source and would produce
// different names on each call — not what we want for a stable nickname.
var (
	friendlyOnce sync.Once
	friendlyAdj  []string
	friendlyNoun []string
	friendlyErr  error
)

func loadFriendlyWords() {
	gen, err := neng.DefaultGenerator(nil)
	if err != nil {
		friendlyErr = fmt.Errorf("neng: %w", err)
		return
	}
	friendlyAdj, friendlyErr = collectWords(gen, neng.WC_ADJECTIVE)
	if friendlyErr != nil {
		return
	}
	friendlyNoun, friendlyErr = collectWords(gen, neng.WC_NOUN)
}

func collectWords(gen *neng.Generator, wc neng.WordClass) ([]string, error) {
	n, err := gen.Len(wc)
	if err != nil {
		return nil, err
	}
	seq, err := gen.All(wc)
	if err != nil {
		return nil, err
	}
	words := make([]string, 0, n)
	for _, w := range seq {
		words = append(words, w.Word())
	}
	return words, nil
}

// FriendlyDeviceName returns a stable "Adjective Noun" nickname derived from a
// device UUID. The same UUID always maps to the same nickname, so devices keep
// a recognisable identity until the user sets a custom name.
func FriendlyDeviceName(id pgtype.UUID) string {
	friendlyOnce.Do(loadFriendlyWords)
	if friendlyErr != nil || len(friendlyAdj) == 0 || len(friendlyNoun) == 0 {
		// Fall back to the raw UUID prefix if the word lists somehow failed to
		// load — better a boring name than a runtime panic on the ingest path.
		return fmt.Sprintf("Device %x", id.Bytes[:4])
	}

	h := fnv.New64a()
	h.Write(id.Bytes[:])
	v := h.Sum64()
	adj := friendlyAdj[v%uint64(len(friendlyAdj))]
	noun := friendlyNoun[(v/uint64(len(friendlyAdj)))%uint64(len(friendlyNoun))]
	return titleCase(adj) + " " + titleCase(noun)
}

func titleCase(s string) string {
	if s == "" {
		return s
	}
	r := []rune(s)
	r[0] = unicode.ToUpper(r[0])
	return string(r)
}

package main

import (
	"bytes"
	"encoding/base64"
	"encoding/binary"
	"encoding/json"
	"log"
	"net/http"
	"net/url"
	"os"

	"github.com/gorilla/mux"
)

const DeckStringVersion = 1

const (
	FormatUnknown = iota
	FormatWild
	FormatStandard
)

type CardCount struct {
	ID    int `json:"id,omitempty"`
	Count int `json:"count,omitempty"`
}

type Deck struct {
	Cards  []CardCount `json:"cards,omitempty"`
	Heroes []int       `json:"heroes,omitempty"`
	Format int         `json:"format,omitempty"`
}

// our main function
func main() {
	port := os.Getenv("PORT")
	if port == "" {
		log.Fatal("$PORT must be set")
	}
	router := mux.NewRouter()
	router.HandleFunc("/decks/", GetDeckFromString).Methods("GET")
	log.Fatal(http.ListenAndServe(":"+port, router))
}

func GetDeckFromString(w http.ResponseWriter, r *http.Request) {
	deckstrings, ok := r.URL.Query()["deckstring"]
	if !ok || len(deckstrings) < 1 {
		log.Println("No deckstring")
		return
	}

	var decks []Deck
	for i, deckstring := range deckstrings {
		deckstringDecoded, _ := url.PathUnescape(deckstring)
		log.Println("Processing Deck: ", deckstringDecoded)
		data, err := base64.StdEncoding.DecodeString(deckstringDecoded)
		if err != nil {
			log.Println("Deck ", i, " - Error: ", err)
			continue
		}
		reader := bytes.NewReader(data)
		v, _ := reader.ReadByte()
		if v != 0 {
			log.Println("Deck ", i, " - Invlaid deckstring")
			continue
		}

		version, _ := binary.ReadUvarint(reader)
		if version != DeckStringVersion {
			log.Println("Deck ", i, " - Unsupported deckstring version: ", version)
			continue
		}

		format, _ := binary.ReadUvarint(reader)
		if format != 1 && format != 2 {
			log.Println("Deck ", i, " - Invalid format")
			continue
		}

		numHeroes, _ := binary.ReadUvarint(reader)
		var heroes []int
		for j := 0; j < int(numHeroes); j++ {
			hero, _ := binary.ReadUvarint(reader)
			heroes = append(heroes, int(hero))
		}

		var cards []CardCount
		numCardsX1, _ := binary.ReadUvarint(reader)
		for i := 0; i < int(numCardsX1); i++ {
			cardID, _ := binary.ReadUvarint(reader)
			cards = append(cards, CardCount{ID: int(cardID), Count: 1})
		}

		numCardsX2, _ := binary.ReadUvarint(reader)
		for i := 0; i < int(numCardsX2); i++ {
			cardID, _ := binary.ReadUvarint(reader)
			cards = append(cards, CardCount{ID: int(cardID), Count: 2})
		}

		numCardsXN, _ := binary.ReadUvarint(reader)
		for i := 0; i < int(numCardsXN); i++ {
			cardID, _ := binary.ReadUvarint(reader)
			cardCount, _ := binary.ReadUvarint(reader)
			cards = append(cards, CardCount{ID: int(cardID), Count: int(cardCount)})
		}
		log.Println("Cards: ", cards)
		log.Println("Heroes: ", heroes)
		decks = append(decks, Deck{cards, heroes, int(format)})
	}

	json.NewEncoder(w).Encode(map[string][]Deck{
		"decks": decks,
	})
}

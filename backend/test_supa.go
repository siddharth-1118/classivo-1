package main

import (
	"fmt"
	"log"

	"goscraper/src/helpers/databases"
	"github.com/joho/godotenv"
)

func main() {
	godotenv.Load(".env")
	db, err := databases.NewDatabaseHelper()
	if err != nil {
		log.Fatalf("DB Init Error: %v", err)
	}

	testHash := "test_hash_123"
	err = db.SaveSession(testHash)
	if err != nil {
		fmt.Printf("SaveSession Error: %v\n", err)
		return
	}
	fmt.Println("SaveSession Success")

	exists, err := db.VerifySession(testHash)
	if err != nil {
		fmt.Printf("VerifySession Error: %v\n", err)
		return
	}
	fmt.Printf("VerifySession Result: %v\n", exists)
}

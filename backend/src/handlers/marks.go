package handlers

import (
	"encoding/json"
	"goscraper/src/helpers"
	"goscraper/src/helpers/databases"
	"goscraper/src/types"
	"goscraper/src/utils"
)

func GetMarks(token string) (*types.MarksResponse, error) {
	encodedToken := utils.Encode(token)
	db, _ := databases.NewDatabaseHelper()
	// Always fetch fresh data
	scraper := helpers.NewAcademicsFetch(token)
	marks, err := scraper.GetMarks()
	if err != nil {
		// Scrape failed - check if we have any stale data as fallback
		if db != nil {
			cachedData, exists, _, _ := db.GetCachedDataByKey(encodedToken, "marks")
			if exists {
				var marksResponse types.MarksResponse
				if jsonData, ok := cachedData.(map[string]interface{}); ok {
					jsonBytes, _ := json.Marshal(jsonData)
					json.Unmarshal(jsonBytes, &marksResponse)
					marksResponse.Stale = true
					return &marksResponse, nil
				}
			}
		}
		return nil, err
	}

	// Scrape succeeded - update cache
	if db != nil && marks != nil {
		regNumber := ""
		if marks.RegNumber != "" {
			regNumber = marks.RegNumber
		}
		go db.UpsertDataByKey(encodedToken, regNumber, "marks", marks)
	}
	marks.Stale = false
	return marks, nil
}

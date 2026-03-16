package handlers

import (
	"encoding/json"
	"goscraper/src/helpers"
	"goscraper/src/helpers/databases"
	"goscraper/src/types"
	"goscraper/src/utils"
	"strconv"
)

func GetTimetable(token string) (*types.TimetableResult, error) {
	encodedToken := utils.Encode(token)
	db, _ := databases.NewDatabaseHelper()
	// Always fetch fresh data
	scraper := helpers.NewTimetable(token)
	user, err := GetUser(token)
	if err != nil {
		// Scrape failed - check if we have any stale data as fallback
		if db != nil {
			cachedData, exists, _, _ := db.GetCachedDataByKey(encodedToken, "timetable")
			if exists {
				var timetableResult types.TimetableResult
				if jsonData, ok := cachedData.(map[string]interface{}); ok {
					jsonBytes, _ := json.Marshal(jsonData)
					json.Unmarshal(jsonBytes, &timetableResult)
					timetableResult.Stale = true
					return &timetableResult, nil
				}
			}
		}
		return &types.TimetableResult{}, err
	}

	if user.Batch == "" {
		user.Batch = "1"
	}
	batchNum, err := strconv.Atoi(user.Batch)
	if err != nil {
		// Scrape failed - check if we have any stale data as fallback
		if db != nil {
			cachedData, exists, _, _ := db.GetCachedDataByKey(encodedToken, "timetable")
			if exists {
				var timetableResult types.TimetableResult
				if jsonData, ok := cachedData.(map[string]interface{}); ok {
					jsonBytes, _ := json.Marshal(jsonData)
					json.Unmarshal(jsonBytes, &timetableResult)
					timetableResult.Stale = true
					return &timetableResult, nil
				}
			}
		}
		return &types.TimetableResult{}, err
	}

	timetable, err := scraper.GetTimetable(batchNum)
	if err != nil {
		// Scrape failed - check if we have any stale data as fallback
		if db != nil {
			cachedData, exists, _, _ := db.GetCachedDataByKey(encodedToken, "timetable")
			if exists {
				var timetableResult types.TimetableResult
				if jsonData, ok := cachedData.(map[string]interface{}); ok {
					jsonBytes, _ := json.Marshal(jsonData)
					json.Unmarshal(jsonBytes, &timetableResult)
					timetableResult.Stale = true
					return &timetableResult, nil
				}
			}
		}
		return nil, err
	}

	// Scrape succeeded - update cache
	if db != nil && timetable != nil {
		regNumber := ""
		if timetable.RegNumber != "" {
			regNumber = timetable.RegNumber
		}
		go db.UpsertDataByKey(encodedToken, regNumber, "timetable", timetable)
	}
	timetable.Stale = false
	return timetable, nil
}

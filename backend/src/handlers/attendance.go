package handlers

import (
	"encoding/json"
	"goscraper/src/helpers"
	"goscraper/src/helpers/databases"
	"goscraper/src/types"
	"goscraper/src/utils"
)

func GetAttendance(token string) (*types.AttendanceResponse, error) {
	encodedToken := utils.Encode(token)
	db, _ := databases.NewDatabaseHelper()
	// Always fetch fresh data
	scraper := helpers.NewAcademicsFetch(token)
	attendance, err := scraper.GetAttendance()
	if err != nil {
		// Scrape failed - check if we have any stale data as fallback
		if db != nil {
			cachedData, exists, _, _ := db.GetCachedDataByKey(encodedToken, "attendance")
			if exists {
				var attendanceResponse types.AttendanceResponse
				if jsonData, ok := cachedData.(map[string]interface{}); ok {
					jsonBytes, _ := json.Marshal(jsonData)
					json.Unmarshal(jsonBytes, &attendanceResponse)
					attendanceResponse.Stale = true
					return &attendanceResponse, nil
				}
			}
		}
		return nil, err
	}

	// Scrape succeeded - update cache
	if db != nil && attendance != nil {
		regNumber := ""
		if attendance.RegNumber != "" {
			regNumber = attendance.RegNumber
		}
		go db.UpsertDataByKey(encodedToken, regNumber, "attendance", attendance)
	}
	attendance.Stale = false
	return attendance, nil
}

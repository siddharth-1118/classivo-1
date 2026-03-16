package handlers

import (
	"encoding/json"
	"goscraper/src/helpers"
	"goscraper/src/helpers/databases"
	"goscraper/src/types"
	"goscraper/src/utils"
)

func GetCourses(token string) (*types.CourseResponse, error) {
	encodedToken := utils.Encode(token)
	db, _ := databases.NewDatabaseHelper()
	// Always fetch fresh data
	scraper := helpers.NewCoursePage(token)
	course, err := scraper.GetCourses()
	if err != nil {
		// Scrape failed - check if we have any stale data as fallback
		if db != nil {
			cachedData, exists, _, _ := db.GetCachedDataByKey(encodedToken, "courses")
			if exists {
				var courseResponse types.CourseResponse
				if jsonData, ok := cachedData.(map[string]interface{}); ok {
					jsonBytes, _ := json.Marshal(jsonData)
					json.Unmarshal(jsonBytes, &courseResponse)
					courseResponse.Stale = true
					return &courseResponse, nil
				}
			}
		}
		return nil, err
	}

	// Scrape succeeded - update cache
	if db != nil && course != nil {
		regNumber := ""
		if course.RegNumber != "" {
			regNumber = course.RegNumber
		}
		go db.UpsertDataByKey(encodedToken, regNumber, "courses", course)
	}
	course.Stale = false
	return course, nil
}

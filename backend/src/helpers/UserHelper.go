package helpers

import (
	"fmt"
	"goscraper/src/types"
	"goscraper/src/utils"
	"regexp"
	"strings"

	"github.com/PuerkitoBio/goquery"
)

const userProfileTableMarker = `<table border="0" align="left" cellpadding="1" cellspacing="1" style="width:900px;">`

func GetUser(rawPage string) (*types.User, error) {
	sectionStart := strings.Index(rawPage, userProfileTableMarker)
	if sectionStart == -1 {
		return nil, fmt.Errorf("profile table marker not found in academic portal response")
	}

	tableChunk := rawPage[sectionStart:]
	sectionEnd := strings.Index(tableChunk, "</table>")
	if sectionEnd == -1 {
		return nil, fmt.Errorf("profile table closing tag not found in academic portal response")
	}

	page := tableChunk[:sectionEnd+len("</table>")]
	doc, err := goquery.NewDocumentFromReader(strings.NewReader(page))
	if err != nil {
		return nil, fmt.Errorf("failed to parse HTML: %v", err)
	}

	data := &types.User{}

	re := regexp.MustCompile(`RA2\d{12}`)
	regNumber := re.FindString(rawPage)

	if data.RegNumber == "" {
		data.RegNumber = regNumber
	}

	if data.RegNumber != "" {
		data.Year = getYear(data.RegNumber)
	}

	doc.Find("tr").Each(func(i int, row *goquery.Selection) {
		cells := row.Find("td")
		for i := 0; i+1 < cells.Length(); i += 2 {
			key := strings.TrimSpace(strings.TrimSuffix(cells.Eq(i).Text(), ":"))
			value := strings.TrimSpace(cells.Eq(i + 1).Text())

			switch key {
			case "Name":
				data.Name = value
			case "Program":
				data.Program = value
			case "Batch":
				data.Batch = value
			case "Mobile":
				data.Mobile = value
			case "Semester":
				data.Semester = utils.ParseInt(value)
			case "Department":
				assignDepartmentAndSection(data, value)
			}
		}
	})

	return data, nil
}

func assignDepartmentAndSection(user *types.User, value string) {
	cleanValue := strings.TrimSpace(value)
	if cleanValue == "" {
		return
	}

	parts := strings.SplitN(cleanValue, "-", 2)
	user.Department = strings.TrimSpace(parts[0])

	if len(parts) < 2 {
		return
	}

	sectionPart := strings.TrimSpace(parts[1])
	sectionPart = strings.TrimPrefix(sectionPart, "(")
	sectionPart = strings.TrimSuffix(sectionPart, ")")
	sectionPart = strings.TrimSuffix(sectionPart, " Section")
	sectionPart = strings.TrimSuffix(sectionPart, " section")
	user.Section = strings.TrimSpace(sectionPart)
}

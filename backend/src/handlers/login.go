package handlers

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	neturl "net/url"
	"sort"
	"strings"
	"time"

	"github.com/valyala/fasthttp"
	"goscraper/src/globals"
	"goscraper/src/helpers/databases"
)

const (
	loginSeedURL     = "https://academia.srmist.edu.in/accounts/p/10002227248/signin?hide_fp=true&orgtype=40&service_language=en&css_url=/49910842/academia-academic-services/downloadPortalCustomCss/login&dcc=true&serviceurl=https%3A%2F%2Facademia.srmist.edu.in%2Fportal%2Facademia-academic-services%2FredirectFromLogin"
	serviceURL       = "https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin"
	defaultUserAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36"
)

type cookieJar map[string]string

func newCookieJar() cookieJar {
	return make(cookieJar)
}

func (cj cookieJar) headerValue() string {
	if len(cj) == 0 {
		return ""
	}
	pairs := make([]string, 0, len(cj))
	for k, v := range cj {
		pairs = append(pairs, fmt.Sprintf("%s=%s", k, v))
	}
	sort.Strings(pairs)
	return strings.Join(pairs, "; ")
}

func (cj cookieJar) csrfToken() string {
	if token, ok := cj["iamcsr"]; ok && token != "" {
		return "iamcsrcoo=" + token
	}
	if token, ok := cj["_zcsr_tmp"]; ok && token != "" {
		return "iamcsrcoo=" + token
	}
	return ""
}

func (cj cookieJar) updateFromResponse(resp *fasthttp.Response) {
	resp.Header.VisitAll(func(key, value []byte) {
		if !strings.EqualFold(string(key), "Set-Cookie") {
			return
		}
		cookie := string(value)
		parts := strings.SplitN(cookie, ";", 2)
		if len(parts) == 0 {
			return
		}
		kv := strings.SplitN(strings.TrimSpace(parts[0]), "=", 2)
		if len(kv) != 2 {
			return
		}
		name := strings.TrimSpace(kv[0])
		val := strings.TrimSpace(kv[1])
		if name != "" {
			cj[name] = val
		}
	})
}

func (lf *LoginFetcher) initCookieJar() (cookieJar, error) {
	jar := newCookieJar()
	req := fasthttp.AcquireRequest()
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseRequest(req)
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI(loginSeedURL)
	req.Header.SetMethod("GET")
	req.Header.Set("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("User-Agent", defaultUserAgent)
	req.Header.Set("Cache-Control", "no-cache")
	req.Header.Set("Pragma", "no-cache")

	if err := fasthttp.Do(req, resp); err != nil {
		return nil, fmt.Errorf("failed to initialize login cookies: %w", err)
	}

	if status := resp.StatusCode(); status >= 400 {
		return nil, fmt.Errorf("initial cookie fetch HTTP error: %d", status)
	}

	jar.updateFromResponse(resp)
	if _, ok := jar["iamcsr"]; !ok {
		return nil, fmt.Errorf("iamcsr cookie missing in initial response")
	}
	if _, ok := jar["cli_rgn"]; !ok {
		jar["cli_rgn"] = "IN"
	}
	return jar, nil
}

type LoginFetcher struct{}

type Session struct {
	PostResponse struct {
		StatusCode int `json:"status_code"`
		Lookup     struct {
			Identifier string `json:"identifier"`
			Digest     string `json:"digest"`
		} `json:"lookup"`
	} `json:"postResponse"`
	PassResponse struct {
		StatusCode int `json:"status_code"`
	} `json:"passResponse"`
	Cookies string `json:"Cookies"`
	Message string `json:"message"`
	Errors  string `json:"errors"`
}

type LoginResponse struct {
	Authenticated bool                   `json:"authenticated"`
	Session       map[string]interface{} `json:"session"`
	Lookup        any                    `json:"lookup"`
	Cookies       string                 `json:"cookies"`
	Status        int                    `json:"status"`
	Message       any                    `json:"message"`
	Errors        []string               `json:"errors"`
	Captcha       *CaptchaData           `json:"captcha,omitempty"`
}

type CaptchaData struct {
	Image   string `json:"image"`   // base64 encoded image
	Cdigest string `json:"cdigest"` // captcha digest
}

func (lf *LoginFetcher) Logout(token string) (map[string]interface{}, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI("https://academia.srmist.edu.in/accounts/p/10002227248/logout?servicename=ZohoCreator&serviceurl=https://academia.srmist.edu.in")
	req.Header.SetMethod("GET")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("DNT", "1")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/")
	req.Header.Set("Sec-Fetch-Dest", "document")
	req.Header.Set("Sec-Fetch-Mode", "navigate")
	req.Header.Set("Sec-Fetch-Site", "same-origin")
	req.Header.Set("Upgrade-Insecure-Requests", "1")
	req.Header.Set("Cookie", token)

	if err := fasthttp.Do(req, resp); err != nil {
		return nil, err
	}

	bodyText := resp.Body()

	result := map[string]interface{}{
		"status": resp.StatusCode(),
		"result": string(bodyText),
	}
	return result, nil
}

func (lf *LoginFetcher) FetchCaptcha(cdigest string, jar cookieJar) (string, error) {
	url := fmt.Sprintf("https://academia.srmist.edu.in/accounts/p/40-10002227248/webclient/v1/captcha/%s?darkmode=false", cdigest)

	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI(url)
	req.Header.SetMethod("GET")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("Referer", loginSeedURL)
	req.Header.Set("User-Agent", defaultUserAgent)
	if cookie := jar.headerValue(); cookie != "" {
		req.Header.Set("cookie", cookie)
	}

	if err := fasthttp.Do(req, resp); err != nil {
		return "", fmt.Errorf("captcha request failed: %v", err)
	}

	if resp.StatusCode() != 200 {
		return "", fmt.Errorf("captcha HTTP error: %d", resp.StatusCode())
	}
	jar.updateFromResponse(resp)

	var parsed map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &parsed); err != nil {
		return "", fmt.Errorf("failed to parse captcha JSON: %v", err)
	}

	captcha, ok := parsed["captcha"].(map[string]interface{})
	if !ok {
		return "", fmt.Errorf("invalid captcha format: missing 'captcha' field")
	}

	imageBytes, ok := captcha["image_bytes"].(string)
	if !ok || imageBytes == "" {
		return "", fmt.Errorf("invalid captcha format: missing 'image_bytes'")
	}

	return imageBytes, nil
}

func (lf *LoginFetcher) Login(username, password string, cdigest, captcha *string) (*LoginResponse, error) {
	user := strings.TrimSpace(username)
	if idx := strings.Index(user, "@"); idx != -1 {
		user = user[:idx]
	}
	if user == "" {
		return &LoginResponse{
			Authenticated: false,
			Session:       nil,
			Lookup:        nil,
			Cookies:       "",
			Status:        400,
			Message:       "invalid account identifier",
			Errors:        []string{"Please enter your SRM user id (e.g. ab1234)"},
		}, nil
	}

	jar, err := lf.initCookieJar()
	if err != nil {
		return nil, err
	}

	lookupURL := fmt.Sprintf("https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/lookup/%s@srmist.edu.in", user)

	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	cli_time := time.Now().UnixMilli()

	req.SetRequestURI(lookupURL)
	req.Header.SetMethod("POST")
	req.Header.Set("Accept", "*/*")
	req.Header.Set("Accept-Language", "en-US,en;q=0.9")
	req.Header.Set("Connection", "keep-alive")
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("Origin", "https://academia.srmist.edu.in")
	req.Header.Set("Referer", loginSeedURL)
	req.Header.Set("Sec-Fetch-Mode", "cors")
	req.Header.Set("User-Agent", defaultUserAgent)
	if token := jar.csrfToken(); token != "" {
		req.Header.Set("X-ZCSRF-TOKEN", token)
	}
	if cookie := jar.headerValue(); cookie != "" {
		req.Header.Set("cookie", cookie)
	}

	redirectURL := neturl.QueryEscape(serviceURL)
	body := fmt.Sprintf("mode=primary&cli_time=%d&orgtype=40&service_language=en&serviceurl=%s", cli_time, redirectURL)

	// Add captcha and cdigest if provided
	if cdigest != nil && captcha != nil {
		body += fmt.Sprintf("&captcha=%s&cdigest=%s", *captcha, *cdigest)
	}

	req.SetBody([]byte(body))

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	err = fasthttp.Do(req, resp)
	if err != nil {
		return nil, err
	}
	jar.updateFromResponse(resp)

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &data); err != nil {
		fmt.Println("ERR", err)
		return nil, err
	}

	if errors, ok := data["errors"].([]interface{}); ok && len(errors) > 0 {
		lookupMsg := errors[0].(map[string]interface{})["message"].(string)
		statusCode := int(data["status_code"].(float64))

		if statusCode == 400 {
			// Check if CAPTCHA is required
			if strings.Contains(data["message"].(string), "HIP") || strings.Contains(lookupMsg, "HIP") {
				cdigestVal, hasCdigest := data["cdigest"]
				if hasCdigest {
					cdigestStr, ok := cdigestVal.(string)
					if ok && cdigestStr != "" {
						// Fetch CAPTCHA image
						captchaImage, err := lf.FetchCaptcha(cdigestStr, jar)
						if err != nil {
							return &LoginResponse{
								Authenticated: false,
								Session:       nil,
								Lookup:        data,
								Cookies:       "",
								Status:        statusCode,
								Message:       data["localized_message"].(string),
								Errors:        []string{lookupMsg},
								Captcha: &CaptchaData{
									Cdigest: cdigestStr,
								},
							}, nil
						}

						return &LoginResponse{
							Authenticated: false,
							Session:       nil,
							Lookup:        data,
							Cookies:       "",
							Status:        statusCode,
							Message:       data["localized_message"].(string),
							Errors:        []string{lookupMsg},
							Captcha: &CaptchaData{
								Image:   captchaImage,
								Cdigest: cdigestStr,
							},
						}, nil
					}
				}

				// Return error response with original data
				return &LoginResponse{
					Authenticated: false,
					Session:       nil,
					Lookup:        data,
					Cookies:       "",
					Status:        statusCode,
					Message:       data["localized_message"].(string),
					Errors:        []string{lookupMsg},
				}, nil
			}

			return &LoginResponse{
				Authenticated: false,
				Session:       nil,
				Lookup:        nil,
				Cookies:       "",
				Status:        statusCode,
				Message:       data["message"].(string),
				Errors:        []string{lookupMsg},
			}, nil
		}
	}

	exists := strings.Contains(data["message"].(string), "User exists")

	if !exists {
		// Check if CAPTCHA is required
		if strings.Contains(data["message"].(string), "HIP") {
			cdigestVal, hasCdigest := data["cdigest"]
			if hasCdigest {
				cdigestStr, ok := cdigestVal.(string)
				if ok && cdigestStr != "" {
					// Fetch CAPTCHA image
					captchaImage, err := lf.FetchCaptcha(cdigestStr, jar)
					if err != nil {
						return &LoginResponse{
							Authenticated: false,
							Session:       nil,
							Lookup:        data,
							Cookies:       "",
							Status:        int(data["status_code"].(float64)),
							Message:       data["localized_message"].(string),
							Errors:        nil,
							Captcha: &CaptchaData{
								Cdigest: cdigestStr,
							},
						}, nil
					}

					return &LoginResponse{
						Authenticated: false,
						Session:       nil,
						Lookup:        data,
						Cookies:       "",
						Status:        int(data["status_code"].(float64)),
						Message:       data["localized_message"].(string),
						Errors:        nil,
						Captcha: &CaptchaData{
							Image:   captchaImage,
							Cdigest: cdigestStr,
						},
					}, nil
				}
			}

			return &LoginResponse{
				Authenticated: false,
				Session:       nil,
				Lookup:        data,
				Cookies:       "",
				Status:        int(data["status_code"].(float64)),
				Message:       data["localized_message"].(string),
				Errors:        nil,
			}, nil
		}

		return &LoginResponse{
			Authenticated: false,
			Session:       nil,
			Lookup:        nil,
			Cookies:       "",
			Status:        int(data["status_code"].(float64)),
			Message:       data["message"].(string),
			Errors:        nil,
		}, nil
	}

	lookup, ok := data["lookup"].(map[string]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid lookup data")
	}

	session, err := lf.GetSession(password, lookup, jar)
	if err != nil {
		return nil, err
	}

	// Safely access passwordauth
	var code interface{}
	passwordAuthVal, hasPasswordAuth := session["passwordauth"]
	if hasPasswordAuth && passwordAuthVal != nil {
		if passwordAuthMap, ok := passwordAuthVal.(map[string]interface{}); ok {
			code = passwordAuthMap["code"]
		}
	}

	// Safely access message
	var message string
	if msgVal, ok := session["message"]; ok && msgVal != nil {
		if msgStr, ok := msgVal.(string); ok {
			message = msgStr
		}
	}

	// Safely access cookies
	var cookies string
	if cookiesVal, ok := session["cookies"]; ok && cookiesVal != nil {
		if cookiesStr, ok := cookiesVal.(string); ok {
			cookies = cookiesStr
		}
	}

	sessionBody := map[string]interface{}{
		"success": true,
		"code":    code,
		"message": message,
	}

	if strings.Contains(strings.ToLower(message), "invalid") || strings.Contains(cookies, "undefined") || strings.Contains(strings.ToLower(message), "old password") {
		sessionBody["success"] = false
		return &LoginResponse{
			Authenticated: false,
			Session:       sessionBody,
			Lookup: map[string]string{
				"identifier": lookup["identifier"].(string),
				"digest":     lookup["digest"].(string),
			},
			Cookies: cookies,
			Status:  int(data["status_code"].(float64)),
			Message: message,
			Errors:  nil,
		}, nil
	}

	finalMessage := data["message"]
	if message != "" {
		finalMessage = message
	}

	return &LoginResponse{
		Authenticated: true,
		Session:       sessionBody,
		Lookup:        lookup,
		Cookies:       cookies,
		Status:        int(data["status_code"].(float64)),
		Message:       finalMessage,
		Errors:        nil,
	}, nil
}

func (lf *LoginFetcher) GetSession(password string, lookup map[string]interface{}, jar cookieJar) (map[string]interface{}, error) {
	identifierVal, ok := lookup["identifier"]
	if !ok || identifierVal == nil {
		return nil, fmt.Errorf("missing 'identifier' in lookup map")
	}
	digestVal, ok := lookup["digest"]
	if !ok || digestVal == nil {
		return nil, fmt.Errorf("missing 'digest' in lookup map")
	}

	identifier, ok := identifierVal.(string)
	if !ok {
		return nil, fmt.Errorf("identifier is not a string: %v", identifierVal)
	}
	digest, ok := digestVal.(string)
	if !ok {
		return nil, fmt.Errorf("digest is not a string: %v", digestVal)
	}

	body := fmt.Sprintf(`{"passwordauth":{"password":"%s"}}`, password)

	req := fasthttp.AcquireRequest()
	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseRequest(req)
	defer fasthttp.ReleaseResponse(resp)

	url := fmt.Sprintf(
		"https://academia.srmist.edu.in/accounts/p/40-10002227248/signin/v2/primary/%s/password?digest=%s&cli_time=%d&servicename=ZohoCreator&service_language=en&serviceurl=%s",
		identifier, digest, time.Now().UnixMilli(), serviceURL,
	)

	req.SetRequestURI(url)
	req.Header.SetMethod("POST")
	req.Header.Set("accept", "*/*")
	req.Header.Set("content-type", "application/json")
	req.Header.Set("Origin", "https://academia.srmist.edu.in")
	req.Header.Set("User-Agent", defaultUserAgent)
	if token := jar.csrfToken(); token != "" {
		req.Header.Set("x-zcsrf-token", token)
	}
	if cookie := jar.headerValue(); cookie != "" {
		req.Header.Set("cookie", cookie)
	}
	req.SetBody([]byte(body))

	if err := fasthttp.Do(req, resp); err != nil {
		return nil, err
	}
	jar.updateFromResponse(resp)

	status := resp.StatusCode()

	if status >= 400 {
		return nil, fmt.Errorf("HTTP error: %d", status)
	}

	var data map[string]interface{}
	if err := json.Unmarshal(resp.Body(), &data); err != nil {
		return nil, err
	}

	// Return the full accumulated cookie jar, not just the cookies set on the
	// final password request. Subsequent SRM page fetches rely on the complete set.
	cookies := strings.ReplaceAll(jar.headerValue(), " ", "")

	if cookies == "" {
		fmt.Printf("Warning: No cookies found in accumulated login jar\n")
	}
	data["cookies"] = cookies

	// Store session in active sessions (memory) and Supabase (persistent)
	hash := sha256.Sum256([]byte(cookies))
	hashStr := hex.EncodeToString(hash[:])
	globals.ActiveSessions.Store(hashStr, true)

	db, err := databases.NewDatabaseHelper()
	if err == nil {
		if sessErr := db.SaveSession(hashStr); sessErr != nil {
			fmt.Printf("[AUTH ERROR] Failed to save persistent session: %v\n", sessErr)
		} else {
			fmt.Printf("[AUTH STORE] Persistent session stored. Hash: %s\n", hashStr)
		}
	}

	fmt.Printf("[AUTH STORE] Session stored successfully. Hash: %s | Token Length: %d\n", hashStr, len(cookies))

	return data, nil
}

func (lf *LoginFetcher) Cleanup(cookie string) (int, error) {
	req := fasthttp.AcquireRequest()
	defer fasthttp.ReleaseRequest(req)

	resp := fasthttp.AcquireResponse()
	defer fasthttp.ReleaseResponse(resp)

	req.SetRequestURI("https://academia.srmist.edu.in/accounts/p/10002227248/webclient/v1/account/self/user/self/activesessions")
	req.Header.SetMethod("DELETE")
	req.Header.Set("accept", "*/*")
	req.Header.Set("content-type", "application/x-www-form-urlencoded;charset=UTF-8")
	req.Header.Set("x-zcsrf-token", "iamcsrcoo=8cbe86b2191479b497d8195837181ee152bcfd3d607f5a15764130d8fd8ebef9d8a22c03fd4e418d9b4f27a9822f9454bb0bf5694967872771e1db1b5fbd4585")
	req.Header.Set("Referer", "https://academia.srmist.edu.in/accounts/p/10002227248/announcement/sessions-reminder?servicename=ZohoCreator&serviceurl=https://academia.srmist.edu.in/portal/academia-academic-services/redirectFromLogin&service_language=en")
	req.Header.Set("Referrer-Policy", "strict-origin-when-cross-origin")
	req.Header.Set("cookie", cookie)

	if err := fasthttp.Do(req, resp); err != nil {
		return 0, err
	}

	return resp.StatusCode(), nil
}

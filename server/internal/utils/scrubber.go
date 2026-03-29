package utils

import (
	"html"
	"regexp"
	"strings"
)

// StripHTML removes HTML tags and consolidates whitespace.
func StripHTML(s string) string {
	// 1. Unescape HTML Entities (e.g. &#39; -> ')
	s = html.UnescapeString(s)
	
	// 2. Tactical Tag Removal via Regex
	re := regexp.MustCompile("<[^>]*>")
	s = re.ReplaceAllString(s, " ")
	
	// 3. Neural Whitespace Consolidation
	s = strings.Join(strings.Fields(s), " ")
	
	return strings.TrimSpace(s)
}

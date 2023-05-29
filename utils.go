package main

import (
	"fmt"
	"path/filepath"
	"regexp"
	"strings"
)

type CaseInsensitiveReplacerParams struct {
	toReplace   *regexp.Regexp
	replaceWith string
}

func AppendSubstitution(slice *[]Substitution, newItem Substitution) {
	var appears int
	for _, item := range *slice {
		if item.To == newItem.To {
			appears++
		}
	}
	if appears > 0 {
		newItem.Suffix = appears
	}
	*slice = append(*slice, newItem)
}

func ToPathWithSuffix(toPath string, suffix int) string {
	if suffix == 0 {
		return toPath
	}

	dir := filepath.Dir(toPath)
	ext := filepath.Ext(toPath)
	fileName := filepath.Base(toPath)
	fileName = fileName[:len(fileName)-len(ext)]
	newFileName := fmt.Sprintf("%s-%d%s", fileName, suffix, ext)

	return filepath.Join(dir, newFileName)
}

func IsValidExtension(ext string) bool {
	ext = strings.ToLower(ext)
	switch ext {
	case
		".jpg",
		".jpeg",
		".png":
		return true
	}
	return false
}

func AppendPath(slice []string, str string) []string {
	var newSlice []string
	keepParent := false
	str = NormalizePath(str)
	for _, s := range slice {
		if strings.HasPrefix(str, s+"/") {
			keepParent = true
		}
		if strings.HasPrefix(s, str+"/") || str == s {
			continue
		}
		newSlice = append(newSlice, s)
	}
	if !keepParent {
		newSlice = append(newSlice, str)
	}
	return newSlice
}

func CaseInsensitiveReplacer(toReplace, replaceWith string) *CaseInsensitiveReplacerParams {
	return &CaseInsensitiveReplacerParams{
		toReplace:   regexp.MustCompile("(?i)" + toReplace),
		replaceWith: replaceWith,
	}
}

func (cir *CaseInsensitiveReplacerParams) Replace(str string) string {
	return cir.toReplace.ReplaceAllString(str, cir.replaceWith)
}

func NormalizePath(path string) string {
	return filepath.ToSlash(filepath.Clean(path))
}

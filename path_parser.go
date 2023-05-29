package main

import (
	"fmt"
	"github.com/mmcloughlin/geohash"
	"github.com/rwcarlsen/goexif/exif"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	"image"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"path/filepath"
	"regexp"
	"time"
)

type ImageMetadata struct {
	FileSize        int64               `json:"file_size"`
	FilePath        string              `json:"filepath"`
	Width           int                 `json:"width"`
	Height          int                 `json:"height"`
	Year            string              `json:"year"`
	YearTaken       string              `json:"year_taken"`
	YearCreated     string              `json:"year_created"`
	Month           string              `json:"month"`
	MonthTaken      string              `json:"month_taken"`
	MonthCreated    string              `json:"month_created"`
	Date            string              `json:"date"`
	DateTaken       string              `json:"date_taken"`
	DateCreated     string              `json:"date_created"`
	Parent          string              `json:"parent"`
	ParentIfNotDate string              `json:"parent_if_not_date"`
	Location        GeoLocationMetadata `json:"location"`
}

type GeoLocationMetadata struct {
	Geohash   string  `json:"hash"`
	Latitude  float64 `json:"latitude"`
	Longitude float64 `json:"longitude"`
	Country   string  `json:"country"`
	Division  string  `json:"division"`
	City      string  `json:"city"`
	Place     string  `json:"place"`
}

type PlaceholderMap map[string]string

func getExifData(filepath string) (*exif.Exif, error) {
	f, err := os.Open(filepath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	x, err := exif.Decode(f)
	if err != nil {
		return nil, err
	}

	return x, nil
}

func getExifDateTime(x *exif.Exif) (time.Time, error) {
	tm, err := x.DateTime()
	if err != nil {
		return time.Time{}, err
	}

	return tm, nil
}

func getExifLocation(x *exif.Exif) (float64, float64, string, error) {
	lat, long, err := x.LatLong()
	if err != nil {
		return 0, 0, "", err
	}

	return lat, long, geohash.EncodeWithPrecision(lat, long, 8), nil
}

func getImageDimensions(filePath string) (int, int, error) {
	file, err := os.Open(filePath)
	if err != nil {
		return 0, 0, err
	}
	defer file.Close()

	config, _, err := image.DecodeConfig(file)
	if err != nil {
		return 0, 0, err
	}

	width := config.Width
	height := config.Height
	return width, height, nil
}

func isDateFolder(folderPath string) bool {
	folderPath = NormalizePath(folderPath)
	r, _ := regexp.Compile(`^(\d{4}([-/]\d{2}([-/]\d{2})?)?)$`)
	if r.MatchString(filepath.Base(folderPath)) {
		return true
	}
	r, _ = regexp.Compile(`(\d{4}(/\d{2}(/\d{2})?)?)$`)
	if r.MatchString(folderPath) {
		return true
	}
	return false
}

func GetImageMetadata(filePath string) (*ImageMetadata, error) {
	metadata := &ImageMetadata{}
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return nil, err
	}

	// Set the created date from the file info
	metadata.FileSize = fileInfo.Size()
	metadata.FilePath = NormalizePath(filePath)
	metadata.YearCreated = fmt.Sprintf("%04d", fileInfo.ModTime().Year())
	metadata.MonthCreated = fmt.Sprintf("%02d", fileInfo.ModTime().Month())
	metadata.DateCreated = fmt.Sprintf("%02d", fileInfo.ModTime().Day())

	// Get image sizes
	width, height, err := getImageDimensions(metadata.FilePath)
	if err == nil {
		metadata.Width = width
		metadata.Height = height
	}

	// Set datetime and location from exif data, if available
	exifDate, err := getExifData(metadata.FilePath)
	if err == nil {
		dateTaken, err := getExifDateTime(exifDate)
		if err == nil {
			metadata.YearTaken = fmt.Sprintf("%04d", dateTaken.Year())
			metadata.MonthTaken = fmt.Sprintf("%02d", dateTaken.Month())
			metadata.DateTaken = fmt.Sprintf("%02d", dateTaken.Day())
		}
		lat, long, hash, err := getExifLocation(exifDate)
		if err == nil {
			location := &GeoLocationMetadata{}
			location.Latitude = lat
			location.Longitude = long
			location.Geohash = hash
			metadata.Location = *location
		}
	}

	// Set the generic date details
	if metadata.YearTaken != "" {
		metadata.Year = metadata.YearTaken
	} else {
		metadata.Year = metadata.YearCreated
	}
	if metadata.MonthTaken != "" {
		metadata.Month = metadata.MonthTaken
	} else {
		metadata.Month = metadata.MonthCreated
	}
	if metadata.DateTaken != "" {
		metadata.Date = metadata.DateTaken
	} else {
		metadata.Date = metadata.DateCreated
	}

	// Set the parent folder data
	parentFolder := filepath.Base(filepath.Dir(metadata.FilePath))
	metadata.Parent = parentFolder
	if !isDateFolder(filepath.Dir(metadata.FilePath)) {
		metadata.ParentIfNotDate = parentFolder
	}

	return metadata, nil
}

func ProcessPathSubstitution(placeholderText string, metadata *ImageMetadata) string {
	placeholderMap := PlaceholderMap{
		"{year}":               metadata.Year,
		"{year_taken}":         metadata.YearTaken,
		"{year_created}":       metadata.YearCreated,
		"{month}":              metadata.Month,
		"{month_taken}":        metadata.MonthTaken,
		"{month_created}":      metadata.MonthCreated,
		"{date}":               metadata.Date,
		"{date_taken}":         metadata.DateTaken,
		"{date_created}":       metadata.DateCreated,
		"{parent}":             metadata.Parent,
		"{parent_if_not_date}": metadata.ParentIfNotDate,
		"{location_hash}":      metadata.Location.Geohash,
		"{location_country}":   metadata.Location.Country,
		"{location_division}":  metadata.Location.Division,
		"{location_city}":      metadata.Location.City,
		"{location_place}":     metadata.Location.Place,
	}

	for placeholder, value := range placeholderMap {
		r := CaseInsensitiveReplacer(placeholder, value)
		placeholderText = r.Replace(placeholderText)
	}

	placeholderText += "/" + filepath.Base(metadata.FilePath)
	placeholderText = NormalizePath(placeholderText)

	return placeholderText
}

func RelocateFiles(a *App) {
	runtime.EventsEmit(a.ctx, "relocating-start")
	totalFiles := len(a.substitutions)
	totalRelocated := 0
	for i := range a.substitutions {
		if a.moveOrCopy == "move" {
			//err := os.Rename(a.substitutions[i].From, ToPathWithSuffix(a.substitutions[i].To, a.substitutions[i].Suffix))
			fmt.Println("Moving", a.substitutions[i].From, "to", ToPathWithSuffix(a.substitutions[i].To, a.substitutions[i].Suffix))
		} else {
			//sourceFile, err := os.Open(a.substitutions[i].From)
			//if err != nil {
			//	return err
			//}
			//defer sourceFile.Close()
			//
			//destinationFile, err := os.Create(ToPathWithSuffix(a.substitutions[i].To, a.substitutions[i].Suffix))
			//if err != nil {
			//	return err
			//}
			//defer destinationFile.Close()
			//_, err = io.Copy(destinationFile, sourceFile)
			fmt.Println("Copying", a.substitutions[i].From, "to", ToPathWithSuffix(a.substitutions[i].To, a.substitutions[i].Suffix))
		}
		a.substitutions[i].Relocated = true
		totalRelocated++

		runtime.EventsEmit(a.ctx, "relocating-files", RelocationStatus{a.substitutions, totalFiles, totalRelocated})
	}
	runtime.EventsEmit(a.ctx, "relocating-complete")
}

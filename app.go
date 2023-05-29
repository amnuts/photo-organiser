package main

import (
	"context"
	"fmt"
	"github.com/wailsapp/wails/v2/pkg/runtime"
	_ "image/jpeg"
	_ "image/png"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
)

// App struct
type App struct {
	ctx                  context.Context
	startDirectories     []string
	destinationDirectory string
	minSize              int64
	minWidth             int
	minHeight            int
	namingConvention     string
	moveOrCopy           string
	verifyResults        bool
	substitutions        []Substitution
}

type Substitution struct {
	From      string `json:"from"`
	To        string `json:"to"`
	Suffix    int    `json:"suffix"`
	Relocated bool   `json:"relocated"`
}

type ExampleSubstitution struct {
	Path        string `json:"path"`
	Description string `json:"description"`
}

type RelocationStatus struct {
	Substitutions      []Substitution `json:"files"`
	TotalSubstitutions int            `json:"totalFiles"`
	TotalRelocated     int            `json:"totalRelocated"`
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// startup is called when the app starts. The context is saved
// so we can call the runtime methods
func (a *App) startup(ctx context.Context) {
	a.ctx = ctx
}

func (a *App) ResetEverything() {
	a.startDirectories = []string{}
	a.destinationDirectory = ""
	a.minSize = 0
	a.minWidth = 0
	a.minHeight = 0
	a.namingConvention = ""
	a.moveOrCopy = ""
	a.verifyResults = false
	a.substitutions = []Substitution{}
}

func (a *App) SelectDestinationDirectory() string {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select a directory where the images will end up",
		CanCreateDirectories: true,
		ShowHiddenFiles:      false,
	})
	if err != nil || selection == "" {
		return a.destinationDirectory
	}
	a.destinationDirectory = filepath.ToSlash(filepath.Clean(selection))
	return a.destinationDirectory
}

func (a *App) SelectStartDirectories() []string {
	selection, err := runtime.OpenDirectoryDialog(a.ctx, runtime.OpenDialogOptions{
		Title:                "Select a directory in which to search for images",
		CanCreateDirectories: false,
		ShowHiddenFiles:      false,
	})
	if err != nil {
		return []string{}
	}
	if selection != "" {
		a.startDirectories = AppendPath(a.startDirectories, selection)
		sort.Strings(a.startDirectories)
	}
	return a.startDirectories
}

func (a *App) RemoveStartDirectory(directory string) []string {
	for i, prevSelection := range a.startDirectories {
		if prevSelection == directory {
			a.startDirectories = append(a.startDirectories[:i], a.startDirectories[i+1:]...)
			break
		}
	}
	return a.startDirectories
}

func (a *App) ClearStartDirectories() []string {
	a.startDirectories = []string{}
	return a.startDirectories
}

func (a *App) BackendSetMinSize(size int64) {
	a.minSize = size
}

func (a *App) BackendSetMinWidth(width int) {
	a.minWidth = width
}

func (a *App) BackendSetMinHeight(height int) {
	a.minHeight = height
}

func (a *App) BackendSetNamingConvention(namingConvention string) {
	a.namingConvention = namingConvention
}

func (a *App) BackendSetMoveOrCopy(moveOrCopy string) {
	a.moveOrCopy = moveOrCopy
}

func (a *App) BackendSetVerifyResults(verifyResults bool) {
	a.verifyResults = verifyResults
}

func (a *App) GetExamplePathSubstitution(namingConvention string, metadata *ImageMetadata, description string) ExampleSubstitution {
	return ExampleSubstitution{ProcessPathSubstitution(namingConvention, metadata), description}
}

func (a *App) ProcessImages() {
	a.substitutions = nil
	for _, dir := range a.startDirectories {
		fmt.Println("Processing directory", dir)
		err := filepath.Walk(dir, func(path string, info os.FileInfo, err error) error {
			path = NormalizePath(path)
			if err != nil {
				return err
			}
			if info.IsDir() || !IsValidExtension(filepath.Ext(path)) {
				fmt.Println("    Skipping", path, "because it's a directory or not a valid image")
				return nil
			}

			// Get all the info we need about the image
			imageData, _ := GetImageMetadata(path)

			// Skip if we're filtering by size and the file is too small
			if (a.minSize > 0) && (imageData.FileSize < a.minSize) {
				fmt.Println("    Skipping", path, "because it's too small")
				return nil
			}

			// Skip if we're filtering by width and the file is too small
			if (a.minWidth > 0) && (imageData.Width < a.minWidth) {
				fmt.Println("    Skipping", path, "because it's too narrow:", imageData.Width, "<", a.minWidth)
				return nil
			}

			// Skip if we're filtering by height and the file is too small
			if (a.minHeight > 0) && (imageData.Height < a.minHeight) {
				fmt.Println("    Skipping", path, "because it's too short")
				return nil
			}

			from := imageData.FilePath
			to := NormalizePath(filepath.Join(a.destinationDirectory, ProcessPathSubstitution(a.namingConvention, imageData)))
			AppendSubstitution(&a.substitutions, Substitution{from, to, 0, false})

			runtime.EventsEmit(a.ctx, "finding-files", a.substitutions)
			return nil
		})
		if err != nil {
			fmt.Println(err)
		}
	}

	runtime.EventsEmit(a.ctx, "finding-complete")
	fmt.Printf("Found %d image files\n", len(a.substitutions))

	if !a.verifyResults {
		RelocateFiles(a)
	}
}

func (a *App) VerifyRelocation() {
	RelocateFiles(a)
}

func (a *App) OpenHostLocation(filePath string) {
	var cmd *exec.Cmd
	switch platform := runtime.Environment(a.ctx).Platform; platform {
	case "darwin":
		cmd = exec.Command("open", filePath)
		break
	case "linux":
		cmd = exec.Command("xdg-open", filePath)
		break
	case "windows":
		runDll32 := filepath.Join(os.Getenv("SYSTEMROOT"), "System32", "rundll32.exe")
		cmd = exec.Command(runDll32, "url.dll,FileProtocolHandler", filePath)
		break
	}
	err := cmd.Start()
	if err != nil {
		runtime.LogError(a.ctx, fmt.Sprintf("Failed to open file: %s", err))
	}
}

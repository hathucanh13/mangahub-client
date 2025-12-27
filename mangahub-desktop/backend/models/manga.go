package models

type Manga struct {
	ID            string   `json:"id" db:"id"`
	Title         string   `json:"title" db:"title"`
	Author        string   `json:"author" db:"author"`
	Artist        string   `json:"artist" db:"artist"`
	Genres        []string `json:"genres" db:"genres"`
	ChapterCount  int      `json:"chapter_count" db:"chapter_count"`
	PublishedYear int      `json:"published_year" db:"published_year"`
	Status        string   `json:"status" db:"status"`
	CoverURL      string   `json:"cover_url" db:"cover_url"`
	Description   string   `json:"description" db:"description"`
	Popularity    *int     `json:"popularity,omitempty" db:"popularity"`
	Ranking       *int     `json:"ranking,omitempty" db:"ranking"`
}

type MangaPage struct {
	Items      []Manga `json:"items"`
	Page       int     `json:"page"`
	PageSize   int     `json:"page_size"`
	Total      int     `json:"total"`
	TotalPages int     `json:"total_pages"`
}
type PaginatedMangas struct {
	Items      []Manga
	TotalItems int
	TotalPages int
}
type PaginatedMangasResponse struct {
	Page       int     `json:"page"`
	PageSize   int     `json:"page_size"`
	TotalPages int     `json:"total_pages"`
	TotalItems int     `json:"total_items"`
	Items      []Manga `json:"items"`
}

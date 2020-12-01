class GenreSelector {
  constructor(parentElement, genres) {
    this.parentElement = parentElement;
    this.genres = Array.from(Object.entries(genres))
      .sort((a, b) => a[1] - b[1])
      .reverse();
    this.init();
  }

  init() {
    this.genres.forEach(([genre, count]) => {
      $(`#${this.parentElement}`).append(`<option value="${genre}"> 
      ${genre} 
      </option>`);
    });

    $("#genres").select2({
      placeholder: "Select genres",
      allowClear: true,
    });
  }
}

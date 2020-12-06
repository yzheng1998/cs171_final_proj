class GenreSelector {
  constructor(parentElement, genres) {
    this.parentElement = parentElement;
    this.genres = Array.from(Object.entries(genres)).sort(
      (a, b) => b[1] - a[1]
    );
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
      closeOnSelect: false,
    });
  }
}

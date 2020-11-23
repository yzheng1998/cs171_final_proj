class GenreSelector {
  constructor(parentElement, genres) {
    this.parentElement = parentElement;
    this.genres = genres;
    this.init();
  }

  init() {
    this.genres.forEach((genre) => {
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

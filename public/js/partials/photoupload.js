var photoUpload = (function(my){
  my.initUpload = function(){

    var myDropzone = new Dropzone("#dropzone", {
      url: "/photos/new",
      maxFilesize: 10,
      // maxFiles: 1,
      autoProcessQueue: false,
      acceptedFiles: 'image/*'
    });


    $('#upload-image').click(function(event) {
      var category = $('#category').val().toLowerCase();
      var nsfw = $('#nsfw').prop('checked');
      var isEmpty = (category.length === 0 || !category.trim());

      if(!isEmpty){
        $('#catData').val(category);
        $('#nsfwData').val(nsfw);
        myDropzone.processQueue();
      }
    });
  };

  my.init = function(){
    console.log('init photoUpload');
    my.initUpload();
  };
  return my;
}(photoUpload || {}));
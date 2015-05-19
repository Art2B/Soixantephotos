var Verify = (function(my, $){
  
  my.initValidation = function(){
    $('#validate, #validate-nsfw').click(function(event) {
      var imgId = $(this).closest('.photo').data('id');
      var dataToSend = {};
      if($(this).data('nsfw')){
        dataToSend.nsfw = true;
      }
      $.ajax({
        method: "PUT",
        url: "/admin/photos/verify/"+imgId,
        data: dataToSend
      })
      .done(function(msg) {
        console.log( "Data updated: " + msg );
      });
    });
  };

  my.init = function(){
    console.log('Init Verify module');
    my.initValidation();
  };
  return my;
}(Verify || {}, jQuery));
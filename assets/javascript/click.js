$("#pinned_bizzcard").on("click", function() {
  $(this).appendTo("#left-side");
});


$(".card-body").on('click', 'button', function(){
  console.log('hi');
  let rowId = $(this).attr('row-id'); //Pull the attribute from your button
  let tr =  $(this).parent().parent(); //Define the TR itself
  tr.remove();

});

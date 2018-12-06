$("#pinned_bizzcard").on("click", function() {
  $(this).appendTo("#left-side");
});

$("#userInputButton").on("click", function() {
  event.preventDefault();
  resultsZone.empty();
  runQuery();
});

$("#clear-results").on('click', function() {
  resultsZone.empty();
});

resultsZone.on('click', '#pinned_bizzcard', function() {
add($(this));
});

$(document).on('click', '#dltbutton', function() {
event.stopPropagation();
$(this).parent().remove();
});

$(document).on('click', '#dltbuttonfire', function() {
event.stopPropagation();
$(this).parent().remove();
fireKey = $(this).parent().data("fire");
removeItem(fireKey);
});


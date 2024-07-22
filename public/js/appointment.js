$(function () {
  $("#datepicker").datepicker();

  $("#search-appointment").on("click", function (event) {
    let dateEntered = $("#datepicker").datepicker("getDate");
    console.log("dateEntered", dateEntered.getDate());

    $(".available-slots").css("display", "block");
    $("#slot-date").text(dateEntered.toDateString());
  });
});
